// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

// Server output: prices and stock come from Medusa at request time when the
// shop's publishable key is set. Without one the app serves its demo cellar (src/data/), so
// it renders on a laptop before the backend channel exists.
//
// No Tailwind. The design system is one stylesheet of custom properties (src/styles/).
//
// Two homes: Vercel (which sets VERCEL=1 while it builds) gets its own adapter — serverless
// functions, with Vercel's CDN doing compression and caching; anywhere else (Docker, a VPS)
// gets Node's standalone server, run through server.mjs for compression and caching.
const onVercel = !!process.env.VERCEL;

// `astro dev` must run React's development build. If NODE_ENV=production leaks into a dev
// server, Vite pre-bundles production React and every island dies with "jsxDEV is not a
// function". Pin it here so `pnpm dev` works from any shell.
if (process.argv.includes("dev")) process.env.NODE_ENV = "development";

export default defineConfig({
  output: "server",
  adapter: onVercel ? vercel() : node({ mode: "standalone" }),
  integrations: [react()],
  // Each page's CSS goes into its HTML: no render-blocking stylesheet request before first paint
  // (the biggest single PageSpeed cost on a phone). Pages only carry their own CSS — games and
  // the party planner have their own sheets.
  build: { inlineStylesheets: "always" },
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
    // The SDK ships extensionless ESM imports that Node will not resolve unbundled, and the
    // nanostores bindings must share the app's one copy of React, so all are bundled.
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
