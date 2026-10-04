import type { Drink } from "../lib/types";

/**
 * The party planner: occasions to start from, and the arithmetic that turns a headcount into
 * a shopping list. Written down so the shop can argue with it:
 *
 *   drinks a guest   2 the first hour, 1 an hour to hour six, then ½ an hour
 *   split            by crowd — a beer crowd drinks 65% beer, a spirits crowd 60% spirits
 *   spirits          one 750ml bottle pours ~16 drinks (45ml with a mixer)
 *   wine             one 750ml bottle pours 5 glasses
 *   bubbles          one bottle toasts 6
 *   shots            25 a bottle, two each
 *   beer             one bottle is one drink; 20 or more becomes crates where there is one
 *   mixers           tonic, Stoney, soda: 2 drinks a 500ml · cola: 8 drinks a 2L
 *   not drinking     about 1 + ⅗ of the hours glasses each, from 2L sodas
 *   ice              a 2kg bag for every 8 guests, one more past three hours
 */
export type Crowd = "beer" | "mixed" | "spirits" | "wine";
export type Tier = "pocket" | "classic" | "premium";
export type Extra = "toast" | "shots" | "energy" | "ice";

export const CROWDS: Record<Crowd, { name: string; sw: string; split: { beer: number; wine: number; spirits: number } }> = {
  beer: { name: "Mostly beer", sw: "Baridi baridi", split: { beer: 0.65, wine: 0.15, spirits: 0.2 } },
  mixed: { name: "Kidogo ya kila kitu", sw: "A bit of everything", split: { beer: 0.4, wine: 0.25, spirits: 0.35 } },
  spirits: { name: "Spirits-forward", sw: "Mzinga na mixer", split: { beer: 0.2, wine: 0.2, spirits: 0.6 } },
  wine: { name: "Wine lovers", sw: "Glasi ya wine", split: { beer: 0.15, wine: 0.6, spirits: 0.25 } },
};

export const TIERS: Record<Tier, { name: string; sw: string; line: string }> = {
  pocket: { name: "Pocket-friendly", sw: "Bajeti poa", line: "The bottles every bar pours — honest and good value." },
  classic: { name: "Classic", sw: "Zile tunajua", line: "The bestsellers. Nobody complains, everybody knows them." },
  premium: { name: "Premium", sw: "Tunaenda juu", line: "The labels people photograph before they open." },
};

export const SPIRITS: { id: string; name: string }[] = [
  { id: "whisky", name: "Whisky" },
  { id: "vodka", name: "Vodka" },
  { id: "gin", name: "Gin" },
  { id: "tequila", name: "Tequila" },
  { id: "rum", name: "Rum" },
  { id: "cognac", name: "Cognac" },
];

export const EXTRAS: Record<Extra, { name: string; line: string }> = {
  toast: { name: "Toast ya bubbles", line: "A glass each for the speech" },
  shots: { name: "Round ya shots", line: "Tequila, two each" },
  energy: { name: "Energy ya usiku", line: "Red Bull for the late shift" },
  ice: { name: "Barafu", line: "2kg bags, delivered cold" },
};

export const HOURS = [2, 3, 4, 5, 6, 8, 10];
export const hoursLabel = (h: number) => (h >= 10 ? "Mpaka asubuhi" : `${h} hours`);

export interface PartyInput {
  occasion: string;
  guests: number;
  hours: number;
  /** Percent of guests not drinking: drivers, wazee, the pregnant, the teetotal. */
  sober: number;
  crowd: Crowd;
  spirits: string[];
  tier: Tier;
  extras: Extra[];
}

export interface PartyOccasion extends Omit<PartyInput, "occasion" | "tier"> {
  id: string;
  name: string;
  sw: string;
  line: string;
  photo: string;
  /** object-position, so faces stay in the crop */
  focus: string;
  hue: string;
}

