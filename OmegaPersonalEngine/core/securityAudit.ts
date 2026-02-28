import { sanitizePreview } from "@/services/sanitizer";

export function runSecurityAudit(text: string) {
  const res = sanitizePreview(text);
  if (!res.ok) {
    return { severity: "HIGH" as const, score: 10, findings: [res.reason] };
  }
  return { severity: "LOW" as const, score: 95, findings: [] as string[] };
}
