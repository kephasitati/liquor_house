import { useEffect, useMemo, useRef, useState } from "react";
import Bottle from "../Bottle";
import { TumaBoda } from "../TumaBoda";
import { addMany } from "../../stores/bag";
import { money } from "../../lib/format";
import { responsive } from "../../lib/img";
import { toLine, type Drink } from "../../lib/types";
import { site, ZONES } from "../../config/site";
import {
  CROWDS, DEFAULT_INPUT, EXTRAS, HOURS, PARTIES, SPIRITS, TIERS, buildPlan, byTier, fromOccasion, hoursLabel,
  type Crowd, type Extra, type PartyInput, type PlanLine, type Tier,
} from "../../data/party";

/**
 * Panga sherehe — the party planner. Five short steps (the occasion, the mbogi, what they
 * drink, the budget, the bar), with the party building itself on a live bar beside them:
 * the crowd fills in, bottles land on the shelf, the total ticks over. Picking an occasion
 * fills in everything, so a plan is one tap; every number can still be changed after.
 *
 * The plan is kept on this device (`lhk_plan`) so the host can come back to it.
 */
const KEY = `${site.storagePrefix}plan`;
const STEPS = ["Sherehe gani?", "Mbogi", "Wanakunywa nini?", "Bajeti", "Bar yako"];

