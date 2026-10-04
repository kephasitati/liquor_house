import { useEffect, useRef, useState } from "react";
import { CHORA, SAY, pick } from "../../data/games";
import { markSeen, orderFresh } from "./store";
import { Handoff, PartySetup, Scoreboard, TeamResult, TurnBar, cue, turnOrder, useTurnClock, type Party } from "./party";

/**
 * Chora! — Kenyan Pictionary on the phone. The drawer peeks at the word, then draws it with a
 * finger while their team shouts guesses before the clock runs out. "Wamepata!" scores and
 * deals the next word; "Skip" deals another. Then the phone goes to the next drawer.
 * Words never repeat until the whole list has been drawn on this device.
 */
type Phase = "handoff" | "peek" | "draw" | "turn-end" | "end";
const INKS = ["#22180f", "#c4471f", "#1f4e8c", "#4f8a3a", "#d98a1c"];
const SIZES = [4, 8, 16];

export default function Chora() {
  const [party, setParty] = useState<Party | null>(null);
  const [phase, setPhase] = useState<Phase>("handoff");
  const [t, setT] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [w, setW] = useState(0);
  const [shown, setShown] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [got, setGot] = useState<string[]>([]);
  const [ink, setInk] = useState(INKS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [say, setSay] = useState("");
  const [peeking, setPeeking] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  const order = party ? turnOrder(party) : [];
  const turn = order[t % Math.max(1, order.length)];
  const word = words[w % Math.max(1, words.length)];

  const left = useTurnClock(party?.seconds ?? 60, phase === "draw", () => setPhase("turn-end"), t);

  const begin = (p: Party) => {
    setParty(p); setWords(orderFresh("chora", CHORA, (x) => x)); setW(0); setT(0);
    setScores(p.teams.map(() => 0)); setGot([]); setPhase("handoff");
  };
  const nextWord = () => { markSeen("chora", [word]); setW((x) => x + 1); clear(); };
  const scored = () => {
    if (!turn) return;
    cue("go");
    setScores((s) => s.map((v, x) => (x === turn.team ? v + 1 : v)));
    setGot((g) => [...g, word]);
    setSay(pick(SAY.right));
    nextWord();
  };

  // size the canvas to its box, at the screen's pixel density
  useEffect(() => {
    if (phase !== "draw" || !canvas.current) return;
    const c = canvas.current;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0, 0, r.width, r.height);
  }, [phase, t]);

  function clear() {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d")!; const r = c.getBoundingClientRect();
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0, 0, r.width, r.height);
  }
  const pt = (e: React.PointerEvent) => { const r = canvas.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const down = (e: React.PointerEvent) => { canvas.current!.setPointerCapture(e.pointerId); drawing.current = true; lastPt.current = pt(e); move(e); };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !canvas.current) return;
    const ctx = canvas.current.getContext("2d")!;
    const p = pt(e); const l = lastPt.current ?? p;
    ctx.strokeStyle = ink; ctx.lineWidth = ink === "eraser" ? size * 3 : size;
    if (ink === "eraser") ctx.strokeStyle = "#fffdf8";
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    lastPt.current = p;
  };
  const up = () => { drawing.current = false; lastPt.current = null; };

  if (!party) {
    return (
      <PartySetup seconds={60} secondsOptions={[45, 60, 90]} allowSolo={false} onStart={begin} startLabel="Twende — anza kuchora">
        <p className="lede" style={{ margin: 0 }}>Split into teams. The drawer peeks at the word and draws it — no letters, no numbers, no talking! Your team guesses before time's up.</p>
      </PartySetup>
    );
  }
  if (phase === "end") return <TeamResult party={party} scores={scores} unit="drawings guessed" onAgain={() => begin(party)} />;
  if (phase === "handoff" && turn) return <Handoff key={t} turn={turn} party={party} onGo={() => { setShown(false); setGot([]); setPhase("peek"); }} note="You're drawing — don't let your team see the next screen" />;

  if (phase === "peek") {
    return (
      <div className="chora-peek">
        <span className="kicker">Only {turn?.player} looks</span>
        {shown ? <b className="chora-word">{word}</b> : <button type="button" className="btn btn-ghost" onClick={() => setShown(true)}>Tap to see your word</button>}
        {shown && <button type="button" className="btn btn-amber" onClick={() => { cue("go"); setSay(""); setPhase("draw"); }}>Got it — start drawing</button>}
      </div>
    );
  }

  if (phase === "turn-end") {
    const last = t + 1 >= order.length;
    return (
      <div className="game-end">
        <span className="kicker">{got.length >= 3 ? "Noma sana!" : got.length ? "Hapo sawa!" : "Aii, next time!"}</span>
        <p className="game-score"><b>{got.length}</b><span>guessed for Team {turn ? party.teams[turn.team].name : ""}</span></p>
        <Scoreboard party={party} scores={scores} />
        {got.length > 0 && <div className="hu-log">{got.map((g) => <span key={g} className="chip chip-leaf">✓ {g}</span>)}</div>}
        <div className="row gap" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          {last ? (
            <>
              <button type="button" className="btn btn-amber" onClick={() => setPhase("end")}>See who won</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setT(t + 1); setPhase("handoff"); }}>Another round each</button>
            </>
          ) : (
            <button type="button" className="btn btn-amber" onClick={() => { setT(t + 1); setPhase("handoff"); }}>Next drawer: {order[(t + 1) % order.length].player}</button>
          )}
        </div>
      </div>
    );
  }

  const colour = turn ? party.teams[turn.team].colour : undefined;
  return (
    <div className="chora">
      <div className="game-hud">
        <span className="mono">{turn?.player} anachora · Team {turn ? party.teams[turn.team].name : ""}</span>
        <span className="mono">{got.length} ✓</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      <TurnBar left={left} seconds={party.seconds} colour={colour} />
      <canvas ref={canvas} className="chora-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} aria-label="Drawing board" />
      <div className="chora-tools">
        <div className="row gap-s">
          {INKS.map((c) => <button key={c} type="button" className={`ink${ink === c ? " on" : ""}`} style={{ background: c }} onClick={() => setInk(c)} aria-label={`Colour ${c}`} />)}
          <button type="button" className={`ink eraser${ink === "eraser" ? " on" : ""}`} onClick={() => setInk("eraser")} aria-label="Eraser">⌫</button>
        </div>
        <div className="row gap-s">
          {SIZES.map((s) => <button key={s} type="button" className={`ink size${size === s ? " on" : ""}`} onClick={() => setSize(s)} aria-label={`Brush ${s}`}><i style={{ width: s, height: s }} /></button>)}
          <button type="button" className="pill" onClick={clear}>Clear</button>
        </div>
      </div>
      <div className="row gap" style={{ justifyContent: "space-between", flexWrap: "wrap", marginTop: 12 }}>
        <span className="muted">{say || "Hakuna kuongea — draw only!"}</span>
        <div className="row gap-s">
          <button type="button" className="btn btn-ghost btn-sm chora-peek-btn"
            onPointerDown={() => setPeeking(true)} onPointerUp={() => setPeeking(false)} onPointerLeave={() => setPeeking(false)} onPointerCancel={() => setPeeking(false)}
            onContextMenu={(e) => e.preventDefault()}>
            {peeking ? word : "Shika kuona neno"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={nextWord}>Skip word</button>
          <button type="button" className="btn btn-amber btn-sm" onClick={scored}>Wamepata! +1</button>
        </div>
      </div>
    </div>
  );
}
