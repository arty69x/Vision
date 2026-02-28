import { VerificationReport } from "@/engine/types";

export function heatmapAscii(report: VerificationReport) {
  const rows = 4;
  const cols = 6;
  const cells = report.heatmap.slice(0, rows * cols);
  let out = "";
  for (let r = 0; r < rows; r += 1) {
    const line = cells.slice(r * cols, (r + 1) * cols).map((c) => {
      if (c.intensity < 0.05) return "·";
      if (c.intensity < 0.15) return "░";
      if (c.intensity < 0.25) return "▒";
      return "▓";
    }).join(" ");
    out += `${line}\n`;
  }
  return out.trim();
}
