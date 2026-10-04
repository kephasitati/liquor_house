import { useState } from "react";
import { SAY, pick } from "../../data/games";
import { money } from "../../lib/format";
import { responsive } from "../../lib/img";
import GameEnd from "./GameEnd";
import { dealFresh } from "./store";
import { Handoff, PartySetup, Scoreboard, TeamResult, TurnBar, turnOrder, useTurnClock, type Party } from "./party";

/**
 * Bei Gani? — guess what a real bottle on the shelf costs. Slide or nudge to your number and
 * lock it in before the clock does. Within 5% scores 10, within 10% scores 8, within 20%
 * scores 5, within 35% scores 2. Solo for the code; teams pass the phone each bottle.
 * Bottles come from a deck that doesn't repeat until every one has been priced.
 */
export interface PriceDrink { handle: string; name: string; volume: string; thumbnail: string; price: number }

const SOLO_ROUNDS = 6;
const TEAM_ROUNDS = 2;
const MAX = 40000;

function points(guess: number, price: number) {
  const off = Math.abs(guess - price) / price;
  return off <= 0.05 ? 10 : off <= 0.1 ? 8 : off <= 0.2 ? 5 : off <= 0.35 ? 2 : 0;
}

type Phase = "handoff" | "guess" | "reveal" | "end";

export default function BeiGani({ drinks }: { drinks: PriceDrink[] }) {
  const [party, setParty] = useState<Party | null>(null);
  const [rounds, setRounds] = useState<PriceDrink[]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("guess");
  // no starting number: a default would hand out free points whenever a bottle costs that
  const [guess, setGuess] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [last, setLast] = useState({ pts: 0, line: "" });

  const order = party ? turnOrder(party) : [];
  const turn = order[i % Math.max(1, order.length)];
  const bottle = rounds[i];

  const lock = () => {
    if (phase !== "guess" || !bottle || !turn) return;
    const pts = guess == null ? 0 : points(guess, bottle.price);
    setScores((s) => s.map((v, t) => (t === turn.team ? v + pts : v)));
    setLast({ pts, line: pts >= 8 ? pick(SAY.right) : pts >= 2 ? SAY.close : pick(SAY.wrong) });
    setPhase("reveal");
  };
  const left = useTurnClock(party?.seconds ?? 20, phase === "guess", lock);

  const begin = (p: Party) => {
    const n = p.solo ? SOLO_ROUNDS : Math.min(drinks.length, turnOrder(p).length * TEAM_ROUNDS);
    setParty(p); setRounds(dealFresh("bei", drinks, n, (d) => d.handle)); setI(0); setGuess(null);
    setScores(p.teams.map(() => 0));
    setPhase(p.solo ? "guess" : "handoff");
  };
  const next = () => {
    if (i + 1 >= rounds.length) { setPhase("end"); return; }
    setI(i + 1); setGuess(null);
    setPhase(party?.solo ? "guess" : "handoff");
  };

  if (!party) {
    return (
      <PartySetup seconds={20} secondsOptions={[15, 20, 30]} onStart={begin}>
        <p className="lede" style={{ margin: 0 }}>A real bottle from our shelf — how much? Slide to your number and lock it in. Closer is better: within 5% scores 10.</p>
      </PartySetup>
    );
  }
  if (phase === "end") {
    return party.solo
      ? <GameEnd game="bei" score={Math.round(((scores[0] ?? 0) / (rounds.length * 10)) * 100)} of={100} unit="points" onAgain={() => begin(party)} />
      : <TeamResult party={party} scores={scores} unit="points" onAgain={() => begin(party)} />;
  }
  if (phase === "handoff" && turn) return <Handoff key={i} turn={turn} party={party} onGo={() => setPhase("guess")} note={`Bei ${i + 1} of ${rounds.length}`} />;

  const step = (d: number) => setGuess((g) => Math.max(50, Math.min(MAX, (g ?? 2000) + d)));
  return (
    <div className="bei">
      <div className="game-hud">
        <span className="mono">Bei {i + 1} / {rounds.length}{!party.solo && turn ? ` · ${turn.player}` : ""}</span>
        <span className="mono">{party.solo ? `${scores[0] ?? 0} pts` : ""}</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      <TurnBar left={phase === "guess" ? left : 0} seconds={party.seconds} colour={turn && !party.solo ? party.teams[turn.team].colour : undefined} />
      <div className="bei-stage">
        <img {...responsive(bottle.thumbnail, "260px")} alt={bottle.name} />
        <div className="bei-panel">
          <span className="card-brand">Ni pesa ngapi?</span>
          <h2 className="display h3" style={{ margin: "4px 0 2px" }}>{bottle.name}</h2>
          <span className="muted">{bottle.volume}</span>
          {phase === "guess" ? (
            <>
              <output className="bei-guess">{guess == null ? "KSh ?" : money(guess)}</output>
              <input type="range" min={100} max={MAX} step={50} value={guess ?? 100} onChange={(e) => setGuess(Number(e.target.value))} aria-label="Your guess in shillings" />
              <div className="row gap-s" style={{ flexWrap: "wrap" }}>
                {[-1000, -100, +100, +1000].map((d) => <button key={d} type="button" className="pill" onClick={() => step(d)}>{d > 0 ? "+" : "−"}{Math.abs(d).toLocaleString()}</button>)}
              </div>
              <button type="button" className="btn btn-amber" onClick={lock} disabled={guess == null}>{guess == null ? "Slide to guess" : "Lock it in"}</button>
            </>
          ) : (
            <div className="bei-reveal">
              <span className="muted">{guess == null ? "No guess — time ran out" : `You said ${money(guess)}`}</span>
              <b>{money(bottle.price)}</b>
              <span className={`chip ${last.pts >= 5 ? "chip-leaf" : ""}`}>{last.line} +{last.pts}</span>
              <button type="button" className="btn btn-amber btn-sm" onClick={next} autoFocus>
                {i + 1 >= rounds.length ? (party.solo ? "See your score" : "See who won") : party.solo ? "Next bottle" : "Pass the phone"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
