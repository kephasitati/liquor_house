/**
 * Everything about the shop that is a business fact rather than design lives here, so the
 * owner's answers land in one file.
 *
 * TO CONFIRM WITH THE SHOP before launch — every value marked `// confirm` is a sensible
 * placeholder, not something the shop has told us: the street address, phone and WhatsApp
 * number, opening hours, delivery fees and the free-delivery threshold.
 */
export const site = {
  name: "Liquor House Kenya",
  short: "Liquor House",
  tagline: "Nairobi's house of fine spirits",
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) || "https://liquorhouse.co.ke", // confirm (an empty build arg must fall back too)
  locale: "en-KE",
  country: "ke",
  city: "Nairobi",
  address: "Nairobi, Kenya", // confirm: street and landmark
  phone: "+254 700 000 000", // confirm
  whatsapp: "254700000000", // confirm: digits only, 2547XXXXXXXX
  email: "orders@liquorhouse.co.ke", // confirm
  hours: [
    { days: "Mon – Thu", time: "10am – 11pm" }, // confirm
    { days: "Fri – Sat", time: "10am – 1am" }, // confirm
    { days: "Sunday", time: "12pm – 10pm" }, // confirm
  ],
  /** Free delivery within the city zones once the bag reaches this. */
  freeDeliveryOver: 10_000, // confirm
  storagePrefix: "lhk_",
  /** Leave a product off the shelf until it has a photograph, rather than show it without
   *  one. Applies to the live Medusa catalogue too: a POS product with no picture stays
   *  sellable in the shop but does not appear on the website until it gets one. */
  photosOnly: true,
} as const;

/** Kenyan law: no sale to under-18s, and the statutory health message. Shown in the footer,
 *  the age gate and at checkout. */
export const legal = {
  minimumAge: 18,
  ageLine: "Not for sale to persons under the age of 18.",
  healthLine: "Excessive consumption of alcohol is harmful to your health.",
  idLine: "Our riders check ID on delivery.",
};

export interface Shelf {
  id: string;
  name: string;
  /** One line under the shelf name — the voice is a bartender's, not a catalogue's. */
  line: string;
  /** The glow behind the shelf on the back bar. */
  hue: string;
  shape: "spirit" | "wine" | "champagne" | "can" | "box";
  ageRestricted: boolean;
}

export const SHELVES: Shelf[] = [
  { id: "whisky", name: "Whisky", line: "Scotch, Irish, bourbon — peat to honey.", hue: "#c8782a", shape: "spirit", ageRestricted: true },
  { id: "cognac", name: "Cognac & Brandy", line: "Slow sipping, grape and oak.", hue: "#9a4a1c", shape: "spirit", ageRestricted: true },
  { id: "gin", name: "Gin", line: "Juniper first, tonic second.", hue: "#7fb7a6", shape: "spirit", ageRestricted: true },
  { id: "vodka", name: "Vodka", line: "Clean, cold, and ready to mix.", hue: "#a9c4dc", shape: "spirit", ageRestricted: true },
  { id: "tequila", name: "Tequila", line: "Agave, salt, and a late night.", hue: "#d8b45a", shape: "spirit", ageRestricted: true },
  { id: "rum", name: "Rum & Cane", line: "From Kenya Cane to Caribbean spice.", hue: "#b5602b", shape: "spirit", ageRestricted: true },
  { id: "liqueur", name: "Liqueurs", line: "Cream, coffee, bitter, sweet.", hue: "#b98a5e", shape: "spirit", ageRestricted: true },
  { id: "wine", name: "Wine", line: "Sweet reds for the table, dry whites for the sun.", hue: "#8a1c34", shape: "wine", ageRestricted: true },
  { id: "champagne", name: "Champagne & Bubbles", line: "For the toast, the ruracio, the win.", hue: "#e3c77a", shape: "champagne", ageRestricted: true },
  { id: "beer", name: "Beer & Cider", line: "Cold Tusker, by the bottle or the crate.", hue: "#d39a32", shape: "can", ageRestricted: true },
  { id: "mixers", name: "Mixers & Ice", line: "Tonic, soda, energy and ice. No age check.", hue: "#6fa8c9", shape: "can", ageRestricted: false },
];

