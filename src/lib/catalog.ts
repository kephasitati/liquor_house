import type { Drink, Profile } from "./types";
import { LIVE, medusa, PRODUCT_FIELDS, regionId } from "./medusa";
import { liquidColour, SHAPE_BY_SHELF } from "./colour";
import { SHELF_BY_ID, SHELVES } from "../config/site";
import { DEMO_CATALOG } from "../data/catalog";

/**
 * One catalogue, two sources. With a publishable key the shelf is the shop's Medusa sales
 * channel; without one it is the demo cellar. Every page reads through here and never knows
 * which.
 *
 * Medusa → Drink, reading the fields the POS writes when a product is set up:
 *   category  categories[0].handle      the shelf id
 *   brand     metadata.brand
 *   specs     metadata.specs.{Volume,ABV,Origin}
 *   tags      metadata.tags             bestseller · premium · local · occasion:<id> …
 *   notes     metadata.notes
 *   profile   metadata.profile          {sweet,smoky,fruity,spicy,oaky,fresh} 0–5
 */

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const m = typeof v === "string" ? v.replace(/,/g, "").match(/-?\d+(\.\d+)?/) : null;
  return m ? Number(m[0]) : fallback;
}

function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim()) return v.split(/[,·]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function readProfile(v: any): Profile | null {
  if (!v || typeof v !== "object") return null;
  const keys = ["sweet", "smoky", "fruity", "spicy", "oaky", "fresh"] as const;
  const out = Object.fromEntries(keys.map((k) => [k, Math.max(0, Math.min(5, num(v[k], 0)))])) as unknown as Profile;
  return Object.values(out).some((n) => n > 0) ? out : null;
}

function stockOf(p: any): number | null {
  const known = (p?.variants ?? [])
    .map((v: any) => (v?.manage_inventory === false ? null : v?.inventory_quantity))
    .filter((n: unknown) => typeof n === "number") as number[];
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
}

export function fromMedusa(p: any): Drink {
  const v = p?.variants?.[0] ?? null;
  const meta = p?.metadata ?? {};
  const specs = (meta.specs ?? {}) as Record<string, string>;
  const category = p?.categories?.[0]?.handle ?? meta.category ?? "";
  const price: number | null = v?.calculated_price?.calculated_amount ?? v?.calculated_price?.original_amount ?? null;
  const orig = Number(v?.calculated_price?.original_amount);
  const metaWas = Number(meta.compare_at_price);
  const was = Number.isFinite(metaWas) && metaWas > 0 ? metaWas : Number.isFinite(orig) ? orig : null;
  const subcategory = String(meta.subcategory ?? p?.subtitle ?? SHELF_BY_ID[category]?.name ?? "");
  return {
    handle: p?.handle ?? p?.id,
    productId: p?.id,
    variantId: v?.id ?? null,
    name: p?.title ?? "",
    brand: String(meta.brand ?? ""),
    category,
    subcategory,
    price,
    oldPrice: was != null && price != null && was > price ? was : null,
    volume: String(specs.Volume ?? meta.volume ?? ""),
    abv: num(specs.ABV ?? meta.abv, 0),
    origin: String(specs.Origin ?? meta.origin ?? ""),
    stock: stockOf(p),
    tags: list(meta.tags),
    notes: list(meta.notes),
    profile: readProfile(meta.profile),
    colour: meta.colour ? String(meta.colour) : liquidColour({ subcategory, name: p?.title, category }),
    shape: (meta.shape as Drink["shape"]) ?? SHAPE_BY_SHELF[category] ?? "spirit",
    thumbnail: p?.thumbnail ?? p?.images?.[0]?.url ?? null,
    description: String(p?.description ?? ""),
    serve: String(meta.serve ?? ""),
    ageRestricted: meta.age_restricted != null ? !!meta.age_restricted : SHELF_BY_ID[category]?.ageRestricted ?? true,
  };
}

/* The live shelf, fetched in pages of 200 until the reported `count` is reached (so a shelf
 * larger than one page is never silently cut short) and cached for a minute. Never throws. */
const TTL = 60_000;
let cache: { at: number; value: Drink[] } | null = null;
let inflight: Promise<Drink[]> | null = null;

async function fetchLive(): Promise<Drink[]> {
  try {
    const region_id = await regionId();
    const all: any[] = [];
    let total = Infinity;
    while (all.length < total && all.length < 20_000) {
      const { products, count } = (await medusa.store.product.list({
        limit: 200, offset: all.length, region_id, fields: PRODUCT_FIELDS,
      } as any)) as any;
      if (typeof count === "number") total = count;
      if (!products?.length) break;
      all.push(...products);
    }
    return all.map(fromMedusa);
  } catch (err) {
    console.error("[catalog] Medusa fetch failed:", (err as Error).message);
    return cache?.value ?? [];
  }
}

export async function listAll(): Promise<Drink[]> {
  if (!LIVE) return DEMO_CATALOG;
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  inflight ??= fetchLive().then((value) => {
    if (value.length) cache = { at: Date.now(), value };
    inflight = null;
    return value;
  });
  return inflight;
}

export async function getDrink(handle: string): Promise<Drink | null> {
  return (await listAll()).find((d) => d.handle === handle) ?? null;
}

/* ------------------------------------------------------------------ queries */

export const isBestseller = (d: Drink) => d.tags.includes("bestseller");

/** Bestsellers, then premium, then anything with a price. */
export function rank(a: Drink, b: Drink): number {
  const score = (d: Drink) => (isBestseller(d) ? 2 : 0) + (d.tags.includes("premium") ? 1 : 0) + (d.price ? 0.5 : 0);
  return score(b) - score(a);
}

export function shelfCounts(items: Drink[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of items) out[d.category] = (out[d.category] ?? 0) + 1;
  return out;
}

/** Picks for an occasion: tagged bottles first, then the best of its shelves. */
export function forOccasion(items: Drink[], id: string, shelves: string[], n = 4): Drink[] {
  const tagged = items.filter((d) => d.tags.includes(`occasion:${id}`) && d.price != null);
  const fill = shelves
    .flatMap((s) => items.filter((d) => d.category === s && d.price != null).sort(rank))
    .filter((d) => !tagged.includes(d));
  return [...tagged, ...fill].slice(0, n);
}

export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "A – Z" },
] as const;
export type SortId = (typeof SORTS)[number]["id"];

