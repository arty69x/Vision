"use client";

import { detectCursorZone } from "@/engine/cursor/zoneDetector";
import { patchAst } from "@/engine/ast/incrementalParser";
import { buildTailwindSuggestion, enforceTailwindClassIntegrity } from "@/engine/suggestion/tailwindIntelligence";
import { applyGhost, cancelGhost, createGhost, GhostState } from "@/engine/suggestion/ghostEngine";
import { CursorContext, AstPatchResult } from "@/engine/types";

export interface RuntimeState {
  source: string;
  cursor: CursorContext;
  ast: AstPatchResult;
  ghost: GhostState;
  reactionMs: number;
  integrity: { ok: boolean; issues: string[] };
}

const emptyCursor = detectCursorZone("", 0);
const emptyAst: AstPatchResult = { ok: true, parseTimeMs: 0, nodeCount: 0, reason: "init" };

export function createRuntimeState(): RuntimeState {
  return {
    source: "<main>\n  <section>\n    <div className=\"container mx-auto px-4\">\n      <div className=\"co\">\n      </div>\n    </div>\n  </section>\n</main>",
    cursor: emptyCursor,
    ast: emptyAst,
    ghost: cancelGhost(),
    reactionMs: 0,
    integrity: { ok: true, issues: [] }
  };
}

export function onDidChangeCursorPosition(state: RuntimeState, offset: number, locked: boolean): RuntimeState {
  const start = performance.now();
  const cursor = detectCursorZone(state.source, offset);
  const suggestion = locked ? { suggestion: "", replacementStart: 0, replacementEnd: 0, confidence: 0 } : buildTailwindSuggestion(state.source, cursor);
  const ghost = locked ? cancelGhost() : createGhost(suggestion);
  const reactionMs = performance.now() - start;
  return { ...state, cursor, ghost, reactionMs };
}

export function onDidChangeModelContent(state: RuntimeState, source: string, offset: number, locked: boolean): RuntimeState {
  const start = performance.now();
  const astPatched = patchAst({ source: state.source, tree: {} as never, version: 0 }, source).result;
  const cursor = detectCursorZone(source, offset);
  const suggestion = locked ? { suggestion: "", replacementStart: 0, replacementEnd: 0, confidence: 0 } : buildTailwindSuggestion(source, cursor);
  const ghost = locked ? cancelGhost() : createGhost(suggestion);
  const integrity = enforceTailwindClassIntegrity(source);
  const reactionMs = performance.now() - start;
  return { ...state, source, cursor, ast: astPatched, ghost, reactionMs, integrity };
}

export function onKeyDown(state: RuntimeState, key: string, locked: boolean): RuntimeState {
  if (locked) return state;
  if ((key === "Tab" || key === "Enter") && state.ghost.active) {
    const source = applyGhost(state.source, state.ghost);
    const integrity = enforceTailwindClassIntegrity(source);
    return { ...state, source, ghost: cancelGhost(), integrity };
  }
  if (key === "Escape") {
    return { ...state, ghost: cancelGhost() };
  }
  return state;
}
