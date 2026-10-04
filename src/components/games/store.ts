import { site } from "../../config/site";
import { shuffle, type GameId } from "../../data/games";

/**
 * What the games remember on this device: each game's personal best, a code the player has
 * won (so checkout can fill it in), which questions/words have already been played (so nothing
 * repeats until the whole deck has), and the last team setup. All listed on the Cookies page;
 * anything new stored here belongs there too. Storage can be missing (private mode) — every
 * call copes.
 */
const BEST = `${site.storagePrefix}best`;
const CODE = `${site.storagePrefix}code`;
const SEEN = `${site.storagePrefix}seen`;

/**
 * Deal `n` items nobody on this device has had yet. When the unseen ones run out, the deck is
 * reshuffled and starts again — so a question only comes back once every other one has been
 * played. `id` names an item (its text is fine); `deck` keeps each game's memory separate.
 */
export function dealFresh<T>(deck: string, pool: readonly T[], n: number, id: (t: T) => string, topic?: (t: T) => string | undefined): T[] {
  // With topics, deal round-robin across them, so a hand of ten covers ten different things
  const shuffled = topic ? spread(shuffle(pool), topic) : shuffle(pool);
  let seen: string[] = [];
  try { seen = JSON.parse(localStorage.getItem(SEEN) ?? "{}")[deck] ?? []; } catch { /* fresh */ }
  const seenSet = new Set(seen);
  const fresh = shuffled.filter((t) => !seenSet.has(id(t)));
  let hand = fresh.slice(0, n);
  if (hand.length < n) {
    // the deck is spent: start it again, without re-dealing what's already in this hand
    const inHand = new Set(hand.map(id));
    hand = [...hand, ...shuffled.filter((t) => !inHand.has(id(t))).slice(0, n - hand.length)];
    seen = [];
  }
  try {
    const all = JSON.parse(localStorage.getItem(SEEN) ?? "{}");
    all[deck] = [...seen, ...hand.map(id)].slice(-500);
    localStorage.setItem(SEEN, JSON.stringify(all));
  } catch { /* no memory: still no repeats within this game */ }
  return hand;
}

/** Reorder so neighbours come from different topics: one from each topic in turn. */
function spread<T>(xs: T[], topic: (t: T) => string | undefined): T[] {
  const groups = new Map<string, T[]>();
  for (const x of xs) {
    const k = topic(x) ?? "";
    groups.set(k, [...(groups.get(k) ?? []), x]);
  }
  const lanes = shuffle([...groups.values()]);
  const out: T[] = [];
  for (let i = 0; out.length < xs.length; i++) for (const lane of lanes) if (lane[i] !== undefined) out.push(lane[i]);
  return out;
}

/**
 * For games that flow through a deck rather than deal a hand (Kichwa Juu words, would-you-
 * rathers, dares): the whole pool, unseen first. Pair it with markSeen for what was shown.
 * Once everything has been seen, the memory is cleared and it all counts as fresh again.
 */
export function orderFresh<T>(deck: string, pool: readonly T[], id: (t: T) => string): T[] {
  let seen: string[] = [];
  try { seen = JSON.parse(localStorage.getItem(SEEN) ?? "{}")[deck] ?? []; } catch { /* fresh */ }
  const seenSet = new Set(seen);
  const fresh = shuffle(pool.filter((t) => !seenSet.has(id(t))));
  if (!fresh.length) {
    try { const all = JSON.parse(localStorage.getItem(SEEN) ?? "{}"); delete all[deck]; localStorage.setItem(SEEN, JSON.stringify(all)); } catch { /* fine */ }
    return shuffle(pool);
  }
  return [...fresh, ...shuffle(pool.filter((t) => seenSet.has(id(t))))];
}

export function markSeen(deck: string, ids: string[]) {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN) ?? "{}");
    all[deck] = [...new Set([...(all[deck] ?? []), ...ids])].slice(-500);
    localStorage.setItem(SEEN, JSON.stringify(all));
  } catch { /* no memory: still no repeats within this game */ }
}

export function bestScore(game: GameId): number | null {
  try {
    const all = JSON.parse(localStorage.getItem(BEST) ?? "{}");
    return typeof all[game] === "number" ? all[game] : null;
  } catch {
    return null;
  }
}

/** Saves the score if it beats the old best; returns true when it did. */
export function recordScore(game: GameId, score: number): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(BEST) ?? "{}");
    if (typeof all[game] === "number" && all[game] >= score) return false;
    all[game] = score;
    localStorage.setItem(BEST, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function saveCode(code: string) {
  try { localStorage.setItem(CODE, code); } catch { /* the player can still copy it */ }
}

export function savedCode(): string {
  try { return localStorage.getItem(CODE) ?? ""; } catch { return ""; }
}
