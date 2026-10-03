import { useMemo, useState } from "react";
import Bottle from "../Bottle";
import { addToBag } from "../../stores/bag";
import { money } from "../../lib/format";
import { toLine, type Drink, type Profile } from "../../lib/types";

/**
 * Three questions → five bottles. Scoring is deliberately plain: how close a bottle's
 * flavour profile sits to the flavour picked, a nudge for the shelves that suit how the
 * person drinks, and a hard filter on budget. No profile, no match — a bottle we know
 * nothing about is not a recommendation.
 */
type Way = "neat" | "mixed" | "cocktail" | "bubbles";
type Flavour = "smooth" | "smoky" | "fruity" | "spicy" | "fresh";

const WAYS: { id: Way; em: string; title: string; line: string; shelves: string[] }[] = [
  { id: "neat", em: "🥃", title: "Neat or on ice", line: "Something to sip slowly", shelves: ["whisky", "cognac", "tequila", "liqueur"] },
  { id: "mixed", em: "🧊", title: "With a mixer", line: "Tonic, soda, cola, ginger", shelves: ["gin", "vodka", "rum", "whisky"] },
  { id: "cocktail", em: "🍸", title: "In a cocktail", line: "Shaken, stirred, muddled", shelves: ["gin", "vodka", "tequila", "rum", "liqueur"] },
  { id: "bubbles", em: "🍷", title: "Wine or bubbles", line: "For the table or the toast", shelves: ["wine", "champagne"] },
];

const FLAVOURS: { id: Flavour; em: string; title: string; line: string; target: Partial<Profile> }[] = [
  { id: "smooth", em: "🍯", title: "Sweet & smooth", line: "Honey, vanilla, caramel", target: { sweet: 4, oaky: 2, smoky: 0 } },
  { id: "smoky", em: "🔥", title: "Smoky & bold", line: "Peat, char, leather", target: { smoky: 4, oaky: 4, sweet: 1 } },
  { id: "fruity", em: "🍑", title: "Fruity & bright", line: "Orchard fruit, berries", target: { fruity: 4, sweet: 3, fresh: 2 } },
  { id: "spicy", em: "🌶️", title: "Warm & spicy", line: "Pepper, clove, ginger", target: { spicy: 4, oaky: 2 } },
  { id: "fresh", em: "🌿", title: "Crisp & clean", line: "Citrus, herbs, juniper", target: { fresh: 5, sweet: 1, smoky: 0 } },
];

const BUDGETS = [
  { id: "a", em: "KSh", title: "Under 2,500", line: "Everyday pours", min: 0, max: 2500 },
  { id: "b", em: "KSh", title: "2,500 – 6,000", line: "A step up", min: 2500, max: 6000 },
  { id: "c", em: "KSh", title: "6,000 – 12,000", line: "Something special", min: 6000, max: 12000 },
  { id: "d", em: "KSh", title: "No limit", line: "Show me the top shelf", min: 0, max: Infinity },
];

export default function TasteFinder({ drinks }: { drinks: Drink[] }) {
  const [step, setStep] = useState(0);
  const [way, setWay] = useState<Way | null>(null);
  const [flavour, setFlavour] = useState<Flavour | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!way || !flavour || !budget) return [];
    const w = WAYS.find((x) => x.id === way)!;
    const f = FLAVOURS.find((x) => x.id === flavour)!;
    const b = BUDGETS.find((x) => x.id === budget)!;
    return drinks
      .filter((d) => d.profile && d.price != null && d.price >= b.min && d.price < b.max && d.category !== "mixers" && d.category !== "beer")
      .map((d) => {
        const keys = Object.keys(f.target) as (keyof Profile)[];
        const dist = keys.reduce((s, k) => s + Math.abs((d.profile![k] ?? 0) - (f.target[k] ?? 0)), 0);
        const shelfBonus = w.shelves.includes(d.category) ? (w.shelves.length - w.shelves.indexOf(d.category)) * 0.6 : -6;
        const premium = budget === "d" ? (d.price ?? 0) / 8000 : 0;
        return { d, score: shelfBonus - dist + premium + (d.tags.includes("bestseller") ? 0.5 : 0) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.d);
  }, [way, flavour, budget, drinks]);

  const reset = () => { setStep(0); setWay(null); setFlavour(null); setBudget(null); };

  return (
    <div className="tool">
      <div className="tool-head">
        <span className="kicker">{step < 3 ? `Question ${step + 1} of 3` : "Your matches"}</span>
        <div className="steps-dots" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
      </div>
      <div className="tool-body" key={step} style={{ animation: "fadeUp .6s var(--ease)" }}>
        {step === 0 && (
          <>
            <h2 className="q-title">How do you like to <em style={{ color: "var(--amber-hi)" }}>drink it?</em></h2>
            <div className="opts">
              {WAYS.map((o) => (
                <button key={o.id} type="button" className="opt" onClick={() => { setWay(o.id); setStep(1); }}>
                  <span className="em">{o.em}</span><b>{o.title}</b><span>{o.line}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="q-title">Which flavours <em style={{ color: "var(--amber-hi)" }}>pull you in?</em></h2>
            <div className="opts">
              {FLAVOURS.map((o) => (
                <button key={o.id} type="button" className="opt" onClick={() => { setFlavour(o.id); setStep(2); }}>
                  <span className="em">{o.em}</span><b>{o.title}</b><span>{o.line}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="q-title">And the <em style={{ color: "var(--amber-hi)" }}>budget?</em></h2>
            <div className="opts">
              {BUDGETS.map((o) => (
                <button key={o.id} type="button" className="opt" onClick={() => { setBudget(o.id); setStep(3); }}>
                  <span className="em mono" style={{ fontSize: "1rem", color: "var(--amber)" }}>{o.em}</span><b>{o.title}</b><span>{o.line}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="q-title">{results.length ? <>Pour one of <em style={{ color: "var(--amber-hi)" }}>these.</em></> : "Nothing fits all three."}</h2>
            {results.length === 0 ? (
              <p className="muted">Try a wider budget — or message us on WhatsApp and a person will pick for you.</p>
            ) : (
              <div className="plan-lines">
                {results.map((d, i) => (
                  <div className="plan-line" key={d.handle} style={{ gridTemplateColumns: "64px 1fr auto", animation: `fadeUp .6s var(--ease) ${i * 0.07}s both` }}>
                    <Bottle d={d} height={80} salt="tf" />
                    <div>
                      <span className="card-brand">{i === 0 ? "Best match · " : ""}{d.brand}</span>
                      <a href={`/p/${d.handle}`} style={{ display: "block", fontFamily: "var(--f-display)", fontSize: "1.2rem" }}>{d.name}</a>
                      <span className="muted" style={{ fontSize: ".8rem" }}>{d.notes.join(" · ")}</span>
                    </div>
                    <div className="stack" style={{ alignItems: "flex-end", gap: 6 }}>
                      <span className="price">{money(d.price)}</span>
                      <button className="btn btn-amber btn-sm" type="button" onClick={() => { addToBag(toLine(d)); setAdded(d.handle); }}>
                        {added === d.handle ? "Added ✓" : "Add"}
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
