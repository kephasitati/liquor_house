/**
 * How you can pay — M-Pesa, Visa, Mastercard — in each brand's own logo and colours (the
 * official artwork, from Wikimedia Commons, in public/pay/). Each sits on its own white tile,
 * as acceptance marks are shown, so no page colour ever tints them. Nothing else is offered:
 * no cash on delivery.
 */
const LOGOS = {
  mpesa: { src: "/pay/mpesa.svg", alt: "M-Pesa", w: 512, h: 273 },
  visa: { src: "/pay/visa.svg", alt: "Visa", w: 1000, h: 325 },
  mastercard: { src: "/pay/mastercard.svg", alt: "Mastercard", w: 1000, h: 618 },
};

export default function PayLogos({ only, label }: { only?: "mpesa" | "card"; label?: string }) {
  const keys = only === "mpesa" ? (["mpesa"] as const) : only === "card" ? (["visa", "mastercard"] as const) : (["mpesa", "visa", "mastercard"] as const);
  return (
    <span className="pay-logos" aria-label={label}>
      {keys.map((k) => (
        <span className={`pay-tile pay-${k}`} key={k}>
          <img src={LOGOS[k].src} alt={LOGOS[k].alt} width={LOGOS[k].w} height={LOGOS[k].h} loading="lazy" decoding="async" />
        </span>
      ))}
    </span>
  );
}
