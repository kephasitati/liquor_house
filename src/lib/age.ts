import { site } from "../config/site";

/**
 * Who is shopping, as the visitor told the age gate. Two answers, one key:
 *   "1"      18 or over — the whole shop.
 *   "minor"  under 18 — soft drinks, mixers and ice only (shelves with ageRestricted false).
 *
 * The layout's <head> script reads the same key before first paint (Base.astro) and stamps
 * <html data-age="ok" | "minor">, so neither the gate nor an alcohol page ever flashes.
 * Self-declared, like every licensed liquor site; the TumaBoda rider still checks ID.
 */
export const AGE_KEY = `${site.storagePrefix}age_ok`;
export type Age = "adult" | "minor" | null;

export function readAge(): Age {
  try {
    const v = localStorage.getItem(AGE_KEY);
    return v === "1" ? "adult" : v === "minor" ? "minor" : null;
  } catch {
    return null;
  }
}

export function setAge(age: Exclude<Age, null>) {
  try { localStorage.setItem(AGE_KEY, age === "adult" ? "1" : "minor"); } catch { /* this visit only */ }
  document.documentElement.dataset.age = age === "adult" ? "ok" : "minor";
}

/** Forget the answer and ask again (the "I'm 18 or over" link in soft-drinks mode). */
export function resetAge() {
  try { localStorage.removeItem(AGE_KEY); } catch { /* fine */ }
}

/** Where an under-18 lands, and where any page they can't see sends them. */
export const MINOR_HOME = "/shop?shelf=mixers";
