import { SPEEDS, ZONES, legal, site } from "../config/site";
import { money } from "../lib/format";

/**
 * The questions people actually ask a liquor shop, answered in full sentences. Shown on the
 * home and delivery pages and published as FAQPage structured data, so search and answer
 * engines (Google, Bing, ChatGPT, Perplexity) can quote the shop directly. Every fact comes
 * from config/site.ts, so changing a fee or the hours changes the answer too.
 */
export interface Faq { q: string; a: string }

const cheapest = [...ZONES].sort((a, b) => a.fee - b.fee)[0];
const dearest = [...ZONES].sort((a, b) => b.fee - a.fee)[0];

export const FAQ: Faq[] = [
  {
    q: "Where is The Liquor House?",
    a: `${site.name} is ${site.tagline}, on ${site.street}, ${site.area}, ${site.city}. You can walk the aisles in person or order online for delivery.`,
  },
  {
    q: "What time does The Liquor House open and close?",
    a: `The shop is open 24 hours a day, every day. You can walk in, call or WhatsApp ${site.phone}, or order on this website at any hour.`,
  },
  {
    q: "Do you deliver alcohol in Nairobi?",
    a: `Yes. Every delivery in Nairobi is ridden by ${site.courier.name}, straight from the supermarket on Kiambu Road. Delivery costs from ${money(cheapest.fee)} (${cheapest.name}, about ${cheapest.eta}) to ${money(dearest.fee)} (${dearest.name}, about ${dearest.eta}), and is free in the city zones on orders over ${money(site.freeDeliveryOver)}.`,
  },
  {
    q: "How fast is delivery?",
    a: `${SPEEDS.map((s) => `${s.name}: ${s.line.replace(/\.$/, "")}`).join(". ")}. Most orders near Kiambu Road arrive within ${cheapest.eta}.`,
  },
  {
    q: "How can I pay?",
    a: "By M-Pesa — you approve the payment on your phone — or by card (Visa or Mastercard). Payment is taken when you order; there is no cash on delivery.",
  },
  {
    q: "Do you check ID on delivery?",
    a: `Yes. ${legal.ageLine} ${site.courier.name} riders check ID on every delivery that includes alcohol and will not hand it to anyone under ${legal.minimumAge}. You are not charged for an order we cannot hand over.`,
  },
  {
    q: "Can under-18s buy anything?",
    a: "Yes — the soft-drinks shelf: sodas, tonic, ginger beer, energy drinks and ice. Alcohol is only sold to adults aged 18 and over.",
  },
  {
    q: "Can I order on WhatsApp or by phone?",
    a: `Yes. Call or WhatsApp ${site.phone} any time, day or night. You can also order on Glovo.`,
  },
  {
    q: "How much alcohol do I need for a party?",
    a: "As a rule of thumb, two drinks a guest in the first hour and one an hour after that. One 750ml bottle of spirits pours about 16 drinks, a bottle of wine five glasses, and a crate of Tusker 25 bottles. The party planner on this site works it out for your guest list and fills your bag.",
  },
  {
    q: "What if something is wrong with my order?",
    a: "Tell us within 24 hours and we will replace or refund anything missing, damaged or faulty. Refunds go back to your M-Pesa or card. Opened bottles can only be returned if they are faulty.",
  },
];
