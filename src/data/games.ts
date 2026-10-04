/**
 * Games night: the words, questions and dares the four games use.
 *
 * Two rules every line here keeps, because this is an alcohol shop in Kenya:
 *  - Nothing tells anyone to drink. Kenyan law forbids promotions that encourage drinking, so
 *    Spin the Bottle's dares are songs, stories and dance moves, never shots.
 *  - Rewards are for SKILL only (guessing, pouring, knowing). A prize for a game of CHANCE is a
 *    prize competition and needs a gaming licence, so Spin the Bottle never pays out.
 */

export type GameId = "guess" | "pour" | "spin" | "trivia" | "history" | "sheng" | "headsup" | "wyr" | "methali" | "kaunti" | "bei" | "memory" | "chora";
export type GameKind = "quiz" | "party" | "skill";

export interface GameInfo {
  id: GameId;
  name: string;
  sw: string;
  line: string;
  /** The photograph on the game's card. */
  art: string;
  /** A bottle photo stands on the card; a scene photo (cover) fills it. */
  cover?: boolean;
  rewarded: boolean;
  /** Who it's for, shown on the card. */
  players?: string;
  /** For the games page's filters: quiz (maswali), party, skill (ujuzi). */
  kind: GameKind;
  /** A typical game, in minutes. */
  minutes: number;
  /** Plays with teams and pass-the-phone turns. */
  teams: boolean;
}

export const GAMES: GameInfo[] = [
  { id: "history", name: "Historia Yetu", sw: "Unajua story ya Kenya?", line: "Maswali za history ya 254 — primary na high school, from Turkana Boy to Katiba 2010. Uko sure unajua?", art: "/games/history.webp", cover: true, rewarded: true, kind: "quiz", minutes: 6, teams: true },
  { id: "sheng", name: "Unasema Sheng?", sw: "Uko na msamiati?", line: "Keja, mbogi, nduthi, luku. Tuone kama uko fiti na lugha ya mtaa.", art: "/games/sheng.webp", cover: true, rewarded: true, kind: "quiz", minutes: 5, teams: true },
  { id: "headsup", name: "Kichwa Juu", sw: "Simu kwa kichwa!", line: "Phone on your forehead, the mbogi acts it out. Matatu tout, smokie pasua, Kipchoge — guess fast.", art: "/games/headsup.webp", cover: true, rewarded: false, players: "3+ players", kind: "party", minutes: 10, teams: true },
  { id: "wyr", name: "Ungependa?", sw: "Chagua moja", line: "Githeri for a month or no chapo ever? Nairobi would-you-rather for the whole squad.", art: "/games/wyr.webp", cover: true, rewarded: false, players: "Any crowd", kind: "party", minutes: 15, teams: true },
  { id: "guess", name: "Guess the Bottle", sw: "Ni chupa gani?", line: "A bottle steps out of the dark. Name it before the light comes up.", art: "/bottles/tusker-lager-500ml.webp", rewarded: true, kind: "skill", minutes: 4, teams: true },
  { id: "pour", name: "Perfect Pour", sw: "Mimina sawa sawa", line: "Hold to pour, let go on the line. A barman's hand, or a beginner's?", art: "/bottles/kenya-cane-750ml.webp", rewarded: true, kind: "skill", minutes: 3, teams: true },
  { id: "trivia", name: "Bar Trivia", sw: "Unajua?", line: "Ten questions on Kenyan drinks, the bar and the bottle.", art: "/bottles/procera-blue-dot-gin-700ml.webp", rewarded: true, kind: "quiz", minutes: 5, teams: true },
  { id: "bei", name: "Bei Gani?", sw: "Ni pesa ngapi?", line: "A real bottle from the shelf — guess what it costs. Closest wins. Uko na macho ya bei?", art: "/bottles/johnnie-walker-black-label-750ml.webp", rewarded: true, kind: "skill", minutes: 5, teams: true },
  { id: "methali", name: "Methali", sw: "Maliza methali", line: "Haraka haraka… Mgeni njoo… Finish the Swahili proverb before the clock does.", art: "/games/methali.webp", cover: true, rewarded: true, kind: "quiz", minutes: 5, teams: true },
  { id: "kaunti", name: "Kaunti Gani?", sw: "Unaijua Kenya?", line: "All 47 counties — Mandera to Kwale, Kakuma to Kit Mikayi. Unajua ziko wapi?", art: "/games/kaunti.webp", cover: true, rewarded: true, kind: "quiz", minutes: 5, teams: true },
  { id: "memory", name: "Kumbukumbu", sw: "Kumbuka chupa", line: "Flip two, find the pair. Real bottles, sharp memory — a match keeps your turn.", art: "/bottles/hennessy-v-s-700ml.webp", rewarded: true, kind: "skill", minutes: 5, teams: true },
  { id: "chora", name: "Chora!", sw: "Chora, wapate", line: "Draw it on the phone, your team guesses before time's up. Matatu, twiga, ugali…", art: "/games/chora.webp", cover: true, rewarded: false, players: "2 teams", kind: "party", minutes: 15, teams: true },
  { id: "spin", name: "Spin the Bottle", sw: "Zungusha!", line: "Names round the table, a Tusker in the middle, a dare for whoever it picks.", art: "/bottles/white-cap-lager-500ml.webp", rewarded: false, players: "The whole table", kind: "party", minutes: 15, teams: false },
];

