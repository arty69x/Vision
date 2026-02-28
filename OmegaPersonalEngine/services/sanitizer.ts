const banned = [
  /eval\s*\(/,
  /Function\s*\(/,
  /child_process/,
  /\bexec\b/,
  /\bspawn\b/,
  /dangerouslySetInnerHTML/,
  /\.\./,
  /^\//m,
  /https?:\/\/(?!localhost|127\.0\.0\.1)/,
  /javascript:/i,
  /data:/i
];

export function sanitizePreview(text: string) {
  for (const b of banned) {
    if (b.test(text)) return { ok: false, reason: `blocked: ${b.toString()}` };
  }

  const hasUseClient = /^[\s\n\r]*["']use client["']/.test(text);
  const browserApi = /\b(window|document|localStorage|navigator)\b/.test(text);
  if (browserApi && !hasUseClient) {
    return { ok: false, reason: "blocked: Browser API inside server component" };
  }

  return { ok: true, reason: "pass" };
}
