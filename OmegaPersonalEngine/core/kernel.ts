import path from "path";
import { AgentRegistry } from "@/agents/registry";
import { runParallelCandidates } from "@/core/candidateEngine";
import { runHealing } from "@/core/healingEngine";
import { detectBurnout } from "@/core/burnoutEngine";
import { computeConfidence } from "@/core/confidenceEngine";
import { logEvent, readEvents } from "@/core/logger";
import { etaFromTrends, initMemory, injectMemory, recordModelHealth, recordTrend, writeAgentMemory } from "@/core/memoryEngine";
import { createSnapshot, readWorkspace, writeWorkspace } from "@/core/snapshotManager";
import { runSecurityAudit } from "@/core/securityAudit";
import { StateMachine } from "@/core/stateMachine";
import { validateCandidate } from "@/services/validator";
import { runOneClickPipeline } from "@/engine/mapping/oneClickPipeline";
import { exportTargets } from "@/engine/export/exporter";
import { callOllamaLocal } from "@/services/ollamaClient";
import { aggregateGlobalProgress, milestone } from "@/core/progressEngine";
import { diffCode } from "@/core/diffEngine";
import { buildProjectGraph } from "@/core/projectGraphEngine";
import { assertSafeWrite } from "@/core/sandboxFs";

const caps = {
  maxParallelBranches: 2,
  maxAttempts: 2,
  maxHealingRounds: 2,
  maxTotalAgentCalls: 20,
  timeoutPerAgent: 25000,
  globalTimeout: 120000
} as const;

const modelPriority = ["deepseek-coder", "llama3", "mistral"] as const;

type KernelResult = {
  state: string;
  retry_count: number;
  healing_rounds: number;
  models_used: string[];
  validation_passed: boolean;
  confidence_score: number;
  total_runtime_ms: number;
  run_id: string;
  eta_ms: number;
  global_progress_percent: number;
};

async function emitProgress(runId: string, agent: string, state: string, percent: number, startedAt: number, retries: number, model: string, status: "IDLE" | "RUNNING" | "DONE" | "FAILED") {
  const p = milestone(percent);
  const global = aggregateGlobalProgress(state, p);
  await logEvent({
    runId,
    type: "progress",
    payload: {
      agent,
      state,
      progress_percent: p,
      elapsed_ms: Date.now() - startedAt,
      retries,
      model,
      status,
      global_progress_percent: global
    },
    at: Date.now()
  });
  return global;
}

async function runModelWithFallback(prompt: string) {
  const used: string[] = [];
  for (const model of modelPriority) {
    const t0 = Date.now();
    const res = await callOllamaLocal(prompt, model);
    const latency = Date.now() - t0;
    used.push(model);
    await recordModelHealth(model, latency, res.ok);
    if (res.ok) return { ok: true as const, output: res.output, models: used };
  }
  return { ok: false as const, output: "all models failed", models: used };
}

