import { AgentRegistry } from "@/agents/registry";
import { validateCandidate } from "@/services/validator";
import { runSecurityAudit } from "@/core/securityAudit";

export interface CandidateScore {
  id: string;
  code: string;
  score: number;
  reviewer: number;
  validation: number;
  security: number;
  performance: number;
}

export async function runParallelCandidates(prompt: string, memoryInjection: { lastFailures: string[]; promotedPatterns: string[] }, parallelism = 2) {
  const ctx = { prompt, memoryInjection };
  const [a, b] = parallelism === 1 ? [await AgentRegistry.coderA.run(ctx), null] : await Promise.all([AgentRegistry.coderA.run(ctx), AgentRegistry.coderB.run(ctx)]);

  const list = [a, b].filter(Boolean) as Array<{ result: { id: string; code: string } }>;

  return list.map((candidate) => {
    const reviewer = 90;
    const validation = validateCandidate(candidate.result.code).score;
    const security = runSecurityAudit(candidate.result.code).score;
    const performance = 88;
    const score = validation * 0.4 + reviewer * 0.3 + security * 0.2 + performance * 0.1;
    return { id: candidate.result.id, code: candidate.result.code, score, reviewer, validation, security, performance } as CandidateScore;
  });
}
