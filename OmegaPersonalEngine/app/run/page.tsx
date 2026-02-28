"use client";

import { useEffect, useMemo, useState } from "react";
import { UltraFrontendStudio } from "@/components/UltraFrontendStudio";

const snapHeights = { 25: "h-[25vh]", 60: "h-[60vh]", 100: "h-[100vh]" } as const;

export default function RunPage() {
  const [prompt, setPrompt] = useState("Build a robust mobile-first feature");
  const [output, setOutput] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [lockedMode, setLockedMode] = useState(false);
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [snap, setSnap] = useState<25 | 60 | 100>(25);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        const list = Array.isArray(json.logs) ? json.logs : [];
        setLogs(list);
      } catch {
        if (!active) return;
      }
    };
    void poll();
    const t = setInterval(() => void poll(), 1200);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const runLocked = async () => {
    try {
      setBusy(true);
      setLockedMode(true);
      setSnap(60);
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
      setSnap(100);
    } catch (e) {
      setOutput(e instanceof Error ? e.message : "run failed");
    } finally {
      setBusy(false);
      setLockedMode(false);
    }
  };

  const globalProgress = useMemo(() => {
    const progress = logs.filter((l) => l.type === "progress").slice(-1)[0];
    const payload = (progress?.payload ?? {}) as Record<string, unknown>;
    return Number(payload.global_progress_percent ?? 0);
  }, [logs]);

  const visibleLogs = useMemo(() => logs.slice(-120), [logs]);

  return (
    <main>
      <section>
        <div className="container mx-auto px-4 py-6 pb-32">
          <div className="sticky top-14 z-10 rounded-xl border border-slate-200 bg-white p-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, globalProgress))}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-600">Global Progress {globalProgress.toFixed(2)}%</p>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-semibold">Command</label>
              <textarea className="min-h-40 w-full rounded-xl border border-slate-300 p-3 text-sm" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={lockedMode} />
              <div className="mt-3 flex flex-col gap-2 md:flex-row">
                <button
                  className="min-h-11 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:w-auto"
                  onClick={runLocked}
                  disabled={busy}
                >
                  {busy ? "RUNNING LOCKED..." : "FULL CURSOR AGENT MODE LOCKED"}
                </button>
                <button className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm md:w-auto" onClick={() => setPrompt("induce error compile failure")} disabled={lockedMode}>Trigger Healing</button>
              </div>
            </div>
            <pre className="w-full overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{output}</pre>
            <UltraFrontendStudio locked={lockedMode} />
          </div>
        </div>
      </section>

      <aside className={`fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] ${snapHeights[snap]} transition-all`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold">Timeline</p>
          <div className="flex gap-2">
            {[25, 60, 100].map((s) => (
              <button key={s} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold ${snap === s ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`} onClick={() => setSnap(s as 25 | 60 | 100)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-auto rounded-xl bg-slate-950 p-2">
          <div className="space-y-1">
            {visibleLogs.map((log, i) => (
              <div key={`${String(log.at)}-${i}`} className="rounded-md border border-slate-800 bg-slate-900 p-2 text-[10px] text-slate-100">
                {JSON.stringify(log)}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
