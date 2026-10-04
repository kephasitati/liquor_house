import Medusa from "@medusajs/js-sdk";

/**
 * Medusa Store SDK — a single store. The publishable key IS the
 * store: Medusa resolves it to this shop's sales channel before any handler runs.
 *
 * No key means no backend yet: `LIVE` is false, the catalogue comes from the demo cellar and
 * checkout sends the order over WhatsApp. Nothing calls Medusa in that mode.
 */
const MEDUSA_URL = (import.meta.env.PUBLIC_MEDUSA_URL ?? "http://localhost:8082").replace(/\/+$/, "");
const KEY = (import.meta.env.PUBLIC_MEDUSA_KEY_LIQUORHOUSE as string | undefined) ?? "";

export const LIVE = KEY.length > 0;
export const medusa = new Medusa({ baseUrl: MEDUSA_URL, publishableKey: KEY || "pk_unset" });

export const PRODUCT_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,*images,*categories,metadata," +
  "*variants,*variants.calculated_price,variants.inventory_quantity,variants.manage_inventory,variants.sku";

let regionCache: string | null = null;

/** The Kenyan region: pinned by env, else the first region that lists `ke`. */
export async function regionId(): Promise<string | undefined> {
  if (import.meta.env.PUBLIC_MEDUSA_REGION_ID) return import.meta.env.PUBLIC_MEDUSA_REGION_ID;
  if (regionCache) return regionCache;
  const { regions } = await medusa.store.region.list({ fields: "id,*countries" });
  const match = regions.find((r: any) => r.countries?.some((c: any) => c.iso_2?.toLowerCase() === "ke")) ?? regions[0];
  regionCache = match?.id ?? null;
  return regionCache ?? undefined;
}
