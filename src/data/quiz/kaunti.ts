import type { Question } from "./types";

/**
 * Kaunti Gani? — all 47 counties: their parks, lakes, towns, landmarks, headquarters and
 * county numbers. Grouped by the old provinces so a game travels the whole country instead of
 * staying on the coast.
 */
const k = (topic: string, q: string, options: string[], answer: number, fact: string): Question => ({ topic, q, options, answer, fact });

export const KAUNTI: Question[] = [
  /* ----------------------------------------------------------------- coast */
  k("Coast", "Diani Beach is in which county?", ["Kwale", "Kilifi", "Mombasa", "Lamu"], 0, "Kwale — south coast, white sand and colobus monkeys."),
  k("Coast", "Shimba Hills National Reserve, home of the sable antelope, is in…", ["Kwale", "Taita-Taveta", "Kilifi", "Tana River"], 0, "Kwale — the only place in Kenya with sable antelope."),
  k("Coast", "Wasini Island and Kisite Marine Park are in…", ["Kwale", "Lamu", "Mombasa", "Kilifi"], 0, "Kwale, off Shimoni — dolphins and coral."),
  k("Coast", "Malindi and Watamu are in…", ["Mombasa", "Kwale", "Kilifi", "Tana River"], 2, "Kilifi County — so are the Gede Ruins."),
  k("Coast", "Arabuko Sokoke, the largest coastal forest left in East Africa, is in…", ["Kilifi", "Kwale", "Lamu", "Tana River"], 0, "Kilifi — home of the golden-rumped elephant shrew."),
  k("Coast", "Marafa's 'Hell's Kitchen' canyon is in…", ["Kilifi", "Baringo", "Turkana", "Lamu"], 0, "Kilifi — red and orange sandstone gorges inland from Malindi."),
  k("Coast", "Rabai, Kenya's first mission station, is in…", ["Kilifi", "Mombasa", "Kwale", "Lamu"], 0, "Kilifi County, just inland of Mombasa."),
  k("Coast", "Fort Jesus is in…", ["Lamu", "Mombasa", "Kilifi", "Kwale"], 1, "Mombasa — county number 001."),
  k("Coast", "Haller Park, a quarry turned into a nature park, is in…", ["Mombasa", "Kilifi", "Kwale", "Nairobi"], 0, "Mombasa, at Bamburi."),
  k("Coast", "Which is Kenya's smallest county by area?", ["Nairobi", "Mombasa", "Vihiga", "Kisumu"], 1, "Mombasa — about 220 km², mostly the island and its mainland."),
  k("Coast", "Lamu Old Town is in…", ["Tana River", "Kilifi", "Lamu", "Garissa"], 2, "Lamu County — a UNESCO World Heritage Site."),
  k("Coast", "The Takwa Ruins are on Manda Island, in…", ["Lamu", "Kilifi", "Kwale", "Mombasa"], 0, "Lamu County."),
  k("Coast", "Kenya's new LAPSSET port is being built at…", ["Lamu", "Malindi", "Kilifi", "Vanga"], 0, "Lamu — the Lamu Port–South Sudan–Ethiopia Transport corridor."),
  k("Coast", "Hola town is the headquarters of…", ["Tana River", "Garissa", "Lamu", "Isiolo"], 0, "Tana River County."),
  k("Coast", "The Tana River Primate Reserve, home of the red colobus, is in…", ["Tana River", "Lamu", "Kilifi", "Garissa"], 0, "Tana River County."),
  k("Coast", "Voi and the Taita Hills are in…", ["Makueni", "Kwale", "Taita-Taveta", "Kitui"], 2, "Taita-Taveta — misty forests above the Tsavo plains."),
  k("Coast", "Lake Chala, a crater lake on the Tanzanian border, is in…", ["Taita-Taveta", "Kajiado", "Kwale", "Makueni"], 0, "Taita-Taveta — half in Kenya, half in Tanzania."),

  /* --------------------------------------------------------- north eastern */
  k("North Eastern", "Dadaab refugee complex is in…", ["Garissa", "Turkana", "Wajir", "Mandera"], 0, "Garissa County."),
  k("North Eastern", "The Bour-Algi Giraffe Sanctuary is in…", ["Garissa", "Isiolo", "Marsabit", "Nakuru"], 0, "Garissa — a community sanctuary for the reticulated giraffe."),
  k("North Eastern", "Kenya, Ethiopia and Somalia meet at the corner of…", ["Mandera", "Wajir", "Marsabit", "Garissa"], 0, "Mandera — Kenya's far north-east corner."),
  k("North Eastern", "Habaswein and Bute are towns in…", ["Wajir", "Garissa", "Isiolo", "Mandera"], 0, "Wajir County."),
  k("North Eastern", "Garissa town sits on the banks of the…", ["Tana River", "Athi River", "Ewaso Ng'iro", "Nzoia"], 0, "The Tana."),
  k("North Eastern", "Which county is number 009?", ["Mandera", "Wajir", "Garissa", "Marsabit"], 0, "Mandera is 009. Garissa is 007 and Wajir 008."),

  /* ------------------------------------------------------------ eastern */
  k("Eastern", "The Chalbi Desert is in…", ["Turkana", "Wajir", "Marsabit", "Garissa"], 2, "Marsabit — Kenya's only true desert."),
  k("Eastern", "Sibiloi National Park and Koobi Fora are in…", ["Marsabit", "Turkana", "Samburu", "Isiolo"], 0, "Marsabit — on the east shore of Lake Turkana."),
  k("Eastern", "Shaba and Buffalo Springs national reserves are in…", ["Isiolo", "Samburu", "Meru", "Laikipia"], 0, "Isiolo. Samburu National Reserve is just across the Ewaso Ng'iro, in Samburu County."),
  k("Eastern", "Meru National Park, where Elsa the lioness of 'Born Free' lived, is in…", ["Meru", "Isiolo", "Tharaka-Nithi", "Embu"], 0, "Meru County."),
  k("Eastern", "The Njuri Ncheke shrine at Nchiru is in…", ["Meru", "Embu", "Tharaka-Nithi", "Kirinyaga"], 0, "Meru — the Ameru council of elders still meets there."),
  k("Eastern", "The Chogoria route up Mount Kenya starts in…", ["Tharaka-Nithi", "Meru", "Nyeri", "Kirinyaga"], 0, "Tharaka-Nithi — Chuka University is there too."),
  k("Eastern", "Embu town is the headquarters of…", ["Embu", "Kirinyaga", "Meru", "Kitui"], 0, "Embu County — on the southern slopes of Mount Kenya."),
  k("Eastern", "Mwingi town is in…", ["Kitui", "Machakos", "Embu", "Makueni"], 0, "Kitui County."),
  k("Eastern", "The Mui Basin coal deposits are in…", ["Kitui", "Makueni", "Taita-Taveta", "Machakos"], 0, "Kitui."),
  k("Eastern", "Konza Technopolis, Kenya's planned 'Silicon Savannah' city, is in…", ["Machakos", "Kajiado", "Kiambu", "Makueni"], 0, "Machakos County."),
  k("Eastern", "Machakos was the first upcountry headquarters of the IBEA Company, in…", ["1889", "1920", "1963", "1901"], 0, "1889 — Machakos is one of Kenya's oldest colonial towns."),
  k("Eastern", "Wote is the headquarters of…", ["Makueni", "Machakos", "Kitui", "Kajiado"], 0, "Makueni County."),
  k("Eastern", "The Chyulu Hills are partly in…", ["Makueni", "Nyeri", "Kericho", "Baringo"], 0, "Makueni (and Kajiado and Taita-Taveta) — young volcanic hills with lava caves."),
  k("Eastern", "Which county is number 012?", ["Meru", "Embu", "Isiolo", "Kitui"], 0, "Meru is 012. Isiolo is 011, Tharaka-Nithi 013, Embu 014."),

  /* ------------------------------------------------------------ central */
  k("Central", "Mukurwe wa Nyagathanga, the Agikuyu shrine of Gikuyu and Mumbi, is in…", ["Murang'a", "Nyeri", "Kiambu", "Kirinyaga"], 0, "Murang'a — the traditional birthplace of the Agikuyu."),
  k("Central", "Ndakaini Dam, which supplies most of Nairobi's water, is in…", ["Murang'a", "Kiambu", "Nyandarua", "Nairobi"], 0, "Murang'a, in Gatanga."),
  k("Central", "The Mwea rice irrigation scheme is in…", ["Kirinyaga", "Embu", "Murang'a", "Tana River"], 0, "Kirinyaga — Kenya's rice bowl."),
  k("Central", "Kerugoya is the headquarters of…", ["Kirinyaga", "Nyeri", "Embu", "Murang'a"], 0, "Kirinyaga County."),
  k("Central", "Baden-Powell, founder of the Scouts, is buried in…", ["Nyeri", "Nanyuki", "Nakuru", "Nairobi"], 0, "Nyeri — at St Peter's Church."),
  k("Central", "Treetops, where Princess Elizabeth became Queen in 1952, is in the Aberdares in…", ["Nyeri", "Nyandarua", "Murang'a", "Laikipia"], 0, "Nyeri County."),
  k("Central", "Lake Ol Bolossat, the only natural lake in the old Central Province, is in…", ["Nyandarua", "Nyeri", "Laikipia", "Kiambu"], 0, "Nyandarua — near Ol Kalou, the county headquarters."),
  k("Central", "Gatundu, Jomo Kenyatta's home, is in…", ["Kiambu", "Murang'a", "Nyeri", "Nairobi"], 0, "Kiambu County."),
  k("Central", "Thika town is in…", ["Kiambu", "Murang'a", "Machakos", "Nairobi"], 0, "Kiambu County."),
  k("Central", "Which county is number 022?", ["Kiambu", "Murang'a", "Nyeri", "Nakuru"], 0, "Kiambu is 022. Nyeri is 019, Kirinyaga 020, Murang'a 021."),

  /* -------------------------------------------------------- rift valley */
  k("Rift Valley", "Lodwar is the headquarters of…", ["Turkana", "Marsabit", "West Pokot", "Samburu"], 0, "Turkana County."),
  k("Rift Valley", "Kakuma refugee camp is in…", ["Turkana", "Garissa", "Marsabit", "West Pokot"], 0, "Turkana County."),
  k("Rift Valley", "Kenya first found oil, in 2012, near Lokichar in…", ["Turkana", "Lamu", "Marsabit", "Wajir"], 0, "Turkana — the South Lokichar basin."),
  k("Rift Valley", "Nariokotome, where 'Turkana Boy' was found, is in…", ["Turkana", "Marsabit", "Baringo", "Samburu"], 0, "Turkana — west of the lake."),
  k("Rift Valley", "Kapenguria, where Kenyatta and five others were tried, is the headquarters of…", ["West Pokot", "Trans Nzoia", "Baringo", "Turkana"], 0, "West Pokot County."),
  k("Rift Valley", "Maralal is the headquarters of…", ["Samburu", "Laikipia", "Isiolo", "Marsabit"], 0, "Samburu County — home of the Maralal camel derby."),
  k("Rift Valley", "Kitale town is in…", ["Bungoma", "Trans Nzoia", "West Pokot", "Uasin Gishu"], 1, "Trans Nzoia — Kenya's breadbasket country."),
  k("Rift Valley", "Saiwa Swamp National Park, home of the sitatunga, is in…", ["Trans Nzoia", "Kakamega", "Busia", "Nandi"], 0, "Trans Nzoia — Kenya's smallest national park."),
  k("Rift Valley", "Eldoret town is in…", ["Uasin Gishu", "Nandi", "Kericho", "Bungoma"], 0, "Uasin Gishu County."),
  k("Rift Valley", "Iten, the 'Home of Champions', is in…", ["Uasin Gishu", "Nandi", "Elgeyo-Marakwet", "Trans Nzoia"], 2, "Elgeyo-Marakwet — where Kenya's runners train at altitude."),
  k("Rift Valley", "The Kerio Valley runs through…", ["Elgeyo-Marakwet and Baringo", "Nakuru and Narok", "Kajiado and Makueni", "Meru and Isiolo"], 0, "Elgeyo-Marakwet and Baringo."),
  k("Rift Valley", "Kapsabet is the headquarters of…", ["Nandi", "Uasin Gishu", "Kericho", "Bomet"], 0, "Nandi County."),
  k("Rift Valley", "The Koitalel Samoei mausoleum is at Nandi Hills, in…", ["Nandi", "Kericho", "Uasin Gishu", "Baringo"], 0, "Nandi County."),
  k("Rift Valley", "Lake Bogoria and its geysers are in…", ["Baringo", "Nakuru", "Laikipia", "Samburu"], 0, "Baringo — flamingos and hot springs."),
  k("Rift Valley", "Kabarnet is the headquarters of…", ["Baringo", "Elgeyo-Marakwet", "Nakuru", "Samburu"], 0, "Baringo County."),
  k("Rift Valley", "Ol Pejeta Conservancy, home of the last northern white rhinos, is in…", ["Nyeri", "Laikipia", "Meru", "Isiolo"], 1, "Laikipia — Najin and Fatu live there."),
  k("Rift Valley", "Thomson's Falls, in Nyahururu, are in…", ["Laikipia", "Nyandarua", "Nakuru", "Nyeri"], 0, "Laikipia County."),
  k("Rift Valley", "Nanyuki, on the Equator at the foot of Mount Kenya, is in…", ["Laikipia", "Nyeri", "Meru", "Isiolo"], 0, "Laikipia County."),
  k("Rift Valley", "Menengai Crater is in…", ["Nakuru", "Narok", "Baringo", "Kajiado"], 0, "Nakuru — one of the largest calderas in the world."),
  k("Rift Valley", "Hell's Gate National Park, near Naivasha, is in…", ["Nakuru", "Narok", "Kiambu", "Nyandarua"], 0, "Nakuru County — cycle past the zebras."),
  k("Rift Valley", "Lake Elementaita is in…", ["Nakuru", "Baringo", "Narok", "Kajiado"], 0, "Nakuru County — one of three Rift Valley lakes on the World Heritage list."),
  k("Rift Valley", "Kariandusi, a stone-age site near Gilgil, is in…", ["Nakuru", "Nyandarua", "Laikipia", "Kajiado"], 0, "Nakuru County."),
  k("Rift Valley", "The Maasai Mara is in…", ["Kajiado", "Narok", "Nakuru", "Bomet"], 1, "Narok — home of the great wildebeest migration."),
  k("Rift Valley", "Amboseli, with Kilimanjaro behind the elephants, is in…", ["Kajiado", "Taita-Taveta", "Makueni", "Narok"], 0, "Kajiado — the classic elephant-and-Kili photo."),
  k("Rift Valley", "Lake Magadi, famous for soda ash, is in…", ["Kajiado", "Narok", "Nakuru", "Baringo"], 0, "Kajiado."),
  k("Rift Valley", "The Ngong Hills are in…", ["Kajiado", "Nairobi", "Kiambu", "Narok"], 0, "Kajiado — just outside Nairobi."),
  k("Rift Valley", "Olorgesailie prehistoric site is in…", ["Kajiado", "Nakuru", "Narok", "Makueni"], 0, "Kajiado."),
  k("Rift Valley", "Kericho is famous for…", ["Tea", "Sugar", "Rice", "Pineapples"], 0, "Tea — the green hills of Kenya's tea capital."),
  k("Rift Valley", "Tenwek Hospital is in…", ["Bomet", "Kericho", "Narok", "Nyamira"], 0, "Bomet County."),
  k("Rift Valley", "Which county is number 032?", ["Nakuru", "Narok", "Laikipia", "Kajiado"], 0, "Nakuru is 032. Laikipia is 031, Narok 033, Kajiado 034."),

  /* ------------------------------------------------------------- western */
  k("Western", "Kakamega Forest is in…", ["Vihiga", "Bungoma", "Kakamega", "Busia"], 2, "Kakamega — Kenya's last piece of Guineo-Congolian rainforest."),
  k("Western", "The Crying Stone of Ilesi is in…", ["Kakamega", "Vihiga", "Kisumu", "Bungoma"], 0, "Kakamega, by the Kisumu road."),
  k("Western", "Mumias, named after Nabongo Mumia, is in…", ["Kakamega", "Busia", "Bungoma", "Vihiga"], 0, "Kakamega County."),
  k("Western", "Kaimosi, where the Quakers opened a mission in 1902, is in…", ["Vihiga", "Nandi", "Kakamega", "Kisumu"], 0, "Vihiga County."),
  k("Western", "Webuye town is in…", ["Bungoma", "Kakamega", "Busia", "Trans Nzoia"], 0, "Bungoma County."),
  k("Western", "Chetambe Hill, site of the Bukusu resistance, is in…", ["Bungoma", "Kakamega", "Busia", "Trans Nzoia"], 0, "Bungoma, near Webuye."),
  k("Western", "The Malaba border crossing to Uganda is in…", ["Busia", "Bungoma", "Trans Nzoia", "Kakamega"], 0, "Busia County."),
  k("Western", "Which county is number 038?", ["Vihiga", "Kakamega", "Bungoma", "Busia"], 0, "Vihiga is 038. Kakamega is 037, Bungoma 039, Busia 040."),

  /* -------------------------------------------------------------- nyanza */
  k("Nyanza", "Kogelo, the ancestral home of Barack Obama's father, is in…", ["Siaya", "Kisumu", "Homa Bay", "Migori"], 0, "Siaya County."),
  k("Nyanza", "Got Ramogi, the first Luo settlement in Kenya, is in…", ["Siaya", "Homa Bay", "Kisumu", "Migori"], 0, "Siaya."),
  k("Nyanza", "Kit Mikayi, the giant balancing rock, is in…", ["Kisumu", "Siaya", "Homa Bay", "Vihiga"], 0, "Kisumu County, in Seme."),
  k("Nyanza", "The Kisumu Impala Sanctuary is on the shore of…", ["Lake Victoria", "Lake Naivasha", "Lake Baringo", "Lake Turkana"], 0, "Lake Victoria, in Kisumu."),
  k("Nyanza", "Ruma National Park, home of the roan antelope, is in…", ["Homa Bay", "Kisumu", "Migori", "Siaya"], 0, "Homa Bay — near Lake Victoria."),
  k("Nyanza", "Rusinga Island, with Tom Mboya's mausoleum, is in…", ["Homa Bay", "Siaya", "Kisumu", "Migori"], 0, "Homa Bay County."),
  k("Nyanza", "The rock art of Mfangano Island is in…", ["Homa Bay", "Migori", "Siaya", "Kisumu"], 0, "Homa Bay County."),
  k("Nyanza", "Thimlich Ohinga, the stone enclosures on the World Heritage list, is in…", ["Migori", "Homa Bay", "Kisii", "Siaya"], 0, "Migori County."),
  k("Nyanza", "The Macalder gold mines are in…", ["Migori", "Kakamega", "Siaya", "Kisii"], 0, "Migori County."),
  k("Nyanza", "Tabaka, famous for soapstone carving, is in…", ["Kisii", "Nyamira", "Migori", "Homa Bay"], 0, "Kisii County."),
  k("Nyanza", "Nyamira County is famous for…", ["Tea and bananas on green hills", "Sisal plantations", "Camel herding", "Coconuts"], 0, "Tea and bananas — it was split from Kisii."),
  k("Nyanza", "Which county is number 042?", ["Kisumu", "Siaya", "Homa Bay", "Kisii"], 0, "Kisumu is 042. Siaya is 041, Homa Bay 043, Migori 044, Kisii 045, Nyamira 046."),

  /* ------------------------------------------------------------- nairobi */
  k("Nairobi", "Nairobi is county number…", ["001", "022", "040", "047"], 3, "047 — the last of the 47 counties on the list."),
  k("Nairobi", "Nairobi National Park is special because…", ["It is the only national park inside a capital city", "It has no animals", "It is the oldest in Africa", "It is on the coast"], 0, "It's the world's only national park inside a capital city — lions with skyscrapers behind them."),
  k("Nairobi", "Uhuru Gardens, where the Kenyan flag was first raised, is in…", ["Nairobi", "Kiambu", "Machakos", "Kajiado"], 0, "Nairobi, off Lang'ata Road — at midnight on 12 December 1963."),
  k("Nairobi", "Kariokor market in Nairobi takes its name from…", ["The Carrier Corps of World War I", "A Maasai chief", "A railway engineer", "A river"], 0, "The Carrier Corps — the African porters of the First World War."),
];
