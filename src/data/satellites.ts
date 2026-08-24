// ─── Satellite Orbital Data ───────────────────────────────────────────────────
// Visualization orbital parameters (simulated — not real-time TLE data)
// altitude in km above Earth surface
// inclination in degrees from equatorial plane
// period in minutes

export type SatOrbitClass = "LEO" | "MEO" | "GEO" | "Lunar" | "HEO" | "Interplanetary";
export type SatType = "Science" | "Navigation" | "Communication" | "EarthObs" | "Crewed" | "Military" | "Weather" | "Technology";

export type Satellite = {
  id: string;
  name: string;
  shortName: string;
  agencyId: string;
  country: string;
  flag: string;
  color: string;          // orbital track color
  type: SatType;
  orbitClass: SatOrbitClass;
  altitude: number;       // km
  inclination: number;    // degrees
  period: number;         // minutes
  launchYear: number;
  launchVehicle: string;
  status: "active" | "retired" | "failed";
  mass: number;           // kg
  emoji: string;
  headline: string;
  story: string;
  discoveries: string[];
  // 3D visualization params (computed from altitude)
  visualRadius?: number;   // set at runtime
  orbitSpeed?: number;     // set at runtime
  startAngle?: number;     // random starting angle
};

// Visual orbit radius mapping (Earth visual radius = 2.2 in scene units)
// LEO ~400-2000km: 3.0-3.6
// MEO ~8000-20200km: 4.2-5.5
// GEO 35786km: 6.8
// Lunar ~384400km: 10.0 (scaled down)
export function satVisualRadius(altitude: number): number {
  if (altitude < 2000)   return 3.0 + (altitude / 2000) * 0.6;         // LEO band
  if (altitude < 20200)  return 3.8 + ((altitude - 2000) / 18200) * 1.0; // MEO band
  if (altitude < 40000)  return 4.8 + ((altitude - 20200) / 19800) * 1.4; // GEO band
  return 8.0;                                                             // Lunar/beyond
}

export function satOrbitSpeed(period: number): number {
  return (2 * Math.PI) / (period * 60 * 0.001); // scale for visualization
}

