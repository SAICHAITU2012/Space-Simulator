import type { TextureKey } from "../lib/textures";

export type DwarfPlanet = {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  color: string;
  visualRadius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  textureKey: TextureKey;
  fact: string;
  funFacts: [string, string, string];
};

export const DWARF_PLANETS: DwarfPlanet[] = [
  {
    id: "ceres",
    name: "Ceres",
    nickname: "The Belt World",
    emoji: "🪨",
    color: "#9a9088",
    visualRadius: 0.38,
    orbitRadius: 26.2,
    orbitSpeed: 0.17,
    rotationSpeed: 0.9,
    textureKey: "ceres",
    fact: "Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner Solar System.",
    funFacts: [
      "Dawn found bright salt deposits in Occator crater.",
      "Ceres may still have a briny ocean layer under its crust.",
      "It was the first asteroid discovered (1801) and later reclassified as a dwarf planet.",
    ],
  },
  {
    id: "haumea",
    name: "Haumea",
    nickname: "The Fast Spinner",
    emoji: "🥚",
    color: "#d8d0c4",
    visualRadius: 0.32,
    orbitRadius: 48,
    orbitSpeed: 0.045,
    rotationSpeed: 2.4,
    textureKey: "haumea",
    fact: "Haumea is stretched into an ellipsoid because it spins once every four hours.",
    funFacts: [
      "It has a ring and two known moons, Hi'iaka and Namaka.",
      "The surface is crystalline water ice.",
      "Its shape is unique among known dwarf planets.",
    ],
  },
  {
    id: "makemake",
    name: "Makemake",
    nickname: "The Kuiper Classic",
    emoji: "🟤",
    color: "#c49a6a",
    visualRadius: 0.3,
    orbitRadius: 52,
    orbitSpeed: 0.038,
    rotationSpeed: 0.7,
    textureKey: "makemake",
    fact: "Makemake is a bright Kuiper Belt dwarf planet named after a Rapa Nui creation deity.",
    funFacts: [
      "It was one of the discoveries that led to Pluto's reclassification.",
      "A thin methane atmosphere may come and go with its seasons.",
      "It has at least one small moon, S/2015 (136472) 1.",
    ],
  },
  {
    id: "eris",
    name: "Eris",
    nickname: "The Distant Twin",
    emoji: "⚪",
    color: "#d0d4dc",
    visualRadius: 0.34,
    orbitRadius: 57,
    orbitSpeed: 0.03,
    rotationSpeed: 0.55,
    textureKey: "eris",
    fact: "Eris is similar in size to Pluto and farther out — its discovery forced a new definition of 'planet'.",
    funFacts: [
      "It takes about 557 Earth years to orbit the Sun.",
      "Its moon Dysnomia helped astronomers weigh Eris.",
      "Surface ices include methane and may be as reflective as fresh snow.",
    ],
  },
  {
    id: "pluto",
    name: "Pluto",
    nickname: "The Heart World",
    emoji: "🤎",
    color: "#c8a078",
    visualRadius: 0.36,
    orbitRadius: 44,
    orbitSpeed: 0.033,
    rotationSpeed: -0.35,
    textureKey: "pluto",
    fact: "Pluto is a Kuiper Belt dwarf with a heart-shaped nitrogen glacier and a surprisingly active geology.",
    funFacts: [
      "New Horizons found mountains of water ice and a hazy blue atmosphere.",
      "Charon is so large that Pluto–Charon is often called a binary system.",
      "Its 248-year orbit is tilted 17° and crosses inside Neptune's path.",
    ],
  },
];

export const DWARF_BY_ID: Record<string, DwarfPlanet> = Object.fromEntries(
  DWARF_PLANETS.map(d => [d.id, d])
);
