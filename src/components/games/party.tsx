import { useEffect, useRef, useState } from "react";
import { site } from "../../config/site";
import { SPIN_NAMES } from "../../data/games";

/**
 * Playing as a mbogi: the pieces every game shares when more than one person is holding the
 * phone. Teams with players' names, a turn order that rotates across the teams, a "pass the
 * phone" screen between turns, a turn timer that beeps and buzzes when time is up, a
 * scoreboard, and the winner at the end.
 *
 * Solo is a party of one, so each game has a single code path.
 */
export interface Team { name: string; colour: string; players: string[] }
export interface Party { solo: boolean; teams: Team[]; seconds: number }
export interface Turn { team: number; player: string }

const PALETTE = [
  { name: "Simba", colour: "#d98a1c" },
  { name: "Chui", colour: "#1f4e8c" },
  { name: "Twiga", colour: "#4f8a3a" },
  { name: "Ndovu", colour: "#9c3d5a" },
];
const KEY = `${site.storagePrefix}party`;

export const SOLO: Party = { solo: true, teams: [{ name: "Wewe", colour: PALETTE[0].colour, players: ["Wewe"] }], seconds: 20 };

function defaultTeams(): Team[] {
  return [
    { ...PALETTE[0], players: SPIN_NAMES.slice(0, 2) },
    { ...PALETTE[1], players: SPIN_NAMES.slice(2, 4) },
  ];
}

/** Turns go team by team, each team's players in order: Simba 1, Chui 1, Simba 2, Chui 2… */
export function turnOrder(party: Party): Turn[] {
  const out: Turn[] = [];
  const most = Math.max(...party.teams.map((t) => t.players.length));
  for (let p = 0; p < most; p++) {
    party.teams.forEach((t, team) => { if (t.players[p]) out.push({ team, player: t.players[p] }); });
  }
  return out;
}

/** A short beep and a buzz: time's up, switch. */
export function cue(kind: "switch" | "go" = "switch") {
  try { navigator.vibrate?.(kind === "switch" ? [180, 80, 180] : 60); } catch { /* not a phone */ }
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = kind === "switch" ? 660 : 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "switch" ? 0.45 : 0.18));
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
    o.onended = () => ctx.close();
  } catch { /* no sound: the screen still says so */ }
}

/* --------------------------------------------------------------------- setup */

