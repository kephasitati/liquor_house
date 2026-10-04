import { useState } from "react";
import { SAY, TRIVIA, pick, shuffle, type GameId, type Question } from "../../data/games";
import GameEnd from "./GameEnd";
import { dealFresh } from "./store";
import { Handoff, PartySetup, Scoreboard, TeamResult, TurnBar, turnOrder, useTurnClock, type Party } from "./party";

/**
 * A quiz — Bar Trivia, Historia Yetu and Unasema Sheng? are all this, with their own pool.
 *
 * Solo: ten questions against the clock, and a high score wins the code. With a mbogi: each
 * question goes to the next player in turn (the teams take it in turns), the phone is passed
 * between turns, the clock runs per turn, and the scoreboard keeps count.
 *
 * Questions never repeat: each quiz deals from a deck that remembers what this device has
 * already been asked, and only reshuffles when every question has been played.
 */
const SOLO_COUNT = 10;
const ROUNDS = 2; // in team play, each player answers this many

interface Props {
  game?: Extract<GameId, "trivia" | "history" | "sheng" | "methali" | "kaunti">;
  pool?: Question[];
  intro?: string;
}
interface Dealt extends Question { order: number[] }
type Phase = "handoff" | "ask" | "fact" | "end";

export default function BarTrivia({ game = "trivia", pool = TRIVIA, intro = "Ten questions on Kenyan drinks, the bar and the bottle." }: Props) {
  const [party, setParty] = useState<Party | null>(null);
  const [qs, setQs] = useState<Dealt[]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [chosen, setChosen] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [line, setLine] = useState("");

  const order = party ? turnOrder(party) : [];
  const turn = order[i % Math.max(1, order.length)];
  const q = qs[i];

  const left = useTurnClock(party?.seconds ?? 20, phase === "ask", () => {
    setChosen(-1);
    setLine(party?.solo ? SAY.timeUp : `${SAY.timeUp} Turn ya next player.`);
    setPhase("fact");
  });

  const start = (p: Party) => {
    const count = p.solo ? SOLO_COUNT : Math.min(pool.length, turnOrder(p).length * ROUNDS);
    const dealt = dealFresh(`quiz:${game}`, pool, count, (x) => x.q, (x) => x.topic).map((x) => ({ ...x, order: shuffle(x.options.map((_, n) => n)) }));
    setParty(p); setQs(dealt); setI(0); setChosen(null); setLine("");
    setScores(p.teams.map(() => 0));
    setPhase(p.solo ? "ask" : "handoff");
  };

  const answer = (n: number) => {
    if (phase !== "ask" || !q || !turn) return;
    setChosen(n);
    const ok = n === q.answer;
    if (ok) setScores((s) => s.map((v, t) => (t === turn.team ? v + 1 : v)));
    setLine(ok ? pick(SAY.right) : pick(SAY.wrong));
    setPhase("fact");
  };

  const next = () => {
    setChosen(null); setLine("");
    if (i + 1 >= qs.length) { setPhase("end"); return; }
    setI(i + 1);
    setPhase(party?.solo ? "ask" : "handoff");
  };

  if (!party) {
    return (
      <PartySetup seconds={20} secondsOptions={[15, 20, 30, 45]} onStart={start}>
        <p className="lede" style={{ margin: 0 }}>{intro} Play solo for the code, or split the mbogi into teams and pass the phone.</p>
      </PartySetup>
    );
  }

  if (phase === "end") {
    return party.solo
      ? <GameEnd game={game} score={scores[0] ?? 0} of={qs.length} unit="right" onAgain={() => start(party)} />
      : <TeamResult party={party} scores={scores} unit="right" onAgain={() => start(party)} />;
  }

  if (phase === "handoff" && turn) {
    return <Handoff key={i} turn={turn} party={party} onGo={() => setPhase("ask")} note={`Swali ${i + 1} of ${qs.length}`} />;
  }

  const colour = turn ? party.teams[turn.team].colour : undefined;
  return (
    <div className="trivia">
      <div className="game-hud">
        <span className="mono">Swali {i + 1} / {qs.length}{!party.solo && turn ? ` · ${turn.player}` : ""}</span>
        <span className="mono">{party.solo ? `${scores[0] ?? 0} right` : ""}</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      <TurnBar left={phase === "ask" ? left : 0} seconds={party.seconds} colour={colour} />
      {(q.topic || q.level) && (
        <div className="q-tags">
          {q.topic && <span className="chip">{q.topic}</span>}
          {q.level && <span className="chip chip-amber">{q.level}</span>}
        </div>
      )}
      <h2 className="q-title" style={{ marginTop: q.topic || q.level ? 8 : 18 }}>{q.q}</h2>
      <div className="opts">
        {q.order.map((n) => {
          const state = phase === "ask" ? "" : n === q.answer ? " is-right" : n === chosen ? " is-wrong" : " is-dim";
          return (
            <button key={n} type="button" className={`opt${state}`} onClick={() => answer(n)} disabled={phase !== "ask"}>
              <b>{q.options[n]}</b>
            </button>
          );
        })}
      </div>
      {phase === "fact" && (
        <div className="trivia-fact">
          <b>{line}</b> {q.fact}
          <button className="btn btn-amber btn-sm" type="button" onClick={next} autoFocus>
            {i + 1 >= qs.length ? (party.solo ? "See your score" : "See who won") : party.solo ? "Next question" : "Pass the phone"}
          </button>
        </div>
      )}
    </div>
  );
}
