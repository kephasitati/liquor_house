/**
 * The Liquor House sign, as it hangs over the supermarket on Kiambu Road: a navy plaque in a
 * brushed-silver frame with a thin inner rule, and the name in white roman capitals, "THE"
 * set smaller than "LIQUOR HOUSE". Cinzel (a Trajan-style face) stands in for the sign's
 * lettering; Georgia if it hasn't loaded.
 *
 * `id` keeps the gradient ids unique when the plaque appears twice on a page (header, footer).
 */
export default function Plaque({ id = "lh", className = "logo-plaque", title }: { id?: string; className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 44" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset=".45" stopColor="#b9c1ca" />
          <stop offset=".55" stopColor="#d9dee4" />
          <stop offset="1" stopColor="#8a939d" />
        </linearGradient>
        <linearGradient id={`${id}-navy`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#33466e" />
          <stop offset="1" stopColor="#1b2a48" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="238" height="42" rx="6" fill={`url(#${id}-silver)`} />
      <rect x="4" y="4" width="232" height="36" rx="4" fill={`url(#${id}-navy)`} />
      <rect x="4" y="4" width="232" height="17" rx="4" fill={`url(#${id}-sheen)`} />
      <rect x="7.5" y="7.5" width="225" height="29" rx="2.5" fill="none" stroke="#d6dce3" strokeOpacity=".6" strokeWidth=".9" />
      <text x="120" y="28.6" textAnchor="middle" fill="#f6f8fb" fontFamily="Cinzel, 'Trajan Pro', Georgia, 'Times New Roman', serif" fontWeight="700" letterSpacing=".6">
        <tspan fontSize="11.5">THE </tspan>
        <tspan fontSize="16.5">LIQUOR HOUSE</tspan>
      </text>
    </svg>
  );
}
