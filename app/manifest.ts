import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Longtable — Bible study for everyone",
    short_name: "Longtable",
    description: "Scripture, open to everyone — whatever your tradition, wherever you’re starting.",
    start_url: "/",
    display: "standalone",
    background_color: "#EFF1EA",
    theme_color: "#2E4230",
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
