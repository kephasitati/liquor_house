import { useCallback, useEffect, useRef, useState } from "react";
import { SAY, pick, shuffle } from "../../data/games";
import GameEnd from "./GameEnd";
import { Handoff, PartySetup, Scoreboard, TeamResult, TurnBar, turnOrder, useTurnClock, type Party } from "./party";

/**
 * Perfect Pour. Hold (mouse, finger or space bar) to pour, let go on the line. Five rounds,
 * each a Kenyan bottle and a bar measure; accuracy is how close you land, and overfilling the
 * glass spills and scores nothing. The ml are hidden while you pour — that's the game.
 */
export interface PourDrink { handle: string; name: string; thumbnail: string; colour: string }

const MEASURES = [
  { label: "One tot", ml: 25 },
  { label: "A double", ml: 50 },
  { label: "Three fingers", ml: 75 },
  { label: "Half the glass", ml: 100 },
  { label: "A long one", ml: 150 },
];
const CAPACITY = 200;
const RATE = 42; // ml per second
const GLASS = { top: 160, bottom: 376, xTop: 136, wTop: 128, xBot: 146, wBot: 108 };
const yFor = (ml: number) => GLASS.bottom - (ml / CAPACITY) * (GLASS.bottom - GLASS.top);
/** The neck of the bottle, where the stream leaves it (scene units). */
const MOUTH = { x: 196, y: 118 };

interface Round { drink: PourDrink; target: { label: string; ml: number } }
interface Result { poured: number; acc: number; spilt: boolean; late?: boolean }
type Phase = "handoff" | "play" | "end";
const TEAM_POURS = 2; // per player

