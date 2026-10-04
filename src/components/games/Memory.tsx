import { useRef, useState } from "react";
import { SAY, pick, shuffle } from "../../data/games";
import GameEnd from "./GameEnd";
import { responsive } from "../../lib/img";
import { dealFresh } from "./store";
import { PartySetup, Scoreboard, TeamResult, TurnBar, cue, turnOrder, useTurnClock, type Party } from "./party";

/**
 * Kumbukumbu — memory, with real bottles. Twelve cards face down; flip two, keep them if
 * they match. Solo scores on moves (six is perfect). With teams, a match keeps your turn and
 * a miss — or the turn clock running out — passes it on. The bottles in a game come from a
 * deck that doesn't repeat until every bottle has had its turn.
 */
export interface MemoryDrink { handle: string; name: string; thumbnail: string }
interface Card { key: string; handle: string; name: string; src: string }

const PAIRS = 6;

export default function Memory({ drinks }: { drinks: MemoryDrink[] }) {
  const [party, setParty] = useState<Party | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [up, setUp] = useState<number[]>([]); // face-up, unmatched (max 2)
  const [won, setWon] = useState<Record<string, number>>({}); // handle → team that matched it
  const [moves, setMoves] = useState(0);
  const [t, setT] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [say, setSay] = useState("");
  const busy = useRef(false);

  const order = party ? turnOrder(party) : [];
  const turn = order[t % Math.max(1, order.length)];
  const done = cards.length > 0 && Object.keys(won).length === PAIRS;

  const passTurn = () => { setUp([]); busy.current = false; if (!party?.solo) setT((x) => x + 1); };
  const left = useTurnClock(party?.seconds ?? 15, !!party && !party.solo && !done && cards.length > 0, () => { setSay(SAY.timeUp); passTurn(); }, t);

  const begin = (p: Party) => {
    const picks = dealFresh("memory", drinks, PAIRS, (d) => d.handle);
    setCards(shuffle(picks.flatMap((d) => [0, 1].map((n) => ({ key: `${d.handle}-${n}`, handle: d.handle, name: d.name, src: d.thumbnail })))));
    setParty(p); setUp([]); setWon({}); setMoves(0); setT(0); setSay("");
    setScores(p.teams.map(() => 0));
  };

  const flip = (n: number) => {
    if (busy.current || up.includes(n) || won[cards[n].handle] !== undefined || up.length >= 2) return;
    const nowUp = [...up, n];
    setUp(nowUp);
    if (nowUp.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = nowUp.map((k) => cards[k]);
    if (a.handle === b.handle) {
      cue("go");
      setWon((w) => ({ ...w, [a.handle]: turn?.team ?? 0 }));
      setScores((s) => s.map((v, x) => (x === (turn?.team ?? 0) ? v + 1 : v)));
      setSay(pick(SAY.right));
      setUp([]); // a match keeps the turn
    } else {
      busy.current = true;
      setSay(pick(SAY.wrong));
      setTimeout(passTurn, 900);
    }
  };

  if (!party) {
    return (
      <PartySetup seconds={15} secondsOptions={[10, 15, 20]} onStart={begin}>
        <p className="lede" style={{ margin: 0 }}>Twelve cards, six pairs of real bottles. Flip two — a match stays up. Solo: fewer moves, better score. Teams: a match keeps your turn.</p>
      </PartySetup>
    );
  }

  if (done) {
    return party.solo
      ? <GameEnd game="memory" score={Math.max(0, Math.min(100, 100 - (moves - PAIRS) * 6))} of={100} unit={`points · ${moves} moves`} onAgain={() => begin(party)} />
      : <TeamResult party={party} scores={scores} unit="pairs" onAgain={() => begin(party)} />;
  }

  const colour = turn && !party.solo ? party.teams[turn.team].colour : undefined;
  return (
    <div className="memory">
      <div className="game-hud">
        <span className="mono">{party.solo ? `${moves} moves` : `Turn ya ${turn?.player} · Team ${party.teams[turn!.team].name}`}</span>
        <span className="mono">{Object.keys(won).length} / {PAIRS} pairs</span>
      </div>
      <Scoreboard party={party} scores={scores} current={turn?.team} />
      {!party.solo && <TurnBar left={left} seconds={party.seconds} colour={colour} />}
      <div className="mem-grid">
        {cards.map((c, n) => {
          const face = up.includes(n) || won[c.handle] !== undefined;
          const team = won[c.handle];
          return (
            <button key={c.key} type="button" className={`mem-card${face ? " is-up" : ""}${team !== undefined ? " is-won" : ""}`} onClick={() => flip(n)}
              style={team !== undefined && !party.solo ? { ["--team" as any]: party.teams[team].colour } : undefined}
              aria-label={face ? c.name : "Face-down card"}>
              <span className="mem-inner">
                <span className="mem-back" aria-hidden="true">LH</span>
                <span className="mem-front"><img {...responsive(c.src, "120px")} alt="" /></span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="muted center" style={{ minHeight: 22, marginTop: 10 }}>{say}</p>
    </div>
  );
}
