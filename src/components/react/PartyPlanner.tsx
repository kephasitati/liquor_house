import { useMemo, useState } from "react";
import Bottle from "../Bottle";
import { addMany } from "../../stores/bag";
import { money } from "../../lib/format";
import { toLine, type Drink } from "../../lib/types";

/**
 * Guests × hours × crowd → a shopping list.
 *
 * The arithmetic, written down so the shop can argue with it:
 *   drinks       guests × (2 for the first hour + 1 per hour after)
 *   split        by crowd — a beer crowd drinks 65% beer, a spirits crowd 60% spirits
 *   spirits      one 750ml bottle pours ~16 drinks (45ml with a mixer)
 *   wine         one 750ml bottle pours 5 glasses
 *   beer         one bottle is one drink; 25 or more becomes crates
 *   mixers       two spirit drinks per 500ml mixer
 *   ice          a 2kg bag for every 8 guests, more past three hours
 */
type Crowd = "beer" | "mixed" | "spirits";
const SPLIT: Record<Crowd, { beer: number; wine: number; spirits: number; label: string }> = {
  beer: { beer: 0.65, wine: 0.15, spirits: 0.2, label: "Mostly beer" },
  mixed: { beer: 0.4, wine: 0.25, spirits: 0.35, label: "A bit of everything" },
  spirits: { beer: 0.2, wine: 0.2, spirits: 0.6, label: "Spirits-forward" },
};

function pick(drinks: Drink[], test: (d: Drink) => boolean): Drink | null {
  return drinks.filter((d) => d.price != null && test(d)).sort((a, b) => Number(b.tags.includes("bestseller")) - Number(a.tags.includes("bestseller")) || (a.price! - b.price!))[0] ?? null;
}

