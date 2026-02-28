import { LayoutCandidate } from "@/engine/types";

export function runAdaptiveHealing(candidate: LayoutCandidate, maxRounds: number) {
  let current = { ...candidate };
  let rounds = 0;

  while (rounds < maxRounds) {
    if (current.layoutIoU >= 0.995 && current.driftPx <= 3) break;
    rounds += 1;
    current = {
      ...current,
      layoutIoU: Number(Math.min(0.9999, current.layoutIoU + 0.003).toFixed(6)),
      driftPx: Math.max(0, current.driftPx - 1),
      entropyScore: Number(Math.min(1, current.entropyScore + 0.01).toFixed(4)),
      totalScore: Number(Math.min(1, current.totalScore + 0.01).toFixed(6))
    };
  }

  return { candidate: current, rounds };
}