export const PRICE_BANDS = [
  { id: "u2", label: "Under 2k", min: 0, max: 2000 },
  { id: "2-5", label: "2k – 5k", min: 2000, max: 5000 },
  { id: "5-10", label: "5k – 10k", min: 5000, max: 10000 },
  { id: "10p", label: "10k +", min: 10000, max: Infinity },
] as const;

export interface ShopQuery {
  shelf?: string | null;
  q?: string | null;
  band?: string | null;
  tag?: string | null;
  sort?: SortId;
}

export function query(items: Drink[], f: ShopQuery): Drink[] {
  let out = items;
  if (f.shelf) out = out.filter((d) => d.category === f.shelf);
  if (f.tag) out = out.filter((d) => d.tags.includes(f.tag!));
  const band = PRICE_BANDS.find((b) => b.id === f.band);
  if (band) out = out.filter((d) => d.price != null && d.price >= band.min && d.price < band.max);
  if (f.q) {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    out = out.filter((d) => {
      const hay = `${d.name} ${d.brand} ${d.subcategory} ${d.origin} ${SHELF_BY_ID[d.category]?.name ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }
  const s = out.slice();
  switch (f.sort) {
    case "price-asc": return s.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
    case "price-desc": return s.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "name": return s.sort((a, b) => a.name.localeCompare(b.name));
    default: {
      // Featured: shelves in back-bar order, the best of each first.
      const order = new Map(SHELVES.map((sh, i) => [sh.id, i]));
      return s.sort((a, b) => (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99) || rank(a, b));
    }
  }
}

/** Bottles that drink like this one: same shelf, nearest flavour profile. */
export function similar(items: Drink[], d: Drink, n = 4): Drink[] {
  const dist = (o: Drink) => {
    if (!d.profile || !o.profile) return 10;
    return (Object.keys(d.profile) as (keyof Profile)[]).reduce((s, k) => s + Math.abs(d.profile![k] - o.profile![k]), 0);
  };
  return items
    .filter((o) => o.handle !== d.handle && o.category === d.category)
    .sort((a, b) => dist(a) - dist(b))
    .slice(0, n);
}

/** A cocktail ingredient → a bottle we sell: the preferred brand, else the shelf's best. */
export function resolveIngredient(items: Drink[], shelf: string, brand?: string): Drink | null {
  const onShelf = items.filter((d) => d.category === shelf && d.price != null);
  if (!onShelf.length) return null;
  if (brand) {
    const b = brand.toLowerCase();
    const hit = onShelf.find((d) => d.brand.toLowerCase().includes(b) || d.name.toLowerCase().includes(b));
    if (hit) return hit;
  }
  return onShelf.slice().sort(rank)[0];
}