export default function PartyPlanner({ drinks }: { drinks: Drink[] }) {
  const [guests, setGuests] = useState(30);
  const [hours, setHours] = useState(4);
  const [crowd, setCrowd] = useState<Crowd>("mixed");
  const [added, setAdded] = useState(false);

  const plan = useMemo(() => {
    const total = guests * (2 + Math.max(0, hours - 1));
    const s = SPLIT[crowd];
    const spiritDrinks = Math.round(total * s.spirits);
    const spiritBottles = Math.max(guests > 0 ? 1 : 0, Math.ceil(spiritDrinks / 16));
    const wineBottles = Math.ceil((total * s.wine) / 5);
    const beers = Math.round(total * s.beer);
    const mixers = Math.ceil(spiritDrinks / 2);
    const ice = Math.max(1, Math.ceil(guests / 8) + (hours > 3 ? 1 : 0));

    const whisky = pick(drinks, (d) => d.category === "whisky" && d.price! < 5000);
    const vodka = pick(drinks, (d) => d.category === "vodka" && d.price! < 3000);
    const gin = pick(drinks, (d) => d.category === "gin" && d.price! < 3000);
    const wine = pick(drinks, (d) => d.category === "wine");
    const crate = pick(drinks, (d) => d.category === "beer" && /crate/i.test(d.name));
    const beer = pick(drinks, (d) => d.category === "beer" && !/crate/i.test(d.name));
    const tonic =
      pick(drinks, (d) => d.category === "mixers" && /tonic/i.test(d.subcategory + d.name)) ??
      pick(drinks, (d) => d.category === "mixers" && /soda|lemon|ginger/i.test(d.subcategory + d.name));
    const cola = pick(drinks, (d) => d.category === "mixers" && /cola/i.test(d.subcategory + d.name));
    const iceBag = pick(drinks, (d) => d.category === "mixers" && /ice/i.test(d.subcategory + d.name));

    const lines: { d: Drink; qty: number; why: string }[] = [];
    const spiritsPool = [whisky, vodka, gin].filter(Boolean) as Drink[];
    spiritsPool.forEach((d, i) => {
      const share = Math.floor(spiritBottles / spiritsPool.length) + (i < spiritBottles % spiritsPool.length ? 1 : 0);
      if (share > 0) lines.push({ d, qty: share, why: `${share * 16} drinks` });
    });
    if (wine && wineBottles) lines.push({ d: wine, qty: wineBottles, why: `${wineBottles * 5} glasses` });
    if (beers) {
      const crates = crate ? Math.floor(beers / 25) : 0;
      const loose = beers - crates * 25;
      if (crates && crate) lines.push({ d: crate, qty: crates, why: `${crates * 25} bottles` });
      if (loose > 0 && beer) lines.push({ d: beer, qty: loose, why: crates ? "the rest, one by one" : "one each, ice-cold" });
    }
    if (mixers) {
      const half = Math.ceil(mixers / 2);
      if (tonic) lines.push({ d: tonic, qty: half, why: "for the gin & vodka" });
      // A big bottle stands in for several 500ml mixers: 2L is four of them.
      const litres = Number(cola?.volume.match(/([\d.]+)\s*L\b/i)?.[1] ?? 0.5);
      if (cola) lines.push({ d: cola, qty: Math.max(1, Math.ceil(half / (litres * 2))), why: `${cola.volume}, for the whisky` });
    }
    if (iceBag) lines.push({ d: iceBag, qty: ice, why: "2kg bags" });

    return { total, spiritBottles, wineBottles, beers, ice, lines, cost: lines.reduce((s, l) => s + (l.d.price ?? 0) * l.qty, 0) };
  }, [guests, hours, crowd, drinks]);

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="kicker">Your party</span>
        <span className="muted" style={{ fontSize: ".85rem" }}>Estimates — adjust quantities in the bag.</span>
      </div>
      <div className="tool-body">
        <div className="range-row">
          <label htmlFor="pp-g">Guests</label>
          <input id="pp-g" type="range" min={4} max={200} step={1} value={guests} onChange={(e) => { setGuests(+e.target.value); setAdded(false); }} />
          <output htmlFor="pp-g">{guests}</output>
        </div>
        <div className="range-row">
          <label htmlFor="pp-h">Hours</label>
          <input id="pp-h" type="range" min={1} max={10} step={1} value={hours} onChange={(e) => { setHours(+e.target.value); setAdded(false); }} />
          <output htmlFor="pp-h">{hours}h</output>
        </div>
        <div className="range-row" style={{ gridTemplateColumns: "160px 1fr" }}>
          <label>The crowd</label>
          <div className="row gap-s" style={{ flexWrap: "wrap" }}>
            {(Object.keys(SPLIT) as Crowd[]).map((c) => (
              <button key={c} type="button" className="pill" aria-current={crowd === c ? "true" : undefined} onClick={() => { setCrowd(c); setAdded(false); }}>{SPLIT[c].label}</button>
            ))}
          </div>
        </div>

        <div className="plan">
          <div><b>{plan.total}</b><span>drinks poured</span></div>
          <div><b>{plan.spiritBottles}</b><span>bottles of spirits</span></div>
          <div><b>{plan.wineBottles}</b><span>bottles of wine</span></div>
          <div><b>{plan.beers}</b><span>beers</span></div>
          <div><b>{plan.ice}</b><span>bags of ice</span></div>
        </div>

        <div className="plan-lines">
          {plan.lines.map((l) => (
            <div className="plan-line" key={l.d.handle}>
              <Bottle d={l.d} height={52} salt="pp" />
              <div>
                <a href={`/p/${l.d.handle}`} style={{ fontWeight: 600 }}>{l.qty} × {l.d.name}</a>
                <div className="muted" style={{ fontSize: ".78rem" }}>{l.why}</div>
              </div>
              <span className="price">{money((l.d.price ?? 0) * l.qty)}</span>
            </div>
          ))}
        </div>

        <div className="row gap mt" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <span className="muted" style={{ fontSize: ".8rem" }}>Estimated total</span>
            <div className="price" style={{ fontSize: "1.8rem" }}>{money(plan.cost)}</div>
            <span className="muted" style={{ fontSize: ".78rem" }}>≈ {money(plan.cost / Math.max(1, guests))} a guest</span>
          </div>
          <button className="btn btn-amber" type="button" disabled={!plan.lines.length} onClick={() => { addMany(plan.lines.map((l) => toLine(l.d, l.qty))); setAdded(true); }}>
            {added ? "The party is in your bag ✓" : "Add everything to the bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
