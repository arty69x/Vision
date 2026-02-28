import { CursorContext } from "@/engine/types";

const typographyTokens = ["text-", "font-", "leading-", "tracking-"];
const interactionTokens = ["hover:", "focus:", "active:", "disabled:"];
const formTokens = ["input", "textarea", "select", "button", "label"];
const dataTokens = ["table", "thead", "tbody", "tr", "td", "th", "article"];

function getLineCol(source: string, offset: number) {
  const safe = Math.max(0, Math.min(offset, source.length));
  const prefix = source.slice(0, safe);
  const parts = prefix.split("\n");
  return { line: parts.length, col: parts.at(-1)?.length ?? 0 };
}

export function detectCursorZone(source: string, offset: number): CursorContext {
  const { line, col } = getLineCol(source, offset);
  const start = Math.max(0, offset - 140);
  const end = Math.min(source.length, offset + 140);
  const surrounding = source.slice(start, end);
  const classMatch = /className\s*=\s*["'`]([^"'`]*)$/m.test(source.slice(0, offset));

  const wordLeft = source.slice(0, offset).split(/\s+/).at(-1) ?? "";
  const token = wordLeft.trim();

  const inRoot = /<main[\s>]/.test(source) && /<section[\s>]/.test(source) && /container\s+mx-auto\s+px-4/.test(source);
  let zone: CursorContext["zone"] = "COMPONENT_WRAPPER";

  if (classMatch) zone = "CLASSNAME_STRING";
  if (/sm:|md:|lg:|xl:/.test(surrounding)) zone = "BREAKPOINT_ZONE";
  if (/\bflex\b|flex-/.test(surrounding)) zone = "FLEX_ZONE";
  if (/\bgrid\b|grid-/.test(surrounding)) zone = "GRID_ZONE";
  if (typographyTokens.some((t) => surrounding.includes(t))) zone = "TYPOGRAPHY_ZONE";
  if (interactionTokens.some((t) => surrounding.includes(t))) zone = "INTERACTION_ZONE";
  if (formTokens.some((t) => surrounding.includes(`<${t}`) || surrounding.includes(`${t}>`))) zone = "FORM_FIELD";
  if (dataTokens.some((t) => surrounding.includes(`<${t}`))) zone = "DATA_DISPLAY";
  if (inRoot && /<section[\s>]/.test(surrounding)) zone = "SECTION_CONTAINER";
  if (inRoot && /<main[\s>]/.test(surrounding)) zone = "ROOT_LAYOUT";

  return { zone, offset, line, col, inClassName: classMatch, currentToken: token, surrounding };
}
