// ─── Space Agency Data ───────────────────────────────────────────────────────
// "Humanity's entire presence in space" — not just NASA

export type Agency = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  color: string;           // brand accent color
  founded: number;
  hq: string;
  budget: string;          // annual budget (approx)
  launches: number;        // total launches
  activeSats: number;      // active satellites
  humans: number;          // humans launched
  crewed: boolean;
  tagline: string;
  story: string;
  achievements: string[];
  website: string;
};

export const AGENCIES: Agency[] = [
  {
    id: "nasa",
    name: "National Aeronautics and Space Administration",
    shortName: "NASA",
    country: "United States",
    flag: "🇺🇸",
    color: "#4d7dff",
    founded: 1958,
    hq: "Washington D.C., USA",
    budget: "$24.9 billion",
    launches: 430,
    activeSats: 68,
    humans: 360,
    crewed: true,
    tagline: "For the Benefit of All",
    story:
      "Founded in 1958 after Sputnik, NASA has led humanity's most ambitious space endeavours — from the Moon landings to the Hubble Space Telescope, Mars rovers, and the James Webb Space Telescope peering 13 billion years back in time.",
    achievements: ["Moon landing (1969)", "Hubble Space Telescope", "Mars Perseverance Rover", "James Webb Space Telescope", "Voyager interstellar mission"],
    website: "nasa.gov",
  },
  {
    id: "isro",
    name: "Indian Space Research Organisation",
    shortName: "ISRO",
    country: "India",
    flag: "🇮🇳",
    color: "#ff9b00",
    founded: 1969,
    hq: "Bengaluru, India",
    budget: "$1.7 billion",
    launches: 94,
    activeSats: 53,
    humans: 0,
    crewed: false,
    tagline: "Space Technology in Service of Humanity",
    story:
      "ISRO is one of the world's most cost-effective space agencies. It achieved Mars orbit on its first attempt (Mangalyaan, 2014) and made history with Chandrayaan-3 successfully landing near the Moon's south pole in 2023 — a world first. The Aditya-L1 solar observatory launched the same year.",
    achievements: ["Chandrayaan-3 Moon south pole landing", "Mangalyaan Mars orbit (1st attempt)", "Aditya-L1 solar observatory", "NavIC navigation system", "100+ satellite launches on PSLV"],
    website: "isro.gov.in",
  },
  {
    id: "esa",
    name: "European Space Agency",
    shortName: "ESA",
    country: "Europe (22 nations)",
    flag: "🇪🇺",
    color: "#4dccff",
    founded: 1975,
    hq: "Paris, France",
    budget: "$9.5 billion",
    launches: 120,
    activeSats: 22,
    humans: 22,
    crewed: true,
    tagline: "Inspiring Europe, Discovering Our Planet and Universe",
    story:
      "ESA unifies 22 European nations in space exploration. From the Ariane rocket family to the Rosetta comet orbiter, ExoMars rover, and co-operation aboard the ISS, ESA punches above its weight and plays a critical role in Earth observation, science, and navigation.",
    achievements: ["Rosetta/Philae comet mission", "Huygens Titan landing", "Gaia star mapping", "Copernicus Earth observation", "ISS Columbus module"],
    website: "esa.int",
  },
  {
    id: "jaxa",
    name: "Japan Aerospace Exploration Agency",
    shortName: "JAXA",
    country: "Japan",
    flag: "🇯🇵",
    color: "#ff4d6d",
    founded: 2003,
    hq: "Tokyo, Japan",
    budget: "$2.0 billion",
    launches: 52,
    activeSats: 18,
    humans: 14,
    crewed: true,
    tagline: "Reaching for the Skies, Exploring the Universe",
    story:
      "JAXA is renowned for precision engineering. The Hayabusa missions returned asteroid samples to Earth — a world first. JAXA developed HTV cargo spacecraft for the ISS and the H-IIA/H3 launch vehicles, and collaborates on NASA's Artemis program with the Gateway lunar station.",
    achievements: ["Hayabusa asteroid sample return", "Kaguya lunar orbiter", "HTV ISS supply ships", "SLIM lunar landing (2024)", "Artemis Gateway module"],
    website: "jaxa.jp",
  },
  {
    id: "cnsa",
    name: "China National Space Administration",
    shortName: "CNSA",
    country: "China",
    flag: "🇨🇳",
    color: "#ff3a3a",
    founded: 1993,
    hq: "Beijing, China",
    budget: "$11.9 billion",
    launches: 350,
    activeSats: 541,
    humans: 21,
    crewed: true,
    tagline: "Innovation, Exploration, Cooperation, Sharing",
    story:
      "China has rapidly become a major space power. It operates the Tiangong Space Station, landed the Zhurong rover on Mars, and the Chang'e missions achieved lunar farside landing (Chang'e-4, 2019) and sample return (Chang'e-5, 2020). China's BeiDou navigation system provides global coverage.",
    achievements: ["Tiangong Space Station", "Zhurong Mars rover", "Chang'e-4 Moon farside landing", "Chang'e-5 Moon sample return", "BeiDou global navigation"],
    website: "cnsa.gov.cn",
  },
  {
    id: "roscosmos",
    name: "Roscosmos State Corporation",
    shortName: "Roscosmos",
    country: "Russia",
    flag: "🇷🇺",
    color: "#b0c4ff",
    founded: 1992,
    hq: "Moscow, Russia",
    budget: "$2.7 billion",
    launches: 1500,
    activeSats: 174,
    humans: 125,
    crewed: true,
    tagline: "Opening New Paths to Space",
    story:
      "Roscosmos inherits the legacy of the Soviet space programme — humanity's first satellite, first human in space, and first spacewalk. The Soyuz rocket is the world's most-launched orbital rocket. Russia maintains its ISS partnership and operates the GLONASS navigation system.",
    achievements: ["Sputnik — first satellite (1957)", "Yuri Gagarin — first human in space (1961)", "Mir Space Station", "Soyuz — most flown rocket", "GLONASS navigation"],
    website: "roscosmos.ru",
  },
  {
    id: "spacex",
    name: "Space Exploration Technologies Corp.",
    shortName: "SpaceX",
    country: "USA (Private)",
    flag: "🚀",
    color: "#a0ccff",
    founded: 2002,
    hq: "Hawthorne, California, USA",
    budget: "$9.0B+ revenue",
    launches: 370,
    activeSats: 6700,
    humans: 18,
    crewed: true,
    tagline: "Making Life Multi-Planetary",
    story:
      "Founded by Elon Musk, SpaceX revolutionized access to space with reusable Falcon 9 rockets, reducing launch costs by ~90%. Crew Dragon carries astronauts to the ISS. The Starship mega-rocket is designed for Mars. Starlink operates the world's largest satellite internet constellation.",
    achievements: ["First private crewed orbital spacecraft (Crew Dragon)", "Reusable Falcon 9 landing", "Starlink 6700+ satellite constellation", "Starship — largest rocket ever built", "Dragon ISS cargo & crew missions"],
    website: "spacex.com",
  },
  {
    id: "ksa",
    name: "Korea Aerospace Research Institute",
    shortName: "KARI",
    country: "South Korea",
    flag: "🇰🇷",
    color: "#ff6b9d",
    founded: 1989,
    hq: "Daejeon, South Korea",
    budget: "$0.7 billion",
    launches: 12,
    activeSats: 6,
    humans: 1,
    crewed: false,
    tagline: "Korea's Space Dream",
    story:
      "KARI launched South Korea's first domestically developed rocket Nuri (KSLV-II) in 2022. The Danuri lunar orbiter reached Moon orbit in 2022, making Korea the 7th country to reach the Moon. South Korea aims for a lunar lander mission by 2030.",
    achievements: ["Nuri (KSLV-II) domestic rocket", "Danuri lunar orbiter (2022)", "Korea's first astronaut (2008)", "KOMPSAT Earth observation series", "Lunar lander planned 2030"],
    website: "kari.re.kr",
  },
  {
    id: "uaesa",
    name: "UAE Space Agency",
    shortName: "UAE Space",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    color: "#4dff99",
    founded: 2014,
    hq: "Abu Dhabi, UAE",
    budget: "$0.5 billion",
    launches: 4,
    activeSats: 3,
    humans: 2,
    crewed: false,
    tagline: "Reaching Beyond Our Limits",
    story:
      "The UAE became only the fifth country to reach Mars orbit with the Hope Probe (2021) — the Arab world's first interplanetary mission. The Emirates Mars Mission returned the most detailed global view of Martian weather ever produced. The UAE has now sent two of its own astronauts to the ISS.",
    achievements: ["Hope Probe — Mars orbit (2021)", "First Arab interplanetary mission", "UAE astronaut Hazzaa Al Mansoori (2019)", "Emirates Mission to the Asteroid Belt (2027)", "Khalifa Sat Earth observation"],
    website: "space.gov.ae",
  },
  {
    id: "isas",
    name: "Israel Space Agency",
    shortName: "ISA",
    country: "Israel",
    flag: "🇮🇱",
    color: "#4d99ff",
    founded: 1983,
    hq: "Jerusalem, Israel",
    budget: "$0.16 billion",
    launches: 11,
    activeSats: 9,
    humans: 1,
    crewed: false,
    tagline: "Small Country, Big Space Dreams",
    story:
      "Israel is one of the few countries to achieve orbital launches from its own territory. The Beresheet lunar lander (2019) was the first privately funded Moon mission attempt. OFEQ spy satellites are launched westward — opposite most launches — due to political geography.",
    achievements: ["Beresheet — first private Moon mission attempt", "Westward-launch orbital capability", "OFEQ reconnaisance satellites", "Amos communication satellites", "Ilan Ramon — first Israeli astronaut"],
    website: "space.gov.il",
  },
];

export const AGENCY_BY_ID: Record<string, Agency> = Object.fromEntries(
  AGENCIES.map(a => [a.id, a])
);
