import type { APIRoute } from "astro";
import { SHELVES, site } from "../config/site";
import { COCKTAILS } from "../data/cocktails";
import { listAll } from "../lib/catalog";
import { money } from "../lib/format";

/**
 * /llms-full.txt — every bottle on the shelf with its price, size, strength and notes, and
 * every cocktail recipe, for an assistant asked "how much is Jameson at The Liquor House?".
 * Prices are the live ones (Medusa when connected), as of the moment it is fetched.
 */
export const GET: APIRoute = async () => {
  const u = (p: string) => new URL(p, site.url).toString();
  const all = await listAll();
  const today = new Date().toISOString().slice(0, 10);

  const shelves = SHELVES.map((s) => {
    const items = all.filter((d) => d.category === s.id);
    if (!items.length) return "";
    return `## ${s.name}\n\n${items
      .map((d) => {
        const bits = [d.volume, d.ageRestricted ? `${d.abv}% ABV` : "", d.origin, d.price != null ? money(d.price) : "price on request", d.stock != null && d.stock <= 0 ? "out of stock" : ""].filter(Boolean);
        return `- [${d.name}](${u(`/p/${d.handle}`)}) — ${bits.join(" · ")}${d.notes.length ? `. Notes: ${d.notes.join(", ")}` : ""}`;
      })
      .join("\n")}`;
  }).filter(Boolean);

  const recipes = COCKTAILS.map((c) => `### ${c.name}\n\n${c.kicker}. About ${c.minutes} minutes.\n\nIngredients:\n${c.ingredients.map((i) => `- ${i.label}`).join("\n")}\n\nMethod:\n${c.method.map((m, i) => `${i + 1}. ${m}`).join("\n")}`);

  const text = `# ${site.name} — full catalogue

> Every bottle at ${site.name}, ${site.address}, with prices in Kenyan shillings as of ${today}. Open 24 hours; order on ${site.url}, by phone or WhatsApp on ${site.phone}. Delivered across Nairobi by ${site.courier.name}. Alcohol is sold to adults aged 18 and over only.

${shelves.join("\n\n")}

## Cocktail recipes

${recipes.join("\n\n")}
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
