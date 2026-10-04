import { SHELF_BY_ID, ZONES, site } from "../config/site";
import type { Cocktail } from "../data/cocktails";
import type { Faq } from "../data/faq";
import type { Drink } from "./types";

/**
 * Structured data (schema.org JSON-LD) for search and answer engines. One store entity with a
 * stable @id that every product, offer and page points back to, so Google, Bing and the AI
 * engines read the site as one business with one address, one phone and one catalogue.
 */
export const abs = (path: string) => new URL(path, site.url).toString();
export const STORE_ID = abs("/#store");
export const SITE_ID = abs("/#website");
export const OG_IMAGE = "/og.jpg";

export function storeLd() {
  const fees = ZONES.map((z) => z.fee);
  return {
    "@type": ["LiquorStore", "OnlineStore"],
    "@id": STORE_ID,
    name: site.name,
    alternateName: site.short,
    slogan: site.tagline,
    description: `${site.tagline}: whisky, cognac, gin, vodka, wine, champagne and cold beer on ${site.street}, ${site.area}, Nairobi. Open 24 hours, delivered across Nairobi by ${site.courier.name}.`,
    url: site.url,
    logo: abs("/icon-512.png"),
    image: abs(OG_IMAGE),
    telephone: site.phone,
    ...(site.email ? { email: site.email } : {}),
    address: { "@type": "PostalAddress", streetAddress: site.street, addressLocality: site.area, addressRegion: site.city, addressCountry: "KE" },
    hasMap: site.maps,
    openingHours: site.openingHours,
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    }],
    areaServed: { "@type": "City", name: "Nairobi", containedInPlace: { "@type": "Country", name: "Kenya" } },
    currenciesAccepted: "KES",
    paymentAccepted: "M-Pesa, Visa, Mastercard",
    priceRange: "KSh 110 – KSh 32,000",
    sameAs: site.socials.map((s) => s.url),
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: site.phone,
      contactType: "customer service",
      areaServed: "KE",
      availableLanguage: ["English", "Swahili"],
      hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
    }],
    potentialAction: { "@type": "OrderAction", target: abs("/shop"), deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet" },
    makesOffer: { "@type": "Offer", name: "Delivery across Nairobi", priceSpecification: { "@type": "PriceSpecification", minPrice: Math.min(...fees), maxPrice: Math.max(...fees), priceCurrency: "KES" } },
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: site.locale,
    publisher: { "@id": STORE_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${abs("/shop")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb { name: string; path: string }
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function faqLd(faq: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** A year out: Google wants an end date on every price. */
const priceValidUntil = () => `${new Date().getFullYear() + 1}-12-31`;

export function productLd(d: Drink) {
  const url = abs(`/p/${d.handle}`);
  const soldOut = d.stock != null && d.stock <= 0;
  const cheapest = [...ZONES].sort((a, b) => a.fee - b.fee)[0];
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: d.name,
    sku: d.handle,
    url,
    brand: d.brand ? { "@type": "Brand", name: d.brand } : undefined,
    description: d.description,
    category: SHELF_BY_ID[d.category]?.name,
    image: d.thumbnail ? abs(d.thumbnail) : undefined,
    countryOfOrigin: d.origin || undefined,
    additionalProperty: [
      d.volume && { "@type": "PropertyValue", name: "Volume", value: d.volume },
      d.ageRestricted && { "@type": "PropertyValue", name: "Alcohol by volume", value: `${d.abv}%` },
      d.notes.length && { "@type": "PropertyValue", name: "Tasting notes", value: d.notes.join(", ") },
    ].filter(Boolean),
    audience: d.ageRestricted ? { "@type": "PeopleAudience", suggestedMinAge: 18 } : undefined,
    offers: d.price != null ? {
      "@type": "Offer",
      url,
      priceCurrency: "KES",
      price: d.price,
      priceValidUntil: priceValidUntil(),
      itemCondition: "https://schema.org/NewCondition",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@id": STORE_ID },
      areaServed: { "@type": "City", name: "Nairobi" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: cheapest.fee, currency: "KES" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "KE", addressRegion: "Nairobi" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "KE",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 1,
        returnFees: "https://schema.org/FreeReturn",
      },
    } : undefined,
  };
}

export function itemListLd(name: string, drinks: Drink[]) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: drinks.length,
    itemListElement: drinks.slice(0, 30).map((d, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/p/${d.handle}`), name: d.name })),
  };
}

export function recipeLd(c: Cocktail) {
  return {
    "@type": "Recipe",
    "@id": abs(`/cocktails#${c.id}`),
    name: c.name,
    description: `${c.kicker}. ${c.name}, made at home in ${c.minutes} minutes.`,
    image: abs(`/cocktails/${c.id}.webp`),
    author: { "@id": STORE_ID },
    recipeCategory: "Cocktail",
    recipeCuisine: c.id === "dawa" ? "Kenyan" : undefined,
    totalTime: `PT${c.minutes}M`,
    recipeYield: "1 drink",
    keywords: `${c.name}, cocktail, ${c.base}, Nairobi`,
    recipeIngredient: c.ingredients.map((i) => i.label),
    recipeInstructions: c.method.map((m) => ({ "@type": "HowToStep", text: m })),
  };
}
