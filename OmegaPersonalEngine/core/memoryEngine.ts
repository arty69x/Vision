import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const dir = path.join(process.cwd(), ".local_memory");
const jsonlFiles = ["failures.jsonl", "accepted.jsonl"] as const;
const jsonFiles = ["model_health.json", "user_profile.json", "performance_trends.json"] as const;

async function appendCapped(file: string, obj: unknown, cap: number) {
  const p = path.join(dir, file);
  let lines: string[] = [];
  try {
    lines = (await readFile(p, "utf8")).split("\n").filter(Boolean);
  } catch {}
  lines.push(JSON.stringify({ ...Object(obj), at: Date.now() }));
  if (lines.length > cap) lines = lines.slice(-cap);
  await writeFile(p, `${lines.join("\n")}\n`, "utf8");
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path.join(dir, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await writeFile(path.join(dir, file), JSON.stringify(value, null, 2), "utf8");
}

export async function initMemory() {
  await mkdir(dir, { recursive: true });
  for (const f of jsonlFiles) {
    await appendCapped(f, { init: true }, 100);
  }
  const modelHealth = await readJson<Record<string, { avgLatencyMs: number; success: number; fail: number }>>("model_health.json", {});
  const userProfile = await readJson<Record<string, unknown>>("user_profile.json", { strict: true, mobileFirst: true });
  const trends = await readJson<Array<{ totalRuntimeMs: number; timestamp: number }>>("performance_trends.json", []);
  await writeJson("model_health.json", modelHealth);
  await writeJson("user_profile.json", userProfile);
  await writeJson("performance_trends.json", trends);
}

export async function writeAgentMemory(kind: "failures" | "accepted", payload: unknown) {
  await appendCapped(kind === "failures" ? "failures.jsonl" : "accepted.jsonl", payload, 100);
}

export async function injectMemory() {
  const readJsonLines = async (file: string) => {
    try {
      return (await readFile(path.join(dir, file), "utf8")).split("\n").filter(Boolean).map((v) => JSON.parse(v));
    } catch {
      return [] as Array<Record<string, unknown>>;
    }
  };

  const failures = await readJsonLines("failures.jsonl");
  const accepted = await readJsonLines("accepted.jsonl");

  const lastFailures = failures.slice(-3).map((v) => String(v.reason ?? v.error ?? "failure"));

  const hitMap = new Map<string, number>();
  for (const row of accepted) {
    const p = String(row.pattern ?? "");
    if (!p) continue;
    hitMap.set(p, (hitMap.get(p) ?? 0) + 1);
  }

  const promotedPatterns = [...hitMap.entries()].filter(([, hits]) => hits >= 3).map(([k]) => k).slice(-20);
  return { lastFailures, promotedPatterns };
}

export async function recordModelHealth(model: string, latencyMs: number, success: boolean) {
  const health = await readJson<Record<string, { avgLatencyMs: number; success: number; fail: number }>>("model_health.json", {});
  const current = health[model] ?? { avgLatencyMs: latencyMs, success: 0, fail: 0 };
  const total = current.success + current.fail + 1;
  const nextAvg = (current.avgLatencyMs * (total - 1) + latencyMs) / total;
  health[model] = {
    avgLatencyMs: Number(nextAvg.toFixed(2)),
    success: current.success + (success ? 1 : 0),
    fail: current.fail + (success ? 0 : 1)
  };
  await writeJson("model_health.json", health);
}

export async function recordTrend(totalRuntimeMs: number) {
  const trends = await readJson<Array<{ totalRuntimeMs: number; timestamp: number }>>("performance_trends.json", []);
  trends.push({ totalRuntimeMs, timestamp: Date.now() });
  while (trends.length > 100) trends.shift();
  await writeJson("performance_trends.json", trends);
}

export async function etaFromTrends() {
  const trends = await readJson<Array<{ totalRuntimeMs: number; timestamp: number }>>("performance_trends.json", []);
  const last = trends.slice(-5);
  if (last.length === 0) return 45000;
  const avg = last.reduce((s, t) => s + t.totalRuntimeMs, 0) / last.length;
  return Math.round(avg);
}