export const PARTIES: PartyOccasion[] = [
  { id: "birthday", name: "Birthday Bash", sw: "Birthday ya mbogi", line: "Cake, a toast and a night that goes long.", photo: "/party/birthday.webp", focus: "50% 40%", hue: "#d9467a",
    guests: 25, hours: 5, sober: 15, crowd: "mixed", spirits: ["vodka", "whisky"], extras: ["toast", "shots", "ice"] },
  { id: "nyama", name: "Nyama Choma", sw: "Nyama na mbogi", line: "Smoke, a long table and cold Tusker by the crate.", photo: "/party/nyama.webp", focus: "50% 45%", hue: "#c4471f",
    guests: 20, hours: 6, sober: 10, crowd: "beer", spirits: ["whisky"], extras: ["ice"] },
  { id: "ruracio", name: "Ruracio & Harusi", sw: "Sherehe ya familia", line: "Bubbles for the toast, cognac for the wazee.", photo: "/party/ruracio.webp", focus: "50% 30%", hue: "#9c3d5a",
    guests: 80, hours: 6, sober: 35, crowd: "mixed", spirits: ["whisky", "cognac"], extras: ["toast", "ice"] },
  { id: "match", name: "Match Night", sw: "Kick-off saa nne", line: "Crates, a vodka for half time and something to shout over.", photo: "/party/match.webp", focus: "50% 40%", hue: "#2f7a3a",
    guests: 12, hours: 3, sober: 10, crowd: "beer", spirits: ["vodka"], extras: ["ice"] },
  { id: "office", name: "Office Party", sw: "End-year ya ofisi", line: "Crowd-pleasers that go the distance — and sodas for the drivers.", photo: "/party/office.webp", focus: "50% 35%", hue: "#1f4e8c",
    guests: 40, hours: 4, sober: 25, crowd: "mixed", spirits: ["vodka", "gin"], extras: ["toast", "ice"] },
  { id: "sundowner", name: "Sundowner", sw: "Balcony, 6:40pm", line: "Gin, tonic and the last of the light over the city.", photo: "/party/sundowner.webp", focus: "50% 50%", hue: "#e08a2c",
    guests: 10, hours: 3, sober: 10, crowd: "spirits", spirits: ["gin"], extras: ["ice"] },
  { id: "graduation", name: "Graduation", sw: "Mtoto amemaliza!", line: "Family, photos and a toast to the graduate.", photo: "/party/graduation.webp", focus: "50% 30%", hue: "#5b3f8c",
    guests: 30, hours: 5, sober: 35, crowd: "wine", spirits: ["whisky"], extras: ["toast", "ice"] },
  { id: "newyear", name: "New Year", sw: "Mpaka asubuhi", line: "Countdown bubbles, a shots round and energy for 3am.", photo: "/party/newyear.webp", focus: "50% 45%", hue: "#b8862e",
    guests: 30, hours: 10, sober: 10, crowd: "spirits", spirits: ["vodka", "tequila", "whisky"], extras: ["toast", "shots", "energy", "ice"] },
];

export const DEFAULT_INPUT: PartyInput = {
  occasion: "birthday", guests: 25, hours: 5, sober: 15, crowd: "mixed", spirits: ["vodka", "whisky"], tier: "classic", extras: ["toast", "shots", "ice"],
};

export function fromOccasion(o: PartyOccasion, tier: Tier): PartyInput {
  return { occasion: o.id, guests: o.guests, hours: o.hours, sober: o.sober, crowd: o.crowd, spirits: [...o.spirits], tier, extras: [...o.extras] };
}

/* ------------------------------------------------------------------ the plan */

export type Group = "spirits" | "bubbles" | "wine" | "beer" | "soft";

export interface PlanLine {
  /** What the line is for. Swaps and quantity changes are kept per slot. */
  slot: string;
  group: Group;
  d: Drink;
  qty: number;
  why: string;
  /** Other bottles that would do the same job, cheapest first. Empty: not swappable. */
  alts: Drink[];
  /** When swapping changes another slot's choice: a crate swaps the beer it is a crate of. */
  swapSlot?: string;
  /** The bottle in `alts` this line stands for, when it isn't `d` itself. */
  base?: Drink;
}

export interface Plan {
  drinkers: number;
  sober: number;
  poured: number;
  lines: PlanLine[];
  bottles: number;
  cost: number;
}

