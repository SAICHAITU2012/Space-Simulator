// ─── Space History Timeline ──────────────────────────────────────────────────

export type TimelineEvent = {
  id: string;
  year: number;
  month?: number;
  day?: number;
  title: string;
  subtitle: string;
  emoji: string;
  country: string;
  flag: string;
  agencyId: string;
  category: "milestone" | "mission" | "disaster" | "discovery" | "technology";
  color: string;
  description: string;
  significance: string;   // one-liner impact
};

export const TIMELINE: TimelineEvent[] = [
  {
    id: "sputnik",
    year: 1957, month: 10, day: 4,
    title: "Sputnik 1 — First Satellite",
    subtitle: "The Space Age begins",
    emoji: "🛰️",
    country: "Soviet Union",
    flag: "🇷🇺",
    agencyId: "roscosmos",
    category: "milestone",
    color: "#b0c4ff",
    description: "The Soviet Union launched Sputnik 1, the first artificial Earth satellite. It was just 58cm in diameter and beeped a radio signal that anyone with a receiver could detect. The shock of a communist country being first in space triggered the Space Race.",
    significance: "Humanity's first step off Earth",
  },
  {
    id: "gagarin",
    year: 1961, month: 4, day: 12,
    title: "Yuri Gagarin — First Human in Space",
    subtitle: "Vostok 1 orbits Earth",
    emoji: "👨‍🚀",
    country: "Soviet Union",
    flag: "🇷🇺",
    agencyId: "roscosmos",
    category: "milestone",
    color: "#b0c4ff",
    description: "Cosmonaut Yuri Gagarin completed one orbit of Earth in 108 minutes aboard Vostok 1. His words 'Poyekhali!' (Let's go!) became iconic. He experienced 5g forces at launch. The world celebrated — both superpowers knew the psychological importance of this moment.",
    significance: "First human to reach space",
  },
  {
    id: "apollo11",
    year: 1969, month: 7, day: 20,
    title: "Apollo 11 — Moon Landing",
    subtitle: "One small step for man…",
    emoji: "🌕",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "milestone",
    color: "#4d7dff",
    description: "Neil Armstrong and Buzz Aldrin landed on the Sea of Tranquility while Michael Collins orbited above. Armstrong's first words: 'That's one small step for a man, one giant leap for mankind.' They collected 21.5 kg of lunar samples. The mission used 400,000 engineers and cost $28 billion (2024 dollars).",
    significance: "Greatest engineering achievement in human history",
  },
  {
    id: "voyager_launch",
    year: 1977, month: 9, day: 5,
    title: "Voyager 1 Launch",
    subtitle: "Grand Tour of the outer Solar System",
    emoji: "🛸",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "mission",
    color: "#4d7dff",
    description: "Voyager 1 launched on a trajectory to exploit a rare planetary alignment (once every 176 years). It would fly by Jupiter and Saturn before heading into interstellar space. A golden record carrying sounds of Earth — music, languages, and nature — was attached to communicate with potential extraterrestrial civilizations.",
    significance: "First spacecraft to leave the Solar System",
  },
  {
    id: "challenger",
    year: 1986, month: 1, day: 28,
    title: "Space Shuttle Challenger Disaster",
    subtitle: "7 crew lost — a day the world stood still",
    emoji: "💔",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "disaster",
    color: "#ff4d6d",
    description: "Challenger broke apart 73 seconds after launch due to an O-ring failure in cold weather. All 7 crew members were lost, including schoolteacher Christa McAuliffe. The disaster led to a 32-month shuttle suspension and fundamentally changed NASA's safety culture. The Rogers Commission found that NASA had known about O-ring risks.",
    significance: "Reshaped space safety standards globally",
  },
  {
    id: "hubble_launch",
    year: 1990, month: 4, day: 24,
    title: "Hubble Space Telescope Launch",
    subtitle: "Humanity's greatest eye in space",
    emoji: "🔭",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "technology",
    color: "#4dccff",
    description: "Hubble was deployed by Space Shuttle Discovery. It was initially embarrassing — the primary mirror had a 1/50th of a human hair flaw — but astronauts repaired it in 1993 in one of the most dramatic spacewalks in history. Since then, Hubble has made 1.5 million observations and permanently changed our understanding of the universe.",
    significance: "Determined the age and expansion rate of the universe",
  },
  {
    id: "mir_docking",
    year: 1995, month: 6, day: 29,
    title: "US-Russia Space Station Docking",
    subtitle: "Atlantis docks with Mir",
    emoji: "🤝",
    country: "International",
    flag: "🌍",
    agencyId: "nasa",
    category: "milestone",
    color: "#a0d8ff",
    description: "Space Shuttle Atlantis docked with Russia's Mir space station — the first time American and Russian spacecraft joined in orbit since the Apollo-Soyuz mission of 1975. This symbolic moment of Cold War rivals cooperating in space paved the way for the International Space Station.",
    significance: "Began an era of international space cooperation",
  },
  {
    id: "iss_first_crew",
    year: 2000, month: 11, day: 2,
    title: "ISS First Crew Arrives",
    subtitle: "Permanent human presence in space begins",
    emoji: "🏠",
    country: "International",
    flag: "🌍",
    agencyId: "nasa",
    category: "milestone",
    color: "#4d7dff",
    description: "Expedition 1 — Bill Shepherd (NASA) and Sergei Krikalev, Yuri Gidzenko (Roscosmos) — arrived at the ISS. Since that day in November 2000, there has not been a single moment when humans have not been in space. Humanity has had a permanent presence off Earth for over 24 years.",
    significance: "Humanity has lived in space continuously since 2000",
  },
  {
    id: "mars_opportunity",
    year: 2004, month: 1, day: 25,
    title: "Opportunity Rover Lands on Mars",
    subtitle: "90-day mission lasted 15 years",
    emoji: "🤖",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "mission",
    color: "#ff6b00",
    description: "Opportunity was designed for 90 days on Mars. It lasted 14 years and 136 days, traveling 45.16 km before a massive dust storm in 2018 cut off solar power. Its last transmission was nicknamed 'My battery is low and it is getting dark.' It discovered irrefutable evidence that Mars once had liquid water.",
    significance: "Proved Mars once had liquid water — and possibly life conditions",
  },
  {
    id: "spacex_falcon9_landing",
    year: 2015, month: 12, day: 21,
    title: "SpaceX Falcon 9 First Stage Landing",
    subtitle: "The moment reusable rockets became real",
    emoji: "🚀",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "spacex",
    category: "technology",
    color: "#a0ccff",
    description: "SpaceX landed the first orbital-class rocket booster at Cape Canaveral — something most aerospace experts thought was impossible. The rocket launched 11 satellites into orbit, then turned around, relit its engines, and landed upright. This changed the economics of space forever: launch costs dropped from $10,000/kg to under $2,000/kg.",
    significance: "Reduced space launch costs by ~80% — opened the new space age",
  },
  {
    id: "mangalyaan_mars",
    year: 2014, month: 9, day: 24,
    title: "Mangalyaan Enters Mars Orbit",
    subtitle: "India's 1st attempt to reach Mars succeeded",
    emoji: "🔴",
    country: "India",
    flag: "🇮🇳",
    agencyId: "isro",
    category: "milestone",
    color: "#ff9b00",
    description: "India's Mars Orbiter Mission became the first Asian country to reach Mars orbit, and the first space agency in the world to succeed on its maiden attempt. The entire mission cost $74 million — making it the cheapest Mars mission in history. Prime Minister Modi said: 'We have dared to reach out into the unknown.'",
    significance: "India became the 4th country to reach Mars — cheapest mission ever",
  },
  {
    id: "cassini_end",
    year: 2017, month: 9, day: 15,
    title: "Cassini's Grand Finale",
    subtitle: "Saturn mission ends after 13 years",
    emoji: "🪐",
    country: "USA/International",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "mission",
    color: "#ffd700",
    description: "After 13 years exploring Saturn, NASA intentionally plunged Cassini into Saturn's atmosphere to prevent contaminating moons Enceladus and Titan (which might harbor life) with Earth bacteria. Cassini discovered liquid water geysers on Enceladus, complex organics on Titan, and confirmed that Saturn's rings are a recent addition.",
    significance: "Discovered ocean worlds that might harbor life in our Solar System",
  },
  {
    id: "jwst_images",
    year: 2022, month: 7, day: 12,
    title: "James Webb Telescope First Images",
    subtitle: "Deepest view of the universe ever captured",
    emoji: "🌌",
    country: "USA/International",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "discovery",
    color: "#ffd700",
    description: "NASA released Webb's first deep field image — showing more galaxies in a patch of sky the size of a grain of sand held at arm's length than Hubble could in weeks of exposure. The furthest detected galaxies existed just 300 million years after the Big Bang. President Biden called it 'a new window into the history of our universe.'",
    significance: "Looked 13.5 billion years back in time — closer to the Big Bang than ever before",
  },
  {
    id: "chandrayaan3_landing",
    year: 2023, month: 8, day: 23,
    title: "Chandrayaan-3 Moon South Pole Landing",
    subtitle: "First-ever lunar south pole touchdown",
    emoji: "🌙",
    country: "India",
    flag: "🇮🇳",
    agencyId: "isro",
    category: "milestone",
    color: "#ff9b00",
    description: "India's Vikram lander touched down near the Moon's south pole at 6:04 PM IST on August 23, 2023 — just 4 days after Russia's Luna-25 failed in the same region. The Pragyan rover confirmed sulphur, oxygen, aluminium and calcium in lunar soil. The south pole is vital because its craters hold permanently frozen water ice — a future resource for human outposts.",
    significance: "First nation to land near the Moon's south pole — water ice confirmed region",
  },
  {
    id: "artemis1",
    year: 2022, month: 11, day: 16,
    title: "Artemis I Launch",
    subtitle: "Return to the Moon begins",
    emoji: "🚀",
    country: "USA",
    flag: "🇺🇸",
    agencyId: "nasa",
    category: "mission",
    color: "#4d7dff",
    description: "NASA's Space Launch System — the most powerful rocket ever built — launched the Orion capsule on an uncrewed test flight around the Moon. It traveled 1.3 million km, set a record for the greatest distance from Earth for a human-rated spacecraft, and returned safely. Artemis aims to land the first woman and first person of color on the Moon.",
    significance: "The most powerful rocket ever built — humanity's return to the Moon",
  },
  {
    id: "gaganyaan_tvd1",
    year: 2023, month: 10, day: 21,
    title: "Gaganyaan TV-D1 Crew Abort Test",
    subtitle: "India's crew module flies a pad-abort profile",
    emoji: "👨‍🚀",
    country: "India",
    flag: "🇮🇳",
    agencyId: "isro",
    category: "technology",
    color: "#ff9b00",
    description: "ISRO launched the Gaganyaan Test Vehicle Demonstration-1 from Sriharikota. The crew module separated, deployed parachutes, and splashed down in the Bay of Bengal — a key step toward human-rating India's orbital crew vehicle. Uncrewed orbital missions are planned before a crewed flight.",
    significance: "First in-flight abort demonstration for India's human spaceflight programme",
  },
  {
    id: "nisar_launch",
    year: 2025, month: 7, day: 30,
    title: "NISAR Launch",
    subtitle: "NASA–ISRO radar Earth observatory reaches orbit",
    emoji: "📡",
    country: "India / USA",
    flag: "🇮🇳",
    agencyId: "isro",
    category: "mission",
    color: "#ff9b00",
    description: "NISAR lifted off on GSLV-F16 carrying dual-frequency synthetic aperture radar from NASA (L-band) and ISRO (S-band). The mission maps ice, ecosystems, and crustal deformation through clouds every 12 days — a flagship partnership in Earth science.",
    significance: "Most advanced NASA–ISRO Earth-observation satellite to date",
  },
];

export type DecadeGroup = {
  decade: number;
  label: string;
  events: TimelineEvent[];
};

export function groupByDecade(events: TimelineEvent[]): DecadeGroup[] {
  const map: Record<number, TimelineEvent[]> = {};
  events.forEach(e => {
    const d = Math.floor(e.year / 10) * 10;
    if (!map[d]) map[d] = [];
    map[d].push(e);
  });
  return Object.entries(map)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([d, evs]) => ({
      decade: Number(d),
      label: `${d}s`,
      events: evs.sort((a, b) => a.year - b.year),
    }));
}
