export type Planet = {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  color: string;
  gradientColors: [string, string];
  visualRadius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  // Real physical values
  massKg: number;       // kg
  radiusKm: number;     // km
  distanceAU: number;   // AU from Sun
  gravity: number;      // relative to Earth = 1
  moons: number;
  day: string;
  year: string;
  temperature: number;  // avg surface °C
  atmosphere: string;
  ring?: boolean;
  fact: string;
  funFacts: [string, string, string];
  namedFor: string;
  discoveredBy: string;
  discovery: string;
  missions: string[];
  upcomingMissions: string[];
  organizations: string[];
  links: Array<{ label: string; url: string }>;
};

// Physical constants
export const G = 6.6743e-11; // N·m²/kg²
export const EARTH_MASS = 5.972e24; // kg
export const EARTH_RADIUS = 6371000; // m

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    nickname: "The Tiny Speed Runner",
    emoji: "🔘",
    color: "#b8a99a",
    gradientColors: ["#3d2e27", "#1a1410"],
    visualRadius: 0.55,
    orbitRadius: 6,
    orbitSpeed: 0.82,
    rotationSpeed: 0.7,
    massKg: 3.285e23,
    radiusKm: 2440,
    distanceAU: 0.387,
    gravity: 0.38,
    moons: 0,
    day: "59 Earth days",
    year: "88 days",
    temperature: 167,
    atmosphere: "Trace — exosphere only",
    fact: "Mercury races around the Sun faster than any other planet, but one day there lasts almost two Mercury years.",
    funFacts: [
      "Despite being closest to the Sun, Mercury is NOT the hottest planet — Venus is.",
      "Mercury has water ice hidden in permanently shadowed craters at its poles.",
      "A year on Mercury is only 88 Earth days — shorter than its own day of 176 Earth days of sunlight."
    ],
    namedFor: "The Roman messenger god, because Mercury moves quickly across the sky.",
    discoveredBy: "Known since ancient times",
    discovery: "Mercury is visible without a telescope, so no single discoverer is credited.",
    missions: ["Mariner 10", "MESSENGER", "BepiColombo"],
    upcomingMissions: ["BepiColombo Mercury orbit science phase"],
    organizations: ["NASA", "ESA", "JAXA"],
    links: [
      { label: "NASA Mercury", url: "https://science.nasa.gov/mercury/" },
      { label: "ESA BepiColombo", url: "https://www.esa.int/Science_Exploration/Space_Science/BepiColombo" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mercury_(planet)" }
    ]
  },
  {
    id: "venus",
    name: "Venus",
    nickname: "The Cloud Furnace",
    emoji: "🌕",
    color: "#e0b56e",
    gradientColors: ["#4a3010", "#1e1208"],
    visualRadius: 0.92,
    orbitRadius: 9,
    orbitSpeed: 0.6,
    rotationSpeed: -0.24,
    massKg: 4.867e24,
    radiusKm: 6052,
    distanceAU: 0.723,
    gravity: 0.9,
    moons: 0,
    day: "243 Earth days",
    year: "225 days",
    temperature: 464,
    atmosphere: "CO₂ 96%, Nitrogen 3.5%",
    fact: "Venus spins backward and is hotter than Mercury because its thick atmosphere traps heat like a blanket.",
    funFacts: [
      "A day on Venus is longer than its year — it's the only planet where this is true.",
      "Venus rotates in the opposite direction to most planets — the Sun rises in the west.",
      "The atmospheric pressure on Venus is 90× that of Earth — like being 900m underwater."
    ],
    namedFor: "The Roman goddess of love and beauty, because Venus appears bright and beautiful in the sky.",
    discoveredBy: "Known since ancient times",
    discovery: "Venus is one of the brightest objects in the night sky and has been observed by many ancient cultures.",
    missions: ["Venera", "Magellan", "Akatsuki", "Parker Solar Probe flybys"],
    upcomingMissions: ["NASA DAVINCI", "NASA VERITAS", "ESA EnVision"],
    organizations: ["NASA", "ESA", "JAXA", "Soviet space program"],
    links: [
      { label: "NASA Venus", url: "https://science.nasa.gov/venus/" },
      { label: "ESA EnVision", url: "https://www.esa.int/Science_Exploration/Space_Science/EnVision" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Venus" }
    ]
  },
  {
    id: "earth",
    name: "Earth",
    nickname: "The Ocean World",
    emoji: "🌍",
    color: "#3d8cff",
    gradientColors: ["#0a2d6e", "#041428"],
    visualRadius: 1,
    orbitRadius: 12,
    orbitSpeed: 0.5,
    rotationSpeed: 1.3,
    massKg: 5.972e24,
    radiusKm: 6371,
    distanceAU: 1.0,
    gravity: 1.0,
    moons: 1,
    day: "24 hours",
    year: "365 days",
    temperature: 15,
    atmosphere: "Nitrogen 78%, Oxygen 21%",
    fact: "Earth is the only known planet with liquid oceans on the surface and life everywhere — from clouds to deep sea vents.",
    funFacts: [
      "Earth spins at about 1,670 km/h at the equator — faster than a bullet.",
      "The Moon stabilizes Earth's axial tilt, keeping our climate steady for life.",
      "Earth's magnetic field shields us from deadly solar radiation every single second."
    ],
    namedFor: "The English/Germanic word for ground or soil; unlike other planets, Earth is not named after a Roman god.",
    discoveredBy: "Our home world",
    discovery: "Earth was recognized as a planet through centuries of astronomy, especially the heliocentric model.",
    missions: ["ISS", "Landsat", "Sentinel", "INSAT", "NISAR", "Hubble"],
    upcomingMissions: ["NISAR operations", "EarthCARE", "future climate and weather satellites"],
    organizations: ["NASA", "ISRO", "ESA", "JAXA", "CNSA", "SpaceX"],
    links: [
      { label: "NASA Earth", url: "https://science.nasa.gov/earth/" },
      { label: "NASA ISS", url: "https://www.nasa.gov/international-space-station/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Earth" }
    ]
  },
  {
    id: "mars",
    name: "Mars",
    nickname: "The Red Planet",
    emoji: "🔴",
    color: "#df6848",
    gradientColors: ["#5c2010", "#200a04"],
    visualRadius: 0.76,
    orbitRadius: 15.5,
    orbitSpeed: 0.4,
    rotationSpeed: 1.2,
    massKg: 6.39e23,
    radiusKm: 3390,
    distanceAU: 1.524,
    gravity: 0.38,
    moons: 2,
    day: "24h 37m",
    year: "687 days",
    temperature: -65,
    atmosphere: "CO₂ 95%, Argon 1.9%",
    fact: "Mars has the tallest volcano in the Solar System — Olympus Mons — three times the height of Mount Everest.",
    funFacts: [
      "Olympus Mons on Mars is so wide that you couldn't see its edges standing at the center.",
      "Mars has two tiny potato-shaped moons: Phobos and Deimos.",
      "Sunsets on Mars are blue because of how dust scatters light in the thin atmosphere."
    ],
    namedFor: "The Roman god of war, inspired by its red color.",
    discoveredBy: "Known since ancient times",
    discovery: "Mars has been tracked by ancient astronomers for thousands of years because of its red color and wandering motion.",
    missions: ["Viking", "Pathfinder", "Spirit", "Opportunity", "Curiosity", "Perseverance", "Mangalyaan", "Tianwen-1", "Hope Probe"],
    upcomingMissions: ["Mars Sample Return concepts", "ExoMars Rosalind Franklin"],
    organizations: ["NASA", "ISRO", "ESA", "CNSA", "UAE Space Agency"],
    links: [
      { label: "NASA Mars", url: "https://science.nasa.gov/mars/" },
      { label: "ISRO Mangalyaan", url: "https://www.isro.gov.in/MarsOrbiterMissionSpacecraft.html" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mars" }
    ]
  },
  {
    id: "jupiter",
    name: "Jupiter",
    nickname: "The Storm Giant",
    emoji: "🟠",
    color: "#d9a66f",
    gradientColors: ["#4a2e0e", "#1c0f04"],
    visualRadius: 2.05,
    orbitRadius: 23,
    orbitSpeed: 0.2,
    rotationSpeed: 1.8,
    massKg: 1.898e27,
    radiusKm: 69911,
    distanceAU: 5.203,
    gravity: 2.53,
    moons: 95,
    day: "10 hours",
    year: "12 years",
    temperature: -110,
    atmosphere: "Hydrogen 90%, Helium 10%",
    fact: "Jupiter is so massive it protects the inner Solar System by tugging many comets and asteroids off course.",
    funFacts: [
      "Jupiter's Great Red Spot is a storm that has been raging for over 350 years.",
      "Jupiter's moon Ganymede is larger than the planet Mercury.",
      "If Jupiter were about 80× more massive, it could have become a star."
    ],
    namedFor: "The king of the Roman gods, matching Jupiter's giant size.",
    discoveredBy: "Known since ancient times",
    discovery: "Jupiter is bright enough to see without a telescope. Galileo discovered its four largest moons in 1610.",
    missions: ["Pioneer 10", "Voyager 1", "Voyager 2", "Galileo", "Juno"],
    upcomingMissions: ["Europa Clipper", "ESA JUICE"],
    organizations: ["NASA", "ESA"],
    links: [
      { label: "NASA Jupiter", url: "https://science.nasa.gov/jupiter/" },
      { label: "NASA Europa Clipper", url: "https://science.nasa.gov/mission/europa-clipper/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Jupiter" }
    ]
  },
  {
    id: "saturn",
    name: "Saturn",
    nickname: "The Ring World",
    emoji: "🪐",
    color: "#e5c98d",
    gradientColors: ["#4a3a0a", "#1a1504"],
    visualRadius: 1.7,
    orbitRadius: 30,
    orbitSpeed: 0.14,
    rotationSpeed: 1.55,
    massKg: 5.683e26,
    radiusKm: 58232,
    distanceAU: 9.537,
    gravity: 1.07,
    moons: 146,
    day: "11 hours",
    year: "29 years",
    temperature: -140,
    atmosphere: "Hydrogen 96%, Helium 3%",
    ring: true,
    fact: "Saturn's rings are made from ice and rock ranging from dust grains to mountain-sized chunks.",
    funFacts: [
      "Saturn is less dense than water — it would float if you could find an ocean big enough.",
      "Saturn's moon Titan has lakes of liquid methane — the only body besides Earth with surface liquids.",
      "Saturn's rings are incredibly thin: up to 282,000 km wide but only ~10 meters thick."
    ],
    namedFor: "The Roman god of agriculture and time.",
    discoveredBy: "Known since ancient times",
    discovery: "Saturn is visible to the naked eye. Galileo first viewed its rings through a telescope in 1610, though he did not understand their shape.",
    missions: ["Pioneer 11", "Voyager 1", "Voyager 2", "Cassini-Huygens"],
    upcomingMissions: ["NASA Dragonfly to Titan"],
    organizations: ["NASA", "ESA", "ASI"],
    links: [
      { label: "NASA Saturn", url: "https://science.nasa.gov/saturn/" },
      { label: "NASA Dragonfly", url: "https://science.nasa.gov/mission/dragonfly/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Saturn" }
    ]
  },
  {
    id: "uranus",
    name: "Uranus",
    nickname: "The Sideways Ice Giant",
    emoji: "🔵",
    color: "#7fd9df",
    gradientColors: ["#0a3a3d", "#041518"],
    visualRadius: 1.25,
    orbitRadius: 36,
    orbitSpeed: 0.1,
    rotationSpeed: -1.1,
    massKg: 8.681e25,
    radiusKm: 25362,
    distanceAU: 19.19,
    gravity: 0.89,
    moons: 27,
    day: "17 hours",
    year: "84 years",
    temperature: -195,
    atmosphere: "Hydrogen 83%, Helium 15%, Methane 2%",
    ring: true,
    fact: "Uranus rolls around the Sun on its side — probably tipped over by a massive collision long ago.",
    funFacts: [
      "Uranus has rings too — they're just much darker and harder to see than Saturn's.",
      "On Uranus, a single season lasts 21 years because of its extreme axial tilt.",
      "Uranus's moons are named after Shakespeare characters, not mythology."
    ],
    namedFor: "The Greek god of the sky.",
    discoveredBy: "William Herschel",
    discovery: "William Herschel discovered Uranus in 1781, making it the first planet found with a telescope.",
    missions: ["Voyager 2 flyby"],
    upcomingMissions: ["Uranus orbiter concepts recommended by planetary scientists"],
    organizations: ["NASA"],
    links: [
      { label: "NASA Uranus", url: "https://science.nasa.gov/uranus/" },
      { label: "NASA Voyager", url: "https://science.nasa.gov/mission/voyager/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Uranus" }
    ]
  },
  {
    id: "neptune",
    name: "Neptune",
    nickname: "The Wind Planet",
    emoji: "🔷",
    color: "#496dff",
    gradientColors: ["#080e40", "#030618"],
    visualRadius: 1.22,
    orbitRadius: 41,
    orbitSpeed: 0.08,
    rotationSpeed: 1.1,
    massKg: 1.024e26,
    radiusKm: 24622,
    distanceAU: 30.07,
    gravity: 1.14,
    moons: 14,
    day: "16 hours",
    year: "165 years",
    temperature: -200,
    atmosphere: "Hydrogen 80%, Helium 19%, Methane 1%",
    fact: "Neptune has the strongest winds in the Solar System — screaming at over 2,100 km/h.",
    funFacts: [
      "Neptune was discovered through mathematics before it was seen through a telescope.",
      "Triton, Neptune's largest moon, orbits backwards — it was probably captured from the Kuiper Belt.",
      "Neptune has only completed one full orbit since it was discovered in 1846."
    ],
    namedFor: "The Roman god of the sea, matching its deep blue color.",
    discoveredBy: "Johann Galle and Heinrich d'Arrest, using predictions by Urbain Le Verrier",
    discovery: "Neptune was discovered in 1846 after astronomers predicted its position from Uranus's unusual orbit.",
    missions: ["Voyager 2 flyby"],
    upcomingMissions: ["Neptune/Triton mission concepts"],
    organizations: ["NASA"],
    links: [
      { label: "NASA Neptune", url: "https://science.nasa.gov/neptune/" },
      { label: "NASA Voyager", url: "https://science.nasa.gov/mission/voyager/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Neptune" }
    ]
  }
];

export const PLANET_BY_ID = PLANETS.reduce<Record<string, Planet>>((map, planet) => {
  map[planet.id] = planet;
  return map;
}, {});
