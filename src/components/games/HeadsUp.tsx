import { useCallback, useEffect, useRef, useState } from "react";
import { HEADSUP, SAY, pick } from "../../data/games";
import { markSeen, orderFresh } from "./store";
import { Handoff, PartySetup, Scoreboard, TeamResult, TurnBar, cue, turnOrder, useTurnClock, type Party, type Turn } from "./party";

/**
 * Kichwa Juu — Heads Up, Kenyan edition. One player holds the phone to their forehead, the
 * mbogi describes or acts out the word, and the player guesses before the clock runs out.
 * Tap the right half (or →) when they get it, the left half (or ←) to pass.
 *
 * With teams, every player gets a timed turn: the phone is passed between turns, the clock
 * beeps and buzzes when it's time to switch, and the scoreboard keeps count. A word is never
 * shown twice — not in this game, and not again on this device until the deck runs out.
 */
type Phase = "setup" | "handoff" | "count" | "play" | "turn-end" | "end";
const DECKS = [["mix", "Mix ya kila kitu", "A bit of everything"], ...Object.entries(HEADSUP).map(([k, d]) => [k, d.name, d.words.slice(0, 3).join(", ") + "…"])];

export default function HeadsUp() {
  const [deck, setDeck] = useState("mix");
  const [party, setParty] = useState<Party | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(3);
  const [words, setWords] = useState<string[]>([]);
  const [w, setW] = useState(0); // next word, across every turn
  const [t, setT] = useState(0); // whose turn
  const [scores, setScores] = useState<number[]>([]);
  const [log, setLog] = useState<{ word: string; got: boolean }[]>([]);
  const [flash, setFlash] = useState<"" | "got" | "pass">("");
  const shown = useRef<string[]>([]);

  const order: Turn[] = party ? turnOrder(party) : [];
  const turn = order[t % Math.max(1, order.length)];
  const deckKey = `headsup:${deck}`;

  const left = useTurnClock(party?.seconds ?? 60, phase === "play", () => setPhase("turn-end"));

  const start = (p: Party) => {
    const pool = deck === "mix" ? Object.values(HEADSUP).flatMap((d) => d.words) : HEADSUP[deck].words;
    setWords(orderFresh(deckKey, pool, (x) => x));
    setParty(p); setW(0); setT(0); setLog([]); setScores(p.teams.map(() => 0));
    shown.current = [];
    beginTurn(p);
  };
  const beginTurn = (p: Party) => { setLog([]); if (p.solo) { setCount(3); setPhase("count"); } else setPhase("handoff"); };

  // 3, 2, 1…
  useEffect(() => {
    if (phase !== "count") return;
    if (count === 0) { cue("go"); setPhase("play"); return; }
    const id = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [phase, count]);

  // remember what was shown, so it doesn't come back next game
  useEffect(() => {
    if (phase === "play" && words[w]) shown.current.push(words[w]);
    if (phase === "turn-end" || phase === "end") markSeen(deckKey, shown.current);
  }, [phase, w]);

  const answer = useCallback((got: boolean) => {
    if (phase !== "play" || !turn) return;
    setLog((l) => [...l, { word: words[w], got }]);
    if (got) setScores((s) => s.map((v, i) => (i === turn.team ? v + 1 : v)));
    setFlash(got ? "got" : "pass");
    setTimeout(() => setFlash(""), 350);
    if (w + 1 >= words.length) { setPhase("turn-end"); return; }
    setW(w + 1);
  }, [phase, words, w, turn]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") answer(true);
      if (e.key === "ArrowLeft") answer(false);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [answer]);

  if (phase === "setup" || !party) {
    return (
      <PartySetup seconds={60} secondsOptions={[30, 45, 60, 90]} onStart={start} startLabel="Twende — anza!">
        <p className="lede" style={{ margin: 0 }}>Weka simu kwa kichwa, screen facing out. The mbogi describes or acts — no saying the word! Play in teams and everyone gets a timed turn.</p>
        <div className="opts">
          {DECKS.map(([k, name, line]) => (
            <button key={k} type="button" className={`opt${deck === k ? " is-right" : ""}`} onClick={() => setDeck(k)}>
              <b>{name}</b><span>{line}</span>
            </button>
          ))}
        </div>
      </PartySetup>
    );
  }

  if (phase === "handoff" && turn) return <Handoff key={t} turn={turn} party={party} onGo={() => setPhase("play")} note="Phone on your forehead — the mbogi describes" />;
  if (phase === "count") return <div className="hu-card hu-count" aria-live="assertive"><span>{count || "Twende!"}</span></div>;

  if (phase === "end") return <TeamResult party={party} scores={scores} unit="words" onAgain={() => start(party)} />;

  if (phase === "turn-end") {
    const got = log.filter((l) => l.got).length;
    const lastTurn = party.solo || t + 1 >= order.length;
    return (
      <div className="game-end">
        <span className="kicker">{got >= 8 ? "Noma sana!" : got >= 4 ? "Hapo sawa!" : "Aii, next time!"}</span>
        <p className="game-score"><b>{got}</b><span>{party.solo ? "got it" : `for ${turn?.player} · Team ${party.teams[turn!.team].name}`}</span></p>
        <Scoreboard party={party} scores={scores} />
        <div className="hu-log">{log.map((l, n) => <span key={n} className={`chip ${l.got ? "chip-leaf" : ""}`}>{l.got ? "✓" : "–"} {l.word}</span>)}</div>
        <div className="row gap" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          {party.solo ? (
            <button type="button" className="btn btn-amber" onClick={() => beginTurn(party)}>Next round</button>
          ) : lastTurn ? (
            <>
              <button type="button" className="btn btn-amber" onClick={() => setPhase("end")}>See who won</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setT(t + 1); beginTurn(party); }}>Another round each</button>
            </>
          ) : (
            <button type="button" className="btn btn-amber" onClick={() => { setT(t + 1); beginTurn(party); }}>Next up: {order[(t + 1) % order.length].player}</button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setPhase("setup")}>Change deck</button>
        </div>
      </div>
    );
  }

  const colour = turn && !party.solo ? party.teams[turn.team].colour : undefined;
  return (
    <div className="hu">
      <div className="game-hud">
        <span className="mono">{party.solo ? `${log.filter((l) => l.got).length} got it` : `${turn?.player} · Team ${party.teams[turn!.team].name}`}</span>
        <span className="mono">{log.filter((l) => l.got).length} ✓</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      <TurnBar left={left} seconds={party.seconds} colour={colour} />
      <div className={`hu-card${flash ? ` hu-${flash}` : ""}`}>
        <button type="button" className="hu-zone hu-pass" onClick={() => answer(false)} aria-label="Pass">Pass</button>
        <button type="button" className="hu-zone hu-got" onClick={() => answer(true)} aria-label="Got it">Got it!</button>
        <span className="hu-word">{words[w]}</span>
        {flash && <span className="hu-say">{flash === "got" ? pick(SAY.right) : "Next!"}</span>}
      </div>
      <p className="muted center" style={{ fontSize: ".8rem", marginTop: 10 }}>Tap the right side when they get it, the left side to pass — or use ← →.</p>
    </div>
  );
}
