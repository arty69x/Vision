import { CursorContext, SuggestionResult } from "@/engine/types";

const twoKey: Record<string, string> = {
  co: "container mx-auto px-4",
  ma: "main",
  se: "section",
  ca: "rounded-2xl shadow-md p-6"
};

const fourKey: Record<string, string> = {
  hero: "w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-10",
  card: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
  grid: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
  form: "space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
};

function deterministicOrder(classes: string) {
  const tokens = classes.split(/\s+/).filter(Boolean);
  const unique = [...new Set(tokens)];
  return unique.sort((a, b) => a.localeCompare(b)).join(" ");
}

function inferZoneClass(zone: CursorContext["zone"]) {
  switch (zone) {
    case "ROOT_LAYOUT":
      return "flex flex-col gap-4";
    case "SECTION_CONTAINER":
      return "py-6 md:py-10";
    case "FLEX_ZONE":
      return "flex flex-col gap-3 md:flex-row";
    case "GRID_ZONE":
      return "grid grid-cols-1 gap-4 md:grid-cols-2";
    case "TYPOGRAPHY_ZONE":
      return "text-sm text-slate-700";
    case "INTERACTION_ZONE":
      return "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
    case "FORM_FIELD":
      return "min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2";
    default:
      return "rounded-xl border border-slate-200";
  }
}

export function buildTailwindSuggestion(source: string, ctx: CursorContext): SuggestionResult {
  const token = ctx.currentToken.toLowerCase();
  let suggestion = "";

  if (twoKey[token]) suggestion = twoKey[token];
  else if (fourKey[token]) suggestion = fourKey[token];
  else suggestion = inferZoneClass(ctx.zone);

  if (/\$\{|\+/.test(source)) {
    suggestion = "";
  }

  const ordered = deterministicOrder(suggestion);
  return {
    suggestion: ordered,
    replacementStart: Math.max(0, ctx.offset - token.length),
    replacementEnd: ctx.offset,
    confidence: ordered ? 0.78 : 0.05
  };
}

export function enforceTailwindClassIntegrity(code: string) {
  const dynamicClass = /className\s*=\s*{[^}]*}/.test(code);
  const templateClass = /className\s*=\s*`/.test(code);
  const hasMain = /<main[\s>]/.test(code);
  const hasSection = /<section[\s>]/.test(code);
  const hasContainer = /container\s+mx-auto\s+px-4/.test(code);

  const issues: string[] = [];
  if (dynamicClass) issues.push("Dynamic className is blocked");
  if (templateClass) issues.push("Template literal className is blocked");
  if (!hasMain || !hasSection || !hasContainer) issues.push("Missing required layout hierarchy main>section>container");

  return { ok: issues.length === 0, issues };
}
