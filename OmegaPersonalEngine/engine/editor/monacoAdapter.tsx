"use client";

import { useMemo, useState } from "react";
import { createRuntimeState, onDidChangeCursorPosition, onDidChangeModelContent, onKeyDown } from "@/engine/editor/runtime";

interface Props {
  locked: boolean;
}

export function MonacoAdapter({ locked }: Props) {
  const initial = useMemo(() => createRuntimeState(), []);
  const [state, setState] = useState(initial);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <label className="text-sm font-semibold">Local IDE Runtime (Monaco-compatible event model)</label>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
        <textarea
          className="min-h-72 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs"
          value={state.source}
          onClick={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setState((prev) => onDidChangeCursorPosition(prev, target.selectionStart, locked));
          }}
          onKeyUp={(e) => {
            const target = e.currentTarget;
            setState((prev) => onDidChangeCursorPosition(prev, target.selectionStart, locked));
          }}
          onChange={(e) => {
            const target = e.currentTarget;
            setState((prev) => onDidChangeModelContent(prev, target.value, target.selectionStart, locked));
          }}
          onKeyDown={(e) => {
            const next = onKeyDown(state, e.key, locked);
            if (next !== state) {
              e.preventDefault();
              setState(next);
            }
          }}
        />
      </div>
      {state.ghost.active ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-700">
          Ghost ({Math.round(state.ghost.opacity * 100)}%): {state.ghost.text}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
          zone={state.cursor.zone} line={state.cursor.line} col={state.cursor.col}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
          ast={state.ast.reason} nodes={state.ast.nodeCount} parse={state.ast.parseTimeMs.toFixed(2)}ms react={state.reactionMs.toFixed(2)}ms
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
        integrity: {state.integrity.ok ? "PASS" : `FAIL ${state.integrity.issues.join(" | ")}`}
      </div>
    </div>
  );
}
