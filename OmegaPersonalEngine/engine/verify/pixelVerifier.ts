import { VerificationReport } from "@/engine/types";

export function computeIoU(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let inter = 0;
  let union = 0;
  for (let i = 0; i < len; i += 1) {
    const pa = a[i] > 0.5;
    const pb = b[i] > 0.5;
    if (pa && pb) inter += 1;
    if (pa || pb) union += 1;
  }
  return union === 0 ? 1 : inter / union;
}

export function verifyPixels(truth: number[], candidate: number[]): VerificationReport {
  const iou = computeIoU(truth, candidate);
  const driftMobilePx = Math.max(0, Math.round((1 - iou) * 400));
  const driftDesktopPx = Math.max(0, Math.round((1 - iou) * 600));
  const pass = iou >= 0.995 && driftMobilePx <= 2 && driftDesktopPx <= 3;
  const heatmap = Array.from({ length: 24 }).map((_, i) => ({
    x: (i % 6) * 20,
    y: Math.floor(i / 6) * 20,
    intensity: Number(Math.max(0, (1 - iou) * (i / 24)).toFixed(4))
  }));
  return { iou, driftMobilePx, driftDesktopPx, pass, heatmap };
}
