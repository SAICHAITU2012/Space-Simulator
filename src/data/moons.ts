export type Moon = {
  id: string;
  name: string;
  nickname: string;
  planetId: string;
  emoji: string;
  color: string;
  visualRadius: number;
  orbitScale: number;
  fact: string;
  funFacts: [string, string, string];
  textureKey?: "moon";
};

export const MOONS: Moon[] = [
  {
    id: "luna",
    name: "Moon",
    nickname: "Luna",
    planetId: "earth",
    emoji: "🌕",
    color: "#c8d0e0",
    visualRadius: 0.27,
    orbitScale: 2.6,
    textureKey: "moon",
    fact: "Earth's Moon is the only other world humans have walked on — and it locks the same face toward us as it orbits.",
    funFacts: [
      "The Moon is slowly drifting away from Earth at about 3.8 cm per year.",
      "Nearside maria are ancient lava plains; the farside is almost all highlands.",
      "A lunar day lasts about 29.5 Earth days — sunrise to sunrise on the surface.",
    ],
  },
  {
    id: "phobos",
    name: "Phobos",
    nickname: "Fear",
    planetId: "mars",
    emoji: "🥔",
    color: "#8a7060",
    visualRadius: 0.08,
    orbitScale: 2.15,
    fact: "Phobos is a potato-shaped moon so close to Mars that it would look huge in the sky — and it is spiraling inward.",
    funFacts: [
      "Phobos completes an orbit in just 7 hours 39 minutes — faster than Mars rotates.",
      "Stickney crater is so large it nearly shattered the moon.",
      "Tidal decay may tear Phobos into a ring in tens of millions of years.",
    ],
  },
  {
    id: "deimos",
    name: "Deimos",
    nickname: "Dread",
    planetId: "mars",
    emoji: "🌑",
    color: "#9a8878",
    visualRadius: 0.06,
    orbitScale: 3.4,
    fact: "Deimos is Mars's smaller outer moon — a dark, cratered rock that may be a captured asteroid.",
    funFacts: [
      "Deimos takes about 30 hours to orbit Mars, so it hangs in the sky for days.",
      "From Deimos, Mars would fill a huge part of the sky.",
      "Its surface is smoother than Phobos because dust fills the craters.",
    ],
  },
  {
    id: "io",
    name: "Io",
    nickname: "The Volcano Moon",
    planetId: "jupiter",
    emoji: "🟡",
    color: "#e8c45a",
    visualRadius: 0.18,
    orbitScale: 2.2,
    fact: "Io is the most volcanically active body in the Solar System, painted yellow and orange by sulfur.",
    funFacts: [
      "Jupiter's tides squeeze Io so hard that its interior stays molten.",
      "Hundreds of volcanoes erupt, some plumes reaching hundreds of kilometres high.",
      "Io's surface is only a few million years old — constantly resurfaced.",
    ],
  },
  {
    id: "europa",
    name: "Europa",
    nickname: "The Ice Ocean",
    planetId: "jupiter",
    emoji: "🧊",
    color: "#d8ecec",
    visualRadius: 0.16,
    orbitScale: 2.7,
    fact: "Europa hides a global saltwater ocean under an icy crust — one of the best places to look for life beyond Earth.",
    funFacts: [
      "The ice shell may be 10–30 km thick over an ocean up to 100 km deep.",
      "Reddish cracks are tidal stress fractures in the ice.",
      "NASA's Europa Clipper is on the way to study this ocean world up close.",
    ],
  },
  {
    id: "ganymede",
    name: "Ganymede",
    nickname: "The Giant Moon",
    planetId: "jupiter",
    emoji: "⚪",
    color: "#b8b0a0",
    visualRadius: 0.22,
    orbitScale: 3.25,
    fact: "Ganymede is larger than Mercury and the only moon with its own magnetic field.",
    funFacts: [
      "Ganymede has a subsurface ocean and a metallic core.",
      "Bright grooved terrain is younger ice next to dark ancient cratered regions.",
      "ESA's JUICE mission will orbit Ganymede later this decade.",
    ],
  },
  {
    id: "callisto",
    name: "Callisto",
    nickname: "The Cratered World",
    planetId: "jupiter",
    emoji: "🔘",
    color: "#7a7068",
    visualRadius: 0.2,
    orbitScale: 3.85,
    fact: "Callisto is the most heavily cratered large moon — a time capsule of the early Solar System.",
    funFacts: [
      "It has barely been geologically active for billions of years.",
      "Valhalla basin is a multi-ring impact scar thousands of kilometres wide.",
      "A possible subsurface ocean may still exist deep inside.",
    ],
  },
  {
    id: "titan",
    name: "Titan",
    nickname: "The Methane World",
    planetId: "saturn",
    emoji: "🟠",
    color: "#d4a06a",
    visualRadius: 0.24,
    orbitScale: 2.55,
    fact: "Titan is the only moon with a thick atmosphere and stable lakes — but they are liquid methane and ethane.",
    funFacts: [
      "Huygens landed on Titan in 2005 and sent back photos of a river-carved landscape.",
      "The atmosphere is mostly nitrogen, like Earth's, with orange haze.",
      "NASA's Dragonfly rotorcraft is planned to fly between Titan's dunes in the 2030s.",
    ],
  },
  {
    id: "enceladus",
    name: "Enceladus",
    nickname: "The Geyser Moon",
    planetId: "saturn",
    emoji: "💨",
    color: "#f0f4ff",
    visualRadius: 0.1,
    orbitScale: 3.2,
    fact: "Enceladus sprays ice from a south-polar ocean into space — feeding Saturn's E ring.",
    funFacts: [
      "Cassini flew through the plumes and found water, salts, and organic molecules.",
      "Tiger-stripe fractures at the south pole are the geyser vents.",
      "It is a top target in the search for habitable environments.",
    ],
  },
  {
    id: "triton",
    name: "Triton",
    nickname: "The Captured Moon",
    planetId: "neptune",
    emoji: "🟣",
    color: "#c8b8d8",
    visualRadius: 0.2,
    orbitScale: 2.7,
    fact: "Triton orbits Neptune backwards — almost certainly a captured Kuiper Belt object.",
    funFacts: [
      "Voyager 2 saw nitrogen geysers and a cantaloupe-textured crust.",
      "Triton is slowly spiraling in and may someday be torn into a ring.",
      "Its polar caps are frozen nitrogen that sublimates in the weak sunlight.",
    ],
  },
];

export const MOON_BY_ID: Record<string, Moon> = Object.fromEntries(MOONS.map(m => [m.id, m]));

export const MOONS_BY_PLANET: Record<string, Moon[]> = MOONS.reduce<Record<string, Moon[]>>((acc, moon) => {
  if (!acc[moon.planetId]) acc[moon.planetId] = [];
  acc[moon.planetId].push(moon);
  return acc;
}, {});
