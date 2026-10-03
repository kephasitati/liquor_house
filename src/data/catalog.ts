import type { Drink, Profile } from "../lib/types";
import { liquidColour, SHAPE_BY_SHELF } from "../lib/colour";
import { SHELF_BY_ID } from "../config/site";
import PHOTOS from "../../scripts/bottle-photos.json";

/**
 * The demo cellar.
 *
 * What the storefront shows until the shop's Medusa channel is connected
 * (PUBLIC_MEDUSA_KEY_LIQUORHOUSE). The bottles are real brands sold in Nairobi; the PRICES are
 * indicative shelf prices for laying out the design and must be replaced by the shop's own
 * before anything is sold — which happens automatically once the catalogue comes from Medusa.
 *
 * One line per bottle. The profile string is six 0–5 scores in this order:
 *   sweet smoky fruity spicy oaky fresh
 *
 * Every bottle shown is PHOTOGRAPHED: public/bottles/<handle>.webp, mapped and credited in
 * scripts/bottle-photos.json. A bottle with no photograph stays listed here (it is still a
 * thing the shop sells) but is left off the shelf until one is added — the shop is never
 * shown with a drawn stand-in.
 */
type Extra = { old?: number; tags?: string[]; serve?: string; desc?: string; stock?: number };

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function profile(s: string): Profile {
  const [sweet, smoky, fruity, spicy, oaky, fresh] = s.split(" ").map(Number);
  return { sweet, smoky, fruity, spicy, oaky, fresh };
}

const DEFAULT_SERVE: Record<string, string> = {
  whisky: "Neat, or over one large cube. A drop of water opens it up.",
  cognac: "In a tulip glass at room temperature, after dinner.",
  gin: "Over plenty of ice with tonic and a wedge of lime or cucumber.",
  vodka: "Ice-cold from the freezer, or long with soda and lime.",
  tequila: "Sipped neat, or shaken into a margarita with fresh lime.",
  rum: "With cola and lime, or ginger beer and a squeeze of lemon.",
  liqueur: "Over ice, or poured into coffee.",
  wine: "Lightly chilled for whites and rosé; reds just below room temperature.",
  champagne: "Well chilled, in a flute or a wide white-wine glass.",
  beer: "Ice-cold, straight from the fridge.",
  mixers: "Chilled. Keep a few extra — they always run out first.",
};

function d(
  category: string,
  name: string,
  brand: string,
  subcategory: string,
  volume: string,
  abv: number,
  origin: string,
  price: number,
  prof: string,
  notes: string,
  x: Extra = {},
): Drink {
  const handle = slug(`${name} ${volume}`);
  return {
    handle,
    productId: `demo_${handle}`,
    variantId: null,
    name,
    brand,
    category,
    subcategory,
    price,
    oldPrice: x.old ?? null,
    volume,
    abv,
    origin,
    stock: x.stock ?? null,
    tags: x.tags ?? [],
    notes: notes.split("·").map((s) => s.trim()).filter(Boolean),
    profile: profile(prof),
    colour: liquidColour({ subcategory, name, category }),
    shape: SHAPE_BY_SHELF[category] ?? "spirit",
    thumbnail: handle in PHOTOS ? `/bottles/${handle}.webp` : null,
    description:
      x.desc ??
      `${name} — ${subcategory.toLowerCase()} from ${origin}. ${volume}, ${abv}% ABV. Delivered cold across Nairobi.`,
    serve: x.serve ?? DEFAULT_SERVE[category] ?? "",
    ageRestricted: SHELF_BY_ID[category]?.ageRestricted ?? true,
  };
}

