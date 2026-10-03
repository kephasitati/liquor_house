import type { APIRoute } from "astro";
import { site } from "../config/site";
import { listAll } from "../lib/catalog";

export const GET: APIRoute = async () => {
  const pages = ["/", "/shop", "/cocktails", "/finder", "/party", "/delivery", "/about"];
  const products = (await listAll()).map((d) => `/p/${d.handle}`);
  const urls = [...pages, ...products].map((p) => `<url><loc>${new URL(p, site.url)}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "content-type": "application/xml" },
  });
};
