import { useEffect, useState } from "react";
import { legal, site } from "../../config/site";

/**
 * The 18+ door.
 *
 * Kenyan law prohibits selling alcohol to anyone under 18, so the site asks before it shows
 * a single bottle. It is a self-declared, per-device confirmation — what every licensed
 * liquor site does — and the rider still checks ID at the door; it does not pretend to be
 * identity verification.
 *
 * No flash: an inline script in the layout's <head> stamps data-age="ok" on <html> before
 * first paint for a visitor who has already confirmed, and CSS hides the page until then.
 */
const KEY = `${site.storagePrefix}age_ok`;

export default function AgeGate() {
  const [state, setState] = useState<"checking" | "ask" | "denied" | "leaving" | "ok">("checking");

  useEffect(() => {
    let ok = false;
    try { ok = localStorage.getItem(KEY) === "1"; } catch { /* private mode: ask */ }
    if (ok) { document.documentElement.dataset.age = "ok"; setState("ok"); }
    else setState("ask");
  }, []);

  if (state === "checking" || state === "ok") return null;

  const enter = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* let them in for this visit */ }
    document.documentElement.dataset.age = "ok";
    setState("leaving");
    setTimeout(() => setState("ok"), 1100);
  };

  return (
    <div className={`gate${state === "leaving" ? " leaving" : ""}`} role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="gate-card">
        <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22.5" fill="none" stroke="#e8a33d" strokeWidth="1.2" />
          <path d="M11 37 V21 L24 10 L37 21 V37" fill="none" stroke="#e8a33d" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M22.3 16.5 h3.4 v4.2 c0 1.2 2.6 2 2.6 4.8 v9.6 a1.4 1.4 0 0 1 -1.4 1.4 h-5.8 a1.4 1.4 0 0 1 -1.4 -1.4 v-9.6 c0 -2.8 2.6 -3.6 2.6 -4.8 z" fill="#e8a33d" />
        </svg>
        <span className="kicker">{site.name}</span>
        {state === "denied" ? (
          <>
            <h2 id="gate-title" className="display">Come back <em>at 18.</em></h2>
            <p className="lede" style={{ margin: "0 auto" }}>We can't sell alcohol to anyone under {legal.minimumAge}. When the day comes, the first toast is waiting.</p>
          </>
        ) : (
          <>
            <h2 id="gate-title" className="display">Are you <em>18 or over?</em></h2>
            <p className="lede" style={{ margin: "0 auto" }}>The house is open to adults only. Kenyan law prohibits the sale of alcohol to anyone under {legal.minimumAge}.</p>
            <div className="gate-actions">
              <button className="btn btn-amber" type="button" onClick={enter} autoFocus>Yes, I'm 18 or over — enter</button>
              <button className="btn btn-ghost" type="button" onClick={() => setState("denied")}>No</button>
            </div>
          </>
        )}
        <small>{legal.healthLine} {legal.idLine}</small>
      </div>
    </div>
  );
}