const perGuest = (h: number) => 2 + Math.min(h - 1, 5) + Math.max(0, h - 6) * 0.5;
const priced = (xs: Drink[]) => xs.filter((d) => d.price != null).sort((a, b) => a.price! - b.price!);

/** The bottle a tier reaches for: the cheapest, a bestseller, or the best under KSh 15,000. */
export function byTier(pool: Drink[], tier: Tier): Drink | null {
  const xs = priced(pool);
  if (!xs.length) return null;
  if (tier === "pocket") return xs[0];
  if (tier === "premium") {
    const ok = xs.filter((d) => d.price! <= 15000);
    return ok[ok.length - 1] ?? xs[0];
  }
  const best = xs.filter((d) => d.tags.includes("bestseller"));
  return best.find((d) => d !== xs[0]) ?? best[0] ?? xs[Math.floor(xs.length / 2)];
}

const MIXER_FOR: Record<string, { sub: RegExp; per: number; for: string }> = {
  gin: { sub: /tonic/i, per: 2, for: "the gin" },
  vodka: { sub: /ginger/i, per: 2, for: "the vodka" },
  cognac: { sub: /ginger/i, per: 2, for: "the cognac" },
  whisky: { sub: /cola/i, per: 8, for: "the whisky" },
  rum: { sub: /cola/i, per: 8, for: "the rum" },
  tequila: { sub: /soda/i, per: 2, for: "the tequila" },
};

