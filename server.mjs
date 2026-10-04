// The production server: Astro's own standalone handler, plus the two things it doesn't do.
//
//   1. Compression (brotli or gzip) for HTML, CSS, JS, SVG, JSON and text. The pages are
//      server-rendered on every request and a phone on 4G feels every kilobyte; without it
//      PageSpeed flags ~300 KB a page.
//   2. A month of browser caching for the photos and icons in public/ (bottles, party, games,
//      scene, pay). Astro already marks its hashed /_astro files immutable.
//
// Run `node server.mjs` after `astro build`. HOST and PORT work as they do for entry.mjs.
import http from "node:http";
import compression from "compression";

process.env.ASTRO_NODE_AUTOSTART = "disabled";
const { handler } = await import("./dist/server/entry.mjs");

const compress = compression({ threshold: 1024 });
const MEDIA = /\.(webp|avif|jpe?g|png|gif|svg|ico|woff2?)$/i;

const server = http.createServer((req, res) => {
  if ((req.method === "GET" || req.method === "HEAD") && MEDIA.test(req.url.split("?")[0]) && !req.url.startsWith("/_astro/")) {
    // `send` (inside Astro's static handler) writes max-age=0 over any header set earlier, so
    // ours is applied as the file starts streaming, and only to a file that was found.
    const set = res.setHeader.bind(res);
    res.setHeader = (name, value) =>
      set(name, name.toLowerCase() === "cache-control" ? "public, max-age=2592000, stale-while-revalidate=86400" : value);
  }
  compress(req, res, () => handler(req, res));
});

const port = Number(process.env.PORT ?? 4321);
const host = process.env.HOST ?? "0.0.0.0";
server.listen(port, host, () => console.log(`The Liquor House on http://${host}:${port}`));
