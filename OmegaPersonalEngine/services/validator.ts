export function validateCandidate(code: string) {
  const issues: string[] = [];
  if (!code.includes("export default")) issues.push("Missing export default");
  if (!code.includes("container mx-auto px-4")) issues.push("Missing required mobile container");
  return { ok: issues.length === 0, issues, score: issues.length === 0 ? 100 : 50 };
}
