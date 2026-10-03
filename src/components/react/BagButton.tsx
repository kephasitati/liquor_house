import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { bagCount, bagOpen } from "../../stores/bag";

export default function BagButton() {
  const count = useStore(bagCount);
  // The count lives in localStorage, which the server cannot see: render nothing until
  // mounted so the server's "0" never flashes over a full bag.
  const [mounted, setMounted] = useState(false);
  const [bump, setBump] = useState(false);
  const prev = useRef(count);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 500);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <button className="icon-btn" type="button" aria-label={`Bag, ${count} items`} onClick={() => bagOpen.set(true)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
      </svg>
      {mounted && count > 0 && <span className={`bag-count${bump ? " bump" : ""}`}>{count}</span>}
    </button>
  );
}
