import { medusa, regionId } from "./medusa";
import { money } from "./format";
import type { BagLine } from "./types";
import { site } from "../config/site";

/**
 * Two ways an order leaves the site.
 *
 *   medusa    every line has a variant id (a live channel): a real Medusa cart is built from
 *             the bag, then address → shipping → payment → complete.
 *   whatsapp  the demo cellar, or a bag with a line Medusa does not know: the order is
 *             written out as a message to the shop's WhatsApp, and the shop confirms the
 *             delivery and the payment in the chat.
 */
/** M-Pesa or a card — nothing else. No cash on delivery. */
export type PayMethod = "mpesa" | "card";

export const PROVIDERS: Record<PayMethod, string> = {
  mpesa: "pp_mpesa_mpesa",
  /** Visa / Mastercard through Paystack's hosted, 3-D Secure page. */
  card: "pp_paystack_paystack",
};

/** The cart a card payment is waiting on, kept for the round trip to Paystack (this tab only). */
const CARD_PENDING = `${site.storagePrefix}card_cart`;

export interface Details {
  name: string;
  phone: string;
  email: string;
  area: string;
  address: string;
  notes: string;
}

/** 0712 000 000, +254 712 000 000 and 712000000 are all the same phone: 254712000000. */
export function normalisePhone(raw: string): string {
  const d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  if (d.length === 9) return "254" + d;
  return d;
}

export const validPhone = (raw: string) => /^2547\d{8}$|^2541\d{8}$/.test(normalisePhone(raw));

export const canUseMedusa = (lines: BagLine[]) => lines.length > 0 && lines.every((l) => !!l.variantId);

/* -------------------------------------------------------------------- WhatsApp */

export function whatsappMessage(
  lines: BagLine[],
  d: Details,
  delivery: { label: string; fee: number },
  pay: PayMethod,
  promo?: { code: string; amount: number },
  needsAdult = true,
): string {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const off = promo?.amount ?? 0;
  return [
    `Hello ${site.name}, I'd like to order:`,
    "",
    ...lines.map((l) => `• ${l.qty} × ${l.name}${l.volume ? ` (${l.volume})` : ""} — ${money(l.price * l.qty)}`),
    "",
    `Bottles: ${money(subtotal)}`,
    `Delivery: ${delivery.label} — ${delivery.fee ? money(delivery.fee) : "free"} (TumaBoda)`,
    promo ? `Games code ${promo.code}: −${money(off)}` : "",
    `Total: ${money(subtotal + delivery.fee - off)}`,
    `Paying by: ${pay === "mpesa" ? "M-Pesa" : "card (Visa/Mastercard) — please send me a secure payment link"}`,
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    d.area ? `Area: ${d.area}` : "",
    d.address ? `Address: ${d.address}` : "",
    d.notes ? `Notes: ${d.notes}` : "",
    "",
    needsAdult ? "I confirm I am 18 or over and will show ID on delivery." : "Soft drinks only.",
  ]
    .filter((l, i, all) => !(l === "" && all[i - 1] === ""))
    .join("\n")
    .trim();
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------------------- Medusa */

/** Build a Medusa cart from the bag and attach the customer. */
export async function createCart(lines: BagLine[], d: Details, promoCode?: string): Promise<any> {
  const region_id = await regionId();
  const [first_name, ...rest] = d.name.trim().split(/\s+/);
  const address = {
    first_name: first_name || d.name,
    last_name: rest.join(" ") || "-",
    phone: normalisePhone(d.phone),
    address_1: d.address || d.area,
    city: d.area || site.city,
    country_code: site.country,
  };
  const { cart } = await medusa.store.cart.create({
    region_id,
    email: d.email || `${normalisePhone(d.phone)}@guest.${new URL(site.url).hostname}`,
    items: lines.map((l) => ({ variant_id: l.variantId!, quantity: l.qty })),
    shipping_address: address,
    billing_address: address,
    metadata: { notes: d.notes || undefined, age_confirmed: true, source: "liquorhouse-web" },
  } as any);
  // A games code works online only if the shop has created the same code in Medusa
  // (Promotions). If it hasn't, the order still goes through, at full price.
  if (promoCode) {
    try {
      const res: any = await medusa.client.fetch(`/store/carts/${cart.id}/promotions`, { method: "POST", body: { promo_codes: [promoCode] } });
      return res?.cart ?? cart;
    } catch {
      return cart;
    }
  }
  return cart;
}

export interface ShipOption { id: string; name: string; amount: number }

export async function shippingOptions(cartId: string): Promise<ShipOption[]> {
  const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId } as any);
  return (shipping_options ?? []).map((o: any) => ({ id: o.id, name: o.name, amount: Number(o.amount ?? 0) }));
}

