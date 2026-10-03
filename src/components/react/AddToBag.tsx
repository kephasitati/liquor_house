import { useEffect, useRef, useState } from "react";
import { addToBag } from "../../stores/bag";
import { money } from "../../lib/format";
import type { BagLine } from "../../lib/types";

/** The product page's buy row, plus the sticky bar that takes over on a phone once the
 *  real button scrolls away. */
export default function AddToBag({ line, disabled = false }: { line: BagLine; disabled?: boolean }) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const add = (n = qty) => {
    addToBag({ ...line, qty: n }, { open: true });
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <>
      <div className="buy" ref={ref}>
        <div className="qty">
          <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button className="btn btn-amber" style={{ flex: 1 }} type="button" disabled={disabled} onClick={() => add()}>
          {disabled ? "Sold out" : done ? "Poured into your bag ✓" : `Add to bag · ${money(line.price * qty)}`}
        </button>
      </div>
      {!disabled && (
        <div className={`mobile-buy${showBar ? " show" : ""}`}>
          <div>
            <b>{line.name}</b>
            <span className="price muted" style={{ fontSize: ".85rem" }}>{money(line.price)}</span>
          </div>
          <button className="btn btn-amber btn-sm" type="button" onClick={() => add(1)}>{done ? "Added ✓" : "Add to bag"}</button>
        </div>
      )}
    </>
  );
}