interface Saved { input: PartyInput; swaps: Record<string, string>; adj: Record<string, number>; when: string; zone: string; chama: number; step: number }

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(19, 0, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T19:00`;
}

function whenLabel(when: string) {
  if (!when) return "";
  const d = new Date(when);
  if (isNaN(+d)) return "";
  return d.toLocaleString("en-KE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function countdown(when: string) {
  const d = new Date(when);
  if (!when || isNaN(+d)) return "";
  const days = Math.ceil((+d - Date.now()) / 86_400_000);
  return days < 0 ? "Imeshapita" : days === 0 ? "Ni leo!" : days === 1 ? "Ni kesho!" : `Siku ${days} to go`;
}

export default function PartyPlanner({ drinks }: { drinks: Drink[] }) {
  const [input, setInput] = useState<PartyInput>(DEFAULT_INPUT);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [adj, setAdj] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(false);
  const [when, setWhen] = useState("");
  const [zone, setZone] = useState(ZONES[0].id);
  const [chama, setChama] = useState(1);
  const [budget, setBudget] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  // the saved plan, if this host has been here before
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null") as Saved | null;
      if (s?.input) {
        setInput({ ...DEFAULT_INPUT, ...s.input }); setSwaps(s.swaps ?? {}); setAdj(s.adj ?? {});
        setWhen(s.when || nextSaturday()); setZone(s.zone || ZONES[0].id); setChama(s.chama || 1); setStep(s.step ?? 0); setPicked(true);
      } else setWhen(nextSaturday());
    } catch { setWhen(nextSaturday()); }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify({ input, swaps, adj, when, zone, chama, step } satisfies Saved)); } catch { /* private mode */ }
  }, [input, swaps, adj, when, zone, chama, step]);

  const occasion = PARTIES.find((o) => o.id === input.occasion) ?? PARTIES[0];
  const plan = useMemo(() => buildPlan(input, drinks, swaps, adj), [input, drinks, swaps, adj]);
  const tierCost = useMemo(
    () => Object.fromEntries((Object.keys(TIERS) as Tier[]).map((t) => [t, buildPlan({ ...input, tier: t }, drinks)])) as Record<Tier, ReturnType<typeof buildPlan>>,
    [input, drinks],
  );
  const z = ZONES.find((x) => x.id === zone) ?? ZONES[0];
  const total = plan.cost + z.fee;

  // changing the party resets hand-tuned quantities (they were for a different party)
  const set = (patch: Partial<PartyInput>) => { setInput((i) => ({ ...i, ...patch })); setAdj({}); setAdded(false); };
  const go = (n: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const choose = (id: string) => {
    const o = PARTIES.find((x) => x.id === id)!;
    setInput(fromOccasion(o, input.tier)); setSwaps({}); setAdj({}); setAdded(false); setPicked(true);
    go(1);
  };
  const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
  const swap = (l: PlanLine) => {
    const cur = l.base ?? l.d;
    const next = l.alts[(l.alts.findIndex((d) => d.handle === cur.handle) + 1) % l.alts.length];
    const slot = l.swapSlot ?? l.slot;
    setSwaps((s) => ({ ...s, [slot]: next.handle })); setAdded(false);
  };
  const qty = (l: PlanLine, n: number) => { setAdj((a) => ({ ...a, [l.slot]: Math.max(0, n) })); setAdded(false); };

  const shareText = () => {
    const rows = plan.lines.filter((l) => l.qty > 0).map((l) => `• ${l.qty} × ${l.d.name}${l.d.volume ? ` (${l.d.volume})` : ""}`);
    const each = Math.ceil(total / Math.max(1, chama) / 10) * 10;
    return [
      `*${occasion.name} — the plan*`,
      [whenLabel(when), `${input.guests} guests`, hoursLabel(input.hours)].filter(Boolean).join(" · "),
      "",
      ...rows,
      "",
      `Total: ${money(total)} incl. delivery to ${z.name}`,
      chama > 1 ? `Mchango: ${money(each)} each for ${chama} of us` : "",
      `Planned at ${site.name}: ${site.url}/party`,
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
  };

  /* ------------------------------------------------------------- the steps */
  const steps = [
    // 0 — the occasion
    <div className="pp-step" key="o">
      <h2 className="display h3 pp-q">Sherehe gani? <em>Pick one — we fill in the rest.</em></h2>
      <div className="pp-occ">
        {PARTIES.map((o, i) => (
          <button key={o.id} type="button" className={`pp-occ-card${picked && input.occasion === o.id ? " on" : ""}`} style={{ ["--hue" as any]: o.hue, ["--d" as any]: `${i * 0.05}s` }} onClick={() => choose(o.id)}>
            <img {...responsive(o.photo, "(max-width: 560px) 50vw, 240px")} alt="" style={{ objectPosition: o.focus }} loading={i < 4 ? "eager" : "lazy"} decoding="async" />
            <span className="pp-occ-text">
              <small>{o.sw}</small>
              <b>{o.name}</b>
              <span>{o.line}</span>
              <i>{o.guests} guests · {hoursLabel(o.hours)}</i>
            </span>
          </button>
        ))}
      </div>
    </div>,

    // 1 — the mbogi
    <div className="pp-step" key="g">
      <h2 className="display h3 pp-q">Mbogi ni wangapi? <em>Count everyone, even the ones not drinking.</em></h2>
      <div className="pp-count">
        <button type="button" className="pp-round" onClick={() => set({ guests: Math.max(2, input.guests - 1) })} aria-label="One fewer guest">−</button>
        <output aria-live="polite"><b key={input.guests}>{input.guests}</b><span>wageni</span></output>
        <button type="button" className="pp-round" onClick={() => set({ guests: Math.min(300, input.guests + 1) })} aria-label="One more guest">+</button>
      </div>
      <input className="pp-range" type="range" min={2} max={300} value={input.guests} onChange={(e) => set({ guests: +e.target.value })} aria-label="Guests" />
      <div className="pp-chips">
        {[10, 20, 30, 50, 80, 120, 200].map((n) => <button key={n} type="button" className="pill" aria-current={input.guests === n ? "true" : undefined} onClick={() => set({ guests: n })}>{n}</button>)}
      </div>

      <h3 className="pp-sub">Mpaka saa ngapi?</h3>
      <div className="pp-chips">
        {HOURS.map((h) => <button key={h} type="button" className="pill" aria-current={input.hours === h ? "true" : undefined} onClick={() => set({ hours: h })}>{hoursLabel(h)}</button>)}
      </div>

      <h3 className="pp-sub">Wasiokunywa <small>drivers, wazee, the teetotal</small></h3>
      <div className="pp-sober">
        <input className="pp-range" type="range" min={0} max={60} step={5} value={input.sober} onChange={(e) => set({ sober: +e.target.value })} aria-label="Percent not drinking" />
        <span><b>{plan.sober}</b> of {input.guests} won't drink — we've added sodas for them.</span>
      </div>
    </div>,

    // 2 — what they drink
    <div className="pp-step" key="d">
      <h2 className="display h3 pp-q">Wanakunywa nini? <em>The crowd, the spirits, the extras.</em></h2>
      <div className="pp-crowds">
        {(Object.keys(CROWDS) as Crowd[]).map((c) => {
          const s = CROWDS[c].split;
          return (
            <button key={c} type="button" className={`pp-crowd${input.crowd === c ? " on" : ""}`} onClick={() => set({ crowd: c })}>
              <b>{CROWDS[c].name}</b>
              <small>{CROWDS[c].sw}</small>
              <span className="pp-split" aria-hidden="true">
                <i className="beer" style={{ flex: s.beer }} /><i className="wine" style={{ flex: s.wine }} /><i className="spirit" style={{ flex: s.spirits }} />
              </span>
              <span className="pp-split-key">Beer {Math.round(s.beer * 100)} · Wine {Math.round(s.wine * 100)} · Spirits {Math.round(s.spirits * 100)}</span>
            </button>
          );
        })}
      </div>

      <h3 className="pp-sub">Spirits za mbogi <small>pick as many as you like</small></h3>
      <div className="pp-spirits">
        {SPIRITS.map((s) => {
          const d = byTier(drinks.filter((x) => x.category === s.id), input.tier);
          if (!d) return null;
          const on = input.spirits.includes(s.id);
          return (
            <button key={s.id} type="button" className={`pp-spirit${on ? " on" : ""}`} aria-pressed={on} onClick={() => set({ spirits: toggle(input.spirits, s.id) })}>
              <span className="pp-spirit-art"><Bottle d={d} height={78} salt="pps" /></span>
              <b>{s.name}</b>
              <small>{d.brand}</small>
            </button>
          );
        })}
      </div>

      <h3 className="pp-sub">Extras</h3>
      <div className="pp-extras">
        {(Object.keys(EXTRAS) as Extra[]).map((x) => {
          const on = input.extras.includes(x);
          return (
            <button key={x} type="button" className={`pp-extra${on ? " on" : ""}`} aria-pressed={on} onClick={() => set({ extras: toggle(input.extras, x) })}>
              <span className="pp-tick" aria-hidden="true">{on ? "✓" : ""}</span>
              <span><b>{EXTRAS[x].name}</b><small>{EXTRAS[x].line}</small></span>
            </button>
          );
        })}
      </div>
    </div>,

    // 3 — the budget
    <div className="pp-step" key="b">
      <h2 className="display h3 pp-q">Bajeti? <em>Same party, three ways to pour it.</em></h2>
      <div className="pp-tiers">
        {(Object.keys(TIERS) as Tier[]).map((t) => {
          const p = tierCost[t];
          const names = [...new Set(p.lines.filter((l) => l.group !== "soft").map((l) => l.d.brand))].slice(0, 4);
          return (
            <button key={t} type="button" className={`pp-tier${input.tier === t ? " on" : ""}`} onClick={() => { set({ tier: t }); setSwaps({}); }}>
              <small>{TIERS[t].sw}</small>
              <b>{TIERS[t].name}</b>
              <span className="pp-tier-price">{money(p.cost)}</span>
              <span className="muted">≈ {money(p.cost / Math.max(1, input.guests))} a guest</span>
              <span className="pp-tier-line">{TIERS[t].line}</span>
              <span className="pp-tier-brands">{names.join(" · ")}</span>
            </button>
          );
        })}
      </div>
      <h3 className="pp-sub">Una bajeti fixed? <small>optional</small></h3>
      <div className="pp-budget">
        <label>
          <span>KSh</span>
          <input type="number" inputMode="numeric" min={0} step={500} placeholder="e.g. 30000" value={budget ?? ""} onChange={(e) => setBudget(e.target.value ? +e.target.value : null)} />
        </label>
        {budget ? (
          <div className="pp-meter">
            <span style={{ width: `${Math.min(100, (plan.cost / budget) * 100)}%` }} className={plan.cost > budget ? "over" : ""} />
            <p>
              {plan.cost <= budget
                ? <>Uko sawa — {money(budget - plan.cost)} to spare.</>
                : <>Over by {money(plan.cost - budget)}.{" "}
                  {(Object.keys(TIERS) as Tier[]).filter((t) => t !== input.tier && tierCost[t].cost <= budget).slice(0, 1).map((t) => (
                    <button key={t} type="button" className="link-btn" onClick={() => { set({ tier: t }); setSwaps({}); }}>{TIERS[t].name} fits — switch</button>
                  ))}
                </>}
            </p>
          </div>
        ) : null}
      </div>
    </div>,

    // 4 — the bar
    <div className="pp-step" key="r">
      <h2 className="display h3 pp-q">Bar yako iko ready. <em>Swap a brand, change a number.</em></h2>
      <div className="pp-lines">
        {plan.lines.map((l) => (
          <div key={l.slot} className={`pp-line${l.qty ? "" : " off"}`}>
            <span className="pp-line-art"><Bottle d={l.d} height={58} salt="ppl" /></span>
            <span className="pp-line-text">
              <b>{l.d.name}</b>
              <small>{l.d.volume} · {l.why}</small>
              {l.alts.length > 1 && <button type="button" className="link-btn" onClick={() => swap(l)}>Badilisha brand ⇄</button>}
            </span>
            <span className="pp-qty">
              <button type="button" onClick={() => qty(l, l.qty - 1)} aria-label={`One fewer ${l.d.name}`}>−</button>
              <output>{l.qty}</output>
              <button type="button" onClick={() => qty(l, l.qty + 1)} aria-label={`One more ${l.d.name}`}>+</button>
            </span>
            <span className="price">{money((l.d.price ?? 0) * l.qty)}</span>
          </div>
        ))}
      </div>

      <div className="pp-when">
        <label>
          <span>Leta lini?</span>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label>
          <span>Wapi?</span>
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {ZONES.map((x) => <option key={x.id} value={x.id}>{x.name} — {money(x.fee)}</option>)}
          </select>
        </label>
        <p className="muted"><TumaBoda /> brings it cold to {z.name} in about {z.eta}. Order an hour before the party — we're open 24 hours.</p>
      </div>

      <div className="pp-chama">
        <span>Mnachanga wangapi?</span>
        <span className="pp-qty">
          <button type="button" onClick={() => setChama(Math.max(1, chama - 1))} aria-label="One fewer chipping in">−</button>
          <output>{chama}</output>
          <button type="button" onClick={() => setChama(Math.min(input.guests, chama + 1))} aria-label="One more chipping in">+</button>
        </span>
        <b>{chama > 1 ? `${money(Math.ceil(total / chama / 10) * 10)} each` : "Host analipa yote"}</b>
      </div>

      <div className="pp-checkout">
        <div>
          <small className="muted">Bottles {money(plan.cost)} + delivery {money(z.fee)}</small>
          <div className="price pp-big">{money(total)}</div>
        </div>
        <div className="row gap-s" style={{ flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(shareText())}`} target="_blank" rel="noopener">Tuma kwa group</a>
          {added
            ? <a className="btn btn-amber" href="/checkout">Iko kwa bag — checkout →</a>
            : <button className="btn btn-amber" type="button" disabled={!plan.cost} onClick={() => { addMany(plan.lines.filter((l) => l.qty > 0).map((l) => toLine(l.d, l.qty))); setAdded(true); }}>Weka yote kwa bag</button>}
        </div>
      </div>
      <p className="muted pp-fine">Estimates — every party drinks differently. 18+ only; ID is checked on delivery. Need games for the night? <a href="/games">Games night →</a></p>
    </div>,
  ];

  const last = step === STEPS.length - 1;
  return (
    <div className="pp" ref={top} style={{ ["--hue" as any]: occasion.hue }}>
      <div className="pp-main">
        <nav className="pp-rail" aria-label="Planner steps">
          {STEPS.map((s, i) => (
            <button key={s} type="button" className={`pp-rail-step${i === step ? " on" : ""}${i < step ? " done" : ""}`} onClick={() => go(i)} aria-current={i === step ? "step" : undefined}>
              <i>{i < step ? "✓" : i + 1}</i><span>{s}</span>
            </button>
          ))}
        </nav>

        <div className="pp-panel" key={step}>{steps[step]}</div>

        <div className="pp-nav">
          {step > 0 ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(step - 1)}>← Rudi</button> : <span />}
          {!last && (
            <div className="row gap-s">
              {step > 0 && step < 3 && <button type="button" className="link-btn" onClick={() => go(STEPS.length - 1)}>Ruka — ona bar</button>}
              <button type="button" className="btn btn-amber" onClick={() => go(step + 1)}>Next: {STEPS[step + 1]} →</button>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------- the live bar */}
      <aside className="pp-bar" id="pp-bar" aria-label="Your party, so far">
        <div className="pp-scene">
          <img key={occasion.id} {...responsive(occasion.photo, "(max-width: 1020px) 100vw, 360px")} alt="" style={{ objectPosition: occasion.focus }} decoding="async" />
          <div className="pp-scene-text">
            <small>{occasion.sw}</small>
            <b>{occasion.name}</b>
            <span>{[whenLabel(when), countdown(when)].filter(Boolean).join(" · ") || " "}</span>
          </div>
        </div>

        <Guests guests={input.guests} sober={plan.sober} />

        <div className="pp-shelf">
          <div className="pp-shelf-row">
            {plan.lines.filter((l) => l.qty > 0 && l.group !== "soft").map((l) => <ShelfBottle key={l.slot + l.d.handle} l={l} h={76} />)}
          </div>
          <div className="pp-shelf-row is-low">
            {plan.lines.filter((l) => l.qty > 0 && l.group === "soft").map((l) => <ShelfBottle key={l.slot + l.d.handle} l={l} h={46} />)}
          </div>
        </div>

        <div className="pp-stats">
          <div><b>{plan.poured}</b><span>drinks poured</span></div>
          <div><b>{plan.bottles}</b><span>bottles</span></div>
          <div><b>{money(Math.round(plan.cost / Math.max(1, input.guests)))}</b><span>a guest</span></div>
        </div>
        <div className="pp-total">
          <span>Total ya bar</span>
          <b key={plan.cost}>{money(plan.cost)}</b>
        </div>
        {!last && <button type="button" className="btn btn-amber btn-block" onClick={() => go(STEPS.length - 1)}>Ona bar yako →</button>}
      </aside>

      {!last && (
        <button type="button" className="pp-dock" onClick={() => document.getElementById("pp-bar")?.scrollIntoView({ behavior: "smooth" })}>
          <span>{plan.bottles} bottles · {input.guests} guests</span>
          <b>{money(plan.cost)}</b>
        </button>
      )}
    </div>
  );
}

