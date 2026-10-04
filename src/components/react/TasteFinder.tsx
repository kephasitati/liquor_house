import { useMemo, useState } from "react";
import Bottle from "../Bottle";
import { addToBag } from "../../stores/bag";
import { money } from "../../lib/format";
import { responsive } from "../../lib/img";
import { toLine, type Drink, type Profile } from "../../lib/types";

/**
 * Three questions → five bottles. Scoring is deliberately plain: how close a bottle's
 * flavour profile sits to the flavour picked, a nudge for the shelves that suit how the
 * person drinks, and a hard filter on budget. No profile, no match — a bottle we know
 * nothing about is not a recommendation.
 *
 * Every answer is shown with something real rather than an emoji: the first question with a
 * photograph of the drink, the other two with the actual bottles from the shelf that the
 * answer would lead to, scored the same way the results are.
 */
type Way = "neat" | "mixed" | "cocktail" | "bubbles";
type Flavour = "smooth" | "smoky" | "fruity" | "spicy" | "fresh";

const WAYS: { id: Way; photo: string; focus: string; title: string; line: string; shelves: string[] }[] = [
  { id: "neat", photo: "/finder/neat.webp", focus: "50% 70%", title: "Neat or on ice", line: "Something to sip slowly", shelves: ["whisky", "cognac", "tequila", "liqueur"] },
  { id: "mixed", photo: "/cocktails/gin-tonic.webp", focus: "50% 85%", title: "With a mixer", line: "Tonic, soda, cola, ginger", shelves: ["gin", "vodka", "rum", "whisky"] },
  { id: "cocktail", photo: "/cocktails/margarita.webp", focus: "50% 40%", title: "In a cocktail", line: "Shaken, stirred, muddled", shelves: ["gin", "vodka", "tequila", "rum", "liqueur"] },
  { id: "bubbles", photo: "/finder/wine.webp", focus: "50% 60%", title: "Wine or bubbles", line: "For the table or the toast", shelves: ["wine", "champagne"] },
];

const FLAVOURS: { id: Flavour; title: string; line: string; target: Partial<Profile> }[] = [
  { id: "smooth", title: "Sweet & smooth", line: "Honey, vanilla, caramel", target: { sweet: 4, oaky: 2, smoky: 0 } },
  { id: "smoky", title: "Smoky & bold", line: "Peat, char, leather", target: { smoky: 4, oaky: 4, sweet: 1 } },
  { id: "fruity", title: "Fruity & bright", line: "Orchard fruit, berries", target: { fruity: 4, sweet: 3, fresh: 2 } },
  { id: "spicy", title: "Warm & spicy", line: "Pepper, clove, ginger", target: { spicy: 4, oaky: 2 } },
  { id: "fresh", title: "Crisp & clean", line: "Citrus, herbs, juniper", target: { fresh: 5, sweet: 1, smoky: 0 } },
];

const BUDGETS = [
  { id: "a", title: "Under 2,500", line: "Everyday pours", min: 0, max: 2500 },
  { id: "b", title: "2,500 – 6,000", line: "A step up", min: 2500, max: 6000 },
  { id: "c", title: "6,000 – 12,000", line: "Something special", min: 6000, max: 12000 },
  { id: "d", title: "No limit", line: "Show me the top shelf", min: 0, max: Infinity },
];

const scorable = (d: Drink) => d.profile && d.price != null && d.category !== "mixers" && d.category !== "beer";

function score(d: Drink, way: Way | null, flavour: Flavour | null, topShelf = false) {
  let s = d.tags.includes("bestseller") ? 0.5 : 0;
  if (way) {
    const shelves = WAYS.find((x) => x.id === way)!.shelves;
    s += shelves.includes(d.category) ? (shelves.length - shelves.indexOf(d.category)) * 0.6 : -6;
  }
  if (flavour) {
    const target = FLAVOURS.find((x) => x.id === flavour)!.target;
    const keys = Object.keys(target) as (keyof Profile)[];
    s -= keys.reduce((sum, k) => sum + Math.abs((d.profile![k] ?? 0) - (target[k] ?? 0)), 0);
  }
  if (topShelf) s += (d.price ?? 0) / 8000;
  return s;
}

