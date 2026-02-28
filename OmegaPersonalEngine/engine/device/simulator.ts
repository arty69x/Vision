export const devices = {
  "iphone-se": { width: 375, height: 667 },
  "iphone-pro": { width: 393, height: 852 },
  "pixel-7": { width: 412, height: 915 },
  "ipad-mini": { width: 768, height: 1024 },
  "desktop-1440": { width: 1440, height: 900 },
  "desktop-1920": { width: 1920, height: 1080 }
} as const;

export type DeviceName = keyof typeof devices;

export function simulateDrift(base: number, device: DeviceName) {
  const d = devices[device];
  const scale = d.width < 500 ? 1.5 : d.width < 1000 ? 1.1 : 0.8;
  return Math.max(0, Number((base * scale).toFixed(2)));
}
