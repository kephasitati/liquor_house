import { addToBag } from "../stores/bag";
import type { BagLine } from "../lib/types";

/**
 * Every bit of motion that does not need React, in one module loaded by the layout.
 *
 * All of it is progressive: the page is complete without this file, and every effect stands
 * down under prefers-reduced-motion or on a touch screen where hover means nothing.
 */
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------------------------------------------------- header: solid, then hides */
const hdr = document.querySelector<HTMLElement>(".hdr");
let lastY = scrollY;
function onScrollHeader() {
  if (!hdr) return;
  const y = scrollY;
  hdr.dataset.scrolled = String(y > 24);
  // Hide on the way down past the fold, return on any scroll up.
  hdr.dataset.hidden = String(y > 600 && y > lastY + 4 && !document.querySelector(".drawer.open"));
  if (y < lastY - 4 || y < 600) hdr.dataset.hidden = "false";
  lastY = y;
}

/* ------------------------------------------------------------- reveal on scroll */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
);
document.querySelectorAll("[data-reveal], .profile").forEach((el) => io.observe(el));

/* ------------------------------------------------------------------- the pour */
/**
 * The home page's scroll scene. One custom property, --p (0 → 1 across the section), and
 * the CSS does the rest: the bottle tips, the stream appears, the glass fills, the beats
 * change. Written as stages so each moment can be tuned on its own.
 */
const pour = document.querySelector<HTMLElement>(".pour");
const beats = pour ? [...pour.querySelectorAll<HTMLElement>(".beat")] : [];
const fill = pour?.querySelector<SVGRectElement>("[data-fill]");
const FILL_TOP = 470; // glass rim, in the scene's viewBox units
const FILL_BOTTOM = 640; // glass base
function onScrollPour() {
  if (!pour) return;
  const r = pour.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  const tip = Math.min(1, p / 0.28); // bottle tips over the first 28%
  const stream = p > 0.28 && p < 0.86 ? 1 : 0;
  const level = Math.min(1, Math.max(0, (p - 0.3) / 0.54));
  pour.style.setProperty("--p", p.toFixed(4));
  const pt = p > 0.86 ? Math.max(0, 1 - (p - 0.86) / 0.12) : tip;
  pour.style.setProperty("--pt", pt.toFixed(4));
  // The cork pops as the bottle starts to tip (well before the stream) and is back on by the
  // time it stands up again.
  pour.style.setProperty("--cork", Math.min(1, Math.max(0, (pt - 0.08) / 0.42)).toFixed(4));
  pour.style.setProperty("--stream", String(stream));
  if (fill) {
    const h = (FILL_BOTTOM - FILL_TOP) * 0.86 * level;
    fill.setAttribute("y", String(FILL_BOTTOM - h));
    fill.setAttribute("height", String(h));
  }
  const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
  beats.forEach((b, i) => b.classList.toggle("on", i === idx));
}

/* ------------------------------------------------------------ hero light + parallax */
const hero = document.querySelector<HTMLElement>(".hero");
const heroBottle = hero?.querySelector<HTMLElement>(".hero-bottle");
if (hero && finePointer && !reduced) {
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    hero.style.setProperty("--mx", `${x * 100}%`);
    hero.style.setProperty("--my", `${y * 100}%`);
    if (heroBottle) {
      heroBottle.style.setProperty("--tx", `${(x - 0.5) * 24}px`);
      heroBottle.style.setProperty("--ty", `${(y - 0.5) * 16}px`);
      heroBottle.style.setProperty("--rot", `${(x - 0.5) * 6}deg`);
    }
  });
}

/* ------------------------------------------------------------------- card tilt */
if (finePointer && !reduced) {
  document.addEventListener("pointermove", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  });
  document.addEventListener(
    "pointerout",
    (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      if (card && !card.contains(e.relatedTarget as Node)) {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      }
    },
    true,
  );
  // Buttons catch the light where the pointer is.
  document.addEventListener("pointermove", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".btn");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--bx", `${e.clientX - r.left}px`);
    b.style.setProperty("--by", `${e.clientY - r.top}px`);
  });
}

/* ------------------------------------------------------- quick add, from any card */
document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-add]");
  if (btn) {
    e.preventDefault();
    try {
      const raw = JSON.parse(btn.dataset.add!);
      const lines: BagLine[] = Array.isArray(raw) ? raw : [raw];
      lines.forEach((l) => addToBag(l, { open: lines.length > 1 }));
      btn.classList.add("done");
      setTimeout(() => btn.classList.remove("done"), 1400);
    } catch (err) {
      console.error("[bag] bad data-add payload", err);
    }
  }
});

/* ------------------------------------------------- back bar: drag + arrow buttons */
document.querySelectorAll<HTMLElement>("[data-rail]").forEach((rail) => {
  let down = false, startX = 0, startLeft = 0, moved = 0;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; moved = 0; startX = e.clientX; startLeft = rail.scrollLeft;
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 5) rail.classList.add("dragging");
    rail.scrollLeft = startLeft - dx;
  });
  addEventListener("pointerup", () => {
    down = false;
    setTimeout(() => rail.classList.remove("dragging"), 0);
  });
  const id = rail.dataset.rail;
  document.querySelectorAll<HTMLElement>(`[data-rail-btn="${id}"]`).forEach((b) => {
    b.addEventListener("click", () => rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.8, behavior: "smooth" }));
  });
});

/* ---------------------------------------------------------- search + mobile menu */
const pop = document.querySelector<HTMLElement>(".search-pop");
document.querySelector("[data-search-toggle]")?.addEventListener("click", () => {
  if (!pop) return;
  const open = pop.dataset.open !== "true";
  pop.dataset.open = String(open);
  if (open) pop.querySelector("input")?.focus();
});
document.addEventListener("click", (e) => {
  if (pop && !pop.contains(e.target as Node)) pop.dataset.open = "false";
});
const mnav = document.getElementById("mobile-nav");
document.querySelector("[data-menu-open]")?.addEventListener("click", () => { if (mnav) mnav.dataset.open = "true"; });
document.querySelector("[data-menu-close]")?.addEventListener("click", () => { if (mnav) mnav.dataset.open = "false"; });

/* ------------------------------------------------------------------- one rAF loop */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    onScrollHeader();
    onScrollPour();
    ticking = false;
  });
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();
