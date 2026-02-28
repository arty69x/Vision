"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [summary, setSummary] = useState("loading...");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        const logs = Array.isArray(json.logs) ? json.logs : [];
        const latest = logs.slice(-1)[0];
        setSummary(latest ? JSON.stringify(latest, null, 2) : "No runs yet");
      } catch (e) {
        if (!active) return;
        setSummary(e instanceof Error ? e.message : "error");
      }
    };
    void load();
    const t = setInterval(() => void load(), 2000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <main>
      <section>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <pre className="overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{summary}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