export async function payAndPlace(
  cartId: string,
  optionId: string,
  method: PayMethod,
  onStatus: (s: string) => void,
): Promise<any> {
  onStatus("Booking your TumaBoda rider…");
  await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId } as any);
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "id,email,*shipping_address,total" } as any);

  onStatus(method === "mpesa" ? "Sending the M-Pesa prompt to your phone…" : "Opening the secure card payment…");
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart as any, {
    provider_id: PROVIDERS[method],
    data: {
      phone: (cart as any)?.shipping_address?.phone,
      email: (cart as any)?.email,
      // Paystack brings the buyer back here; the checkout then finishes the order.
      ...(method === "card" ? { callback_url: `${location.origin}/checkout?card=1` } : {}),
    },
  } as any);

  if (method === "card") {
    const session = ((payment_collection as any)?.payment_sessions ?? []).find((s: any) => s.provider_id === PROVIDERS.card);
    const url = session?.data?.authorization_url;
    if (!url) throw new Error("The card payment couldn't be started. Try M-Pesa, or try again in a minute.");
    try { sessionStorage.setItem(CARD_PENDING, cartId); } catch { /* the return trip will ask them to call */ }
    location.href = url;
    return { redirected: true };
  }

  if (method === "mpesa") {
    onStatus("Check your phone and enter your M-Pesa PIN.");
    const ok = await pollMpesa(cartId);
    if (!ok.authorized) throw new Error(ok.message);
  }

  const res = await medusa.store.cart.complete(cartId);
  if (res.type === "order") return res.order;
  throw new Error((res as any)?.error?.message ?? "The order did not go through. Nothing has been charged — try again.");
}

/** Back from Paystack: finish the order the card paid for. Null if no card payment is waiting. */
export async function finishCardPayment(): Promise<any | null> {
  let cartId: string | null = null;
  try { cartId = sessionStorage.getItem(CARD_PENDING); } catch { /* no storage, nothing to finish */ }
  if (!cartId) return null;
  const res = await medusa.store.cart.complete(cartId);
  try { sessionStorage.removeItem(CARD_PENDING); } catch { /* fine */ }
  if (res.type === "order") return res.order;
  throw new Error("Your card payment hasn't cleared yet. If you were charged, your order is safe — call us and we'll confirm it.");
}

async function pollMpesa(cartId: string): Promise<{ authorized: boolean; message: string }> {
  for (let i = 0; i < 30; i++) {
    try {
      const { cart } = await medusa.store.cart.retrieve(cartId, {
        fields: "id,payment_collection.payment_sessions.provider_id,payment_collection.payment_sessions.status,payment_collection.payment_sessions.data",
      } as any);
      const s = ((cart as any)?.payment_collection?.payment_sessions ?? []).find((x: any) => x.provider_id === PROVIDERS.mpesa);
      const status = s?.status ?? s?.data?.status;
      if (status === "authorized" || status === "captured") return { authorized: true, message: "" };
      if (status === "error" || status === "canceled") {
        return { authorized: false, message: s?.data?.failure_reason ?? "That M-Pesa payment did not go through. Try again, or pay by card." };
      }
    } catch {
      /* a dropped poll is not a failed payment */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { authorized: false, message: "We did not hear back from M-Pesa. If you were charged, your order is safe — call us." };
}
