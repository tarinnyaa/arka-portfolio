import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// GitHub Pages serves the site from /<repo>/ — the base is set for the repo
// name in production and stays "/" for local dev and preview so deep links
// behave the same way in both.
const REPO = "arka-portfolio";

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site under /<repo>/. Dev runs at "/" so the
  // router's history paths are easy to type; build and preview use the base.
  base: command === "build" || isPreview ? `/${REPO}/` : "/",
  resolve: {
    alias: {
      "@content": fileURLToPath(new URL("./content", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("flowerArt.extra.gen")) return "flower-art-extra";
          if (id.includes("flowerArt.core.gen")) return "flower-art-core";
          if (id.includes("node_modules/gsap")) return "gsap";
          return undefined;
        },
      },
    },
  },
  server: { port: 5173, strictPort: false },
}));
