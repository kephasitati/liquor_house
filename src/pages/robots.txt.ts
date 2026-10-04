import type { APIRoute } from "astro";
import { site } from "../config/site";

/**
 * Open to every search engine and every AI assistant: the shop wants to be the answer when
 * someone asks where to buy whisky in Nairobi at 2am. The AI crawlers are named so nobody
 * reading this file wonders whether they were forgotten. Checkout and searches stay out.
 */
const AI = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", // OpenAI
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot", "Meta-ExternalAgent", "CCBot",
];

export const GET: APIRoute = () => {
  const rules = ["Allow: /", "Disallow: /checkout", "Disallow: /shop?q=", "Disallow: /*?*q="];
  const body = [
    "# The Liquor House — Kiambu Road, Nairobi. Open 24 hours.",
    "# A summary for AI assistants: /llms.txt (full catalogue: /llms-full.txt)",
    "",
    "User-agent: *",
    ...rules,
    "",
    ...AI.flatMap((bot) => [`User-agent: ${bot}`, ...rules, ""]),
    `Sitemap: ${new URL("/sitemap.xml", site.url)}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