/**
 * The reward for a high score. ONE shop-wide code, so it is easy to run and easy to stop:
 * change it here, and create the SAME code in Medusa (Promotions) so the online checkout
 * accepts it. Over WhatsApp the code travels in the order message for the shop to apply.
 * Anyone can share a code, so cap its use in Medusa. Confirm the offer with the shop.
 */
export const REWARD = {
  code: "MCHEZO5", // confirm
  percent: 5, // confirm
  /** What counts as a high score in each rewarded game. */
  threshold: { guess: 70, pour: 85, trivia: 8, history: 8, sheng: 8, methali: 8, kaunti: 8, bei: 70, memory: 70 } as Partial<Record<GameId, number>>,
};

/** The games talk like a Nairobi bar: casual Sheng, not textbook Swahili. */
export const SAY = {
  right: ["Hapo sawa!", "Uko fiti!", "Noma sana!", "Umeweza!", "Safi kabisa!", "Iko poa!"],
  wrong: ["Aii, umekosa!", "Si hiyo!", "Wapi bana!", "Ah-ah, jaribu tena!"],
  timeUp: "Time imeisha!",
  win: "Hapo sawa — umeshinda!",
  close: "Karibu tu — almost!",
};

export const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ trivia */

import type { Question } from "./quiz/types";
export type { Question };
// The Kenya question banks live in ./quiz — big enough to deserve their own files.
export { HISTORY } from "./quiz/history";
export { SHENG } from "./quiz/sheng";
export { METHALI } from "./quiz/methali";
export { KAUNTI } from "./quiz/kaunti";

export const TRIVIA: Question[] = [
  { q: "Tusker beer is named after an elephant. Why?", options: ["It was brewed near Amboseli", "One of the brewery's founders was killed by an elephant", "Elephants were Kenya's national symbol in 1922", "The first crate was carried by an elephant"], answer: 1, fact: "Kenya Breweries was founded in 1922 by George and Charles Hurst. George was killed by an elephant while hunting, and the beer was named in his memory." },
  { q: "In what year was Tusker first brewed?", options: ["1922", "1945", "1963", "1978"], answer: 0, fact: "1922 — Tusker is older than independent Kenya by more than forty years." },
  { q: "What does 'dawa', the Nairobi cocktail, mean in Swahili?", options: ["Honey", "Medicine", "Lime", "Celebration"], answer: 1, fact: "Dawa means medicine. The vodka, lime and honey cocktail was made famous at the Carnivore restaurant in Nairobi." },
  { q: "Procera gin, distilled in Nairobi, is the first gin made with which juniper?", options: ["Italian juniper", "African juniper", "Himalayan juniper", "Scottish juniper"], answer: 1, fact: "Juniperus procera — the African pencil cedar, which grows in Kenya's highlands." },
  { q: "The mountain on the White Cap label is…", options: ["Kilimanjaro", "Mount Elgon", "Mount Kenya", "Mount Longonot"], answer: 2, fact: "Mount Kenya — the 'white cap' is its snow." },
  { q: "In Kenyan bar talk, a 'mzinga' is…", options: ["A shot", "A full bottle of spirits", "A crate of beer", "A cocktail shaker"], answer: 1, fact: "A mzinga is a full bottle — as in 'tulinunua mzinga moja'." },
  { q: "Amarula cream liqueur is made from the fruit of which tree?", options: ["Baobab", "Marula", "Mango", "Acacia"], answer: 1, fact: "The marula tree — elephants are famously fond of the fruit too." },
  { q: "What is the legal drinking age in Kenya?", options: ["16", "18", "21", "25"], answer: 1, fact: "18 — and TumaBoda riders check ID at the door." },
  { q: "Kenya Cane is a…", options: ["Sugar-cane spirit", "Rum from Jamaica", "Coffee liqueur", "Fruit wine"], answer: 0, fact: "A clean cane spirit, made in Kenya — the base of many a Nairobi night." },
  { q: "Which spirit is a margarita built on?", options: ["Gin", "White rum", "Tequila", "Vodka"], answer: 2, fact: "Tequila, with lime and orange liqueur — and salt on the rim." },
  { q: "What gives gin its main flavour?", options: ["Juniper", "Cucumber", "Coriander", "Orange peel"], answer: 0, fact: "By law, gin must taste predominantly of juniper. Everything else is a supporting act." },
  { q: "Champagne can only come from…", options: ["Anywhere in France", "The Champagne region of France", "Any sparkling-wine maker in Europe", "Reims distillery"], answer: 1, fact: "Only wine from the Champagne region may carry the name; elsewhere it is sparkling wine." },
  { q: "A 'single malt' Scotch is made…", options: ["From one barrel", "At one distillery, from malted barley", "From one harvest year", "With one type of oak"], answer: 1, fact: "One distillery, malted barley — it can still be a blend of many casks from that distillery." },
  { q: "Tequila is made from which plant?", options: ["Sugar cane", "Blue agave", "Cactus", "Maize"], answer: 1, fact: "Blue agave — and agave is a succulent, not a cactus." },
  { q: "Guinness sold in Kenya is…", options: ["Imported from Dublin", "Brewed in Kenya by Kenya Breweries", "Brewed in Uganda", "Only sold in cans"], answer: 1, fact: "Guinness Foreign Extra Stout is brewed right here by Kenya Breweries." },
  { q: "Baileys Irish Cream is a blend of cream and…", options: ["Irish whiskey", "Rum", "Brandy", "Vodka"], answer: 0, fact: "Irish whiskey and Irish dairy cream — which is why it belongs in the fridge once opened." },
  { q: "The mojito comes from…", options: ["Mexico", "Brazil", "Cuba", "Spain"], answer: 2, fact: "Havana, Cuba: white rum, mint, lime, sugar and soda." },
  { q: "Cognac is a brandy made from…", options: ["Apples", "Grapes", "Pears", "Plums"], answer: 1, fact: "Grapes, distilled twice in copper pot stills in the Cognac region of France." },
];

