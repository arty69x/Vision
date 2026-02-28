export type DiffSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface DiffReport {
  jsxChanges: number;
  classChanges: number;
  layoutValid: boolean;
  severity: DiffSeverity;
  issues: string[];
}

export function diffCode(before: string, after: string): DiffReport {
  const jsxChanges = Math.abs((after.match(/</g)?.length ?? 0) - (before.match(/</g)?.length ?? 0));
  const classChanges = Math.abs((after.match(/className/g)?.length ?? 0) - (before.match(/className/g)?.length ?? 0));
  const layoutValid = /<main[\s>]/.test(after) && /<section[\s>]/.test(after) && /container\s+mx-auto\s+px-4/.test(after);
  const issues: string[] = [];
  if (!layoutValid) issues.push("layout hierarchy invalid");

  let severity: DiffSeverity = "LOW";
  if (!layoutValid || jsxChanges > 10) severity = "HIGH";
  else if (classChanges > 8) severity = "MEDIUM";

  return { jsxChanges, classChanges, layoutValid, severity, issues };
}