/** The three photographed bottles an answer would lead to, one per brand. */
function fan(pool: Drink[], rank: (d: Drink) => number): Drink[] {
  const seen = new Set<string>();
  return pool
    .filter((d) => d.thumbnail)
    .map((d) => ({ d, s: rank(d) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.d)
    .filter((d) => (seen.has(d.brand) ? false : (seen.add(d.brand), true)))
    .slice(0, 3);
}

function Fan({ bottles }: { bottles: Drink[] }) {
  return (
    <span className="opt-fan" aria-hidden="true">
      {bottles.map((d) => <img key={d.handle} {...responsive(d.thumbnail, "90px")} alt="" loading="lazy" decoding="async" />)}
    </span>
  );
}

export default function TasteFinder({ drinks }: { drinks: Drink[] }) {
  const [step, setStep] = useState(0);
  const [way, setWay] = useState<Way | null>(null);
  const [flavour, setFlavour] = useState<Flavour | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const pool = useMemo(() => drinks.filter(scorable), [drinks]);
  /** Bottles on the shelves that suit how they drink: what the later answers draw from. */
  const onShelf = useMemo(() => {
    if (!way) return pool;
    const shelves = WAYS.find((x) => x.id === way)!.shelves;
    return pool.filter((d) => shelves.includes(d.category));
  }, [pool, way]);

  const flavourFans = useMemo(
    () => Object.fromEntries(FLAVOURS.map((f) => [f.id, fan(onShelf, (d) => score(d, way, f.id))])),
    [onShelf, way],
  );
  const budgetBands = useMemo(
    () => Object.fromEntries(BUDGETS.map((b) => {
      const inBand = onShelf.filter((d) => d.price! >= b.min && d.price! < b.max);
      return [b.id, { count: inBand.length, bottles: fan(inBand, (d) => score(d, way, flavour, b.id === "d")) }];
    })),
    [onShelf, way, flavour],
  );

  const results = useMemo(() => {
    if (!way || !flavour || !budget) return [];
    const b = BUDGETS.find((x) => x.id === budget)!;
    return pool
      .filter((d) => d.price! >= b.min && d.price! < b.max)
      .map((d) => ({ d, s: score(d, way, flavour, budget === "d") }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((x) => x.d);
  }, [way, flavour, budget, pool]);

  const reset = () => { setStep(0); setWay(null); setFlavour(null); setBudget(null); };
  const accent = { color: "var(--amber-ink)" };

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="kicker">{step < 3 ? `Question ${step + 1} of 3` : "Your matches"}</span>
        <div className="steps-dots" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
      </div>
      <div className="tool-body" key={step} style={{ animation: "fadeUp .6s var(--ease)" }}>
        {step === 0 && (
          <>
            <h2 className="q-title">How do you like to <em style={accent}>drink it?</em></h2>
            <div className="opts opts-photo">
              {WAYS.map((o, i) => (
                <button key={o.id} type="button" className="opt-photo" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => { setWay(o.id); setStep(1); }}>
                  <img {...responsive(o.photo, "(max-width: 760px) 50vw, 300px")} alt="" style={{ objectPosition: o.focus }} decoding="async" />
                  <span className="opt-photo-text"><b>{o.title}</b><span>{o.line}</span></span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="q-title">Which flavours <em style={accent}>pull you in?</em></h2>
            <div className="opts opts-fan">
              {FLAVOURS.map((o) => (
                <button key={o.id} type="button" className="opt" onClick={() => { setFlavour(o.id); setStep(2); }}>
                  <Fan bottles={flavourFans[o.id]} />
                  <b>{o.title}</b><span>{o.line}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="q-title">And the <em style={accent}>budget?</em></h2>
            <div className="opts opts-fan">
              {BUDGETS.map((o) => {
                const band = budgetBands[o.id];
                return (
                  <button key={o.id} type="button" className="opt" disabled={band.count === 0} onClick={() => { setBudget(o.id); setStep(3); }}>
                    <Fan bottles={band.bottles} />
                    <b>{o.title}</b>
                    <span>{band.count ? `${o.line} · ${band.count} ${band.count === 1 ? "bottle" : "bottles"}` : "Nothing on these shelves"}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="q-title">{results.length ? <>Pour one of <em style={accent}>these.</em></> : "Nothing fits all three."}</h2>
            {results.length === 0 ? (
              <p className="muted">Try a wider budget — or message us on WhatsApp and a person will pick for you.</p>
            ) : (
              <div className="plan-lines">
                {results.map((d, i) => (
                  <div className={`plan-line${i === 0 ? " best" : ""}`} key={d.handle} style={{ gridTemplateColumns: "64px 1fr auto", animation: `fadeUp .6s var(--ease) ${i * 0.07}s both` }}>
                    <Bottle d={d} height={80} salt="tf" />
                    <div>
                      <span className="card-brand">{i === 0 ? "Best match · " : ""}{d.brand}</span>
                      <a href={`/p/${d.handle}`} style={{ display: "block", fontFamily: "var(--f-display)", fontSize: "1.2rem" }}>{d.name}</a>
                      <span className="muted" style={{ fontSize: ".8rem" }}>{d.notes.join(" · ")}</span>
                    </div>
                    <div className="stack" style={{ alignItems: "flex-end", gap: 6 }}>
                      <span className="price">{money(d.price)}</span>
                      <button className="btn btn-amber btn-sm" type="button" onClick={() => { addToBag(toLine(d)); setAdded(d.handle); }}>
                        {added === d.handle ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-ghost mt" type="button" onClick={reset}>Start again</button>
          </>
        )}
        {step > 0 && step < 3 && (
          <button className="line-remove mt" type="button" style={{ display: "block" }} onClick={() => setStep(step - 1)}>← Back</button>
        )}
      </div>
    </div>
  );
}