/* ------------------------------------------------------------- spin the bottle */

export const SPIN_NAMES = ["Wanjiku", "Otieno", "Achieng'", "Kamau", "Njeri", "Kiprop"];

/** Dares for whoever the bottle picks. None of them involve drinking; water always counts. */
export const DARES = [
  "Sing the chorus of a Sauti Sol song.",
  "Tell the table your wildest matatu story.",
  "Name five Nairobi estates in ten seconds.",
  "Show us your best Lipala move.",
  "Say something kind about the person on your left — in Sheng.",
  "You pick the next song. No arguments.",
  "Do your best Nairobi traffic-police impression.",
  "Teach everyone one word in your mother tongue.",
  "Name the best nyama choma spot you know, and defend it.",
  "Speak only Swahili until your next turn.",
  "Name three Kenyan athletes who have won Olympic gold.",
  "Get everyone who wants one a glass of water.",
  "Do the weather forecast for Nairobi, news-anchor style.",
  "Tell us the funniest thing a boda guy has ever said to you.",
  "Hum a song — first to guess it chooses the next dare.",
];

/* -------------------------------------------------------------- kichwa juu */

/** Words to act out or describe, by deck. Nothing about drinking. */
export const HEADSUP: Record<string, { name: string; words: string[] }> = {
  mtaa: {
    name: "Mtaa life",
    words: [
      "Matatu tout", "Boda boda", "Mama mboga", "Kanjo", "Nairobi traffic", "Watchie at the gate", "Fundi wa nguo", "Jua kali",
      "Kenya Power blackout", "Chama meeting", "Okoa Jahazi", "Fuliza", "Data bundles", "Landlord on the 5th", "Group chat",
      "Sunday church choir", "Rainy season", "Easter holiday traffic", "Uber driver", "M-Pesa agent", "Nganya with graffiti",
      "Mtumba market", "Gikomba", "Shoe shiner", "Hawker running from kanjo", "Water rationing", "Mkokoteni", "Kinyozi",
      "Salon on a Saturday", "Harambee fundraiser", "Wedding committee meeting", "Ruracio negotiations", "Funeral harambee",
      "Matatu stage", "SGR train", "Expressway toll", "Pothole", "Speed bump", "Traffic police roadblock", "KCPE results day",
      "Form One admission", "School fees", "Parents' day", "Boarding school shopping", "Mandazi kiosk", "Posho mill",
      "Chapati on Christmas", "December ocha", "Bus to shags", "Rooster at 4am", "Mosquito net", "Jerrican",
    ],
  },
  chakula: {
    name: "Chakula",
    words: [
      "Nyama choma", "Ugali", "Chapati", "Mandazi", "Githeri", "Smokie pasua", "Mutura", "Sukuma wiki", "Pilau", "Mukimo",
      "Samosa", "Bhajia", "Viazi karai", "Matoke", "Chips mayai", "Mahamri", "Tea with mandazi", "Fish from Lake Victoria",
      "Roasted maize", "Kachumbari", "Omena", "Managu", "Terere", "Kunde", "Mursik", "Uji", "Nduma", "Ngwaci",
      "Biryani", "Viazi vitamu", "Mshikaki", "Kaimati", "Mabuyu", "Madafu", "Mango with chilli", "Nyama ya mbuzi",
      "Wali wa nazi", "Matumbo", "Chapati na ndengu", "Mukimo na nyama", "Mutura and kachumbari", "Boiled eggs on a tray",
    ],
  },
  watu: {
    name: "Watu & places",
    words: [
      "Eliud Kipchoge", "Lupita Nyong'o", "Sauti Sol", "Wangari Maathai", "David Rudisha", "Faith Kipyegon", "KICC",
      "Maasai Mara", "Diani Beach", "Mount Kenya", "Lake Nakuru flamingos", "Wildebeest migration", "Safari Rally", "Rugby Sevens",
      "Uhuru Gardens", "Fort Jesus", "Lamu donkeys", "Hell's Gate", "Kakamega Forest", "Lake Turkana", "Ngong Hills",
      "Nairobi National Park", "Giraffe Centre", "Karura Forest", "Thomson's Falls", "Menengai Crater", "Iten runners",
      "Harambee Stars", "Kenya Sevens 'Shujaa'", "Catherine Ndereba", "Kip Keino", "Ferdinand Omanyala", "Mary Keitany",
    ],
  },
  mashujaa: {
    name: "Mashujaa & history",
    words: [
      "Dedan Kimathi", "Mekatilili wa Menza", "Koitalel arap Samoei", "Jomo Kenyatta", "Tom Mboya", "Jaramogi Oginga Odinga",
      "Wangari Maathai", "Harry Thuku", "Field Marshal Muthoni", "Waiyaki wa Hinga", "Nabongo Mumia", "Laibon Lenana",
      "The Lunatic Express", "Tsavo man-eaters", "Vasco da Gama", "Fort Jesus siege", "Kapenguria Six", "Mau Mau in the forest",
      "Raising the flag at midnight", "Lancaster House talks", "Kipande around the neck", "Swearing in a president",
      "Promulgating the constitution", "Casting your vote", "Madaraka Day parade", "Jamhuri Day fireworks", "The national anthem",
      "The coat of arms", "Turkana Boy", "Krapf at Rabai", "Swahili dhow trade", "Gedi ruins", "Saba Saba rally",
    ],
  },
  burudani: {
    name: "Burudani",
    words: [
      "Gengetone", "Rhumba", "Lipala dance", "Ohangla", "Benga", "Mugithi", "Taarab", "Bongo Flava", "Isukuti dance",
      "Sauti Sol's 'Suzanna'", "Nameless", "Jua Cali", "Nyashinski", "Khaligraph Jones", "Bien", "Otile Brown", "Nviiri",
      "Akothee", "Churchill Show", "Papa Shirandula", "Tahidi High", "Machachari", "Inspekta Mwala", "Vioja Mahakamani",
      "Real Househelps of Kawangware", "Kenyan TikTok dance", "Kenyan Twitter roast", "Mchongoano", "Choir competition",
      "Kenya Music Festival", "Drama festival", "Kenyan wedding dance-in", "Matatu music video", "Live band at a wedding",
    ],
  },
};

