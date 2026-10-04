import { addToBag } from "../stores/bag";
import { resetAge } from "../lib/age";
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

/* Reveal on scroll lives inline at the end of Base.astro: it has to run before this module
   arrives, or everything above the fold waits for it (PageSpeed counts that wait). */

/* ------------------------------------------------------------------- the pour */
/**
 * The home page's scroll scene. One custom property, --p (0 → 1 across the section), and
 * the CSS does the rest: the bottle tips, the stream appears, the glass fills, the beats
 * change. Written as stages so each moment can be tuned on its own.
 */
const pour = document.querySelector<HTMLElement>(".pour");
const beats = pour ? [...pour.querySelectorAll<HTMLElement>(".beat")] : [];
const fill = pour?.querySelector<SVGRectElement>("[data-fill]");
const cap = pour?.querySelector<SVGGElement>("[data-cap]");
/** Where the cap ends up: lying on its side on the bar, left of the glass (scene units,
 *  relative to where it sits on the neck, whose centre is (0.4, −203)). */
const CAP_REST = { x: 100, y: 493, turn: 90 };
const FILL_TOP = 470; // glass rim, in the scene's viewBox units
const FILL_BOTTOM = 640; // glass base
function onScrollPour() {
  if (!pour) return;
  const r = pour.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  // The cap comes off over the first 10%, the bottle tips over the next 20%, then it pours.
  const off = Math.min(1, p / 0.1);
  const tip = Math.min(1, Math.max(0, (p - 0.1) / 0.2));
  const stream = p > 0.3 && p < 0.86 ? 1 : 0;
  const level = Math.min(1, Math.max(0, (p - 0.32) / 0.52));
  if (cap) {
    // Unscrew (a short twisting rise), then an arc over to the bar, landing on its side.
    let x = 0, y = 0, r = 0;
    if (off < 0.4) {
      const u = off / 0.4;
      y = -16 * u;
      r = Math.sin(u * Math.PI * 3) * 9;
    } else {
      const u = (off - 0.4) / 0.6;
      const e = 1 - (1 - u) ** 3;
      x = CAP_REST.x * e;
      y = -16 + (CAP_REST.y + 16) * u * u - 70 * Math.sin(Math.PI * u);
      r = CAP_REST.turn * e;
    }
    cap.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)} 0.4 -203)`);
  }
  pour.style.setProperty("--p", p.toFixed(4));
  pour.style.setProperty("--pt", (p > 0.86 ? Math.max(0, 1 - (p - 0.86) / 0.12) : tip).toFixed(4));
  pour.style.setProperty("--stream", String(stream));
  if (fill) {
    const h = (FILL_BOTTOM - FILL_TOP) * 0.86 * level;
    fill.setAttribute("y", String(FILL_BOTTOM - h));
    fill.setAttribute("height", String(h));
  }
  const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
  beats.forEach((b, i) => b.classList.toggle("on", i === idx));
}

/* ---------------------------------------------------------------- the parade */
/** Rows of bottles slide past each other: --q runs 0 → 1 while the section is pinned. */
const parade = document.querySelector<HTMLElement>(".parade");
function onScrollParade() {
  if (!parade || reduced) return;
  const r = parade.getBoundingClientRect();
  const total = r.height - innerHeight;
  const q = Math.min(1, Math.max(0, -r.top / total));
  parade.style.setProperty("--q", q.toFixed(4));
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

/* ------------------------------------------- soft-drinks mode: "I'm 18 or over" */
document.querySelector("[data-age-reset]")?.addEventListener("click", () => {
  resetAge();
  location.href = "/";
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
    onScrollParade();
    ticking = false;
  });
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();