const CELLAR: Drink[] = [
  /* ---------------------------------------------------------------- whisky */
  d("whisky", "Johnnie Walker Black Label", "Johnnie Walker", "Blended Scotch", "750ml", 40, "Scotland", 4800,
    "3 3 3 2 3 1", "Dark fruit · Vanilla · Gentle smoke",
    { tags: ["bestseller", "occasion:nyama", "occasion:celebration"], desc: "Twelve years in the making and Nairobi's default answer to 'what are we drinking?'. Rich and rounded, with dark fruit, creamy vanilla and a soft line of Islay smoke." }),
  d("whisky", "Johnnie Walker Red Label", "Johnnie Walker", "Blended Scotch", "750ml", 40, "Scotland", 2400,
    "2 2 2 3 1 2", "Pepper · Cinnamon · Light smoke", { tags: ["value", "occasion:matchnight"] }),
  d("whisky", "Johnnie Walker Double Black", "Johnnie Walker", "Blended Scotch", "750ml", 40, "Scotland", 6500,
    "2 4 2 3 4 1", "Charred oak · Smoke · Raisin", { tags: ["premium"] }),
  d("whisky", "Johnnie Walker Gold Label Reserve", "Johnnie Walker", "Blended Scotch", "750ml", 40, "Scotland", 9500,
    "4 2 3 1 3 1", "Honey · Ripe pear · Toasted almond", { tags: ["premium", "gift", "occasion:celebration"] }),
  d("whisky", "Johnnie Walker Blue Label", "Johnnie Walker", "Blended Scotch", "750ml", 40, "Scotland", 32000,
    "3 3 4 2 4 1", "Hazelnut · Honey · Sandalwood smoke",
    { tags: ["premium", "gift", "occasion:quiet"], desc: "Hand-picked from casks so rare that only one in ten thousand makes the blend. The bottle for the moment you will tell people about." }),
  d("whisky", "Jameson Irish Whiskey", "Jameson", "Irish Whiskey", "750ml", 40, "Ireland", 3200,
    "3 0 3 2 2 2", "Vanilla · Toasted wood · Orchard fruit",
    { tags: ["bestseller", "occasion:nyama", "occasion:matchnight"], serve: "With ginger ale and a wedge of lime — the Jameson, ginger and lime." }),
  d("whisky", "Jameson Black Barrel", "Jameson", "Irish Whiskey", "750ml", 40, "Ireland", 5200,
    "4 1 3 2 4 1", "Toffee · Charred barrel · Dried fruit", { tags: ["premium"] }),
  d("whisky", "Glenfiddich 12 Year Old", "Glenfiddich", "Single Malt Scotch", "750ml", 40, "Speyside, Scotland", 7200,
    "3 0 4 1 3 3", "Fresh pear · Cream · Subtle oak", { tags: ["occasion:quiet", "bestseller"] }),
  d("whisky", "The Glenlivet Founder's Reserve", "The Glenlivet", "Single Malt Scotch", "700ml", 40, "Speyside, Scotland", 5600,
    "3 0 4 1 2 3", "Sweet orange · Pear · Toffee", {}),
  d("whisky", "The Singleton 12 Year Old", "The Singleton", "Single Malt Scotch", "750ml", 40, "Dufftown, Scotland", 6500,
    "4 0 4 1 3 2", "Red berries · Brown sugar · Nutty", { tags: ["occasion:quiet"] }),
  d("whisky", "Monkey Shoulder", "Monkey Shoulder", "Blended Malt Scotch", "700ml", 40, "Speyside, Scotland", 5400,
    "4 0 3 2 3 2", "Vanilla · Orange zest · Honey", { tags: ["new"] }),
  d("whisky", "Talisker 10 Year Old", "Talisker", "Single Malt Scotch", "700ml", 45.8, "Isle of Skye, Scotland", 7800,
    "2 5 2 4 3 1", "Sea smoke · Black pepper · Dried fruit",
    { tags: ["premium", "occasion:quiet"], desc: "Made by the sea on the Isle of Skye: maritime smoke, a hit of black pepper, then sweet dried fruit. For the whisky drinker who has had everything else." }),
  d("whisky", "Jack Daniel's Old No. 7", "Jack Daniel's", "Tennessee Whiskey", "700ml", 40, "Tennessee, USA", 3900,
    "4 1 2 2 3 1", "Caramel · Banana · Toasted oak", { tags: ["bestseller", "occasion:matchnight"], serve: "With cola over ice — the Jack and Coke." }),
  d("whisky", "Chivas Regal 12 Year Old", "Chivas Regal", "Blended Scotch", "750ml", 40, "Scotland", 5200,
    "4 1 3 1 3 2", "Honey · Ripe apple · Vanilla", { tags: ["occasion:celebration"] }),
  d("whisky", "Grant's Family Reserve", "Grant's", "Blended Scotch", "750ml", 40, "Scotland", 2100,
    "3 1 2 2 2 2", "Vanilla · Malt · Sweet oak", { tags: ["value", "occasion:office"] }),
  d("whisky", "Teacher's Highland Cream", "Teacher's", "Blended Scotch", "750ml", 40, "Scotland", 1800,
    "2 3 2 2 2 1", "Peat smoke · Malt · Toffee", { tags: ["value"] }),

  /* ----------------------------------------------------------------- cognac */
  d("cognac", "Hennessy V.S", "Hennessy", "Cognac", "700ml", 40, "Cognac, France", 6500,
    "3 0 3 3 3 1", "Toasted almond · Fresh grape · Oak",
    { tags: ["bestseller", "occasion:celebration"], serve: "Neat in a tulip glass, or long with ginger ale." }),
  d("cognac", "Hennessy V.S.O.P Privilège", "Hennessy", "Cognac", "700ml", 40, "Cognac, France", 9800,
    "4 1 3 3 4 0", "Vanilla · Clove · Honey", { tags: ["premium", "gift", "occasion:quiet"] }),
  d("cognac", "Martell V.S", "Martell", "Cognac", "700ml", 40, "Cognac, France", 6200,
    "3 0 4 2 2 2", "Plum · Apricot · Light oak", {}),
  d("cognac", "Rémy Martin V.S.O.P", "Rémy Martin", "Cognac", "700ml", 40, "Cognac, France", 9200,
    "4 0 4 2 4 1", "Ripe apricot · Vanilla · Liquorice", { tags: ["premium", "occasion:celebration"] }),
  d("cognac", "Richot Brandy", "Richot", "Brandy", "750ml", 43, "Kenya", 1300,
    "3 0 2 2 2 1", "Grape · Caramel · Warm spice", { tags: ["value", "local"] }),
  d("cognac", "Viceroy 5 Year Old", "Viceroy", "Brandy", "750ml", 43, "South Africa", 1700,
    "3 0 3 2 3 1", "Dried fruit · Caramel · Oak", { tags: ["value"] }),

  /* -------------------------------------------------------------------- gin */
  d("gin", "Gilbey's Special Dry Gin", "Gilbey's", "London Dry Gin", "750ml", 40, "Kenya", 1500,
    "1 0 1 2 0 4", "Juniper · Citrus peel · Pepper",
    { tags: ["bestseller", "value", "local", "occasion:sundowner", "occasion:office"], desc: "Bottled in Nairobi and poured in every bar in the country. Clean, juniper-forward, and exactly what a G&T wants." }),
  d("gin", "Gilbey's Mixed Berries Gin", "Gilbey's", "Flavoured Gin", "750ml", 37.5, "Kenya", 1600,
    "4 0 5 0 0 3", "Mixed berries · Juniper · Sweet finish", { tags: ["local", "new", "occasion:sundowner"] }),
  d("gin", "Gordon's London Dry Gin", "Gordon's", "London Dry Gin", "750ml", 37.5, "England", 2100,
    "1 0 2 2 0 4", "Juniper · Lemon · Coriander", { tags: ["bestseller", "occasion:sundowner"] }),
  d("gin", "Tanqueray London Dry", "Tanqueray", "London Dry Gin", "750ml", 43.1, "Scotland", 3200,
    "1 0 1 2 0 5", "Bold juniper · Angelica · Liquorice", {}),
  d("gin", "Hendrick's Gin", "Hendrick's", "Scottish Gin", "700ml", 41.4, "Scotland", 5800,
    "2 0 3 1 0 5", "Cucumber · Rose · Juniper",
    { tags: ["premium", "occasion:sundowner"], serve: "With tonic and a thin ribbon of cucumber, never lime." }),
  d("gin", "Bombay Sapphire", "Bombay Sapphire", "London Dry Gin", "750ml", 40, "England", 3300,
    "1 0 2 2 0 5", "Juniper · Lemon peel · Almond", { tags: ["bestseller"] }),
  d("gin", "Beefeater London Dry", "Beefeater", "London Dry Gin", "750ml", 40, "England", 2600,
    "1 0 2 2 0 5", "Juniper · Seville orange · Lemon peel", {}),
  d("gin", "Procera Blue Dot Gin", "Procera", "African Gin", "700ml", 41.7, "Kenya", 9000,
    "1 0 2 3 1 5", "African juniper · Pink pepper · Honey",
    { tags: ["premium", "local", "gift"], desc: "Distilled in Nairobi from African juniper — the world's first gin made with it. A Kenyan bottle worth putting on the table when guests fly in." }),

  /* ------------------------------------------------------------------ vodka */
  d("vodka", "Smirnoff No. 21", "Smirnoff", "Vodka", "750ml", 37.5, "Kenya", 1600,
    "1 0 0 1 0 4", "Clean · Crisp · Neutral", { tags: ["bestseller", "value", "occasion:office", "occasion:matchnight"] }),
  d("vodka", "Absolut Vodka", "Absolut", "Vodka", "750ml", 40, "Sweden", 2600,
    "1 0 1 1 0 4", "Grain · Dried fruit · Clean finish", { tags: ["occasion:office"] }),
  d("vodka", "Cîroc Snap Frost", "Cîroc", "Grape Vodka", "750ml", 40, "France", 5200,
    "2 0 3 0 0 4", "Fresh grape · Citrus · Smooth", { tags: ["premium", "occasion:celebration"] }),
  d("vodka", "Grey Goose", "Grey Goose", "Vodka", "750ml", 40, "France", 5800,
    "2 0 1 1 0 5", "Almond · Citrus · Soft wheat", { tags: ["premium"] }),
  d("vodka", "Belvedere", "Belvedere", "Rye Vodka", "700ml", 40, "Poland", 6200,
    "1 0 1 2 0 4", "Vanilla · Rye spice · Cream", {}),
  d("vodka", "Chrome Vodka", "Chrome", "Vodka", "750ml", 37.5, "Kenya", 850,
    "1 0 0 1 0 3", "Clean · Light · Mixable", { tags: ["value", "local"] }),

  /* ---------------------------------------------------------------- tequila */
  d("tequila", "José Cuervo Especial Gold", "José Cuervo", "Gold Tequila", "750ml", 38, "Jalisco, Mexico", 3400,
    "3 0 2 3 2 2", "Agave · Caramel · Pepper", { tags: ["bestseller", "occasion:matchnight"] }),
  d("tequila", "Olmeca Blanco", "Olmeca", "Blanco Tequila", "700ml", 38, "Jalisco, Mexico", 2600,
    "1 0 2 3 0 4", "Fresh agave · Citrus · White pepper", { tags: ["value"] }),
  d("tequila", "Don Julio Blanco", "Don Julio", "Blanco Tequila", "750ml", 38, "Jalisco, Mexico", 8200,
    "2 0 3 2 0 5", "Agave · Lime · Black pepper", { tags: ["premium"] }),
  d("tequila", "Patrón Silver", "Patrón", "Blanco Tequila", "750ml", 40, "Jalisco, Mexico", 8800,
    "2 0 3 2 0 5", "Sweet agave · Citrus · Light pepper", { tags: ["premium", "occasion:celebration"] }),
  d("tequila", "Casamigos Reposado", "Casamigos", "Reposado Tequila", "750ml", 40, "Jalisco, Mexico", 10500,
    "4 0 2 2 3 2", "Caramel · Cocoa · Cooked agave", { tags: ["premium", "new", "gift"] }),

  /* -------------------------------------------------------------------- rum */
  d("rum", "Captain Morgan Spiced Gold", "Captain Morgan", "Spiced Rum", "750ml", 35, "Jamaica", 2200,
    "4 0 2 3 2 1", "Vanilla · Cinnamon · Brown sugar", { tags: ["bestseller", "occasion:matchnight"] }),
  d("rum", "Bacardí Carta Blanca", "Bacardí", "White Rum", "750ml", 37.5, "Puerto Rico", 2100,
    "2 0 2 1 0 4", "Light · Vanilla · Almond", { serve: "Muddled with mint, lime and sugar — the mojito." }),
  d("rum", "Kenya Cane", "Kenya Cane", "Cane Spirit", "750ml", 40, "Kenya", 900,
    "2 0 1 1 0 3", "Clean cane · Light sweetness", { tags: ["value", "local", "occasion:matchnight"] }),
  d("rum", "Kenya Cane Pineapple", "Kenya Cane", "Pineapple Cane Spirit", "750ml", 30, "Kenya", 950,
    "4 0 4 0 0 3", "Ripe pineapple · Sugar cane", { tags: ["value", "local", "occasion:matchnight"] }),
  d("rum", "Kenya Cane Coconut", "Kenya Cane", "Coconut Cane Spirit", "750ml", 30, "Kenya", 950,
    "4 0 3 0 0 3", "Toasted coconut · Sugar cane", { tags: ["local", "occasion:sundowner"] }),
  d("rum", "Malibu Coconut", "Malibu", "Coconut Rum Liqueur", "750ml", 21, "Barbados", 2400,
    "5 0 3 0 0 2", "Coconut · Vanilla · Sweet", {}),

  /* ---------------------------------------------------------------- liqueur */
  d("liqueur", "Baileys Original Irish Cream", "Baileys", "Cream Liqueur", "750ml", 17, "Ireland", 2900,
    "5 0 1 1 1 0", "Cream · Cocoa · Vanilla", { tags: ["bestseller", "occasion:quiet", "gift"] }),
  d("liqueur", "Amarula Cream", "Amarula", "Cream Liqueur", "750ml", 17, "South Africa", 2500,
    "5 0 3 1 1 0", "Marula fruit · Caramel · Cream", { tags: ["occasion:quiet"] }),
  d("liqueur", "Jägermeister", "Jägermeister", "Herbal Liqueur", "700ml", 35, "Germany", 3200,
    "3 0 1 4 0 2", "Liquorice · Herbs · Citrus", { tags: ["occasion:matchnight"], serve: "Ice-cold as a shot, or with an energy drink." }),
  d("liqueur", "Kahlúa Coffee Liqueur", "Kahlúa", "Coffee Liqueur", "700ml", 16, "Mexico", 2800,
    "5 1 0 1 1 0", "Roasted coffee · Rum · Vanilla", {}),
  d("liqueur", "Aperol", "Aperol", "Aperitif", "700ml", 11, "Italy", 3000,
    "3 0 4 1 0 4", "Bitter orange · Rhubarb · Herbs",
    { tags: ["occasion:sundowner"], serve: "Three parts prosecco, two parts Aperol, a splash of soda, an orange slice." }),

  /* ------------------------------------------------------------------- wine */
  d("wine", "4th Street Sweet Red", "4th Street", "Sweet Red Wine", "750ml", 7.5, "South Africa", 950,
    "5 0 4 0 0 2", "Berries · Plum · Sweet finish", { tags: ["bestseller", "value", "occasion:office", "occasion:nyama"] }),
  d("wine", "4th Street Sweet Rosé", "4th Street", "Rosé Wine", "750ml", 7.5, "South Africa", 950,
    "5 0 4 0 0 3", "Strawberry · Candyfloss · Fresh", { tags: ["value", "occasion:sundowner"] }),
  d("wine", "Nederburg Cabernet Sauvignon", "Nederburg", "Red Wine", "750ml", 13.5, "South Africa", 1600,
    "1 0 4 2 3 1", "Blackcurrant · Cedar · Mint", { tags: ["occasion:nyama"] }),
  d("wine", "Casillero del Diablo Cabernet Sauvignon", "Casillero del Diablo", "Red Wine", "750ml", 13.5, "Chile", 1700,
    "1 1 4 2 3 1", "Black cherry · Plum · Smoky oak", { tags: ["bestseller"] }),
  d("wine", "Nederburg Sauvignon Blanc", "Nederburg", "White Wine", "750ml", 12.5, "South Africa", 1500,
    "1 0 3 0 0 5", "Green apple · Citrus · Grass", { tags: ["occasion:sundowner"] }),
  d("wine", "Whispering Angel Rosé", "Château d'Esclans", "Rosé Wine", "750ml", 13, "Provence, France", 5500,
    "1 0 4 0 0 5", "Strawberry · Peach · Dry finish", { tags: ["premium", "occasion:sundowner"] }),

  /* -------------------------------------------------------------- champagne */
  d("champagne", "Moët & Chandon Brut Impérial", "Moët & Chandon", "Champagne", "750ml", 12, "Champagne, France", 8500,
    "2 0 4 0 1 5", "Green apple · Brioche · Citrus",
    { tags: ["bestseller", "gift", "occasion:celebration"], desc: "The toast at a thousand Nairobi weddings. Bright green apple and citrus over a fine, persistent bead — order it cold." }),
  d("champagne", "Veuve Clicquot Yellow Label", "Veuve Clicquot", "Champagne", "750ml", 12, "Champagne, France", 10500,
    "2 0 4 0 2 4", "Pear · Vanilla · Toasted brioche", { tags: ["premium", "gift", "occasion:celebration"] }),
  d("champagne", "Martini Asti", "Martini", "Sweet Sparkling Wine", "750ml", 7.5, "Italy", 1900,
    "5 0 4 0 0 4", "Peach · Honey · Grape", { tags: ["value", "occasion:celebration"] }),
  d("champagne", "J.C. Le Roux Le Domaine", "J.C. Le Roux", "Sweet Sparkling Wine", "750ml", 7.5, "South Africa", 1400,
    "5 0 4 0 0 3", "Tropical fruit · Sweet · Fine bubbles", { tags: ["value", "occasion:celebration"] }),

  /* ------------------------------------------------------------------- beer */
  d("beer", "Tusker Lager", "Tusker", "Lager", "500ml can", 4.2, "Kenya", 250,
    "1 0 1 0 0 4", "Malt · Light hops · Crisp",
    { tags: ["bestseller", "local", "occasion:nyama", "occasion:matchnight"], desc: "Kenya's beer since 1922. Pale, crisp and best ice-cold — a pint of the country in one can." }),
  d("beer", "Tusker Lager — Crate of 25", "Tusker", "Lager Crate", "25 × 500ml", 4.2, "Kenya", 5600,
    "1 0 1 0 0 4", "Malt · Light hops · Crisp",
    { old: 6250, tags: ["deal", "local", "occasion:nyama", "occasion:office"], desc: "Twenty-five cold Tuskers in one delivery. The bottles and crate carry a deposit, refunded when the rider collects the empties." }),
  d("beer", "White Cap Lager", "White Cap", "Lager", "500ml can", 4.2, "Kenya", 270,
    "1 0 1 0 0 4", "Smooth malt · Gentle bitterness", { tags: ["local"] }),
  d("beer", "Guinness Draught", "Guinness", "Stout", "500ml can", 4.2, "Ireland", 350,
    "2 2 1 1 1 1", "Roasted barley · Coffee · Creamy head", { tags: ["occasion:nyama"] }),
  d("beer", "Tusker Cider", "Tusker", "Cider", "500ml can", 4.5, "Kenya", 260,
    "3 0 4 0 0 4", "Crisp apple · Light sweetness", { tags: ["local", "occasion:matchnight"] }),
  d("beer", "Heineken", "Heineken", "Lager", "500ml can", 5, "Netherlands", 320,
    "1 0 1 0 0 4", "Light malt · Fruity hop · Crisp", {}),
  d("beer", "Savanna Dry Premium Cider", "Savanna", "Cider", "330ml", 6, "South Africa", 300,
    "2 0 4 0 0 5", "Dry apple · Citrus", { serve: "Ice-cold, with a wedge of lemon in the neck." }),

  /* ----------------------------------------------------------------- mixers */
  d("mixers", "Schweppes Indian Tonic Water", "Schweppes", "Tonic Water", "500ml", 0, "Kenya", 120,
    "2 0 1 0 0 4", "Quinine · Citrus", { tags: ["occasion:sundowner"] }),
  d("mixers", "Schweppes Soda Water", "Schweppes", "Soda Water", "500ml", 0, "Kenya", 110,
    "0 0 0 0 0 5", "Crisp bubbles", {}),
  d("mixers", "Coca-Cola", "Coca-Cola", "Cola", "2L", 0, "Kenya", 230,
    "5 0 1 1 0 2", "Classic cola", { tags: ["occasion:matchnight", "occasion:nyama"] }),
  d("mixers", "Stoney Tangawizi", "Stoney", "Ginger Beer", "500ml", 0, "Kenya", 110,
    "4 0 1 4 0 3", "Fiery ginger · Sweet", { tags: ["local"] }),
  d("mixers", "Schweppes Ginger Ale", "Schweppes", "Ginger Ale", "330ml can", 0, "Kenya", 100,
    "4 0 1 3 0 4", "Ginger · Light sweetness", { tags: ["occasion:nyama"] }),
  d("mixers", "Sprite", "Sprite", "Lemon-Lime Soda", "2L", 0, "Kenya", 230,
    "4 0 2 0 0 4", "Lemon · Lime · Crisp", { tags: ["occasion:office", "occasion:matchnight"] }),
  d("mixers", "Red Bull Energy Drink", "Red Bull", "Energy Drink", "250ml", 0, "Austria", 250,
    "5 0 2 0 0 2", "Sweet · Tart", {}),
  d("mixers", "Party Ice", "Liquor House", "Ice", "2kg bag", 0, "Nairobi", 200,
    "0 0 0 0 0 5", "Clear · Slow-melting",
    { tags: ["occasion:nyama", "occasion:office", "occasion:matchnight"], desc: "A 2kg bag of clear party ice, delivered frozen with your order." }),
];

export const DEMO_CATALOG: Drink[] = CELLAR.filter((d) => d.thumbnail);
