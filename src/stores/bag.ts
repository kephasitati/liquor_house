import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import type { BagLine } from "../lib/types";
import { site } from "../config/site";

/**
 * The bag lives in the browser as a list of snapshots, not as a Medusa cart.
 *
 * That is what lets the same drawer work on the demo cellar (no backend) and on a live
 * channel: lines carry everything the drawer draws, and a Medusa cart is only created at
 * checkout, from these lines, when every one of them has a variant id. Until then, nothing
 * about browsing or basketing touches the network.
 */
export const bag = persistentAtom<BagLine[]>(`${site.storagePrefix}bag`, [], {
  encode: JSON.stringify,
  decode: (raw) => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  },
});

export const bagOpen = atom(false);
/** The last thing added, for the little "poured" toast. */
export const lastAdded = atom<{ line: BagLine; at: number } | null>(null);

export const bagCount = computed(bag, (lines) => lines.reduce((n, l) => n + l.qty, 0));
export const bagSubtotal = computed(bag, (lines) => lines.reduce((s, l) => s + l.price * l.qty, 0));

export function addToBag(line: BagLine, opts: { open?: boolean } = {}): void {
  const lines = bag.get();
  const i = lines.findIndex((l) => l.handle === line.handle);
  const next = i >= 0
    ? lines.map((l, j) => (j === i ? { ...l, qty: Math.min(99, l.qty + line.qty) } : l))
    : [...lines, line];
  bag.set(next);
  lastAdded.set({ line, at: Date.now() });
  if (opts.open) bagOpen.set(true);
}

export function addMany(lines: BagLine[]): void {
  for (const l of lines) addToBag(l);
  bagOpen.set(true);
}

export function setQty(handle: string, qty: number): void {
  bag.set(
    qty <= 0
      ? bag.get().filter((l) => l.handle !== handle)
      : bag.get().map((l) => (l.handle === handle ? { ...l, qty: Math.min(99, qty) } : l)),
  );
}

export function clearBag(): void {
  bag.set([]);
}
