import type { APIRoute } from "astro";
import { SHELVES, SPEEDS, ZONES, legal, site } from "../config/site";
import { FAQ } from "../data/faq";
import { GAMES } from "../data/games";
import { listAll, shelfCounts } from "../lib/catalog";
import { money } from "../lib/format";

/**
 * /llms.txt — the shop in plain Markdown for AI assistants (the llmstxt.org convention):
 * who it is, where, when, how delivery and payment work, and links to every shelf. Built from
 * the same config as the pages, so it can never disagree with them.
 */
export const GET: APIRoute = async () => {
  const u = (p: string) => new URL(p, site.url).toString();
  const all = await listAll();
  const counts = shelfCounts(all);
  const priced = all.filter((d) => d.price != null);
  const lo = Math.min(...priced.map((d) => d.price!));
  const hi = Math.max(...priced.map((d) => d.price!));

  const text = `# ${site.name}

> ${site.name} is ${site.tagline} — a walk-in liquor supermarket on ${site.street}, ${site.area}, Nairobi, Kenya. Open 24 hours, every day. Whisky, cognac, gin, vodka, tequila, rum, liqueurs, wine, champagne, beer and soft drinks, from ${money(lo)} to ${money(hi)}. Delivered across Nairobi by ${site.courier.name}; pay by M-Pesa or card.

## Key facts

- Address: ${site.address}
- Map: ${site.maps}
- Hours: open 24 hours, every day
- Phone and WhatsApp: ${site.phone}
- Website: ${site.url}
- Instagram and X: ${site.socials.map((s) => s.handle).join(", ")}
- Also on Glovo
- Payment: M-Pesa or card (Visa, Mastercard). No cash on delivery.
- Age: ${legal.ageLine} ${legal.idLine} Under-18s may buy soft drinks, mixers and ice only.
- Diageo tasting room in store, opened with Kenya Breweries in December 2020.

## Delivery (${site.courier.name})

${ZONES.map((z) => `- ${z.name}: ${money(z.fee)}, about ${z.eta} (${z.areas.join(", ")})`).join("\n")}
- Free in the city zones on orders over ${money(site.freeDeliveryOver)}.
${SPEEDS.map((s) => `- ${s.name}: ${s.line}`).join("\n")}

## Shelves

${SHELVES.map((s) => `- [${s.name}](${u(`/shop?shelf=${s.id}`)}): ${counts[s.id] ?? 0} bottles. ${s.line}`).join("\n")}

## Tools on the site

- [Party planner](${u("/party")}): guests, hours and occasion in; bottles, crates, mixers, ice and a total out.
- [Taste finder](${u("/finder")}): three questions, matched bottles.
- [Cocktail recipes](${u("/cocktails")}): eight cocktails, including Nairobi's Dawa, with the bottles to buy.
- [Games night](${u("/games")}): ${GAMES.length} free party and quiz games in English and Sheng.

## Frequently asked

${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Policies

- [Delivery](${u("/delivery")})
- [Terms & Conditions](${u("/terms")})
- [Privacy Policy](${u("/privacy")})
- [Cookie Policy](${u("/cookies")})

## Optional

- [Full catalogue with prices](${u("/llms-full.txt")})
- [Sitemap](${u("/sitemap.xml")})
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
