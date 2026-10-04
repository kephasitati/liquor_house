import { useEffect, useState } from "react";
import { REWARD, SAY, type GameId } from "../../data/games";
import { bestScore, recordScore, saveCode } from "./store";

/**
 * The end of a rewarded game: the score, the personal best, and — at or above the game's
 * threshold — the code, copied with one tap and remembered for checkout.
 */
export default function GameEnd({ game, score, of, unit, onAgain }: {
  game: GameId;
  score: number;
  of: number;
  unit: string;
  onAgain: () => void;
}) {
  const threshold = REWARD.threshold[game] ?? Infinity;
  const won = score >= threshold;
  const [best, setBest] = useState<number | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const before = bestScore(game);
    setIsBest(recordScore(game, score) && before !== null);
    setBest(Math.max(before ?? 0, score));
    if (won) saveCode(REWARD.code);
  }, [game, score, won]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(REWARD.code); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <div className="game-end">
      <span className="kicker">{won ? SAY.win : score >= threshold * 0.8 ? SAY.close : "Game imeisha"}</span>
      <p className="game-score"><b>{score}</b><span>/ {of} {unit}</span></p>
      <p className="muted" style={{ margin: 0 }}>
        {isBest ? "A new personal best." : best !== null ? `Your best: ${best}.` : ""}
      </p>
      {won ? (
        <div className="reward">
          <span className="reward-label">{REWARD.percent}% off your next order</span>
          <button type="button" className="reward-code" onClick={copy} aria-label={`Copy code ${REWARD.code}`}>
            {REWARD.code}<small>{copied ? "Copied" : "Tap to copy"}</small>
          </button>
          <span className="muted" style={{ fontSize: ".78rem" }}>Saved for checkout on this device. One code per order. <a href="/terms#games">Terms</a>.</span>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: ".9rem" }}>Score {threshold} or more to unlock {REWARD.percent}% off. Rudia tu!</p>
      )}
      <div className="row gap" style={{ justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-amber" onClick={onAgain}>Play again</button>
        <a className="btn btn-ghost" href="/games">Other games</a>
        {won && <a className="btn btn-ghost" href="/shop">Shop with the code</a>}
      </div>
    </div>
  );
}