export default function PerfectPour({ drinks }: { drinks: PourDrink[] }) {
  const [party, setParty] = useState<Party | null>(null);
  const [phase, setPhase] = useState<Phase>("play");
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [i, setI] = useState(0);
  // per team: total accuracy and pours taken, so teams of different sizes compare fairly
  const [teamSum, setTeamSum] = useState<number[]>([]);
  const [teamPours, setTeamPours] = useState<number[]>([]);
  const [ml, setMl] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const last = useRef(0);
  const mlRef = useRef(0);

  const round = rounds?.[i];
  const order = party ? turnOrder(party) : [];
  const turn = order[i % Math.max(1, order.length)];
  const record = (acc: number) => {
    setScores((s) => [...s, acc]);
    if (turn) {
      setTeamSum((v) => v.map((x, n) => (n === turn.team ? x + acc : x)));
      setTeamPours((v) => v.map((x, n) => (n === turn.team ? x + 1 : x)));
    }
  };

  // the pour itself: time-based, so it is the same speed on every screen
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!pouring) return;
    let raf = 0;
    last.current = performance.now();
    const tick = (now: number) => {
      mlRef.current += ((now - last.current) / 1000) * RATE;
      last.current = now;
      setMl(mlRef.current);
      if (mlRef.current >= CAPACITY + 12) { stopRef.current(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pouring]);

  const pouringRef = useRef(false);
  const begin = useCallback(() => {
    if (!round || result || pouringRef.current) return;
    pouringRef.current = true;
    setPouring(true);
  }, [round, result]);
  const stop = useCallback(() => {
    if (!pouringRef.current || !round) return;
    pouringRef.current = false;
    setPouring(false);
    const poured = mlRef.current;
    const spilt = poured > CAPACITY;
    const err = Math.abs(poured - round.target.ml);
    const acc = spilt ? 0 : Math.max(0, Math.round(100 - (err / Math.max(round.target.ml, 40)) * 100));
    setResult({ poured, acc, spilt });
    record(acc);
  }, [round, turn]);

  // the turn clock: pour before it runs out, or the turn scores nothing
  const left = useTurnClock(party?.seconds ?? 15, phase === "play" && !!round && !result, () => {
    if (pouringRef.current) { stopRef.current(); return; }
    setResult({ poured: 0, acc: 0, spilt: false, late: true });
    record(0);
  });

  stopRef.current = stop;

  // space bar pours too
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === "Space" && !e.repeat && round && !result) { e.preventDefault(); begin(); } };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); stop(); } };
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    return () => { removeEventListener("keydown", down); removeEventListener("keyup", up); };
  }, [begin, stop, round, result]);

  const start = (p: Party) => {
    const n = p.solo ? MEASURES.length : turnOrder(p).length * TEAM_POURS;
    const bottles = shuffle(drinks);
    const targets: Round["target"][] = [];
    while (targets.length < n) targets.push(...shuffle(MEASURES));
    setParty(p);
    setRounds(targets.slice(0, n).map((target, k) => ({ target, drink: bottles[k % bottles.length] })));
    setI(0); setScores([]); setResult(null); mlRef.current = 0; setMl(0);
    setTeamSum(p.teams.map(() => 0)); setTeamPours(p.teams.map(() => 0));
    setPhase(p.solo ? "play" : "handoff");
  };
  const next = () => {
    setResult(null); mlRef.current = 0; setMl(0);
    if (!rounds || i + 1 >= rounds.length) { setPhase("end"); return; }
    setI(i + 1);
    setPhase(party?.solo ? "play" : "handoff");
  };
  const teamAvg = teamSum.map((x, n) => (teamPours[n] ? Math.round(x / teamPours[n]) : 0));

  if (!party || !rounds) {
    return (
      <PartySetup seconds={15} secondsOptions={[10, 15, 20]} onStart={start}>
        <p className="lede" style={{ margin: 0 }}>Hold to pour, let go on the line — a steady hand gets a code. Pour before the clock runs out. With teams, everyone takes a turn and the best average wins.</p>
      </PartySetup>
    );
  }
  if (phase === "end") {
    if (!party.solo) return <TeamResult party={party} scores={teamAvg} unit="% average" onAgain={() => start(party)} />;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
    return <GameEnd game="pour" score={avg} of={100} unit="% accurate" onAgain={() => start(party)} />;
  }
  if (phase === "handoff" && turn) return <Handoff key={i} turn={turn} party={party} onGo={() => setPhase("play")} note={`Pour ${round!.target.label.toLowerCase()} of ${round!.drink.name}`} />;

  const level = Math.min(ml, CAPACITY);
  const surface = yFor(level);
  const tY = yFor(round!.target.ml);
  const tilt = pouring ? 132 : 104;
  const glassPath = `M${GLASS.xTop} ${GLASS.top} H${GLASS.xTop + GLASS.wTop} L${GLASS.xBot + GLASS.wBot} ${GLASS.bottom} H${GLASS.xBot} Z`;

  return (
    <div className="pourgame">
      <div className="game-hud">
        <span className="mono">Mimina {i + 1} / {rounds.length}{!party.solo && turn ? ` · ${turn.player}` : ""}</span>
        <span className="mono">{round!.drink.name}</span>
      </div>
      <Scoreboard party={party} scores={teamAvg} current={turn?.team} />
      <TurnBar left={result ? 0 : left} seconds={party.seconds} colour={turn && !party.solo ? party.teams[turn.team].colour : undefined} />
      <div
        className={`pour-stage${pouring ? " is-pouring" : ""}`}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); begin(); }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 400 420" aria-label={`Pour ${round!.target.label}`}>
          <defs>
            <clipPath id="pp-glass"><path d={glassPath} /></clipPath>
            <linearGradient id="pp-liq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={round!.drink.colour} stopOpacity=".85" />
              <stop offset="1" stopColor={round!.drink.colour} />
            </linearGradient>
          </defs>
          <ellipse cx="200" cy="384" rx="96" ry="9" fill="#4a3014" opacity=".14" />
          <g clipPath="url(#pp-glass)">
            <rect x="120" y={surface} width="160" height={GLASS.bottom - surface + 4} fill="url(#pp-liq)" />
            <rect x="120" y={surface - 1.5} width="160" height="3" fill="#fff" opacity=".5" />
          </g>
          <path d={glassPath} fill="#fff" fillOpacity=".18" stroke="#4a3014" strokeOpacity=".4" strokeWidth="2" />
          <path d={`M${GLASS.xTop + 10} ${GLASS.top + 14} L${GLASS.xBot + 8} ${GLASS.bottom - 16}`} stroke="#fff" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round" />
          {/* the line to hit */}
          <line x1={GLASS.xTop - 26} x2={GLASS.xTop + GLASS.wTop + 26} y1={tY} y2={tY} stroke="var(--amber-ink)" strokeWidth="2" strokeDasharray="6 5" />
          <text x={GLASS.xTop + GLASS.wTop + 32} y={tY + 4} className="pp-label">{round!.target.label}</text>
          {/* the stream */}
          {pouring && <rect x={MOUTH.x - 2.5} y={MOUTH.y} width="5" height={Math.max(0, surface - MOUTH.y)} rx="2.5" fill={round!.drink.colour} />}
          {/* the bottle: its neck sits on MOUTH and it turns about it */}
          <g style={{ transform: `translate(${MOUTH.x}px, ${MOUTH.y}px) rotate(${tilt}deg)`, transition: "transform .35s cubic-bezier(.22,1,.36,1)" }}>
            <image href={round!.drink.thumbnail} x="-78" y="-8" width="156" height="208" className="pp-bottle" />
          </g>
        </svg>
        {result && (
          <div className={`pour-result${result.acc >= 85 ? " good" : ""}`}>
            <b>{result.late ? "Time imeisha!" : result.spilt ? "Imemwagika — spilt!" : result.acc >= 85 ? pick(SAY.right) : result.acc >= 60 ? SAY.close : pick(SAY.wrong)}</b>
            <span>{Math.round(result.poured)} ml poured · target {round!.target.ml} ml · <b>{result.acc}%</b></span>
          </div>
        )}
      </div>
      {!result ? (
        <button
          type="button"
          className="btn btn-amber btn-block pour-hold"
          onPointerDown={(e) => { e.preventDefault(); begin(); }}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
        >
          {pouring ? "Pouring… let go on the line" : "Hold to pour (or hold Space)"}
        </button>
      ) : (
        <button className="btn btn-amber btn-block" type="button" onClick={next} autoFocus>{i + 1 < rounds.length ? (party.solo ? "Next pour" : "Pass the phone") : party.solo ? "See your score" : "See who won"}</button>
      )}
    </div>
  );
}
