/**
 * Responsive photos. Every local photo has a smaller copy in an `s/` folder beside it
 * (bottles 360px wide, everything else 760px — a phone screen at 1.75x — and 400px in xs/), made when the photo was added. A phone takes
 * the small one; a wide or sharp screen the original. Remote images (Medusa uploads) pass
 * through untouched.
 */
const SMALL: Record<string, number> = { bottles: 360, party: 760, games: 760, cocktails: 760, finder: 760 };
const FULL: Record<string, number> = { bottles: 600, party: 1200, games: 1100, cocktails: 1200, finder: 1000 };

export function responsive(src: string | null | undefined, sizes: string): { src: string; srcSet?: string; sizes?: string } {
  const m = src?.match(/^\/(bottles|party|games|cocktails|finder)\/([^/]+\.webp)$/);
  if (!src || !m) return { src: src ?? "" };
  const small = `/${m[1]}/s/${m[2]}`;
  // photos also have a 400px copy in xs/, for thumbnails and two-up grids on a phone
  const xs = m[1] === "bottles" ? "" : `/${m[1]}/xs/${m[2]} 400w, `;
  return { src: small, srcSet: `${xs}${small} ${SMALL[m[1]]}w, ${src} ${FULL[m[1]]}w`, sizes };
}

/** The same, with lowercase attribute names for .astro templates. */
export function img(src: string | null | undefined, sizes: string) {
  const r = responsive(src, sizes);
  return { src: r.src, srcset: r.srcSet, sizes: r.sizes };
}
