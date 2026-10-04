/**
 * Everything about the shop that is a business fact rather than design lives here, so the
 * owner's answers land in one file.
 *
 * The facts below are the shop's own public listing (Google Business Profile, Instagram
 * @liquorhouse254, October 2026): Kenya's first liquor supermarket, on Kiambu Road beside the
 * Astrol station, open around the clock, orders on 0700 884444. Anything still marked
 * `// confirm` is ours, not theirs: the domain, the email, delivery fees and the
 * free-delivery threshold. (@theliquorhouseke in Parklands is a different business.)
 */
export const site = {
  name: "The Liquor House",
  short: "Liquor House",
  tagline: "Kenya's first liquor supermarket",
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? "https://liquorhouse.co.ke", // confirm
  locale: "en-KE",
  country: "ke",
  city: "Nairobi",
  street: "Kiambu Road, beside Astrol petrol station",
  area: "Ridgeways",
  address: "Kiambu Road, beside Astrol petrol station, Ridgeways, Nairobi",
  maps: "https://www.google.com/maps/search/?api=1&query=The+Liquor+House+Supermarket+Kiambu+Road+Nairobi",
  phone: "+254 700 884 444",
  whatsapp: "254700884444",
  /** Empty until the shop gives us one; the pages leave the line out. */
  email: "", // confirm
  hours: [{ days: "Every day", time: "Open 24 hours" }],
  /** schema.org openingHours, for the structured data in the layout. */
  openingHours: "Mo-Su 00:00-23:59",
  socials: [
    { name: "Instagram", icon: "instagram", handle: "@liquorhouse254", url: "https://www.instagram.com/liquorhouse254/" },
    { name: "X", icon: "x", handle: "@liquorhouse254", url: "https://x.com/liquorhouse254" },
  ],
  /** Every delivery in Nairobi is ridden by TumaBoda; its name always renders in its own
   *  colours (src/components/TumaBoda.tsx). */
  courier: { name: "TumaBoda", url: "https://tumaboda.co.ke" },
  /** The shop also takes orders through Glovo. */
  glovo: "https://glovoapp.com/ke/en/nairobi/",
  /** Diageo's tasting room, opened with Kenya Breweries in December 2020. */
  tastingRoom: true,
  /** Free delivery within the nearer zones once the bag reaches this. */
  freeDeliveryOver: 10_000, // confirm
  storagePrefix: "lhk_",
} as const;

/** Kenyan law: no sale to under-18s, and the statutory health message. Shown in the footer,
 *  the age gate and at checkout. */
export const legal = {
  /** When the terms, privacy and cookie pages last changed. */
  updated: "4 October 2026",
  minimumAge: 18,
  ageLine: "Not for sale to persons under the age of 18.",
  healthLine: "Excessive consumption of alcohol is harmful to your health.",
  idLine: "TumaBoda riders check ID on delivery.",
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
  { id: "mixers", name: "Soft Drinks & Mixers", line: "Sodas, tonic, energy drinks and ice — open to everyone, no age check.", hue: "#6fa8c9", shape: "can", ageRestricted: false },
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
  // Ordered by distance from the shop on Kiambu Road. Fees and times: confirm.
  { id: "kiambu-road", name: "Kiambu Road & Ridgeways", fee: 150, eta: "15 – 30 min", areas: ["Ridgeways", "Kiambu Road", "Thindigua", "Karura", "Garden Estate", "Muthaiga North"] },
  { id: "north", name: "Runda, Gigiri & Muthaiga", fee: 200, eta: "20 – 40 min", areas: ["Runda", "Gigiri", "Muthaiga", "Rosslyn", "Two Rivers", "Village Market"] },
  { id: "kiambu", name: "Kiambu, Ruaka & Banana", fee: 250, eta: "30 – 45 min", areas: ["Kiambu Town", "Ruaka", "Banana", "Ndenderu", "Kirigiti", "Tatu City"] },
  { id: "westlands", name: "Westlands & Parklands", fee: 250, eta: "30 – 45 min", areas: ["Westlands", "Parklands", "Spring Valley", "Loresho", "Kitisuru", "Highridge"] },
  { id: "thika", name: "Thika Road & Kasarani", fee: 300, eta: "35 – 55 min", areas: ["Roysambu", "Garden City", "Kasarani", "Zimmerman", "Kahawa", "Ruiru"] },
  { id: "cbd", name: "CBD, Kilimani & Upper Hill", fee: 300, eta: "40 – 60 min", areas: ["CBD", "Upper Hill", "Kilimani", "Lavington", "Kileleshwa", "Hurlingham"] },
  { id: "south", name: "Karen, Lang'ata & South", fee: 450, eta: "60 – 90 min", areas: ["Karen", "Lang'ata", "South B", "South C", "Madaraka", "Ngong Road"] },
  { id: "east", name: "Eastlands & Embakasi", fee: 450, eta: "60 – 90 min", areas: ["Buruburu", "Donholm", "Embakasi", "Umoja", "Fedha", "Eastleigh"] },
];

export const ZONE_BY_ID: Record<string, Zone> = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const SPEEDS = [
  { id: "express", name: "Express", line: "A TumaBoda rider leaves now", surcharge: 150 }, // confirm
  { id: "standard", name: "Scheduled", line: "Pick a time — we're open 24 hours", surcharge: 0 },
  { id: "collect", name: "Collect", line: "From the supermarket on Kiambu Road", surcharge: 0 },
] as const;

export type SpeedId = (typeof SPEEDS)[number]["id"];
