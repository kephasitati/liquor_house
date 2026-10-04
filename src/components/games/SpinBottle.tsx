import { useRef, useState } from "react";
import { DARES, SPIN_NAMES } from "../../data/games";
import { markSeen, orderFresh } from "./store";
import { TurnBar, cue, useTurnClock } from "./party";

const DARE_SECONDS = 30;

/**
 * Spin the Bottle, for the table at home. Names round a bar top, a real bottle in the middle;
 * it spins, slows and points at someone, who gets a dare. The dares are songs, stories and
 * dance moves — never a drink — and there is no score and no prize: it's a game of chance.
 */
export default function SpinBottle({ bottle }: { bottle: string }) {
  const [names, setNames] = useState<string[]>(SPIN_NAMES);
  const [draft, setDraft] = useState("");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [dare, setDare] = useState("");
  const deck = useRef<string[]>([]);
  const [daring, setDaring] = useState(false);
  const left = useTurnClock(DARE_SECONDS, daring, () => setDaring(false));

  // dares don't repeat until the whole list has been done on this device
  const nextDare = () => {
    if (!deck.current.length) deck.current = orderFresh("dares", DARES, (d) => d).reverse();
    const d = deck.current.pop()!;
    markSeen("dares", [d]);
    setDare(d);
    setDaring(false);
  };

  const spin = () => {
    if (spinning || names.length < 2) return;
    setPicked(null);
    setDaring(false);
    setSpinning(true);
    // whole turns plus a random landing; the neck points up at 0°
    const target = angle + 360 * (4 + Math.floor(Math.random() * 3)) + Math.random() * 360;
    setAngle(target);
    setTimeout(() => {
      const step = 360 / names.length;
      const at = ((target % 360) + 360) % 360;
      setPicked(Math.round(at / step) % names.length);
      nextDare();
      setSpinning(false);
    }, 4200);
  };

  const add = () => {
    const n = draft.trim().slice(0, 18);
    if (n && names.length < 10) setNames([...names, n]);
    setDraft("");
  };

  return (
    <div className="spin">
      <div className="spin-table">
        {names.map((n, i) => {
          const a = (i / names.length) * 2 * Math.PI;
          return (
            <span
              key={`${n}-${i}`}
              className={`spin-name${picked === i ? " is-picked" : ""}`}
              style={{ left: `${50 + 42 * Math.sin(a)}%`, top: `${50 - 42 * Math.cos(a)}%` }}
            >
              {n}
            </span>
          );
        })}
        <button type="button" className="spin-bottle" onClick={spin} disabled={spinning || names.length < 2} aria-label="Spin the bottle">
          <img src={bottle} alt="" style={{ transform: `rotate(${angle}deg)` }} />
        </button>
      </div>

      <div className="spin-side">
        {picked !== null && !spinning ? (
          <div className="spin-dare">
            <span className="kicker">Turn ya {names[picked]}</span>
            <p className="display h3" style={{ margin: ".6rem 0 1rem" }}>{dare}</p>
            {daring && <TurnBar left={left} seconds={DARE_SECONDS} />}
            <div className="row gap-s" style={{ flexWrap: "wrap", marginTop: daring ? 12 : 0 }}>
              {!daring && <button className="btn btn-amber btn-sm" type="button" onClick={() => { cue("go"); setDaring(true); }}>Start the clock · {DARE_SECONDS}s</button>}
              <button className="btn btn-ghost btn-sm" type="button" onClick={spin}>Zungusha tena — spin again</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={nextDare}>Another dare</button>
            </div>
          </div>
        ) : (
          <div className="spin-dare">
            <span className="kicker">{spinning ? "Inazunguka…" : "Ready?"}</span>
            <p className="display h3" style={{ margin: ".6rem 0 1rem" }}>{spinning ? "Round and round it goes…" : "Tap the bottle to spin."}</p>
          </div>
        )}

        <div className="spin-names">
          <span className="card-brand">Around the table</span>
          <div className="row gap-s" style={{ flexWrap: "wrap", marginTop: 8 }}>
            {names.map((n, i) => (
              <span className="chip" key={`${n}-${i}`}>
                {n}
                <button type="button" className="chip-x" aria-label={`Remove ${n}`} onClick={() => { setNames(names.filter((_, j) => j !== i)); setPicked(null); }} disabled={spinning}>×</button>
              </span>
            ))}
          </div>
          <form className="row gap-s" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input className="field" style={{ flex: 1, minWidth: 0 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a name" maxLength={18} aria-label="Add a name" />
            <button className="btn btn-ghost btn-sm" type="submit" disabled={!draft.trim() || names.length >= 10}>Add</button>
          </form>
        </div>
        <p className="muted" style={{ fontSize: ".78rem", marginTop: 12 }}>Nobody has to drink to play — water counts. Just for fun: no score, no prize.</p>
      </div>
    </div>
  );
}
