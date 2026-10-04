import { useEffect, useRef, useState } from "react";
import { SAY, pick, shuffle } from "../../data/games";
import GameEnd from "./GameEnd";
import { dealFresh } from "./store";
import { Handoff, PartySetup, Scoreboard, TeamResult, turnOrder, cue, type Party } from "./party";

/**
 * Guess the Bottle. A real bottle photo stands in a dark bar; a torch beam widens on it while
 * the blur clears. Name it from four — the sooner, the more it's worth (up to 10 a bottle).
 *
 * Solo: eight bottles, and a high score wins the code. With teams: each bottle is the next
 * player's turn, the phone is passed between turns and the scoreboard keeps count. Bottles
 * come from a deck that doesn't repeat until every bottle has been shown on this device.
 */
export interface GuessDrink { handle: string; name: string; brand: string; category: string; thumbnail: string; local: boolean }

const SOLO_ROUNDS = 8;
const TEAM_ROUNDS = 2; // bottles per player

interface Round { answer: GuessDrink; options: GuessDrink[] }

function deal(drinks: GuessDrink[], n: number): Round[] {
  // Kenyan bottles always make the round; the rest come unseen-first
  const local = drinks.filter((d) => d.local);
  const hand = dealFresh("guess", drinks, n, (d) => d.handle);
  if (!hand.some((d) => d.local) && local.length) hand[0] = shuffle(local)[0];
  return hand.map((answer) => {
    const brands = new Set([answer.brand]);
    const others: GuessDrink[] = [];
    for (const d of [...shuffle(drinks.filter((x) => x.category === answer.category)), ...shuffle(drinks)]) {
      if (others.length === 3) break;
      if (!brands.has(d.brand)) { brands.add(d.brand); others.push(d); }
    }
    return { answer, options: shuffle([answer, ...others]) };
  });
}

type Phase = "handoff" | "play" | "end";

export default function GuessBottle({ drinks }: { drinks: GuessDrink[] }) {
  const [party, setParty] = useState<Party | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");
  const [t, setT] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [line, setLine] = useState("");
  const start = useRef(0);

  const order = party ? turnOrder(party) : [];
  const turn = order[i % Math.max(1, order.length)];
  const round = rounds[i];
  const settled = chosen !== null;
  const SECONDS = party?.seconds ?? 10;

  useEffect(() => {
    if (phase !== "play" || !round || settled) return;
    start.current = performance.now();
    setT(0);
    let raf = 0;
    const tick = () => {
      const s = (performance.now() - start.current) / 1000;
      setT(Math.min(SECONDS, s));
      if (s >= SECONDS) { setChosen(""); setLine(SAY.timeUp); cue("switch"); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, round, settled]);

  const begin = (p: Party) => {
    const n = p.solo ? SOLO_ROUNDS : Math.min(drinks.length, turnOrder(p).length * TEAM_ROUNDS);
    setParty(p); setRounds(deal(drinks, n)); setI(0); setChosen(null); setLine("");
    setScores(p.teams.map(() => 0));
    setPhase(p.solo ? "play" : "handoff");
  };

  const answer = (d: GuessDrink) => {
    if (!round || settled || !turn) return;
    const right = d.handle === round.answer.handle;
    setChosen(d.handle);
    setLine(right ? pick(SAY.right) : pick(SAY.wrong));
    if (right) {
      const pts = 5 + Math.round(5 * (1 - t / SECONDS));
      setScores((s) => s.map((v, x) => (x === turn.team ? v + pts : v)));
    }
  };

  const next = () => {
    setChosen(null); setLine("");
    if (i + 1 >= rounds.length) { setPhase("end"); return; }
    setI(i + 1);
    setPhase(party?.solo ? "play" : "handoff");
  };

  if (!party) {
    return (
      <PartySetup seconds={10} secondsOptions={[8, 10, 15]} onStart={begin}>
        <p className="lede" style={{ margin: 0 }}>The lights come up slowly — the sooner you name the bottle, the more it's worth. Solo for the code, or teams and pass the phone.</p>
      </PartySetup>
    );
  }

  if (phase === "end") {
    return party.solo
      ? <GameEnd game="guess" score={Math.round(((scores[0] ?? 0) / (rounds.length * 10)) * 100)} of={100} unit="points" onAgain={() => begin(party)} />
      : <TeamResult party={party} scores={scores} unit="points" onAgain={() => begin(party)} />;
  }

  if (phase === "handoff" && turn) return <Handoff key={i} turn={turn} party={party} onGo={() => setPhase("play")} note={`Chupa ${i + 1} of ${rounds.length}`} />;

  const reveal = settled ? 1 : t / SECONDS;
  return (
    <div className="guess">
      <div className="game-hud">
        <span className="mono">Chupa {i + 1} / {rounds.length}{!party.solo && turn ? ` · ${turn.player}` : ""}</span>
        <span className="mono">{party.solo ? `${scores[0] ?? 0} pts` : ""}</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      <div className="game-timer"><i style={{ transform: `scaleX(${1 - (settled ? 0 : t / SECONDS)})` }} /></div>
      <div className="guess-stage">
        <img src={round.answer.thumbnail} alt={settled ? round.answer.name : "A bottle in the dark"} style={{ filter: `blur(${(1 - reveal) * 7}px)` }} />
        <div className="guess-dark" style={{ ["--r" as any]: settled ? "160%" : `${8 + reveal * 70}%` }} aria-hidden="true" />
        {line && <span className={`guess-say ${chosen === round.answer.handle ? "right" : "wrong"}`}>{line}</span>}
      </div>
      <div className="opts guess-opts">
        {round.options.map((d) => {
          const state = !settled ? "" : d.handle === round.answer.handle ? " is-right" : d.handle === chosen ? " is-wrong" : " is-dim";
          return (
            <button key={d.handle} type="button" className={`opt${state}`} onClick={() => answer(d)} disabled={settled}>
              <b>{d.name}</b><span>{d.brand}</span>
            </button>
          );
        })}
      </div>
      {settled && (
        <div className="row gap" style={{ justifyContent: "space-between", flexWrap: "wrap", marginTop: 14 }}>
          <span className="muted">It was <b style={{ color: "var(--fg)" }}>{round.answer.name}</b>.</span>
          <button className="btn btn-amber btn-sm" type="button" onClick={next} autoFocus>
            {i + 1 >= rounds.length ? (party.solo ? "See your score" : "See who won") : party.solo ? "Next bottle" : "Pass the phone"}
          </button>
        </div>
      )}
    </div>
  );
}
