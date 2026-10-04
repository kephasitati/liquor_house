import type { ReactNode } from "react";

/**
 * TumaBoda — who rides every delivery in Nairobi — always in its own logo colours: "Tuma" in
 * TumaBoda green, "Boda" in TumaBoda navy (bright green and white on dark grounds). Same tokens
 * as evenskin/src/styles/tokens/base.css. Used on the name only, never as a site accent.
 *
 * A React component so the same mark renders from .astro pages (statically, no island) and
 * from the React checkout and bag.
 */
export function TumaBoda({ link = false, dark = false }: { link?: boolean; dark?: boolean }) {
  const name = (
    <span className={`tb-name${dark ? " tb-on-dark" : ""}`}>
      <span className="tb-tuma">Tuma</span>
      <span className="tb-boda">Boda</span>
    </span>
  );
  return link ? <a href="https://tumaboda.co.ke" target="_blank" rel="noopener" className="tb-link">{name}</a> : name;
}

/** Text with every "TumaBoda" in it rendered as the mark, for copy that lives in config. */
export function WithTumaBoda({ text, link = false }: { text: string; link?: boolean }) {
  const parts = text.split("TumaBoda");
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i) out.push(<TumaBoda key={`tb${i}`} link={link} />);
    if (p) out.push(p);
  });
  return <>{out}</>;
}
