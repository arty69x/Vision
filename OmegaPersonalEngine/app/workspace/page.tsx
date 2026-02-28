"use client";

import { useEffect, useState } from "react";

export default function WorkspacePage() {
  const [text, setText] = useState("loading...");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/workspace", { cache: "no-store" });
        const json = await res.json();
        if (!active) return;
        setText(JSON.stringify(json, null, 2));
      } catch (e) {
        if (!active) return;
        setText(e instanceof Error ? e.message : "error");
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
            <h1 className="text-2xl font-bold">Workspace</h1>
            <pre className="overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">{text}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
