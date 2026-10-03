import type { Drink } from "../lib/types";

/**
 * A bottle, photographed.
 *
 * Every photo is a 600×750 frame on pure white (scripts/bottle-photos.sh), printed with
 * mix-blend-mode: multiply so the white drops away into whatever light surface it sits on and
 * the bottle looks stood on the card rather than pasted onto it. That only works on a LIGHT
 * surface, which is why every place a bottle appears is one.
 *
 * Nothing is drawn. Products without a photograph are kept off the shelf (site.photosOnly);
 * the only way to reach the fallback is a bag line saved before its photo was removed, and
 * that gets the brand's initial on a plain tile — never a pretend bottle.
 */
type Art = Pick<Drink, "handle" | "name" | "brand"> & { thumbnail?: string | null };

export default function Bottle({ d, height = 220, eager = false }: { d: Art; height?: number; salt?: string; eager?: boolean }) {
  if (d.thumbnail) {
    return (
      <img
        className="bottle-photo"
        src={d.thumbnail}
        alt={d.name}
        width={Math.round(height * 0.8)}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <span className="bottle-none" style={{ height, width: Math.round(height * 0.8) }} role="img" aria-label={d.name}>
      {(d.brand || d.name).trim().charAt(0).toUpperCase()}
    </span>
  );
}
