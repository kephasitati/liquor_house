import { useState } from "react";
import Bottle from "../Bottle";
import { addMany, addToBag } from "../../stores/bag";
import { money } from "../../lib/format";
import { toLine, type Drink } from "../../lib/types";

export interface OccasionSet {
  id: string;
  name: string;
  kicker: string;
  line: string;
  picks: Drink[];
}

/** "What's the night?" — six occasions, four bottles each, one tap for the whole set. */
export default function OccasionPicker({ sets }: { sets: OccasionSet[] }) {
  const [active, setActive] = useState(sets[0]?.id);
  const [added, setAdded] = useState<string | null>(null);
  const set = sets.find((s) => s.id === active) ?? sets[0];
  if (!set) return null;
  const total = set.picks.reduce((s, d) => s + (d.price ?? 0), 0);

  return (
    <div className="occ">
      <div className="occ-tabs" role="tablist" aria-label="Occasions">
        {sets.map((s) => (
          <button
            key={s.id}
            className="occ-tab"
            role="tab"
            type="button"
            aria-selected={s.id === active}
            aria-controls={`occ-${s.id}`}
            onClick={() => setActive(s.id)}
          >
            <small>{s.kicker}</small>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      <div className="occ-panel" key={set.id} id={`occ-${set.id}`} role="tabpanel">
        <div className="occ-panel-head">
          <div>
            <h3 className="display h3">{set.name}</h3>
            <p>{set.line}</p>
          </div>
          <button
            className="btn btn-amber"
            type="button"
            onClick={() => {
              addMany(set.picks.map((d) => toLine(d)));
              setAdded(set.id);
            }}
          >
            {added === set.id ? "The set is in your bag ✓" : `Add the set · ${money(total)}`}
          </button>
        </div>
        <div className="grid grid-4">
          {set.picks.map((d) => (
            <article className="card" key={d.handle} style={{ ["--hue" as any]: d.colour }}>
              <div className="card-stage">
                <Bottle d={d} height={230} salt={`o${set.id}`} />
              </div>
              <div className="card-body">
                <span className="card-brand">{d.brand}</span>
                <a className="card-name" href={`/p/${d.handle}`}>{d.name}</a>
                <span className="card-meta">{[d.volume, d.abv ? `${d.abv}%` : ""].filter(Boolean).join(" · ")}</span>
                <div className="card-foot">
                  <span className="price">{money(d.price)}</span>
                  <button className="add-btn" type="button" aria-label={`Add ${d.name} to bag`} onClick={() => addToBag(toLine(d))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
