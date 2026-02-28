export interface AgentProgress {
  agent: string;
  state: string;
  progress_percent: number;
  elapsed_ms: number;
  retries: number;
  model: string;
  status: "IDLE" | "RUNNING" | "DONE" | "FAILED";
}

const weights: Record<string, number> = {
  PLANNING: 10,
  ARCHITECTING: 15,
  CODING_PARALLEL: 35,
  REVIEWING: 10,
  VALIDATING: 10,
  HEALING: 10,
  FINALIZED: 10
};

const order = ["PLANNING", "ARCHITECTING", "CODING_PARALLEL", "REVIEWING", "VALIDATING", "HEALING", "FINALIZED"];

export function milestone(percent: number) {
  if (percent <= 0) return 0;
  if (percent < 25) return 25;
  if (percent < 60) return 60;
  if (percent < 85) return 85;
  return 100;
}

export function aggregateGlobalProgress(state: string, agentPercent: number) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let doneWeight = 0;
  for (const step of order) {
    if (step === state) {
      doneWeight += (weights[step] ?? 0) * (agentPercent / 100);
      break;
    }
    doneWeight += weights[step] ?? 0;
  }
  return Number(((doneWeight / total) * 100).toFixed(2));
}