export function PartySetup({ seconds, secondsOptions, onStart, startLabel = "Twende — let's go", allowSolo = true, children }: {
  seconds: number;
  secondsOptions: number[];
  onStart: (p: Party) => void;
  startLabel?: string;
  allowSolo?: boolean;
  children?: React.ReactNode;
}) {
  const [solo, setSolo] = useState(allowSolo);
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [secs, setSecs] = useState(seconds);
  const [drafts, setDrafts] = useState<string[]>([]);

  // the mbogi from last time, so nobody retypes names
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.teams?.length >= 2) setTeams(saved.teams);
    } catch { /* first time */ }
  }, []);

  const save = (t: Team[]) => { setTeams(t); try { localStorage.setItem(KEY, JSON.stringify({ teams: t })); } catch { /* fine */ } };
  const addPlayer = (ti: number) => {
    const name = (drafts[ti] ?? "").trim().slice(0, 16);
    if (!name || teams[ti].players.length >= 6) return;
    save(teams.map((t, i) => (i === ti ? { ...t, players: [...t.players, name] } : t)));
    setDrafts(drafts.map((d, i) => (i === ti ? "" : d)));
  };
  const ready = solo || teams.every((t) => t.players.length > 0);

  return (
    <div className="party-setup">
      {children}
      {allowSolo && (
        <div className="seg" role="radiogroup" aria-label="How are you playing?">
          <button type="button" role="radio" aria-checked={solo} className={solo ? "on" : ""} onClick={() => setSolo(true)}>Solo</button>
          <button type="button" role="radio" aria-checked={!solo} className={!solo ? "on" : ""} onClick={() => setSolo(false)}>Na mbogi — teams</button>
        </div>
      )}

      {!solo && (
        <div className="teams">
          {teams.map((t, ti) => (
            <div className="team" key={ti} style={{ ["--team" as any]: t.colour }}>
              <input className="team-name" value={t.name} maxLength={14} aria-label={`Team ${ti + 1} name`}
                onChange={(e) => save(teams.map((x, i) => (i === ti ? { ...x, name: e.target.value } : x)))} />
              <div className="row gap-s" style={{ flexWrap: "wrap" }}>
                {t.players.map((p, pi) => (
                  <span className="chip" key={pi}>{p}
                    <button type="button" className="chip-x" aria-label={`Remove ${p}`}
                      onClick={() => save(teams.map((x, i) => (i === ti ? { ...x, players: x.players.filter((_, j) => j !== pi) } : x)))}>×</button>
                  </span>
                ))}
              </div>
              <form className="row gap-s" onSubmit={(e) => { e.preventDefault(); addPlayer(ti); }}>
                <input className="field" style={{ flex: 1, minWidth: 0, height: 38 }} placeholder="Add a player" maxLength={16}
                  value={drafts[ti] ?? ""} onChange={(e) => setDrafts(Object.assign([...drafts], { [ti]: e.target.value }))} aria-label={`Add a player to ${t.name}`} />
                <button className="btn btn-ghost btn-sm" type="submit">Add</button>
              </form>
            </div>
          ))}
          <div className="row gap-s" style={{ flexWrap: "wrap" }}>
            {teams.length < 4 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => save([...teams, { ...PALETTE[teams.length], players: [] }])}>+ Another team</button>}
            {teams.length > 2 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => save(teams.slice(0, -1))}>− Remove a team</button>}
          </div>
        </div>
      )}

      <div className="row gap-s" style={{ flexWrap: "wrap", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: ".85rem" }}>{solo ? "Time per go" : "Time per turn"}:</span>
        {secondsOptions.map((s) => (
          <button key={s} type="button" className="pill" aria-current={secs === s ? "true" : undefined} onClick={() => setSecs(s)}>{s}s</button>
        ))}
      </div>

      <button className="btn btn-amber" type="button" disabled={!ready}
        onClick={(e) => {
          onStart(solo ? { ...SOLO, seconds: secs } : { solo: false, teams, seconds: secs });
          // on a phone the play area can start below the fold: bring it up
          const tool = (e.currentTarget as HTMLElement).closest(".game-tool");
          requestAnimationFrame(() => tool?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }}>
        {startLabel}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------- pass the phone */

/** Between turns: who's up next, then 3-2-1. Tap to skip the count. */
export function Handoff({ turn, party, onGo, note }: { turn: Turn; party: Party; onGo: () => void; note?: string }) {
  const [n, setN] = useState(3);
  const team = party.teams[turn.team];
  useEffect(() => {
    if (n === 0) { cue("go"); onGo(); return; }
    const t = setTimeout(() => setN((x) => x - 1), 900);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <button type="button" className="handoff" style={{ ["--team" as any]: team.colour }} onClick={() => setN(0)}>
      <span className="kicker">Pass the phone · Team {team.name}</span>
      <b>Turn ya {turn.player}</b>
      {note && <span className="muted">{note}</span>}
      <span className="handoff-count" aria-live="assertive">{n || "Twende!"}</span>
      <small>Tap when you're ready</small>
    </button>
  );
}

/* ----------------------------------------------------------------- the clock */

/** The turn's clock: a draining bar and the seconds. Beeps and buzzes at zero, once.
 *  Change `turnKey` to restart it for a new turn while it's still running. */
export function useTurnClock(seconds: number, running: boolean, onUp: () => void, turnKey: unknown = 0) {
  const [left, setLeft] = useState(seconds);
  const ends = useRef(0);
  const fired = useRef(false);
  const up = useRef(onUp);
  up.current = onUp; // always the latest, so time-up acts on the current turn
  useEffect(() => {
    if (!running) return;
    ends.current = performance.now() + seconds * 1000;
    fired.current = false;
    setLeft(seconds);
    const id = setInterval(() => {
      const s = Math.max(0, (ends.current - performance.now()) / 1000);
      setLeft(s);
      if (s <= 0 && !fired.current) { fired.current = true; cue("switch"); up.current(); }
    }, 100);
    return () => clearInterval(id);
  }, [running, seconds, turnKey]);
  return left;
}

export function TurnBar({ left, seconds, colour }: { left: number; seconds: number; colour?: string }) {
  return (
    <div className="turn-bar" style={{ ["--team" as any]: colour ?? "var(--amber)" }}>
      <i style={{ transform: `scaleX(${Math.max(0, left / seconds)})` }} />
      <span className={`mono${left <= 5 ? " hurry" : ""}`}>{Math.ceil(left)}s</span>
    </div>
  );
}

/* ------------------------------------------------------------ the scoreboard */

export function Scoreboard({ party, scores, current }: { party: Party; scores: number[]; current?: number }) {
  if (party.solo) return null;
  return (
    <div className="scoreboard">
      {party.teams.map((t, i) => (
        <span key={i} className={`score-chip${current === i ? " is-up" : ""}`} style={{ ["--team" as any]: t.colour }}>
          {t.name} <b>{scores[i] ?? 0}</b>
        </span>
      ))}
    </div>
  );
}

/** The end of a team game: the winner, or a draw. */
export function TeamResult({ party, scores, unit, onAgain }: { party: Party; scores: number[]; unit: string; onAgain: () => void }) {
  const top = Math.max(...scores);
  const winners = party.teams.filter((_, i) => scores[i] === top);
  return (
    <div className="game-end">
      <span className="kicker">{winners.length > 1 ? "Sare — it's a draw!" : "Hapo sawa!"}</span>
      <p className="display h2" style={{ margin: 0 }}>
        {winners.length > 1 ? <>{winners.map((w) => w.name).join(" & ")} <em>wamefungana.</em></> : <>Team {winners[0].name} <em>wameshinda!</em></>}
      </p>
      <div className="final-board">
        {party.teams.map((t, i) => (
          <div key={i} className={scores[i] === top ? "is-top" : ""} style={{ ["--team" as any]: t.colour }}>
            <b>{scores[i] ?? 0}</b><span>{t.name} · {unit}</span>
          </div>
        ))}
      </div>
      <div className="row gap" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-amber" onClick={onAgain}>Rematch</button>
        <a className="btn btn-ghost" href="/games">Other games</a>
      </div>
      <p className="muted" style={{ fontSize: ".78rem" }}>Team games are for bragging rights — the discount code is for solo high scores.</p>
    </div>
  );
}