/* --------------------------------------------------------------- ungependa? */

export const WYR: [string, string][] = [
  ["Eat githeri every day for a month", "Never eat chapo again"],
  ["A matatu with loud mziki and no WiFi", "A quiet matatu with fast WiFi that takes twice as long"],
  ["Live in Kilimani with no fibre", "Live in Rongai with the fastest WiFi in Kenya"],
  ["Free Safaricom data for life", "Free Uber rides for a whole year"],
  ["Three hours in Thika Road traffic", "Walk from Westlands to town in the rain"],
  ["Go viral on TikTok for a dance fail", "Never go viral at all"],
  ["Only Gengetone for a year", "Only Rhumba for a year"],
  ["Lunch with Lupita Nyong'o", "A 10K run with Eliud Kipchoge"],
  ["A weekend in Diani", "A road trip to the Maasai Mara"],
  ["Your mathe reads your group chat for a day", "Your boss reads your DMs for a day"],
  ["Never use Fuliza again", "Never use Okoa Jahazi again"],
  ["Hike Ngong Hills at 5am", "Sleep in and miss the best view in Nairobi"],
  ["A chama that always pays out on time", "A landlord who never raises the rent"],
  ["Be the best dancer at every wedding", "Be the best singer in every choir"],
  ["Smokie pasua every day", "Mutura every day"],
  ["Lose your phone in a matatu", "Lose your ID the day before a job interview"],
  ["December ocha with no network", "December in Nairobi with nothing to do"],
  ["Be famous on Kenyan Twitter", "Be rich but nobody knows your name"],
  ["Speak only Sheng for a week", "Speak only English for a week"],
  ["Free pilau for life", "Free nyama choma every Sunday"],
  ["Live in Mombasa's heat", "Live in Limuru's cold"],
  ["Take the SGR to Mombasa", "Fly to Mombasa"],
  ["A house in Karen with a two-hour commute", "A bedsitter in town, ten minutes from everything"],
  ["Run the Nairobi marathon", "Climb Mount Kenya"],
  ["Plan the whole wedding committee", "Give the speech at the wedding"],
  ["Sit through a two-hour ruracio negotiation", "Cook for a hundred guests"],
  ["Read the news on TV", "Commentate a Harambee Stars match on radio"],
  ["Go back to boarding school for a term", "Go back to Standard One for a week"],
  ["Redo KCPE", "Redo KCSE"],
  ["Have Wangari Maathai's courage", "Have Kipchoge's discipline"],
  ["Be an MCA for a year", "Be a matatu driver for a year"],
  ["Ugali with no salt for a month", "Chai with no sugar for a month"],
  ["Live by the lake in Kisumu", "Live by the ocean in Lamu"],
  ["Spend Jamhuri Day at Uhuru Gardens", "Spend it at home with the family"],
  ["Ride a boda in the rain", "Wait an hour for a matatu in the sun"],
  ["Have your cousin as your boss", "Have your boss as your landlord"],
  ["Lose your WhatsApp chats", "Lose your photos"],
  ["Always arrive two hours early", "Always arrive on 'African time'"],
  ["Present the news in Kiswahili only", "Present the news in sheng only"],
  ["Know every methali", "Know every Sheng word ever"],
  ["Be the best rally driver at the Safari Rally", "Be the best runner in Iten"],
  ["Spend a night at Treetops", "Spend a night on a dhow off Lamu"],
  ["Never see a flamingo again", "Never see a giraffe again"],
  ["Have a chama of twelve close friends", "Have a chama of a hundred strangers"],
  ["Answer every call from your mathe", "Reply every text from your aunt's WhatsApp group"],
  ["Work from Nanyuki", "Work from Malindi"],
  ["Be stuck at a funeral harambee all day", "Be stuck at a wedding all night"],
  ["Have a perfect memory for history", "Have a perfect sense of direction in any town"],
];