export function buildPlan(input: PartyInput, drinks: Drink[], swaps: Record<string, string> = {}, adj: Record<string, number> = {}): Plan {
  const shelf = (cat: string, test: (d: Drink) => boolean = () => true) => priced(drinks.filter((d) => d.category === cat && test(d)));
  const mixer = (re: RegExp) => drinks.find((d) => d.category === "mixers" && re.test(d.subcategory)) ?? null;
  const choose = (slot: string, pool: Drink[]) => pool.find((d) => d.handle === swaps[slot]) ?? byTier(pool, input.tier);

  const drinkers = Math.round(input.guests * (1 - input.sober / 100));
  const sober = input.guests - drinkers;
  const poured = Math.round(drinkers * perGuest(input.hours));
  const split = { ...CROWDS[input.crowd].split };
  const spirits = input.spirits.filter((s) => shelf(s).length);
  if (!spirits.length) { // nobody wants spirits: their share goes to beer and wine
    const k = 1 / (split.beer + split.wine);
    split.beer *= k; split.wine *= k; split.spirits = 0;
  }
  const lines: PlanLine[] = [];
  const add = (l: Omit<PlanLine, "qty"> & { qty: number }) => {
    const qty = adj[l.slot] ?? l.qty;
    if (qty > 0 || adj[l.slot] !== undefined) lines.push({ ...l, qty: Math.max(0, qty) });
  };

  // spirits, shared out evenly between the shelves the crowd picked
  const spiritDrinks = Math.round(poured * split.spirits);
  const spiritBottles = spiritDrinks ? Math.max(1, Math.ceil(spiritDrinks / 16)) : 0;
  const mixers = new Map<string, { d: Drink; qty: number; for: string[] }>();
  const addMixer = (d: Drink | null, qty: number, why: string) => {
    if (!d || qty <= 0) return;
    const m = mixers.get(d.handle) ?? { d, qty: 0, for: [] };
    m.qty += qty; if (!m.for.includes(why)) m.for.push(why);
    mixers.set(d.handle, m);
  };
  spirits.forEach((cat, i) => {
    const n = Math.floor(spiritBottles / spirits.length) + (i < spiritBottles % spirits.length ? 1 : 0);
    const pool = shelf(cat);
    const d = choose(`spirit:${cat}`, pool);
    if (!d || !n) return;
    add({ slot: `spirit:${cat}`, group: "spirits", d, qty: n, why: `${n * 16} drinks`, alts: pool });
    const m = MIXER_FOR[cat];
    if (m) addMixer(mixer(m.sub), Math.ceil((adj[`spirit:${cat}`] ?? n) * 16 / m.per), m.for);
  });

  if (input.extras.includes("shots")) {
    const pool = shelf("tequila");
    const d = choose("shots", pool);
    const n = Math.max(1, Math.ceil((drinkers * 2) / 25));
    const tequila = lines.find((l) => l.slot === "spirit:tequila");
    // the crowd already drinks tequila: the shots come out of the same bottles
    if (tequila && adj["spirit:tequila"] === undefined) { tequila.qty += n; tequila.why += ` + a shots round (${n * 25})`; }
    else if (d && drinkers) add({ slot: "shots", group: "spirits", d, qty: n, why: `shots round · ${n * 25} shots`, alts: pool });
  }

  if (input.extras.includes("toast")) {
    const pool = shelf("champagne");
    const d = choose("bubbles", pool);
    const n = Math.max(1, Math.ceil(drinkers / 6));
    if (d && drinkers) add({ slot: "bubbles", group: "bubbles", d, qty: n, why: `a toast for ${n * 6}`, alts: pool });
  }

  const wineGlasses = Math.round(poured * split.wine);
  if (wineGlasses) {
    const pool = shelf("wine");
    const d = choose("wine", pool);
    const n = Math.ceil(wineGlasses / 5);
    if (d) add({ slot: "wine", group: "wine", d, qty: n, why: `${n * 5} glasses`, alts: pool });
  }

  const beers = Math.round(poured * split.beer);
  if (beers) {
    const pool = shelf("beer", (d) => !/crate/i.test(d.subcategory));
    const d = choose("beer", pool);
    if (d) {
      const crate = drinks.find((c) => c.category === "beer" && /crate/i.test(c.subcategory) && c.brand === d.brand && c.name.startsWith(d.name));
      const per = crate ? Number(crate.volume.match(/^(\d+)/)?.[1] ?? 25) : 0;
      const crates = crate && beers >= 20 ? Math.max(1, Math.round(beers / per)) : 0;
      const loose = Math.max(0, beers - crates * per);
      if (crate && crates) add({ slot: "beer:crate", group: "beer", d: crate, qty: crates, why: `${crates * per} bottles`, alts: pool, swapSlot: "beer", base: d });
      if (loose || !crates) add({ slot: "beer", group: "beer", d, qty: loose || beers, why: crates ? "the rest, by the bottle" : "cold, by the bottle", alts: crates ? [] : pool });
    }
  }

  for (const m of mixers.values()) add({ slot: `mix:${m.d.handle}`, group: "soft", d: m.d, qty: m.qty, why: `mixer for ${m.for.join(" & ")}`, alts: [] });

  if (sober) {
    const soda = mixer(/cola/i);
    const n = Math.ceil((sober * (1 + input.hours * 0.6)) / 8);
    if (soda) {
      const slot = `mix:${soda.handle}`;
      const had = lines.find((l) => l.slot === slot);
      if (had && adj[slot] === undefined) { had.qty += n; had.why += ` · sodas for ${sober} not drinking`; }
      else if (!had) add({ slot, group: "soft", d: soda, qty: n, why: `sodas for ${sober} not drinking`, alts: [] });
    }
  }

  if (input.extras.includes("energy")) {
    const rb = mixer(/energy/i);
    if (rb && drinkers) add({ slot: `mix:${rb.handle}`, group: "soft", d: rb, qty: Math.ceil(drinkers / 3), why: "for the late shift", alts: [] });
  }

  if (input.extras.includes("ice")) {
    const ice = mixer(/^ice$/i);
    if (ice) add({ slot: `mix:${ice.handle}`, group: "soft", d: ice, qty: Math.max(1, Math.ceil(input.guests / 8) + (input.hours > 3 ? 1 : 0)), why: "2kg bags", alts: [] });
  }

  const shown = lines.filter((l) => l.qty > 0);
  return {
    drinkers, sober, poured, lines,
    bottles: shown.filter((l) => l.group !== "soft" && l.group !== "beer").reduce((n, l) => n + l.qty, 0),
    cost: shown.reduce((s, l) => s + (l.d.price ?? 0) * l.qty, 0),
  };
}