export async function executeKernel(prompt: string): Promise<KernelResult> {
  const started = Date.now();
  const runId = String(started);
  const machine = new StateMachine();
  let retries = 0;
  let healingRounds = 0;
  let calls = 0;
  let modelsUsed: string[] = [];
  let globalProgressPercent = 0;

  await initMemory();
  const etaMs = await etaFromTrends();

  const transition = async (to: Parameters<StateMachine["transition"]>[0], reason: string) => {
    const row = machine.transition(to);
    await logEvent({ runId, type: "transition", payload: { ...row, reason }, at: row.at });
  };

  const guardCaps = () => {
    if (Date.now() - started > caps.globalTimeout) throw new Error("global timeout exceeded");
    if (calls > caps.maxTotalAgentCalls) throw new Error("max agent calls exceeded");
  };

  try {
    const mem = await injectMemory();

    await transition("PLANNING", "deterministic lock start");
    globalProgressPercent = await emitProgress(runId, "PlannerAgent", "PLANNING", 30, started, retries, modelPriority[0], "RUNNING");
    calls += 1; guardCaps();
    const plan = await AgentRegistry.planner.run({ prompt, memoryInjection: mem });
    await writeAgentMemory("accepted", { pattern: "planning-pass", plan: plan.result });
    await emitProgress(runId, "PlannerAgent", "PLANNING", 100, started, retries, modelPriority[0], "DONE");

    await transition("ARCHITECTING", "architecture synthesis");
    globalProgressPercent = await emitProgress(runId, "ArchitectureAgent", "ARCHITECTING", 40, started, retries, modelPriority[0], "RUNNING");
    calls += 1; guardCaps();
    const architecture = await AgentRegistry.architecture.run({ prompt, memoryInjection: mem });
    await writeAgentMemory("accepted", { pattern: "architecture-pass", architecture: architecture.result });
    await emitProgress(runId, "ArchitectureAgent", "ARCHITECTING", 100, started, retries, modelPriority[0], "DONE");

    await transition("CODING_PARALLEL", "parallel coding start");
    const safeMode = detectBurnout({ healingFrequency: 0, compileFailureRate: 0, regressionRate: 0, candidateStability: 1 }, Date.now() - started);
    const parallel = safeMode ? 1 : caps.maxParallelBranches;
    globalProgressPercent = await emitProgress(runId, "CoderAgentA", "CODING_PARALLEL", 30, started, retries, modelPriority[0], "RUNNING");

    calls += 2; guardCaps();
    const candidates = await runParallelCandidates(prompt, mem, Math.min(parallel, caps.maxParallelBranches));
    const winner = candidates.sort((a, b) => b.score - a.score)[0];

    const modelCall = await runModelWithFallback(prompt);
    modelsUsed = modelCall.models;
    await logEvent({ runId, type: "model", payload: modelCall, at: Date.now() });

    await emitProgress(runId, "CoderAgentB", "CODING_PARALLEL", 100, started, retries, modelsUsed[0] ?? modelPriority[0], "DONE");

    await transition("REVIEWING", "review and diff");
    calls += 2; guardCaps();
    const reviewer = await AgentRegistry.reviewer.run({ prompt, memoryInjection: mem });
    const diff = diffCode("", winner.code);
    const graph = buildProjectGraph({ "workspace/solution.tsx": winner.code });
    await logEvent({ runId, type: "review", payload: { reviewer: reviewer.result, diff, graph }, at: Date.now() });
    await emitProgress(runId, "ReviewerAgent", "REVIEWING", 100, started, retries, modelsUsed[0] ?? modelPriority[0], "DONE");

    await transition("VALIDATING", "validator and compile");
    calls += 3; guardCaps();
    const validator = await AgentRegistry.validator.run({ prompt, memoryInjection: mem });
    const compile = await AgentRegistry.compile.run({ prompt, memoryInjection: mem });
    const secure = runSecurityAudit(winner.code);
    const staticValidation = validateCandidate(winner.code);

    let validationPassed = validator.result.ok && compile.result.ok && staticValidation.ok && secure.severity !== "HIGH" && diff.severity !== "HIGH" && modelCall.ok;
    await emitProgress(runId, "ValidatorAgent", "VALIDATING", validationPassed ? 100 : 70, started, retries, modelsUsed[0] ?? modelPriority[0], validationPassed ? "DONE" : "FAILED");

    if (!validationPassed) {
      await transition("HEALING", "bounded healing");
      const snap = await createSnapshot(runId);
      calls += 1; guardCaps();
      await AgentRegistry.healing.run({ prompt, memoryInjection: mem });
      const healing = await runHealing(prompt, mem, snap, caps.maxHealingRounds);
      healingRounds = healing.rounds;
      retries += 1;
      await logEvent({ runId, type: "healing", payload: healing, at: Date.now() });
      await writeAgentMemory("failures", { reason: healing.notes.join(" | ") || "validation failed" });

      if (!healing.resolved || retries >= caps.maxAttempts) {
        await transition("FAILED", "healing exhausted");
        const confidenceFail = Math.max(0, computeConfidence({ healingFrequency: 1, compileFailureRate: 1, regressionRate: 0.7, candidateStability: 0.4 }) - (healingRounds > 1 ? 0.1 : 0) - (retries > 1 ? 0.05 : 0));
        const runtime = Date.now() - started;
        await recordTrend(runtime);
        return {
          state: "FAILED",
          retry_count: retries,
          healing_rounds: healingRounds,
          models_used: modelsUsed,
          validation_passed: false,
          confidence_score: Number(confidenceFail.toFixed(4)),
          total_runtime_ms: runtime,
          run_id: runId,
          eta_ms: etaMs,
          global_progress_percent: globalProgressPercent
        };
      }

      await transition("REVIEWING", "post-healing re-review");
      validationPassed = true;
    }

    const mapped = runOneClickPipeline(prompt);
    const exported = exportTargets(mapped.winner.code);
    assertSafeWrite("workspace/solution.tsx");
    assertSafeWrite("workspace/export-next.tsx");
    await writeWorkspace({ runId, files: { "workspace/solution.tsx": winner.code, "workspace/export-next.tsx": exported.nextPage, "workspace/export.html": exported.html } });
    await writeAgentMemory("accepted", { pattern: `winner:${winner.id}`, score: winner.score });

    await transition("FINALIZED", "success");
    await emitProgress(runId, "ConfidenceAgent", "FINALIZED", 100, started, retries, modelsUsed.at(-1) ?? modelPriority[0], "DONE");

    const baseConfidence = computeConfidence({
      healingFrequency: healingRounds / caps.maxHealingRounds,
      compileFailureRate: compile.result.ok ? 0 : 1,
      regressionRate: mapped.blocked ? 0.5 : 0,
      candidateStability: Math.abs((candidates[0]?.score ?? 0) - (candidates[1]?.score ?? candidates[0].score)) < 5 ? 0.9 : 0.7
    });
    const finalConfidence = Math.max(0, baseConfidence - (healingRounds > 1 ? 0.1 : 0) - (retries > 1 ? 0.05 : 0));
    const runtime = Date.now() - started;
    await recordTrend(runtime);

    await logEvent({
      runId,
      type: "summary",
      payload: {
        state: "FINALIZED",
        retry_count: retries,
        healing_rounds: healingRounds,
        models_used: modelsUsed,
        validation_passed: validationPassed,
        confidence_score: Number(finalConfidence.toFixed(4)),
        total_runtime_ms: runtime
      },
      at: Date.now()
    });

    return {
      state: "FINALIZED",
      retry_count: retries,
      healing_rounds: healingRounds,
      models_used: modelsUsed,
      validation_passed: validationPassed,
      confidence_score: Number(finalConfidence.toFixed(4)),
      total_runtime_ms: runtime,
      run_id: runId,
      eta_ms: etaMs,
      global_progress_percent: 100
    };
  } catch (error) {
    try { await transition("FAILED", "unhandled"); } catch {}
    const runtime = Date.now() - started;
    await logEvent({ runId, type: "error", payload: error instanceof Error ? error.message : "unknown", at: Date.now() });
    await writeAgentMemory("failures", { reason: error instanceof Error ? error.message : "unknown" });
    await recordTrend(runtime);
    return {
      state: "FAILED",
      retry_count: retries,
      healing_rounds: healingRounds,
      models_used: modelsUsed,
      validation_passed: false,
      confidence_score: 0.2,
      total_runtime_ms: runtime,
      run_id: runId,
      eta_ms: etaMs,
      global_progress_percent: globalProgressPercent
    };
  }
}

export async function readWorkspaceData() {
  return readWorkspace();
}

export async function logsForApi() {
  return readEvents();
}

export function memoryFilePath(name: string) {
  return path.join(process.cwd(), ".local_memory", name);
}
