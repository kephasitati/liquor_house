import { useEffect, useRef, useState } from "react";
import { WYR, pick } from "../../data/games";
import { markSeen, orderFresh } from "./store";
import { TurnBar, cue, useTurnClock } from "./party";

/**
 * Ungependa? — would-you-rather as a timed debate. Read it out, the room splits into Team A
 * and Team B, then each side gets the clock to defend its pick (a beep and a buzz when it's
 * the other side's turn). The room votes who argued it better, and the tally keeps count.
 * No question comes back until the whole deck has been played on this device.
 */
type Phase = "setup" | "pick" | "debate-a" | "debate-b" | "vote";
const NUDGES = ["Hiyo ni ngori kabisa.", "Uko sure? Fikiria tena.", "Wenye hawakuchagua — mko wapi?", "Eish, hii ni tough."];
const DECK = "wyr";

export default function WouldYouRather() {
  const [secs, setSecs] = useState(20);
  const [deck, setDeck] = useState<[string, string][]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [tally, setTally] = useState({ a: 0, b: 0 });
  const [nudge, setNudge] = useState("");
  const shown = useRef<string[]>([]);

  const left = useTurnClock(secs, phase === "debate-a" || phase === "debate-b", () => setPhase((p) => (p === "debate-a" ? "debate-b" : "vote")));

  useEffect(() => {
    if (phase === "pick" && deck[i]) { shown.current.push(deck[i][0]); markSeen(DECK, shown.current); }
  }, [phase, i]);

  const start = () => { setDeck(orderFresh(DECK, WYR, (p) => p[0])); setI(0); setTally({ a: 0, b: 0 }); setNudge(pick(NUDGES)); setPhase("pick"); };
  const next = () => {
    if (i + 1 >= deck.length) { start(); return; }
    setI(i + 1); setNudge(pick(NUDGES)); setPhase("pick");
  };
  const vote = (side: "a" | "b" | null) => { if (side) setTally((t) => ({ ...t, [side]: t[side] + 1 })); next(); };

  if (phase === "setup") {
    return (
      <div className="party-setup">
        <p className="lede" style={{ margin: 0 }}>Read it out. The room splits — Team A on one side, Team B on the other — then each side gets the clock to defend its pick. Kura: who argued it better?</p>
        <div className="row gap-s" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <span className="muted" style={{ fontSize: ".85rem" }}>Time to defend:</span>
          {[15, 20, 30, 45].map((s) => <button key={s} type="button" className="pill" aria-current={secs === s ? "true" : undefined} onClick={() => setSecs(s)}>{s}s</button>)}
        </div>
        <button className="btn btn-amber" type="button" onClick={start}>Twende — let's go</button>
      </div>
    );
  }

  const [a, b] = deck[i];
  const debating = phase === "debate-a" || phase === "debate-b";
  return (
    <div className="wyr">
      <div className="game-hud">
        <span className="mono">Swali {i + 1} / {deck.length}</span>
        <span className="mono">A {tally.a} · B {tally.b}</span>
      </div>
      {debating && <TurnBar left={left} seconds={secs} colour={phase === "debate-a" ? "#d98a1c" : "#1f4e8c"} />}
      <div className="wyr-pair" style={{ marginTop: 10 }}>
        <div className={`wyr-side wyr-a${phase === "debate-a" ? " is-chosen" : phase === "debate-b" ? " is-other" : ""}`}>
          <small>TEAM A</small>{a}
          {phase === "debate-a" && <span className="wyr-now">Ongea sasa — defend it!</span>}
        </div>
        <span className="wyr-or">au</span>
        <div className={`wyr-side wyr-b${phase === "debate-b" ? " is-chosen" : phase === "debate-a" ? " is-other" : ""}`}>
          <small>TEAM B</small>{b}
          {phase === "debate-b" && <span className="wyr-now">Turn yenu — defend it!</span>}
        </div>
      </div>
      <div className="row gap" style={{ justifyContent: "space-between", flexWrap: "wrap", marginTop: 16, minHeight: 44 }}>
        {phase === "pick" && (
          <>
            <span className="muted">Kila mtu achague side — hakuna kukaa katikati. {nudge}</span>
            <div className="row gap-s">
              <button type="button" className="btn btn-ghost btn-sm" onClick={next}>Skip</button>
              <button type="button" className="btn btn-amber btn-sm" onClick={() => { cue("go"); setPhase("debate-a"); }}>Anza debate · {secs}s each</button>
            </div>
          </>
        )}
        {debating && (
          <>
            <span className="muted">{phase === "debate-a" ? "Team A has the floor." : "Team B, jibu!"}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhase(phase === "debate-a" ? "debate-b" : "vote")}>Done — switch</button>
          </>
        )}
        {phase === "vote" && (
          <>
            <span className="muted">Kura! Who argued it better?</span>
            <div className="row gap-s">
              <button type="button" className="btn btn-sm wyr-vote-a" onClick={() => vote("a")}>Team A</button>
              <button type="button" className="btn btn-sm wyr-vote-b" onClick={() => vote("b")}>Team B</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => vote(null)}>Sare</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
