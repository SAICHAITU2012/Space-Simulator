export type StarSystem = {
  id: string;
  name: string;
  kind: "star" | "binary" | "blackhole" | "exoplanet";
  color: string;
  /** Position on the spiral disk (scene units). */
  position: [number, number, number];
  distance: string;
  fact: string;
  warpZoom: number;
};

export const STAR_SYSTEMS: StarSystem[] = [
  {
    id: "sun",
    name: "Solar System",
    kind: "star",
    color: "#ffcc66",
    position: [0.15, 0.02, 0.08],
    distance: "0 ly (home)",
    fact: "Our G-type star and eight planets — warp here to explore the orrery.",
    warpZoom: 38,
  },
  {
    id: "sirius",
    name: "Sirius",
    kind: "binary",
    color: "#dbe9ff",
    position: [1.8, 0.15, -0.4],
    distance: "8.6 ly",
    fact: "Brightest star in Earth's night sky — a main-sequence star plus a white dwarf.",
    warpZoom: 150,
  },
  {
    id: "alphaCentauri",
    name: "Alpha Centauri",
    kind: "star",
    color: "#ffe8c8",
    position: [-1.2, -0.1, 1.4],
    distance: "4.37 ly",
    fact: "The nearest star system: a binary plus Proxima with a rocky planet.",
    warpZoom: 150,
  },
  {
    id: "vega",
    name: "Vega",
    kind: "star",
    color: "#c8e8ff",
    position: [0.6, 0.35, 2.2],
    distance: "25 ly",
    fact: "A pale-blue A-type star that was Earth's north star around 12,000 BCE.",
    warpZoom: 150,
  },
  {
    id: "capella",
    name: "Capella",
    kind: "binary",
    color: "#ffd8a0",
    position: [-2.1, 0.2, -1.1],
    distance: "43 ly",
    fact: "A bright yellow giant binary in Auriga.",
    warpZoom: 150,
  },
  {
    id: "castor",
    name: "Castor",
    kind: "star",
    color: "#e8f0ff",
    position: [2.4, -0.18, 1.1],
    distance: "51 ly",
    fact: "Looks like one star; it is a six-star system in Gemini.",
    warpZoom: 150,
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    kind: "star",
    color: "#ff7744",
    position: [-0.4, 0.45, -2.4],
    distance: "~550 ly",
    fact: "A red supergiant in Orion that would swallow the inner planets if it replaced the Sun.",
    warpZoom: 160,
  },
  {
    id: "antares",
    name: "Antares",
    kind: "star",
    color: "#ff5533",
    position: [1.1, -0.3, 2.6],
    distance: "~550 ly",
    fact: "The heart of Scorpius — a red supergiant rivaling Betelgeuse.",
    warpZoom: 160,
  },
  {
    id: "naos",
    name: "Naos",
    kind: "star",
    color: "#a8c8ff",
    position: [2.8, 0.22, -1.8],
    distance: "~1,080 ly",
    fact: "Zeta Puppis — a hot blue supergiant that sculpts the Gum Nebula with its wind.",
    warpZoom: 165,
  },
  {
    id: "kepler22",
    name: "Kepler-22",
    kind: "exoplanet",
    color: "#88ffcc",
    position: [-2.6, 0.08, 0.7],
    distance: "~620 ly",
    fact: "Host of Kepler-22b, an early Kepler mission planet in the habitable zone.",
    warpZoom: 155,
  },
  {
    id: "sagittarius",
    name: "Sagittarius A*",
    kind: "blackhole",
    color: "#8866ff",
    position: [0.05, -0.05, 0.02],
    distance: "26,000 ly",
    fact: "The supermassive black hole at the centre of the Milky Way.",
    warpZoom: 22,
  },
];

export const STAR_SYSTEM_BY_ID: Record<string, StarSystem> = Object.fromEntries(
  STAR_SYSTEMS.map(s => [s.id, s]),
);