/** The guests, one figure each up to 60; past that each figure stands for a few. */
function Guests({ guests, sober }: { guests: number; sober: number }) {
  const each = Math.ceil(guests / 60);
  const n = Math.ceil(guests / each);
  const dry = Math.round(sober / each);
  return (
    <div className="pp-crowd-row" aria-label={`${guests} guests, ${sober} not drinking`}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} className={`pp-guest${i >= n - dry ? " dry" : ""}`} viewBox="0 0 12 20" style={{ ["--i" as any]: i }} aria-hidden="true">
          <circle cx="6" cy="4" r="3.4" /><path d="M1 20v-6.5C1 10.4 3.2 8.6 6 8.6s5 1.8 5 4.9V20z" />
        </svg>
      ))}
      <span className="pp-crowd-key">{each > 1 ? `each = ${each} guests · ` : ""}<i className="dot" /> drinking <i className="dot dry" /> not drinking</span>
    </div>
  );
}

function ShelfBottle({ l, h }: { l: PlanLine; h: number }) {
  const copies = Math.min(2, l.qty);
  return (
    <span className="pp-sb" title={`${l.qty} × ${l.d.name}`}>
      <span className="pp-sb-stack">
        {Array.from({ length: copies }, (_, i) => (
          <span key={i} className="pp-sb-copy" style={{ ["--k" as any]: copies - 1 - i }}>
            <Bottle d={l.d} height={h} salt={`sb${i}`} />
          </span>
        ))}
      </span>
      <i key={l.qty}>×{l.qty}</i>
    </span>
  );
}
