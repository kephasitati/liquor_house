import type { APIRoute } from "astro";
import { SHELVES, legal, site } from "../config/site";
import { GAMES } from "../data/games";
import { listAll } from "../lib/catalog";

/**
 * Every indexable page: the static pages, one URL per shelf, every game and every bottle —
 * with the bottle's photo, so it can show in image search. The policies carry the date they
 * last changed; everything else is as fresh as the catalogue.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const policies = new Date(`${legal.updated} UTC`).toISOString().slice(0, 10);
  type U = { path: string; priority: string; freq: string; lastmod?: string; image?: { loc: string; title: string } };
  const urls: U[] = [
    { path: "/", priority: "1.0", freq: "daily" },
    { path: "/shop", priority: "0.9", freq: "daily" },
    ...SHELVES.map((s) => ({ path: `/shop?shelf=${s.id}`, priority: "0.8", freq: "daily" })),
    { path: "/delivery", priority: "0.8", freq: "monthly" },
    { path: "/party", priority: "0.7", freq: "monthly" },
    { path: "/cocktails", priority: "0.7", freq: "monthly" },
    { path: "/finder", priority: "0.6", freq: "monthly" },
    { path: "/games", priority: "0.6", freq: "weekly" },
    ...GAMES.map((g) => ({ path: `/games/${g.id}`, priority: "0.4", freq: "monthly" })),
    { path: "/about", priority: "0.6", freq: "monthly" },
    ...["/terms", "/privacy", "/cookies"].map((path) => ({ path, priority: "0.2", freq: "yearly", lastmod: policies })),
    ...(await listAll()).map((d) => ({
      path: `/p/${d.handle}`,
      priority: "0.7",
      freq: "weekly",
      image: d.thumbnail ? { loc: new URL(d.thumbnail, site.url).toString(), title: `${d.name} ${d.volume}` } : undefined,
    })),
  ];
  const body = urls
    .map((u) =>
      `<url><loc>${esc(new URL(u.path, site.url).toString())}</loc><lastmod>${u.lastmod ?? today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority>` +
      (u.image ? `<image:image><image:loc>${esc(u.image.loc)}</image:loc><image:title>${esc(u.image.title)}</image:title></image:image>` : "") +
      `</url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } },
  );
};
