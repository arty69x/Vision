import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Omega Ultra Frontend OS",
    short_name: "OmegaOS",
    start_url: "/run",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: []
  };
}
