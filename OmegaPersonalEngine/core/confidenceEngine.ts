export interface ConfidenceInput {
  healingFrequency: number;
  compileFailureRate: number;
  regressionRate: number;
  candidateStability: number;
}

export function computeConfidence(input: ConfidenceInput) {
  const score = 1 - (input.healingFrequency * 0.3 + input.compileFailureRate * 0.3 + input.regressionRate * 0.2 + (1 - input.candidateStability) * 0.2);
  return Math.max(0, Math.min(1, score));
}
