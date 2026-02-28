import { ConfidenceInput } from "@/core/confidenceEngine";

export function detectBurnout(input: ConfidenceInput, longSessionMs: number) {
  return input.healingFrequency > 0.66 || input.compileFailureRate > 0.5 || input.regressionRate > 0.4 || longSessionMs > 1000 * 60 * 20;
}
