/**
 * The cocktail lab. Each ingredient names a shelf and, optionally, a preferred brand; the
 * page resolves it against whatever catalogue is live (demo or Medusa), so "Add the
 * bottles" keeps working when the shop's own range replaces the demo cellar.
 */
export type Glass = "rocks" | "highball" | "coupe" | "martini" | "flute" | "mug";

export interface Ingredient {
  label: string;
  /** Present when the ingredient is a bottle we sell. */
  shelf?: string;
  brand?: string;
}

export interface Cocktail {
  id: string;
  name: string;
  kicker: string;
  glass: Glass;
  colour: string;
  garnish: string;
  base: string;
  minutes: number;
  ingredients: Ingredient[];
  method: string[];
}

export const COCKTAILS: Cocktail[] = [
  {
    id: "dawa", name: "Dawa", kicker: "Nairobi's own medicine", glass: "rocks", colour: "#e9e3c8", garnish: "#9cc65a",
    base: "vodka", minutes: 3,
    ingredients: [
      { label: "60ml vodka", shelf: "vodka", brand: "Smirnoff" },
      { label: "1 lime, cut into wedges" },
      { label: "2 tsp honey on a dawa stick" },
      { label: "1 tbsp brown sugar" },
      { label: "Crushed ice", shelf: "mixers", brand: "Liquor House" },
    ],
    method: [
      "Muddle the lime wedges with the sugar in a rocks glass.",
      "Fill with crushed ice and pour over the vodka.",
      "Serve with the honey-coated stick — stir as you drink and the honey melts in.",
    ],
  },
  {
    id: "gin-tonic", name: "Sundowner G&T", kicker: "The balcony classic", glass: "highball", colour: "#dfeee9", garnish: "#7cb342",
    base: "gin", minutes: 2,
    ingredients: [
      { label: "50ml gin", shelf: "gin", brand: "Gordon's" },
      { label: "150ml tonic water", shelf: "mixers", brand: "Tonic" },
      { label: "Lime wedge or cucumber ribbon" },
      { label: "Plenty of ice", shelf: "mixers", brand: "Liquor House" },
    ],
    method: [
      "Fill a tall glass to the top with ice — more ice melts slower.",
      "Pour the gin, then the tonic down a bar spoon to keep the bubbles.",
      "Squeeze the lime, drop it in, stir once.",
    ],
  },
  {
    id: "whisky-ginger", name: "Jameson, Ginger & Lime", kicker: "The easy crowd-pleaser", glass: "highball", colour: "#d9a556", garnish: "#8bc34a",
    base: "whisky", minutes: 2,
    ingredients: [
      { label: "50ml Irish whiskey", shelf: "whisky", brand: "Jameson" },
      { label: "150ml ginger ale", shelf: "mixers", brand: "Ginger Ale" },
      { label: "Lime wedge" },
      { label: "Ice", shelf: "mixers", brand: "Liquor House" },
    ],
    method: ["Fill a highball with ice.", "Add the whiskey and top with ginger ale.", "Squeeze in the lime and stir."],
  },
  {
    id: "margarita", name: "Margarita", kicker: "Salt rim, late night", glass: "coupe", colour: "#e4e9a8", garnish: "#9ccc65",
    base: "tequila", minutes: 4,
    ingredients: [
      { label: "50ml blanco tequila", shelf: "tequila", brand: "Olmeca" },
      { label: "25ml fresh lime juice" },
      { label: "20ml triple sec or sugar syrup" },
      { label: "Salt for the rim" },
    ],
    method: [
      "Run a lime wedge around the rim and dip it in salt.",
      "Shake tequila, lime and triple sec hard with ice for ten seconds.",
      "Strain into the chilled glass.",
    ],
  },
  {
    id: "spritz", name: "Aperol Spritz", kicker: "Golden hour in a glass", glass: "flute", colour: "#f07a2c", garnish: "#ff9800",
    base: "liqueur", minutes: 2,
    ingredients: [
      { label: "75ml sparkling wine", shelf: "champagne", brand: "Le Roux" },
      { label: "50ml Aperol", shelf: "liqueur", brand: "Aperol" },
      { label: "Splash of soda water", shelf: "mixers", brand: "Soda Water" },
      { label: "Orange slice" },
    ],
    method: ["Fill a large wine glass with ice.", "Pour the sparkling wine, then the Aperol, then the soda.", "Garnish with orange."],
  },
  {
    id: "mojito", name: "Mojito", kicker: "Mint, lime, rum, repeat", glass: "highball", colour: "#e9f3df", garnish: "#43a047",
    base: "rum", minutes: 4,
    ingredients: [
      { label: "50ml white rum", shelf: "rum", brand: "Bacardí" },
      { label: "8 mint leaves" },
      { label: "½ lime and 2 tsp sugar" },
      { label: "Top with soda water", shelf: "mixers", brand: "Soda Water" },
    ],
    method: [
      "Gently press the mint with lime and sugar — bruise it, don't shred it.",
      "Fill with crushed ice, add the rum, top with soda.",
      "Churn with a spoon and garnish with a mint sprig.",
    ],
  },
  {
    id: "espresso-martini", name: "Espresso Martini", kicker: "The second wind", glass: "martini", colour: "#3a2216", garnish: "#c8a27a",
    base: "vodka", minutes: 4,
    ingredients: [
      { label: "40ml vodka", shelf: "vodka", brand: "Absolut" },
      { label: "25ml coffee liqueur", shelf: "liqueur", brand: "Kahlúa" },
      { label: "30ml fresh Kenyan espresso" },
      { label: "3 coffee beans" },
    ],
    method: [
      "Shake everything very hard with ice — the foam comes from the shake.",
      "Double-strain into a chilled martini glass.",
      "Float three beans on top.",
    ],
  },
  {
    id: "dark-stormy", name: "Cane & Stormy", kicker: "A Kenyan twist", glass: "mug", colour: "#b46a2a", garnish: "#cddc39",
    base: "rum", minutes: 2,
    ingredients: [
      { label: "50ml cane spirit", shelf: "rum", brand: "Kenya Cane" },
      { label: "Stoney Tangawizi", shelf: "mixers", brand: "Stoney" },
      { label: "Lime wedge" },
    ],
    method: ["Fill a copper mug with ice.", "Pour the Tangawizi, then float the cane spirit on top.", "Squeeze in the lime."],
  },
];
