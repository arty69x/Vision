"use client";

import { useMemo, useState } from "react";
import { MonacoAdapter } from "@/engine/editor/monacoAdapter";
import { runOneClickPipeline } from "@/engine/mapping/oneClickPipeline";
import { heatmapAscii } from "@/engine/debug/heatmap";
import { devices, DeviceName, simulateDrift } from "@/engine/device/simulator";

interface Props {
  locked: boolean;
}

export function UltraFrontendStudio({ locked }: Props) {
  const [input, setInput] = useState("hero");
  const [device, setDevice] = useState<DeviceName>("iphone-pro");
  const result = useMemo(() => runOneClickPipeline(input), [input]);

  const deviceRows = Object.entries(devices).map(([name]) => {
    const drift = simulateDrift(result.winner.driftPx, name as DeviceName);
    return { name, drift };
  });

  return (
    <div className="space-y-4">
      <MonacoAdapter locked={locked} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-sm font-semibold">One-click mapping input</label>
        <input className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2" value={input} onChange={(e) => setInput(e.target.value)} disabled={locked} />
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
            winner={result.winner.id} score={result.winner.totalScore} confidence={result.confidence.score}
          </div>
          <div className="rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
            verify iou={result.winner.layoutIoU} drift={result.winner.driftPx}px healing={result.healingRounds}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold">Device simulator + drift</p>
          <select className="min-h-11 rounded-xl border border-slate-300 px-3" value={device} onChange={(e) => setDevice(e.target.value as DeviceName)}>
            {Object.keys(devices).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-600">selected drift: {simulateDrift(result.winner.driftPx, device)}px</p>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {deviceRows.map((row) => (
            <div key={row.name} className="rounded-xl border border-slate-200 p-2 text-xs">
              <span className="font-semibold">{row.name}</span>: {row.drift}px
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">Heatmap overlay</p>
        <pre className="mt-2 rounded-xl bg-slate-900 p-3 text-xs text-slate-100">{heatmapAscii({ iou: result.winner.layoutIoU, driftMobilePx: result.winner.driftPx, driftDesktopPx: result.winner.driftPx, pass: !result.blocked, heatmap: result.candidates[0] ? Array.from({ length: 24 }).map((_, i) => ({ x: i, y: i, intensity: Math.min(0.3, i * 0.01) })) : [] })}</pre>
      </div>
    </div>
  );
}
