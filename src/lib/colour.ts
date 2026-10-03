/**
 * The liquid's colour, read from the words in a product's style — the same rule beyond/'s
 * BottleArt uses, so a bottle added from the POS without a `metadata.colour` still pours the
 * right shade.
 */
export function liquidColour(p: { subcategory?: string; name?: string; category?: string }): string {
  const s = `${p.subcategory ?? ""} ${p.name ?? ""} ${p.category ?? ""}`.toLowerCase();
  if (/pink|rosé|rose|berry|strawberr/.test(s)) return "#d9567f";
  if (/red wine|sweet red|shiraz|cabernet|merlot|red blend|claret/.test(s)) return "#6d1027";
  if (/white wine|sauvignon|chardonnay|chenin/.test(s)) return "#ddcd8a";
  if (/champagne|sparkling|brut|asti/.test(s)) return "#e6cd7d";
  if (/stout/.test(s)) return "#24150e";
  if (/cider/.test(s)) return "#d8a33c";
  if (/lager|beer|pilsner/.test(s)) return "#c8912e";
  if (/cream liqueur|amarula|baileys/.test(s)) return "#c9a884";
  if (/coffee/.test(s)) return "#3b2418";
  if (/herbal|bitter|aperitif|aperol|campari/.test(s)) return "#d2452b";
  if (/blanco|silver|vodka|gin|white rum|cane|coconut/.test(s)) return "#dfe7ee";
  if (/cognac|brandy|añejo|anejo|reposado|gold|spiced|dark rum/.test(s)) return "#8a4413";
  if (/tonic|soda|water|cola|energy|ice|ginger/.test(s)) return "#7fb6d6";
  if (/whisky|whiskey|scotch|bourbon|malt/.test(s)) return "#b0641c";
  return "#b0701f";
}

export const SHAPE_BY_SHELF: Record<string, "spirit" | "wine" | "champagne" | "can" | "box"> = {
  whisky: "spirit", cognac: "spirit", gin: "spirit", vodka: "spirit", tequila: "spirit",
  rum: "spirit", liqueur: "spirit", wine: "wine", champagne: "champagne", beer: "can",
  mixers: "can", gifts: "box",
};