/* ------------------------------------------------------------------- chora! */

/** Things to draw. Nothing about drinking. */
export const CHORA: string[] = [
  "Matatu", "Boda boda", "Twiga", "Ugali", "KICC", "Mount Kenya", "Flamingo", "Nyama choma", "Chapati",
  "Maasai shuka", "Kifaru (rhino)", "Coffee cup", "Tea leaves", "Sukuma wiki", "Mandazi", "Rally car",
  "Mwavuli (umbrella)", "Simu (phone)", "Kiondo basket", "Dhow", "Lion", "Mango", "Sufuria", "Jiko",
  "Football", "Running shoes", "Wedding cake", "Church", "Traffic jam", "Pineapple", "Elephant", "Zebra",
  "Baobab tree", "Fish", "Bus stop", "Gate & watchman", "Guitar", "Drum", "Sun over the savannah", "Rain cloud",
  "Kenyan flag", "Coat of arms", "Fort Jesus", "SGR train", "Lamu donkey", "Ngong Hills", "Equator sign", "Mkokoteni",
  "Posho mill", "Jerrican", "Mosquito net", "Wheelbarrow", "Coconut tree", "Cow", "Goat", "Kuku (chicken)",
  "Ugali and sukuma", "Samosa", "Roasted maize", "Chama meeting", "Ballot box", "Parliament", "Graduation cap",
  "School bus", "Tea picker", "Fishing boat on Lake Victoria", "Hot-air balloon over the Mara", "Wildebeest crossing",
  "Kipchoge winning", "Spear and shield", "Beaded necklace", "Pyramid", "Railway line", "Lighthouse", "Kinyozi chair",
];
