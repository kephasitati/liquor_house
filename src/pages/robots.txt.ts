import type { APIRoute } from "astro";
import { site } from "../config/site";

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /checkout\nSitemap: ${new URL("/sitemap.xml", site.url)}\n`, {
    headers: { "content-type": "text/plain" },
  });
