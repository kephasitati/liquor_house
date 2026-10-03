import { medusa, regionId } from "./medusa";
import { money } from "./format";
import type { BagLine } from "./types";
import { site } from "../config/site";

/**
 * Two ways an order leaves the site.
 *
 *   medusa    every line has a variant id (a live channel): a real Medusa cart is built from
 *             the bag, then address → shipping → payment → complete, as in beyond/.
 *   whatsapp  the demo cellar, or a bag with a line Medusa does not know: the order is
 *             written out as a message to the shop's WhatsApp, and the shop confirms the
 *             delivery and the payment in the chat.
 */
export type PayMethod = "mpesa" | "cod";

export const PROVIDERS: Record<PayMethod, string> = {
  mpesa: "pp_mpesa_mpesa",
  cod: "pp_system_default",
};

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
): string {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return [
    `Hello ${site.name}, I'd like to order:`,
    "",
    ...lines.map((l) => `• ${l.qty} × ${l.name}${l.volume ? ` (${l.volume})` : ""} — ${money(l.price * l.qty)}`),
    "",
    `Bottles: ${money(subtotal)}`,
    `Delivery: ${delivery.label} — ${delivery.fee ? money(delivery.fee) : "free"}`,
    `Total: ${money(subtotal + delivery.fee)}`,
    `Paying by: ${pay === "mpesa" ? "M-Pesa" : "cash on delivery"}`,
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    d.area ? `Area: ${d.area}` : "",
    d.address ? `Address: ${d.address}` : "",
    d.notes ? `Notes: ${d.notes}` : "",
    "",
    "I confirm I am 18 or over and will show ID on delivery.",
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
export async function createCart(lines: BagLine[], d: Details): Promise<any> {
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
  onStatus("Booking your rider…");
  await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId } as any);
  const { cart } = await medusa.store.cart.retrieve(cartId, { fields: "id,email,*shipping_address,total" } as any);

  onStatus(method === "mpesa" ? "Sending the M-Pesa prompt to your phone…" : "Confirming your order…");
  await medusa.store.payment.initiatePaymentSession(cart as any, {
    provider_id: PROVIDERS[method],
    data: { phone: (cart as any)?.shipping_address?.phone, email: (cart as any)?.email },
  } as any);

  if (method === "mpesa") {
    onStatus("Check your phone and enter your M-Pesa PIN.");
    const ok = await pollMpesa(cartId);
    if (!ok.authorized) throw new Error(ok.message);
  }

  const res = await medusa.store.cart.complete(cartId);
  if (res.type === "order") return res.order;
  throw new Error((res as any)?.error?.message ?? "The order did not go through. Nothing has been charged — try again.");
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
        return { authorized: false, message: s?.data?.failure_reason ?? "That M-Pesa payment did not go through. Try again, or pay the rider." };
      }
    } catch {
      /* a dropped poll is not a failed payment */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { authorized: false, message: "We did not hear back from M-Pesa. If you were charged, your order is safe — call us." };
}
