# Liquor House Kenya — storefront

A standalone Astro 6 storefront for Liquor House Kenya, a Nairobi liquor shop. It is built in
the same shape as `beyond/` (Path B in `STOREFRONTS.md`): one Medusa sales channel, one
publishable key, and no `/manage` console because the owner runs the shop from the POS.

It also runs **with no backend at all**. Without a publishable key it serves its demo cellar
(`src/data/catalog.ts`) and checkout goes through WhatsApp. That lets the site be designed,
reviewed and shown to the owner before their channel exists.

## Run it

```bash
# from the REPO ROOT (see AGENTS.md: installing inside the app breaks React)
pnpm install
cd liquorhouse && rm -rf node_modules/.vite
NODE_ENV=development pnpm dev        # http://localhost:4325, needs Node 22.12+
pnpm check                           # astro check: 0 errors expected
```

Copy `.env.example` to `.env` to point it at a backend. Every `PUBLIC_*` variable is baked in
at **build** time.

| Variable | Without it | With it |
|---|---|---|
| `PUBLIC_MEDUSA_KEY_LIQUORHOUSE` | demo cellar, WhatsApp checkout | the shop's sales channel: shelf, stock, cart and Medusa checkout |
| `PUBLIC_MEDUSA_URL` | `http://localhost:8082` | the backend that issued the key |
| `PUBLIC_MEDUSA_REGION_ID` | the first region that lists Kenya | a pinned region |
| `PUBLIC_SITE_URL` | `https://liquorhouse.co.ke` | canonical URLs, sitemap, Open Graph |

In CI the site URL is passed as `PUBLIC_LIQUORHOUSE_SITE_URL`, so it does not collide with
the other apps' build args.

## What is on it

| Route | What it does |
|---|---|
| `/` | Hero over the Nairobi skyline, the back-bar shelf rail, the scroll-driven pour, occasion sets, house favourites, the cocktail lab, Made in Kenya and the delivery zones |
| `/shop` | Every bottle. Shelf, price band, search and sort are query parameters, so a filtered view can be shared |
| `/p/[handle]` | Product page: tasting notes, flavour profile, specs, serving and the cocktails it goes into |
| `/finder` | Taste finder. Three questions, then a ranked match |
| `/party` | Party planner. Guests, hours and crowd turn into bottles, beer, mixers and ice, and fill the bag |
| `/cocktails` | Recipes with an "Add the bottles" button, resolved against what is on the shelf |
| `/checkout` | Medusa checkout when the key is set, WhatsApp order otherwise |
| `/delivery`, `/about` | Zones and fees, hours and contact |
| `/healthz` | Container liveness. Touches nothing |

The 18+ gate is answered before the page paints, and an unconfirmed visitor never sees the
shelf behind it. All business facts (phone, WhatsApp, hours, zones and fees, free-delivery
threshold) are in `src/config/site.ts`. **Values marked `// confirm` are placeholders.** Get
the real ones from the shop before launch.

## Design

`src/styles/global.css` holds the whole design system as custom properties. There is no
Tailwind.

- **Day by default.** The page is a warm cream ground with cards a shade lighter, ink-brown
  type and amber as the light. On cream, amber text uses `--accent`, a deeper amber that
  passes contrast.
- **After hours where it earns it.** The hero, the marquee, the pour, the footer and the age
  gate sit in a `.dark` scope that declares the same tokens again in near-black. A component
  never needs to know which one it is in. When the home page opens on the dark hero, the
  header starts dark too (`<Base heroDark>`) and turns light once you scroll.
- Fraunces is the display face, Inter Tight the UI face and JetBrains Mono the labels and
  prices.

## Photographs: no drawn bottles

**Every bottle on the site is a photograph of that bottle.** `components/Bottle.tsx` prints a
product's `thumbnail` and nothing else. A product without a photograph is left off the shelf
(`site.photosOnly`) instead of being shown with a stand-in. This applies to the live
catalogue too: a POS product with no picture can still be sold in the shop but does not
appear on the website until it has one.

The photos are shot on pure white and printed with `mix-blend-mode: multiply`, so the white
takes on the colour of the card under them. That only works on a light surface, which is why
product photos never appear inside `.dark`. The hero and the pour use transparent cut-outs
instead (`public/hero/`).

**The demo cellar's photographs** come from the shop photographs already in the repo
(`medusa/src/scripts/data/beyond/`, which were downloaded from Nairobi retailers' listings
and are self-hosted, never hotlinked):

- `scripts/bottle-photos.json` maps each demo handle to its source photograph. Every pairing
  was checked by eye. Where no photograph of the exact bottle existed, the demo bottle was
  replaced with one that had a photograph (Talisker 10 instead of Lagavulin 16, for example)
  or left unmapped, which hides it.
- `scripts/bottle-credits.json` records the retailer and source of each one.
- `bash scripts/bottle-photos.sh` rebuilds `public/bottles/<handle>.webp` (600×750, pure
  white, the same floor line) and the hero cut-outs. It needs ImageMagick.

These bottles are in the cellar but hidden until they have a photograph: Gilbey's Special
Dry, Kenya Cane (original), Richot, Casamigos Reposado, Jägermeister, Martini Asti, the
Tusker crate, Schweppes tonic and soda, Stoney Tangawizi and party ice. To bring one back,
add its photograph to the map and re-run the script.

Once the shop's channel is live, its own product photos (uploaded in the POS or through
**Medusa admin → Catalogue import**) replace all of this automatically.

## Deploying

`Dockerfile` follows `beyond/Dockerfile`: a multi-stage Node 22 image that serves
`dist/server/entry.mjs` on port 4321, with a healthcheck on `/healthz`. The service is
`liquorhouse` in `docker-compose.prod.yml` (host port `LIQUORHOUSE_PORT`, default 4325), and
`.github/workflows/deploy.yml` builds `ghcr.io/levi-opunga/ecommerce-astro-liquorhouse`.

**Pushing to `main` deploys to production** (AGENTS.md). Before the site goes live:

1. Create the shop's sales channel, then set the repository Variables
   `PUBLIC_MEDUSA_KEY_LIQUORHOUSE` and `PUBLIC_LIQUORHOUSE_SITE_URL`. Without the key, the
   image ships the demo cellar, whose prices are indicative only.
2. Add both `https://<domain>` and `https://www.<domain>` to the backend's `STORE_CORS`
   and `AUTH_CORS`, **appending** them to the existing values. If you skip this, the pages
   load but nothing can be added to the basket.
3. Give the domain to the `liquorhouse` service in Dokploy.
4. Replace every `// confirm` in `src/config/site.ts`.
