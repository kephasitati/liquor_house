/** Six axes, 0–5. Drives the flavour bars on a product page and the taste finder. */
export interface Profile {
  sweet: number;
  smoky: number;
  fruity: number;
  spicy: number;
  oaky: number;
  fresh: number;
}

export const PROFILE_AXES: { key: keyof Profile; label: string }[] = [
  { key: "sweet", label: "Sweet" },
  { key: "fruity", label: "Fruity" },
  { key: "fresh", label: "Fresh" },
  { key: "spicy", label: "Spicy" },
  { key: "oaky", label: "Oak" },
  { key: "smoky", label: "Smoke" },
];

export interface Drink {
  handle: string;
  productId: string;
  /** Null for the demo cellar: those bottles check out over WhatsApp, not Medusa. */
  variantId: string | null;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number | null;
  oldPrice: number | null;
  volume: string;
  abv: number;
  origin: string;
  /** null means "not measured", which reads as in stock. */
  stock: number | null;
  tags: string[];
  notes: string[];
  profile: Profile | null;
  colour: string;
  shape: "spirit" | "wine" | "champagne" | "can" | "box";
  thumbnail: string | null;
  description: string;
  serve: string;
  ageRestricted: boolean;
}

/** What the bag keeps per line. A snapshot, so the drawer renders with no network. */
export interface BagLine {
  handle: string;
  variantId: string | null;
  name: string;
  brand: string;
  volume: string;
  price: number;
  colour: string;
  shape: Drink["shape"];
  thumbnail: string | null;
  qty: number;
}

export function toLine(d: Drink, qty = 1): BagLine {
  return {
    handle: d.handle,
    variantId: d.variantId,
    name: d.name,
    brand: d.brand,
    volume: d.volume,
    price: d.price ?? 0,
    colour: d.colour,
    shape: d.shape,
    thumbnail: d.thumbnail,
    qty,
  };
}
