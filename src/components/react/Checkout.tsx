import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { bag, bagSubtotal, clearBag, setQty } from "../../stores/bag";
import { readAge } from "../../lib/age";
import { money } from "../../lib/format";
import {
  canUseMedusa, createCart, finishCardPayment, payAndPlace, shippingOptions, validPhone, whatsappMessage, whatsappUrl,
  type Details, type PayMethod, type ShipOption,
} from "../../lib/checkout";
import { ZONES, ZONE_BY_ID, SPEEDS, site, legal, type SpeedId } from "../../config/site";
import Bottle from "../Bottle";
import { TumaBoda, WithTumaBoda } from "../TumaBoda";
import { REWARD } from "../../data/games";
import { savedCode } from "../games/store";
import PayLogos from "../PayLogos";
import { EmptyGlass } from "./BagDrawer";

/** Zones where the free-delivery threshold applies; the outer ring always pays its fare. */
const FREE_ZONES = new Set(["kiambu-road", "north", "kiambu", "westlands", "thika", "cbd"]);

type Done = { kind: "order"; ref: string } | { kind: "whatsapp"; url: string };

export default function Checkout({ live }: { live: boolean }) {
  const lines = useStore(bag);
  const subtotal = useStore(bagSubtotal);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [d, setD] = useState<Details>({ name: "", phone: "", email: "", area: "", address: "", notes: "" });
  // "zoneId|Area" — the zone prices the ride, the area tells the rider where.
  const [areaPick, setAreaPick] = useState("");
  const [zone, areaName = ""] = areaPick.split("|");
  const [speed, setSpeed] = useState<SpeedId>("express");
  const [pay, setPay] = useState<PayMethod>("mpesa");
  const [adult, setAdult] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  // Medusa mode only: the cart is created once details are in, then its shipping options load.
  const medusaMode = live && canUseMedusa(lines);
  const [cartId, setCartId] = useState<string | null>(null);
  const [options, setOptions] = useState<ShipOption[]>([]);
  const [optionId, setOptionId] = useState("");

  // Alcohol needs the 18+ confirmation and an ID check at the door; soft drinks don't.
  const needsAdult = lines.some((l) => l.ageRestricted !== false);
  // Under 18 (soft-drinks mode): any alcohol in the bag comes out before checkout.
  const [removedForAge, setRemovedForAge] = useState(0);
  useEffect(() => {
    if (readAge() !== "minor") return;
    const alcohol = bag.get().filter((l) => l.ageRestricted !== false);
    if (!alcohol.length) return;
    alcohol.forEach((l) => setQty(l.handle, 0));
    setRemovedForAge(alcohol.length);
  }, []);

  // Back from Paystack: finish the order the card just paid for.
  useEffect(() => {
    if (!new URLSearchParams(location.search).has("card")) return;
    setBusy(true); setStatus("Confirming your card payment…");
    finishCardPayment()
      .then((order) => {
        if (!order) return;
        clearBag();
        setDone({ kind: "order", ref: `#${order?.display_id ?? order?.id?.slice(-6)}` });
      })
      .catch((e) => setError(e?.message || "We couldn't confirm the card payment. If you were charged, call us."))
      .finally(() => { setBusy(false); setStatus(""); history.replaceState(null, "", "/checkout"); });
  }, []);

  // A games code, filled in for the player who won one on this device.
  const [code, setCode] = useState("");
  useEffect(() => { const c = savedCode(); if (c) setCode(c); }, []);
  const codeOk = code.trim().toUpperCase() === REWARD.code;
  const discount = !medusaMode && codeOk ? Math.round((subtotal * REWARD.percent) / 100) : 0;

  const z = ZONE_BY_ID[zone];
  const sp = SPEEDS.find((s) => s.id === speed)!;
  const collecting = speed === "collect";
  const fee = useMemo(() => {
    if (medusaMode) return options.find((o) => o.id === optionId)?.amount ?? 0;
    if (collecting || !z) return 0;
    const free = FREE_ZONES.has(z.id) && subtotal >= site.freeDeliveryOver;
    return (free ? 0 : z.fee) + sp.surcharge;
  }, [medusaMode, options, optionId, collecting, z, subtotal, sp]);

  const errors = {
    name: d.name.trim().length < 2 ? "Tell us who to hand it to." : "",
    phone: !validPhone(d.phone) ? "A Kenyan mobile number, like 0712 345 678." : "",
    zone: !medusaMode && !collecting && !zone ? "Pick your area so we can price the ride." : "",
    address: !collecting && d.address.trim().length < 4 ? "A street, building or landmark for the rider." : "",
    adult: needsAdult && !adult ? "Please confirm you are 18 or over." : "",
  };
  const valid = Object.values(errors).every((e) => !e);
  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const err = (k: keyof typeof errors) => (touched && errors[k] ? <span className="err">{errors[k]}</span> : null);

  if (!mounted) return <div style={{ minHeight: "60vh" }} />;

  if (done) {
    return (
      <div className="done-card">
        <svg className="glass-big" viewBox="0 0 80 100" fill="none" aria-hidden="true">
          <path d="M14 10h52l-6 76a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6L14 10Z" stroke="#e8a33d" strokeWidth="1.5" />
          <path d="M17 40h46l-4 46a5 5 0 0 1-5 5H26a5 5 0 0 1-5-5L17 40Z" fill="#e8a33d" fillOpacity=".8" />
        </svg>
        <span className="kicker">{done.kind === "order" ? `Order ${done.ref}` : "Sent to WhatsApp"}</span>
        <h1 className="display h2" style={{ margin: "1rem 0" }}>
          {done.kind === "order" ? <>Cheers — <em>it's on its way.</em></> : <>Almost there — <em>hit send.</em></>}
        </h1>
        <p className="lede" style={{ margin: "0 auto" }}>
          <WithTumaBoda text={done.kind === "order"
            ? `We've got your order and a TumaBoda rider is being lined up. We'll call ${d.phone} if anything changes. ${legal.idLine}`
            : `Your order is written out in WhatsApp. Send it, and we'll confirm the delivery time and how to pay. ${legal.idLine}`} />
        </p>
        <div className="row gap" style={{ justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          {done.kind === "whatsapp" && <a className="btn btn-amber" href={done.url} target="_blank" rel="noopener">Open WhatsApp again</a>}
          <a className="btn btn-ghost" href="/shop">Back to the shelves</a>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="drawer-empty" style={{ padding: "100px 0" }}>
        <EmptyGlass />
        <h1 className="display h2">Your bag is empty.</h1>
        <p className="muted">Pour something in first.</p>
        <a className="btn btn-amber mt" href="/shop">Browse the shelves</a>
      </div>
    );
  }

  /** Medusa: details → cart + options. */
  async function continueToDelivery() {
    setTouched(true);
    if (!valid) return;
    setBusy(true); setError(""); setStatus("Setting up your order…");
    try {
      const cart = await createCart(lines, d, codeOk ? REWARD.code : undefined);
      setCartId(cart.id);
      const opts = await shippingOptions(cart.id);
      setOptions(opts);
      setOptionId(opts[0]?.id ?? "");
      if (!opts.length) setError("We couldn't find a delivery option for that address. Message us on WhatsApp and we'll sort it.");
    } catch (e: any) {
      setError(e?.message || "Something went wrong setting up your order. Nothing has been charged.");
    } finally {
      setBusy(false); setStatus("");
    }
  }

  async function placeMedusa() {
    if (!cartId || !optionId) return;
    setBusy(true); setError("");
    try {
      const order = await payAndPlace(cartId, optionId, pay, setStatus);
      if (order?.redirected) return; // off to Paystack; the return trip finishes it
      clearBag();
      setDone({ kind: "order", ref: `#${order?.display_id ?? order?.id?.slice(-6)}` });
    } catch (e: any) {
      setError(e?.message || "The order did not go through. Nothing has been charged — try again.");
    } finally {
      setBusy(false); setStatus("");
    }
  }

  function sendWhatsApp() {
    setTouched(true);
    if (!valid) return;
    const label = collecting ? "Collect from the shop" : `${z?.name ?? ""} · ${sp.name}`;
    const url = whatsappUrl(whatsappMessage(lines, { ...d, area: collecting ? "Collecting" : areaName }, { label, fee }, pay, discount ? { code: REWARD.code, amount: discount } : undefined, needsAdult));
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
    clearBag();
    setDone({ kind: "whatsapp", url });
  }

  const total = subtotal + fee - discount;

  return (
    <div className="co">
      <div>
        <section className="co-step">
          <h2><i>1</i> Who's it for?</h2>
          <div className="form-grid">
            <label className="lbl">Full name<input className="field" value={d.name} onChange={set("name")} autoComplete="name" disabled={!!cartId} />{err("name")}</label>
            <label className="lbl">M-Pesa / phone number<input className="field" value={d.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="0712 345 678" disabled={!!cartId} />{err("phone")}</label>
            <label className="lbl full"><span>Email <span className="muted">(optional, for the receipt)</span></span><input className="field" type="email" value={d.email} onChange={set("email")} autoComplete="email" disabled={!!cartId} /></label>
          </div>
        </section>

        <section className="co-step">
          <h2><i>2</i> Where to?</h2>
          {!medusaMode && (
            <div className="choices" style={{ marginBottom: 14 }}>
              {SPEEDS.map((s) => (
                <label className="choice" key={s.id}>
                  <input type="radio" name="speed" checked={speed === s.id} onChange={() => setSpeed(s.id)} />
                  <b>{s.name}</b><span><WithTumaBoda text={s.line} /></span>
                  {s.surcharge > 0 && <span className="price">+{money(s.surcharge)}</span>}
                </label>
              ))}
            </div>
          )}
          {!collecting && (
            <div className="form-grid">
              {!medusaMode && (
                <label className="lbl full">Area
                  <select className="field" value={areaPick} onChange={(e) => setAreaPick(e.target.value)}>
                    <option value="">Choose your area…</option>
                    {ZONES.map((zz) => (
                      <optgroup key={zz.id} label={`${zz.name} — ${money(zz.fee)} · ${zz.eta}`}>
                        {zz.areas.map((a) => <option key={a} value={`${zz.id}|${a}`}>{a}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  {err("zone")}
                </label>
              )}
              <label className="lbl full">Street, building, house number or landmark
                <input className="field" value={d.address} onChange={set("address")} autoComplete="street-address" placeholder="e.g. Riverside Drive, Riverside Square, 3rd floor" disabled={!!cartId} />
                {err("address")}
              </label>
              <label className="lbl full"><span>Notes for the <TumaBoda /> rider <span className="muted">(optional)</span></span>
                <textarea className="field" value={d.notes} onChange={set("notes")} placeholder="Gate code, call on arrival…" disabled={!!cartId} />
              </label>
            </div>
          )}
          {collecting && <p className="notice">Collect from {site.address}. We'll message you when it's ready — we're open 24 hours. Bring ID.</p>}

          {medusaMode && cartId && options.length > 0 && (
            <div className="choices mt">
              {options.map((o) => (
                <label className="choice" key={o.id}>
                  <input type="radio" name="ship" checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                  <b>{o.name}</b>
                  <span className="price">{o.amount ? money(o.amount) : "Free"}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="co-step">
          <h2><i>3</i> How you'll pay</h2>
          <div className="choices">
            <label className="choice pay-choice pay-mpesa">
              <input type="radio" name="pay" checked={pay === "mpesa"} onChange={() => setPay("mpesa")} />
              <PayLogos only="mpesa" />
              <b>M-Pesa</b><span>{medusaMode ? "A prompt arrives on your phone — enter your PIN" : "We send the till number on WhatsApp"}</span>
            </label>
            <label className="choice pay-choice pay-card">
              <input type="radio" name="pay" checked={pay === "card"} onChange={() => setPay("card")} />
              <PayLogos only="card" />
              <b>Card</b><span>{medusaMode ? "Visa or Mastercard, on Paystack's secure page" : "We send a secure card-payment link on WhatsApp"}</span>
            </label>
          </div>
          {needsAdult ? (
            <label className="check mt">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
              <span>I confirm I am 18 or over, I'll show ID when the <TumaBoda /> rider arrives, and I accept the <a href="/terms" target="_blank" style={{ textDecoration: "underline" }}>Terms & Conditions</a>. {legal.healthLine}</span>
            </label>
          ) : (
            <p className="muted mt" style={{ fontSize: ".82rem" }}>Soft drinks only — no age check needed. By ordering you accept the <a href="/terms" target="_blank" style={{ textDecoration: "underline" }}>Terms & Conditions</a>.</p>
          )}
          {touched && errors.adult && <p className="err" style={{ color: "var(--ember)", fontSize: ".78rem" }}>{errors.adult}</p>}
        </section>

        {removedForAge > 0 && <p className="notice" role="status">Under 18, so we took {removedForAge === 1 ? "an alcoholic drink" : `${removedForAge} alcoholic drinks`} out of your bag. Soft drinks, mixers and ice are all yours.</p>}
        {error && <p className="notice err" role="alert">{error}</p>}
        {status && <p className="notice" role="status"><WithTumaBoda text={status} /></p>}

        <div className="mt">
          {!medusaMode ? (
            <button className="btn btn-amber btn-block" type="button" onClick={sendWhatsApp} disabled={busy}>
              Send my order on WhatsApp · {money(total)}
            </button>
          ) : !cartId ? (
            <button className="btn btn-amber btn-block" type="button" onClick={continueToDelivery} disabled={busy}>
              {busy ? "One moment…" : "Continue to delivery"}
            </button>
          ) : (
            <button className="btn btn-amber btn-block" type="button" onClick={placeMedusa} disabled={busy || !optionId || (needsAdult && !adult)}>
              {busy ? "Placing your order…" : `Place order · ${money(total)}`}
            </button>
          )}
          {!medusaMode && (
            <p className="muted center" style={{ fontSize: ".78rem", marginTop: 12 }}>
              Your order opens in WhatsApp, written out for you. We confirm the time and payment in the chat.
            </p>
          )}
        </div>
      </div>

      <aside className="co-summary">
        <h3>Your bag</h3>
        <div>
          {lines.map((l) => (
            <div className="line" key={l.handle} style={{ gridTemplateColumns: "48px 1fr auto" }}>
              <div className="line-art" style={{ height: 60 }}>
                <Bottle d={{ handle: l.handle, name: l.name, brand: l.brand, volume: l.volume, colour: l.colour, shape: l.shape, thumbnail: l.thumbnail }} height={50} salt="co" />
              </div>
              <div><div className="line-name">{l.name}</div><div className="line-meta" style={{ margin: 0 }}>{l.qty} × {money(l.price)}</div></div>
              <span className="price">{money(l.price * l.qty)}</span>
            </div>
          ))}
        </div>
        <div className="sum-row mt"><span className="muted">Bottles</span><span className="price">{money(subtotal)}</span></div>
        <div className="sum-row">
          <span className="muted">Delivery</span>
          <span className="price">{medusaMode && !optionId ? "—" : collecting ? "Collect" : !medusaMode && !z ? "Pick an area" : fee ? money(fee) : "Free"}</span>
        </div>
        <label className="lbl mt" style={{ marginBottom: 6 }}><span>Games code <span className="muted">(optional)</span></span>
          <input className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. from Games night" autoCapitalize="characters" spellCheck={false} />
        </label>
        {code.trim() && (
          <p className="muted" style={{ fontSize: ".76rem", margin: "0 0 6px" }}>
            {!codeOk ? "That code isn't recognised." : medusaMode ? `${REWARD.percent}% off the bottles, applied when you pay.` : `${REWARD.percent}% off the bottles.`}{" "}
            <a href="/games" style={{ textDecoration: "underline" }}>Win one</a>
          </p>
        )}
        {discount > 0 && <div className="sum-row"><span className="muted">Games code {REWARD.code}</span><span className="price">−{money(discount)}</span></div>}
        <div className="sum-row total"><span>Total</span><span className="price">{money(total)}</span></div>
        {!medusaMode && z && FREE_ZONES.has(z.id) && subtotal < site.freeDeliveryOver && (
          <p className="muted" style={{ fontSize: ".78rem", margin: 0 }}>Add {money(site.freeDeliveryOver - subtotal)} more for free delivery to {z.name}.</p>
        )}
        <a className="line-remove" href="/shop" style={{ display: "inline-block", marginTop: 14 }}>← Keep shopping</a>
      </aside>
    </div>
  );
}
