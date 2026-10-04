import type { Question } from "./types";

/**
 * Unasema Sheng? — the everyday Sheng of Nairobi's estates: people, money, getting around,
 * feelings, food and the phrases you hear at every stage. Grouped by topic so a game moves
 * around. Nothing about drinking or drugs.
 */
const s = (topic: string, q: string, options: string[], answer: number, fact: string): Question => ({ topic, q, options, answer, fact });

export const SHENG: Question[] = [
  /* -------------------------------------------------------------- watu */
  s("Watu", "'Mbogi' ni nini?", ["A vegetable", "Your crew, your squad", "A matatu", "A fight"], 1, "Mbogi = the gang, your people."),
  s("Watu", "'Msee' ni…", ["An old man only", "A person, a guy", "A teacher", "A police officer"], 1, "Msee = a person. 'Wasee' = people. 'Msee wangu' = my guy."),
  s("Watu", "'Mathe' ni nani?", ["Your teacher", "Your mum", "Your sister", "Your landlord"], 1, "Mathe = mum. Usiambie mathe!"),
  s("Watu", "'Mzae' ni nani?", ["A baby", "A parent or an elder — often your dad", "A neighbour", "A shopkeeper"], 1, "Mzae = old man, parent. 'Wazae' = the parents."),
  s("Watu", "'Manzi' ni…", ["A girl, a young woman", "A mango", "A grandmother", "A teacher"], 0, "Manzi = a girl. So is 'dem' and 'mresh'."),
  s("Watu", "'Chali' ni…", ["A boy, a young man", "A chapati", "A chair", "A cheap phone"], 0, "Chali = a boy, a guy."),
  s("Watu", "'Beshte' wako ni…", ["Your best friend", "Your boss", "Your enemy", "Your cousin"], 0, "Beshte = best friend, from 'best'. 'Mabeshte' = the besties."),
  s("Watu", "'Mdosi' ni nani?", ["A doctor", "The boss", "A driver", "A thief"], 1, "Mdosi = the boss, the one with the money."),
  s("Watu", "Mtu akiitwa 'sonko', ako aje?", ["Broke", "Rich, loaded", "Lazy", "Tall"], 1, "Sonko = a rich person, a big spender."),
  s("Watu", "'Mtoi' ni…", ["A toy", "A child, a kid", "A pet", "A teenager's phone"], 1, "Mtoi = a kid. 'Watoi' = the kids."),
  s("Watu", "'Karao' ni akina nani?", ["Musicians", "Police officers", "Chefs", "Pastors"], 1, "Karao = police. Also 'sanse'."),
  s("Watu", "'Kanjo' ni akina nani?", ["Traffic police", "County askaris", "Bouncers", "Matatu touts"], 1, "Kanjo = the county council askaris — the hawkers' worst enemy."),
  s("Watu", "'Fala' ni…", ["A fool, a clueless person", "A farmer", "A friend", "A footballer"], 0, "Fala = a fool. Don't call your mdosi one."),
  s("Watu", "'Makanga' ni nani?", ["The matatu conductor", "The driver", "A passenger", "The owner"], 0, "Makanga = the conductor who collects fare and hangs off the door."),
  s("Watu", "'Dere' ni nani?", ["The driver", "A dancer", "A doctor", "A dealer"], 0, "Dere = driver, from 'dreva'."),
  s("Watu", "'Msupa' ni…", ["A supermarket", "A beautiful, stylish lady", "A soup", "A supervisor"], 1, "Msupa = a beautiful, well-put-together woman."),

  /* ---------------------------------------------------------- chapaa */
  s("Chapaa", "'Chapaa' ni…", ["Chapati", "Money", "A slap", "Food"], 1, "Chapaa = doh = ganji = mshiko = money."),
  s("Chapaa", "'Mbao' ni pesa ngapi?", ["Five bob", "Twenty bob", "Fifty bob", "A thousand"], 1, "Mbao = twenty shillings."),
  s("Chapaa", "'Thao' ni pesa ngapi?", ["A hundred", "Five hundred", "A thousand", "Ten thousand"], 2, "Thao = a thousand bob."),
  s("Chapaa", "'Soo' ni pesa ngapi?", ["A hundred bob", "A thousand bob", "Ten bob", "Fifty bob"], 0, "Soo = a hundred shillings."),
  s("Chapaa", "'Hamsa' ni pesa ngapi?", ["Fifty bob", "Five bob", "Five hundred", "Fifteen"], 0, "Hamsa = fifty shillings, from the Arabic for five."),
  s("Chapaa", "Ukisema 'nimesota', uko aje?", ["Full", "Broke", "Tired", "Late"], 1, "Kusota = to be broke. Mwisho wa mwezi, wote tumesota."),
  s("Chapaa", "'Mshiko' ni…", ["A handshake", "Money", "A grip on the matatu", "A phone"], 1, "Mshiko = money."),
  s("Chapaa", "'Kuomoka' means…", ["To get lost", "To make it — get rich", "To wake up", "To quit"], 1, "Kuomoka = to make it big. Sote tutaomoka."),
  s("Chapaa", "'Kutoboa' means…", ["To make a hole only", "To break through — succeed", "To fail", "To steal"], 1, "Kutoboa = to break through, to make it. 'Mwaka huu tunatoboa.'"),
  s("Chapaa", "'Hustle' yako ni…", ["Your side business, how you make money", "Your shoes", "Your girlfriend", "Your house"], 0, "Hustle = the grind, how you make your money."),

  /* ---------------------------------------------------------- mtaa */
  s("Mtaa", "Ukiambiwa 'twende keja', unaenda wapi?", ["To the club", "Home — your house", "To work", "To the stage"], 1, "Keja = house, home, your crib."),
  s("Mtaa", "'Ocha' ni wapi?", ["The office", "Upcountry — your rural home", "The beach", "The CBD"], 1, "Ocha = upcountry, shags, home for December."),
  s("Mtaa", "'Kanairo' ni wapi?", ["Kisumu", "Nairobi", "Mombasa", "Nakuru"], 1, "Kanairo = Nairobi. Also 'Nai'."),
  s("Mtaa", "'Nduthi' is a…", ["Motorbike", "Bicycle", "Taxi", "Bus"], 0, "Nduthi = motorbike, the boda boda you hop on."),
  s("Mtaa", "'Nganya' ni…", ["A boring bus", "A pimped-out matatu with graffiti and loud music", "A taxi", "A tuk-tuk"], 1, "Nganya = the flashy matatu with art, lights and a sound system."),
  s("Mtaa", "'Mat' ni…", ["A doormat", "A matatu", "A mattress", "A maths class"], 1, "Mat = matatu."),
  s("Mtaa", "'Ndai' ni…", ["A car", "A dinner", "A dance", "A day"], 0, "Ndai = a car, a ride."),
  s("Mtaa", "'Ghetto' yako ni…", ["Your estate, your hood", "A prison", "A market", "A school"], 0, "Ghetto = your estate, your mtaa."),
  s("Mtaa", "'Stage' ni…", ["Where matatus pick up passengers", "A concert", "A school class", "A football pitch"], 0, "Stage = the matatu stop."),

  /* ---------------------------------------------------- hisia & tabia */
  s("Hisia", "If you're 'boeka', you are…", ["Broke", "Bored", "Busy", "Hungry"], 1, "Kuboeka = to be bored. Ukiboeka, cheza Kichwa Juu."),
  s("Hisia", "If someone 'amejam', they are…", ["Stuck in traffic", "Annoyed, angry", "Asleep", "Excited"], 1, "Kujam = to get annoyed. 'Usinijamishe!'"),
  s("Hisia", "'Fiti' means…", ["Fit at the gym", "Fine, good, okay", "Tired", "Late"], 1, "Fiti = fine, sawa. 'Niko fiti' = I'm good."),
  s("Hisia", "Kitu ikiwa 'ngori', iko aje?", ["Easy", "Hard, risky — trouble", "Sweet", "Cheap"], 1, "Ngori = tough, trouble."),
  s("Hisia", "Kitu ikiwa 'noma', iko aje?", ["Bad only", "Intense — amazing or serious", "Boring", "Cheap"], 1, "Noma = intense, mad. 'Ngoma hii ni noma!' = this song is fire."),
  s("Hisia", "'Kubambika' means…", ["To be bored", "To have a great time, be excited", "To be broke", "To cry"], 1, "Kubambika = to have fun. 'Tulibambika!'"),
  s("Hisia", "'Kuhanya' means…", ["To work hard", "To cheat on your partner", "To run fast", "To cook"], 1, "Kuhanya = to cheat. 'Amehanyiwa' = they've been cheated on."),
  s("Hisia", "'Kutemwa' means…", ["To be bitten", "To be dumped", "To be promoted", "To be paid"], 1, "Kutemwa = to get dumped."),
  s("Hisia", "'Chizi' means…", ["Cheese", "Crazy", "Cheap", "Chilled"], 1, "Chizi = mad, crazy. 'Uko chizi!'"),
  s("Hisia", "Ukisema 'nimechomeka', uko aje?", ["You're in trouble, stuck", "You're sunburnt", "You're rich", "You're full"], 0, "Kuchomeka = to be caught out, in trouble."),
  s("Hisia", "'Kuboronga' means…", ["To mess up", "To build", "To sing", "To bargain"], 0, "Kuboronga = to mess something up. 'Umeboronga!'"),

  /* ------------------------------------------------------------ vitendo */
  s("Vitendo", "'Kudishi' means…", ["To wash dishes", "To eat", "To dance", "To sleep"], 1, "Kudishi = to eat. 'Tumedishi pilau.'"),
  s("Vitendo", "'Kubonga' means…", ["To talk, to chat", "To fight", "To sleep", "To run"], 0, "Kubonga = to talk. 'Tubonge' = let's talk."),
  s("Vitendo", "'Kucheki' means…", ["To check — to see", "To pay by cheque", "To chew", "To cheat"], 0, "Kucheki = to see, check. 'Tucheki baadaye' = see you later."),
  s("Vitendo", "'Kuhepa' means…", ["To help", "To leave, escape", "To hope", "To hide money"], 1, "Kuhepa = to bounce, to leave. 'Nimehepa' = I'm out."),
  s("Vitendo", "'Kudunda' means…", ["To dance, to party", "To fall", "To sleep", "To study"], 0, "Kudunda = to dance — to party."),
  s("Vitendo", "'Kupiga luku' means…", ["To look around", "To dress up sharp", "To take a photo", "To get lucky"], 1, "Luku = your look. Kupiga luku = to dress to impress."),
  s("Vitendo", "'Luku' yako iko fiti. What are they praising?", ["Your luck", "Your outfit, your look", "Your phone", "Your shoes only"], 1, "Luku = look, outfit. 'Ameweka luku!'"),
  s("Vitendo", "'Kukam' means…", ["To calm down", "To come", "To camp", "To cut"], 1, "Kukam = to come, from English. 'Kam hapa!'"),
  s("Vitendo", "'Kuchapa kazi' means…", ["To print a document", "To work hard", "To lose a job", "To fight at work"], 1, "Kuchapa kazi = to work, to grind."),
  s("Vitendo", "'Mchongoano' ni…", ["Playful roasting — 'your mama' style jokes", "A wedding song", "A church sermon", "A cooking style"], 0, "Mchongoano = the art of the roast. 'Wewe ni mfupi mpaka…'"),

  /* --------------------------------------------------------- maneno ya stage */
  s("Salamu", "'Niaje?' means…", ["How are you? What's up?", "Who are you?", "Where are you going?", "Are you hungry?"], 0, "Niaje? = what's up? Reply: 'Poa', 'Fiti' or 'Si mbaya'."),
  s("Salamu", "'Rada ni gani?' means…", ["What's the plan?", "Where's the radio?", "How old are you?", "Who's paying?"], 0, "Rada = the plan, the vibe."),
  s("Salamu", "'Form ni gani?' means…", ["Which school form are you in?", "What's the plan for today?", "Fill in the form", "What's your shape?"], 1, "Form = the plan, what's happening. 'Form ni gani leo?'"),
  s("Salamu", "Mtu akisema 'Maze!', anaongea na…", ["A friend — 'man!', 'bro!'", "A maze puzzle", "Their mum", "Their boss"], 0, "Maze = man, bro. 'Maze, uko wapi?'"),
  s("Salamu", "'Stori ni gani?' means…", ["What's the news, what's happening?", "Read me a story", "Which floor?", "Where's the store?"], 0, "Stori = news, gossip, what's going on."),
  s("Salamu", "'Ngware' ni…", ["Early morning", "Late at night", "Lunchtime", "Weekend"], 0, "Ngware = early. 'Nitakuja ngware.'"),
  s("Salamu", "'Mavitu' ni…", ["Stuff, things", "Vitamins", "Victories", "Vegetables"], 0, "Mavitu = stuff, things — big things."),
  s("Salamu", "'Ngoma' in Sheng usually means…", ["A song, a tune", "A drum only", "A dance competition", "A wedding"], 0, "Ngoma = a song. 'Hii ngoma ni noma!'"),
];
