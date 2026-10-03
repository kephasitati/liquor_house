import type { Drink } from "../lib/types";

/**
 * Generated bottle art.
 *
 * The shop has no photography yet, so every bottle is drawn: five silhouettes by shelf, the
 * liquid tinted from the product's style, glass highlights over it and a cream label with the
 * brand. A real photo (`thumbnail`) replaces the drawing the moment the POS has one.
 *
 * Gradient ids are derived from the handle, not a counter, so the server and the browser
 * draw identical markup and hydration never trips.
 */
type Art = Pick<Drink, "handle" | "name" | "brand" | "volume" | "colour" | "shape"> & { thumbnail?: string | null };

function gid(handle: string, salt = "") {
  return (handle.replace(/[^a-z0-9]/gi, "").slice(-20) || "b") + salt;
}

export default function Bottle({ d, height = 220, salt = "", photo = true }: { d: Art; height?: number; salt?: string; photo?: boolean }) {
  if (photo && d.thumbnail) {
    return <img src={d.thumbnail} alt={d.name} height={height} style={{ height, width: "auto", objectFit: "contain" }} loading="lazy" decoding="async" />;
  }
  const g = gid(d.handle, salt);
  const c = d.colour;
  const brand = (d.brand || d.name).toUpperCase().slice(0, 14);
  const vol = (d.volume || "").slice(0, 12);
  const initial = (d.brand || d.name).trim().charAt(0).toUpperCase();

  const label = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={`url(#lbl${g})`} />
      <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx="1.5" fill="none" stroke="#a88435" strokeWidth=".7" />
      <circle cx={x + w / 2} cy={y + h * 0.3} r={h * 0.13} fill="none" stroke="#a88435" strokeWidth=".7" />
      <text x={x + w / 2} y={y + h * 0.3 + 2.6} textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="7.5" fontWeight="600" fill="#2a2118">{initial}</text>
      <text x={x + w / 2} y={y + h * 0.62} textAnchor="middle" fontFamily="Inter Tight, Arial, sans-serif" fontSize={brand.length > 10 ? 4.6 : 5.6} fontWeight="700" letterSpacing=".6" fill="#2a2118">{brand}</text>
      <line x1={x + w * 0.25} x2={x + w * 0.75} y1={y + h * 0.71} y2={y + h * 0.71} stroke="#a88435" strokeWidth=".5" />
      <text x={x + w / 2} y={y + h * 0.83} textAnchor="middle" fontFamily="Inter Tight, Arial, sans-serif" fontSize="4.2" letterSpacing="1" fill="#6b5a3e">{vol}</text>
    </g>
  );

  let body: React.ReactNode;
  if (d.shape === "wine" || d.shape === "champagne") {
    const wide = d.shape === "champagne";
    const path = wide
      ? "M43,14 h14 v50 c0,12 25,22 25,48 v112 a9,9 0 0 1 -9,9 h-46 a9,9 0 0 1 -9,-9 v-112 c0,-26 25,-36 25,-48 z"
      : "M44,14 h12 v52 c0,12 21,18 21,44 v114 a8,8 0 0 1 -8,8 h-38 a8,8 0 0 1 -8,-8 v-114 c0,-26 21,-32 21,-44 z";
    body = (
      <>
        <path d={path} fill={`url(#liq${g})`} />
        <path d={path} fill={`url(#gls${g})`} />
        <path d={wide ? "M27,120 q2,-6 6,-10" : "M31,116 q2,-6 5,-9"} stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="41" y="6" width="18" height="30" rx="3" fill={wide ? `url(#foil${g})` : "#1d1814"} />
        {wide && <rect x="39" y="30" width="22" height="7" rx="2" fill="#a8862e" />}
        {label(wide ? 25 : 28, 150, wide ? 50 : 44, 58)}
      </>
    );
  } else if (d.shape === "can") {
    body = (
      <>
        <path d="M38,20 h24 v20 c0,8 12,12 12,26 v150 a10,10 0 0 1 -10,10 h-28 a10,10 0 0 1 -10,-10 v-150 c0,-14 12,-18 12,-26 z" fill={`url(#liq${g})`} />
        <path d="M38,20 h24 v20 c0,8 12,12 12,26 v150 a10,10 0 0 1 -10,10 h-28 a10,10 0 0 1 -10,-10 v-150 c0,-14 12,-18 12,-26 z" fill={`url(#gls${g})`} />
        <rect x="37" y="12" width="26" height="12" rx="3" fill={`url(#foil${g})`} />
        {label(28, 110, 44, 64)}
      </>
    );
  } else if (d.shape === "box") {
    body = (
      <>
        <rect x="16" y="70" width="68" height="156" rx="5" fill={`url(#liq${g})`} />
        <rect x="16" y="70" width="68" height="156" rx="5" fill={`url(#gls${g})`} />
        <rect x="45" y="70" width="10" height="156" fill="#c9a24a" opacity=".9" />
        {label(24, 130, 52, 58)}
      </>
    );
  } else {
    const path = "M37,18 h26 v30 c0,10 20,16 20,40 v130 a12,12 0 0 1 -12,12 h-42 a12,12 0 0 1 -12,-12 v-130 c0,-24 20,-30 20,-40 z";
    body = (
      <>
        <path d={path} fill={`url(#liq${g})`} />
        <path d={path} fill={`url(#gls${g})`} />
        <path d="M24,104 q1,-9 6,-14" stroke="#fff" strokeOpacity=".4" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M26,118 v70" stroke="#fff" strokeOpacity=".12" strokeWidth="4" strokeLinecap="round" />
        <rect x="34" y="4" width="32" height="22" rx="4" fill={`url(#cap${g})`} />
        <rect x="34" y="23" width="32" height="5" rx="1.5" fill="#15110d" />
        {label(22, 132, 56, 70)}
      </>
    );
  }

  return (
    <svg className="bottle-svg" viewBox="0 0 100 246" height={height} role="img" aria-label={d.name} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`liq${g}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c} stopOpacity=".7" />
          <stop offset=".42" stopColor={c} />
          <stop offset="1" stopColor={c} stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`gls${g}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".18" stopColor="#fff" stopOpacity=".04" />
          <stop offset=".72" stopColor="#000" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <linearGradient id={`cap${g}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b3129" />
          <stop offset=".5" stopColor="#9a8669" />
          <stop offset="1" stopColor="#2c241e" />
        </linearGradient>
        <linearGradient id={`foil${g}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a22" />
          <stop offset=".5" stopColor="#f0d78a" />
          <stop offset="1" stopColor="#7a5c1c" />
        </linearGradient>
        <linearGradient id={`lbl${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6eedc" />
          <stop offset="1" stopColor="#e6d8b8" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="240" rx="32" ry="4" fill="#000" opacity=".45" />
      {body}
    </svg>
  );
}
