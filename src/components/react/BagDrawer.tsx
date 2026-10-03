import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { bag, bagOpen, bagSubtotal, lastAdded, setQty } from "../../stores/bag";
import { money } from "../../lib/format";
import { site } from "../../config/site";
import Bottle from "../Bottle";
import type { BagLine } from "../../lib/types";

function Art({ l, h }: { l: BagLine; h: number }) {
  return <Bottle d={{ handle: l.handle, name: l.name, brand: l.brand, thumbnail: l.thumbnail }} height={h} salt="bag" />;
}

export function EmptyGlass() {
  return (
    <svg className="glass" viewBox="0 0 80 100" fill="none" aria-hidden="true">
      <path d="M14 10h52l-6 76a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6L14 10Z" stroke="#c9a35c" strokeWidth="1.5" />
      <path d="M20 70h40" stroke="#c9a35c" strokeOpacity=".3" strokeDasharray="3 4" />
      <rect x="30" y="52" width="16" height="16" rx="3" stroke="#c9a35c" strokeOpacity=".5" transform="rotate(12 38 60)" />
    </svg>
  );
}

/** The bag drawer and the "added" toast. Mounted once, in the layout. */
export default function BagDrawer() {
  const lines = useStore(bag);
  const open = useStore(bagOpen);
  const subtotal = useStore(bagSubtotal);
  const added = useStore(lastAdded);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!added || open) return;
    setToast(true);
    const t = setTimeout(() => setToast(false), 2600);
    return () => clearTimeout(t);
  }, [added?.at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && bagOpen.set(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return null;
  const toFree = Math.max(0, site.freeDeliveryOver - subtotal);
  const pct = Math.min(100, (subtotal / site.freeDeliveryOver) * 100);

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={() => bagOpen.set(false)} />
      <aside className={`drawer${open ? " open" : ""}`} aria-label="Your bag" aria-hidden={!open} inert={!open}>
        <div className="drawer-head">
          <h2>Your bag</h2>
          <button className="icon-btn" type="button" aria-label="Close bag" onClick={() => bagOpen.set(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="drawer-empty">
              <EmptyGlass />
              <p className="display h3" style={{ fontSize: "1.8rem" }}>Nothing poured yet.</p>
              <p className="muted">Start with the back bar — every shelf is a tap away.</p>
              <a className="btn btn-amber mt" href="/shop" onClick={() => bagOpen.set(false)}>Browse the shelves</a>
            </div>
          ) : (
            lines.map((l) => (
              <div className="line" key={l.handle}>
                <a className="line-art" href={`/p/${l.handle}`}><Art l={l} h={64} /></a>
                <div>
                  <a className="line-name" href={`/p/${l.handle}`}>{l.name}</a>
                  <div className="line-meta">{[l.brand, l.volume].filter(Boolean).join(" · ")}</div>
                  <div className="qty qty-sm">
                    <button type="button" aria-label="One fewer" onClick={() => setQty(l.handle, l.qty - 1)}>−</button>
                    <output aria-live="polite">{l.qty}</output>
                    <button type="button" aria-label="One more" onClick={() => setQty(l.handle, l.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="line-right">
                  <span className="price">{money(l.price * l.qty)}</span>
                  <button className="line-remove" type="button" onClick={() => setQty(l.handle, 0)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-foot">
            <div className="free-bar">
              {toFree > 0 ? <>Add <b className="price">{money(toFree)}</b> for free delivery in the city.</> : <>Free delivery unlocked in the city zones.</>}
              <div className="track"><i style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="sum-row total"><span>Subtotal</span><span className="price">{money(subtotal)}</span></div>
            <a className="btn btn-amber btn-block" href="/checkout">Checkout</a>
            <p className="center muted" style={{ fontSize: ".74rem", margin: "12px 0 0" }}>Delivery is worked out at checkout. 18+ only — ID checked at the door.</p>
          </div>
        )}
      </aside>

      <div className={`toast${toast && added ? " show" : ""}`} role="status" aria-live="polite">
        {added && (
          <>
            <span className="toast-art"><Art l={added.line} h={30} /></span>
            <span>{added.line.name} — in the bag</span>
            <button type="button" className="line-remove" style={{ color: "var(--ground)" }} onClick={() => { setToast(false); bagOpen.set(true); }}>View</button>
          </>
        )}
      </div>
    </>
  );
}
