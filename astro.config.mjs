// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

// Server output, like beyond/: prices and stock come from Medusa at request time when the
// shop's publishable key is set. Without one the app serves its demo cellar (src/data/), so
// it renders on a laptop before the backend channel exists.
//
// No Tailwind. The design system is one stylesheet of custom properties (src/styles/).
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    server: {
      allowedHosts: [
        "localhost",
        ".ngrok-free.app",
        ".ngrok.app",
        ".trycloudflare.com",
        ...(process.env.LIQUORHOUSE_DEV_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean),
      ],
    },
    // Same reasons as beyond/astro.config.mjs: the SDK ships extensionless ESM imports, and
    // @nanostores/react hoisted to the workspace root would otherwise bring a second React.
    ssr: { noExternal: ["@medusajs/js-sdk", "@nanostores/react", "nanostores", "@nanostores/persistent"] },
    resolve: { dedupe: ["react", "react-dom"] },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "@nanostores/react",
        "nanostores",
        "@nanostores/persistent",
        "@medusajs/js-sdk",
      ],
    },
  },
});
