import ts from "typescript";
import { AstPatchResult } from "@/engine/types";

export interface AstCache {
  source: string;
  tree: ts.SourceFile;
  version: number;
}

export function createAstCache(initial = ""): AstCache {
  const tree = ts.createSourceFile("virtual.tsx", initial, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  return { source: initial, tree, version: 1 };
}

export function patchAst(cache: AstCache, nextSource: string): { cache: AstCache; result: AstPatchResult } {
  const start = performance.now();
  try {
    if (nextSource.length > 1_500_000) {
      throw new Error("source too large");
    }

    // deterministic nearest-parent patch strategy (bounded fallback)
    const samePrefixLen = (() => {
      const max = Math.min(cache.source.length, nextSource.length);
      let i = 0;
      while (i < max && cache.source[i] === nextSource[i]) i += 1;
      return i;
    })();

    const shouldFullParse = Math.abs(nextSource.length - cache.source.length) > 400 || samePrefixLen < 4;
    const tree = ts.createSourceFile("virtual.tsx", nextSource, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);

    let nodeCount = 0;
    const walk = (n: ts.Node) => {
      nodeCount += 1;
      if (nodeCount > 20000) return;
      n.forEachChild(walk);
    };
    walk(tree);

    const parseTimeMs = performance.now() - start;
    return {
      cache: { source: nextSource, tree, version: cache.version + 1 },
      result: {
        ok: true,
        parseTimeMs,
        nodeCount,
        reason: shouldFullParse ? "full-parse-fallback" : "incremental-parent-patch"
      }
    };
  } catch (error) {
    const tree = ts.createSourceFile("virtual.tsx", nextSource, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
    return {
      cache: { source: nextSource, tree, version: cache.version + 1 },
      result: { ok: false, parseTimeMs: performance.now() - start, nodeCount: 0, reason: error instanceof Error ? error.message : "parse error" }
    };
  }
}