export const SATELLITES: Satellite[] = [
  // ── ISS ──────────────────────────────────────────────────────────────────
  {
    id: "iss",
    name: "International Space Station",
    shortName: "ISS",
    agencyId: "nasa",
    country: "International",
    flag: "🌍",
    color: "#4d7dff",
    type: "Crewed",
    orbitClass: "LEO",
    altitude: 408,
    inclination: 51.6,
    period: 92.9,
    launchYear: 1998,
    launchVehicle: "Proton / Space Shuttle",
    status: "active",
    mass: 420000,
    emoji: "🛸",
    headline: "Humanity's home in space since 2000",
    story: "The ISS is the largest human-made structure in space — the size of a football field. Built by 15 nations over 13 years, it has been continuously crewed since November 2000. It completes 16 orbits per day, meaning astronauts see 16 sunrises and sunsets every 24 hours.",
    discoveries: ["Microgravity biology research", "Water recycling tech", "Bone density loss studies", "Psychology of long-duration spaceflight", "Earth observation"],
  },
  // ── Hubble ───────────────────────────────────────────────────────────────
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    shortName: "Hubble",
    agencyId: "nasa",
    country: "USA",
    flag: "🇺🇸",
    color: "#4dccff",
    type: "Science",
    orbitClass: "LEO",
    altitude: 540,
    inclination: 28.5,
    period: 95,
    launchYear: 1990,
    launchVehicle: "Space Shuttle Discovery",
    status: "active",
    mass: 11110,
    emoji: "🔭",
    headline: "Changed everything we know about the universe",
    story: "Launched in 1990, Hubble has made over 1.5 million observations, helped determine the age of the universe (13.8 billion years), discovered dark energy, and produced some of humanity's most iconic images — including the Pillars of Creation and Ultra Deep Field showing 10,000 galaxies.",
    discoveries: ["Age of universe = 13.8 billion years", "Dark energy acceleration", "Black holes in most galaxies", "Atmospheric composition of exoplanets", "Deep Field — oldest galaxies visible"],
  },
  // ── JWST ────────────────────────────────────────────────────────────────
  {
    id: "jwst",
    name: "James Webb Space Telescope",
    shortName: "Webb",
    agencyId: "nasa",
    country: "USA/International",
    flag: "🇺🇸",
    color: "#ffd700",
    type: "Science",
    orbitClass: "Interplanetary",
    altitude: 1500000, // L2 point
    inclination: 0,
    period: 365 * 24 * 60,
    launchYear: 2021,
    launchVehicle: "Ariane 5",
    status: "active",
    mass: 6500,
    emoji: "🌠",
    headline: "Humanity's deepest eye into the cosmos",
    story: "Webb orbits the L2 Lagrange point 1.5 million km from Earth. With its 6.5m gold mirror, it sees the universe in infrared — including the very first galaxies that formed after the Big Bang, just 300 million years after it. This is cosmic archaeology: looking back 13.5 billion years.",
    discoveries: ["Oldest galaxies ever imaged (350 million years post-Big Bang)", "Exoplanet atmospheric chemistry", "Star formation inside dusty nebulae", "Carbon dioxide on exoplanets", "Detailed Jupiter storm structure"],
  },
  // ── GPS Block III ────────────────────────────────────────────────────────
  {
    id: "gps_iii",
    name: "GPS Block III Satellite",
    shortName: "GPS III",
    agencyId: "nasa",
    country: "USA",
    flag: "🇺🇸",
    color: "#4dff99",
    type: "Navigation",
    orbitClass: "MEO",
    altitude: 20200,
    inclination: 55.0,
    period: 718,
    launchYear: 2018,
    launchVehicle: "Falcon 9",
    status: "active",
    mass: 3880,
    emoji: "📡",
    headline: "How your phone knows where you are",
    story: "GPS Block III satellites operate at 20,200 km altitude — high enough to see nearly half the Earth at once. The constellation of 31 active satellites provides positioning accuracy to within 0.5 meters. Your phone receives signals from at least 4 satellites simultaneously to calculate your exact position.",
    discoveries: ["Sub-meter accuracy navigation", "Time synchronization for global internet", "Scientific geodesy", "Emergency services coordination", "Aviation safety worldwide"],
  },
  // ── Chandrayaan-3 ────────────────────────────────────────────────────────
  {
    id: "chandrayaan3",
    name: "Chandrayaan-3 Mission",
    shortName: "CY-3",
    agencyId: "isro",
    country: "India",
    flag: "🇮🇳",
    color: "#ff9b00",
    type: "Science",
    orbitClass: "Lunar",
    altitude: 384400,
    inclination: 18.0,
    period: 27 * 24 * 60,
    launchYear: 2023,
    launchVehicle: "LVM3-M4",
    status: "active",
    mass: 3900,
    emoji: "🌙",
    headline: "India's historic Moon south pole touchdown",
    story: "Chandrayaan-3 made India the 4th country to soft-land on the Moon, and the FIRST EVER to land near the lunar south pole — a region rich in water ice. The Vikram lander and Pragyan rover operated for 14 days. The Pragyan rover confirmed the presence of sulphur, iron, oxygen, and other elements.",
    discoveries: ["First south pole Moon landing", "Sulphur confirmed near Moon south pole", "Soil composition analysis", "Thermal gradient near lunar surface", "Seismic activity detection"],
  },
  // ── Mangalyaan ────────────────────────────────────────────────────────────
  {
    id: "mangalyaan",
    name: "Mars Orbiter Mission",
    shortName: "Mangalyaan",
    agencyId: "isro",
    country: "India",
    flag: "🇮🇳",
    color: "#ff6b00",
    type: "Science",
    orbitClass: "Interplanetary",
    altitude: 77000000,
    inclination: 0,
    period: 8.5 * 24 * 60,
    launchYear: 2013,
    launchVehicle: "PSLV-C25",
    status: "retired",
    mass: 1337,
    emoji: "🔴",
    headline: "India reached Mars on first attempt — at 1/10th the cost",
    story: "Mangalyaan cost only $74 million — cheaper than the Hollywood movie Gravity ($100M). It reached Mars orbit on its very first attempt in 2014, making India only the 4th space agency to successfully orbit Mars. It carried 5 science instruments and studied the Martian atmosphere for 8 years before losing contact in 2022.",
    discoveries: ["Martian atmosphere composition", "Methane detection in Martian atmosphere", "Exospheric deuterium/hydrogen ratio", "First color images of Mars from Indian spacecraft", "Mars moons Phobos and Deimos imaging"],
  },
  // ── Aditya-L1 ─────────────────────────────────────────────────────────────
  {
    id: "adityal1",
    name: "Aditya-L1 Solar Observatory",
    shortName: "Aditya-L1",
    agencyId: "isro",
    country: "India",
    flag: "🇮🇳",
    color: "#ffcc00",
    type: "Science",
    orbitClass: "Interplanetary",
    altitude: 1500000,
    inclination: 0,
    period: 365 * 24 * 60,
    launchYear: 2023,
    launchVehicle: "PSLV-C57",
    status: "active",
    mass: 1475,
    emoji: "☀️",
    headline: "India's eyes on the Sun, from L1",
    story: "Aditya-L1 is India's first solar mission, stationed at the L1 Lagrange point 1.5 million km from Earth — where gravity from Earth and Sun perfectly balance. From this vantage, it continuously observes the Sun without eclipses, studying solar flares, coronal mass ejections, and solar wind that affect Earth's technology.",
    discoveries: ["Solar wind properties near L1", "First Indian coronal imaging", "X-ray flare mapping", "Ultraviolet solar disk observation", "Magnetic field measurements in solar wind"],
  },
  // ── Starlink ─────────────────────────────────────────────────────────────
  {
    id: "starlink",
    name: "Starlink Constellation",
    shortName: "Starlink",
    agencyId: "spacex",
    country: "USA (Private)",
    flag: "🚀",
    color: "#a0ccff",
    type: "Communication",
    orbitClass: "LEO",
    altitude: 550,
    inclination: 53.0,
    period: 95,
    launchYear: 2019,
    launchVehicle: "Falcon 9",
    status: "active",
    mass: 260,
    emoji: "🌐",
    headline: "6,700 satellites — largest constellation ever",
    story: "SpaceX's Starlink is the largest satellite constellation ever built. With over 6,700 active satellites, it provides high-speed internet to 100+ countries including remote areas with no cable infrastructure. A Falcon 9 rocket can deploy 60 Starlinks at once — it launches more satellites per month than most agencies do in a decade.",
    discoveries: ["Satellite internet to underserved regions", "Latency <30ms for some applications", "Maritime/aviation connectivity", "Emergency disaster relief communications", "Concerns about light pollution for astronomers"],
  },
  // ── Sentinel-6 (ESA) ──────────────────────────────────────────────────────
  {
    id: "sentinel6",
    name: "Sentinel-6 Michael Freilich",
    shortName: "Sentinel-6",
    agencyId: "esa",
    country: "Europe",
    flag: "🇪🇺",
    color: "#4dccff",
    type: "EarthObs",
    orbitClass: "LEO",
    altitude: 1336,
    inclination: 66.0,
    period: 112,
    launchYear: 2020,
    launchVehicle: "Falcon 9",
    status: "active",
    mass: 1440,
    emoji: "🌊",
    headline: "Measuring sea level rise to the millimeter",
    story: "Sentinel-6 is the most accurate sea-level measurement satellite ever built. It uses a radar altimeter to measure ocean height to within 2cm — critical for tracking climate change and protecting 600 million people in coastal zones. It detected that sea levels are rising 3.6mm per year — accelerating faster than in the 20th century.",
    discoveries: ["Sea level rise rate: 3.6mm/year", "Ocean circulation mapping", "El Niño event tracking", "Arctic sea ice extent monitoring", "Glacier melt contribution data"],
  },
  // ── Tiangong ─────────────────────────────────────────────────────────────
  {
    id: "tiangong",
    name: "Tiangong Space Station",
    shortName: "Tiangong",
    agencyId: "cnsa",
    country: "China",
    flag: "🇨🇳",
    color: "#ff3a3a",
    type: "Crewed",
    orbitClass: "LEO",
    altitude: 400,
    inclination: 41.5,
    period: 92,
    launchYear: 2021,
    launchVehicle: "Long March 5B",
    status: "active",
    mass: 100000,
    emoji: "🏠",
    headline: "China's independently operated space station",
    story: "Tiangong (meaning 'Sky Palace') is China's third-generation space station, completed in 2022. The core module Tianhe is flanked by two lab modules — Wentian and Mengtian. It operates entirely independently of the ISS, with China banned from the ISS program. Up to 6 taikonauts can live there.",
    discoveries: ["Long-duration microgravity biology", "High-energy cosmic ray observation", "Chinese space technology validation", "Protein crystallization experiments", "Space medicine research"],
  },
  // ── Beresheet (Israel) ──────────────────────────────────────────────────
  {
    id: "beresheet",
    name: "Beresheet Lunar Lander",
    shortName: "Beresheet",
    agencyId: "isas",
    country: "Israel",
    flag: "🇮🇱",
    color: "#4d99ff",
    type: "Science",
    orbitClass: "Lunar",
    altitude: 200,
    inclination: 0,
    period: 127,
    launchYear: 2019,
    launchVehicle: "Falcon 9",
    status: "failed",
    mass: 585,
    emoji: "🌑",
    headline: "The private Moon mission that almost worked",
    story: "Beresheet (Genesis) was built by SpaceIL, an Israeli nonprofit, for $100 million — 10× cheaper than any previous lunar mission. It became the 7th spacecraft to orbit the Moon and was on final approach when an inertial measurement unit failed, causing it to crash in April 2019. It inspired a generation of Israeli engineers.",
    discoveries: ["Low-cost lunar mission architecture", "Magnetic field anomalies near Mare Serenitatis", "Biological tardigrades accidentally brought to Moon", "Commercial lunar mission viability", "New model for private space missions"],
  },
  // ── Voyager 1 ────────────────────────────────────────────────────────────
  {
    id: "voyager1",
    name: "Voyager 1",
    shortName: "Voyager 1",
    agencyId: "nasa",
    country: "USA",
    flag: "🇺🇸",
    color: "#c0d8ff",
    type: "Science",
    orbitClass: "Interplanetary",
    altitude: 23000000000,
    inclination: 35.0,
    period: 0,
    launchYear: 1977,
    launchVehicle: "Titan III-E/Centaur",
    status: "active",
    mass: 721,
    emoji: "🛸",
    headline: "The most distant human-made object ever — 23 billion km away",
    story: "Launched in 1977, Voyager 1 is now over 23 billion km from Earth — so far that radio signals traveling at the speed of light take 21+ hours to reach it. In 2012, it became the first human-made object to enter interstellar space — the space between the stars. Scientists still receive signals from it.",
    discoveries: ["Jupiter's ring system", "Io's active volcanoes", "Jupiter's complex magnetosphere", "Entered interstellar space (2012)", "Composition of the heliopause boundary"],
  },
  // ── CARTOSAT-3 (ISRO) ──────────────────────────────────────────────────
  {
    id: "cartosat3",
    name: "CARTOSAT-3",
    shortName: "CARTOSAT-3",
    agencyId: "isro",
    country: "India",
    flag: "🇮🇳",
    color: "#ff7b3a",
    type: "EarthObs",
    orbitClass: "LEO",
    altitude: 509,
    inclination: 97.5,
    period: 94.8,
    launchYear: 2019,
    launchVehicle: "PSLV-C47",
    status: "active",
    mass: 1625,
    emoji: "🗺️",
    headline: "India's sharpest eye from space — 0.25m resolution",
    story: "CARTOSAT-3 is India's most advanced Earth observation satellite, producing images with 0.25 meter resolution — enough to identify individual vehicles. It provides critical data for urban planning, disaster management, border security, and agricultural monitoring. It was launched along with 13 commercial international satellites.",
    discoveries: ["Sub-25cm resolution Indian satellite imagery", "Flood damage mapping", "Urban encroachment detection", "Forest cover change analysis", "Agricultural crop health assessment"],
  },
  // ── Hope Probe (UAE) ─────────────────────────────────────────────────────
  {
    id: "hope_probe",
    name: "Emirates Mars Mission (Hope Probe)",
    shortName: "Hope Probe",
    agencyId: "uaesa",
    country: "UAE",
    flag: "🇦🇪",
    color: "#4dff99",
    type: "Science",
    orbitClass: "Interplanetary",
    altitude: 55000000,
    inclination: 25.0,
    period: 55 * 24 * 60,
    launchYear: 2020,
    launchVehicle: "H-IIA",
    status: "active",
    mass: 1350,
    emoji: "🔴",
    headline: "The Arab world's first interplanetary mission",
    story: "The Emirates Mars Mission (Hope) reached Mars orbit in February 2021 — a 7-month, 500 million km journey. Launched from Japan on a Japanese rocket, built with US university partnerships, it represents a new model of international space cooperation. It produced the most complete global weather map of Mars ever made.",
    discoveries: ["Most comprehensive Martian weather dataset ever", "Discrete aurora activity on Mars", "Ozone distribution in Martian atmosphere", "Dust storm global circulation patterns", "Hydrogen escape rates from Mars atmosphere"],
  },
  // ── Danuri (KARI) ─────────────────────────────────────────────────────────
  {
    id: "danuri",
    name: "Korea Pathfinder Lunar Orbiter",
    shortName: "Danuri",
    agencyId: "ksa",
    country: "South Korea",
    flag: "🇰🇷",
    color: "#ff6b9d",
    type: "Science",
    orbitClass: "Lunar",
    altitude: 100,
    inclination: 90.0,
    period: 118,
    launchYear: 2022,
    launchVehicle: "Falcon 9",
    status: "active",
    mass: 678,
    emoji: "🌙",
    headline: "Korea's first spacecraft to escape Earth's gravity",
    story: "Danuri (meaning 'enjoy the Moon') is South Korea's first deep space mission. It used a revolutionary 'ballistic lunar transfer' trajectory — flying 1.5 million km away from Earth to use the Sun's gravity as a slingshot to reach the Moon. It mapped permanently shadowed craters that may contain water ice.",
    discoveries: ["Lunar permanently shadowed crater mapping", "Water ice deposit candidates", "Gamma-ray and magnetic field data", "First Korean deep space mission experience", "NASA ShadowCam imagery from dark lunar craters"],
  },
];

export const SATELLITE_BY_ID: Record<string, Satellite> = Object.fromEntries(
  SATELLITES.map(s => [s.id, s])
);

export const SATELLITES_BY_AGENCY: Record<string, Satellite[]> = SATELLITES.reduce<Record<string, Satellite[]>>(
  (acc, s) => {
    if (!acc[s.agencyId]) acc[s.agencyId] = [];
    acc[s.agencyId].push(s);
    return acc;
  },
  {}
);