export const SHELF_BY_ID: Record<string, Shelf> = Object.fromEntries(SHELVES.map((s) => [s.id, s]));

/** The occasion picker on the home page. `pick` names the tags and shelves it draws from. */
export interface Occasion {
  id: string;
  name: string;
  kicker: string;
  line: string;
  /** Products tagged `occasion:<id>` come first; these shelves fill any gaps. */
  shelves: string[];
}

export const OCCASIONS: Occasion[] = [
  { id: "sundowner", name: "Sundowner", kicker: "6:40pm, the balcony", line: "Gin, tonic and the last of the light over the city.", shelves: ["gin", "mixers", "wine"] },
  { id: "nyama", name: "Nyama Choma Sunday", kicker: "Smoke, friends, a long table", line: "Cold beer by the crate and a whisky for after.", shelves: ["beer", "whisky", "mixers"] },
  { id: "celebration", name: "Ruracio & Weddings", kicker: "The toast that everyone remembers", line: "Bubbles for the toast, cognac for the elders.", shelves: ["champagne", "cognac", "whisky"] },
  { id: "matchnight", name: "Match Night", kicker: "Kick-off at 10pm", line: "Lager, cider and something to shout over.", shelves: ["beer", "vodka", "mixers"] },
  { id: "office", name: "Office Party", kicker: "Thirty people, one budget", line: "Crowd-pleasers that go the distance.", shelves: ["vodka", "wine", "beer"] },
  { id: "quiet", name: "Quiet Night In", kicker: "A record, a chair, one good pour", line: "Single malts and slow cognac.", shelves: ["whisky", "cognac", "liqueur"] },
];

/**
 * Delivery zones. Fees and windows are placeholders until the shop confirms them — they
 * drive the WhatsApp checkout's total. With a Medusa channel, the backend's own shipping
 * options are shown instead and these are only used for the delivery page.
 */
export interface Zone {
  id: string;
  name: string;
  fee: number;
  eta: string;
  areas: string[];
}

export const ZONES: Zone[] = [
  { id: "cbd", name: "CBD & Upper Hill", fee: 200, eta: "30 – 45 min", areas: ["CBD", "Upper Hill", "Ngara", "Parklands"] }, // confirm
  { id: "westlands", name: "Westlands & Kilimani", fee: 250, eta: "30 – 45 min", areas: ["Westlands", "Kilimani", "Lavington", "Kileleshwa", "Riverside", "Hurlingham"] }, // confirm
  { id: "south", name: "Karen, Lang'ata & South", fee: 350, eta: "45 – 60 min", areas: ["Karen", "Lang'ata", "South B", "South C", "Madaraka", "Ngong Road"] }, // confirm
  { id: "north", name: "Runda, Gigiri & Muthaiga", fee: 350, eta: "45 – 60 min", areas: ["Runda", "Gigiri", "Muthaiga", "Ridgeways", "Kitisuru", "Two Rivers"] }, // confirm
  { id: "east", name: "Eastlands & Embakasi", fee: 350, eta: "45 – 75 min", areas: ["Buruburu", "Donholm", "Embakasi", "Umoja", "Fedha", "Eastleigh"] }, // confirm
  { id: "thika", name: "Thika Road & Kasarani", fee: 400, eta: "60 – 90 min", areas: ["Kasarani", "Roysambu", "Garden City", "Zimmerman", "Kahawa", "Ruiru"] }, // confirm
  { id: "outer", name: "Kiambu, Rongai & Syokimau", fee: 500, eta: "60 – 90 min", areas: ["Kiambu", "Ruaka", "Rongai", "Syokimau", "Kitengela", "Athi River"] }, // confirm
];

export const ZONE_BY_ID: Record<string, Zone> = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const SPEEDS = [
  { id: "express", name: "Express", line: "Rider leaves now", surcharge: 150 }, // confirm
  { id: "standard", name: "This evening", line: "6pm – 10pm", surcharge: 0 },
  { id: "collect", name: "Collect", line: "Ready in 20 minutes", surcharge: 0 },
] as const;

export type SpeedId = (typeof SPEEDS)[number]["id"];
