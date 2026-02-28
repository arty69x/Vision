import { enforceTailwindClassIntegrity } from "@/engine/suggestion/tailwindIntelligence";

export interface ExportOutput {
  ok: boolean;
  reason: string;
  html: string;
  nextPage: string;
}

export function exportTargets(code: string): ExportOutput {
  const integrity = enforceTailwindClassIntegrity(code);
  if (!integrity.ok) {
    return { ok: false, reason: integrity.issues.join("; "), html: "", nextPage: "" };
  }
  const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head><body>${code}</body></html>`;
  const nextPage = `export default function Page(){return (${code});}`;
  return { ok: true, reason: "pass", html, nextPage };
}
