export type DeepSpaceObject = {
  id: string;
  name: string;
  type: "Star" | "Nebula" | "Galaxy";
  emoji: string;
  color: string;
  position: [number, number, number];
  visualRadius: number;
  distance: string;
  discovered: string;
  description: string;
  whyItMatters: string;
  facts: [string, string, string];
  links: Array<{ label: string; url: string }>;
};

export const DEEP_SPACE_OBJECTS: DeepSpaceObject[] = [
  {
    id: "sirius",
    name: "Sirius",
    type: "Star",
    emoji: "*",
    color: "#dbe9ff",
    position: [-95, 34, -145],
    visualRadius: 1.1,
    distance: "8.6 light-years",
    discovered: "Known since ancient times",
    description: "The brightest star in Earth's night sky, actually a two-star system with a white dwarf companion.",
    whyItMatters: "Sirius helps children connect naked-eye sky watching with real stellar science.",
    facts: [
      "Sirius is about twice as massive as the Sun.",
      "Its companion, Sirius B, is a dense white dwarf.",
      "Ancient Egyptians used its rising to track the Nile flood season."
    ],
    links: [
      { label: "NASA APOD", url: "https://apod.nasa.gov/apod/ap000911.html" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Sirius" }
    ]
  },
  {
    id: "polaris",
    name: "Polaris",
    type: "Star",
    emoji: "*",
    color: "#fff4d6",
    position: [42, 92, -132],
    visualRadius: 0.95,
    distance: "About 433 light-years",
    discovered: "Known since ancient times",
    description: "The North Star sits close to Earth's north celestial pole, making it a famous navigation star.",
    whyItMatters: "It shows how astronomy helped humans navigate long before GPS.",
    facts: [
      "Polaris appears almost fixed while other stars circle around it.",
      "It is not the brightest star in the sky.",
      "Polaris is a multiple-star system."
    ],
    links: [
      { label: "NASA", url: "https://science.nasa.gov/universe/stars/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Polaris" }
    ]
  },
  {
    id: "orion_nebula",
    name: "Orion Nebula",
    type: "Nebula",
    emoji: "N",
    color: "#d68cff",
    position: [128, -24, -168],
    visualRadius: 4.2,
    distance: "About 1,344 light-years",
    discovered: "Recorded in 1610 by Nicolas-Claude Fabri de Peiresc",
    description: "A glowing stellar nursery where new stars are being born inside clouds of gas and dust.",
    whyItMatters: "It makes star birth visible: stars are not just lights, they are formed from cosmic clouds.",
    facts: [
      "It is visible to the naked eye in Orion's sword.",
      "The Trapezium cluster lights up the nebula.",
      "It is one of the most studied star-forming regions."
    ],
    links: [
      { label: "NASA Hubble", url: "https://science.nasa.gov/mission/hubble/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Orion_Nebula" }
    ]
  },
  {
    id: "crab_nebula",
    name: "Crab Nebula",
    type: "Nebula",
    emoji: "N",
    color: "#7dfcff",
    position: [-142, -18, -202],
    visualRadius: 3.6,
    distance: "About 6,500 light-years",
    discovered: "Supernova observed in 1054; nebula identified in 1731",
    description: "The expanding remains of a star that exploded as a supernova, with a pulsar spinning at its center.",
    whyItMatters: "It is a dramatic example of stellar death creating new cosmic material.",
    facts: [
      "Chinese astronomers recorded the supernova in 1054.",
      "A neutron star at its center spins about 30 times per second.",
      "The nebula is still expanding today."
    ],
    links: [
      { label: "NASA Chandra", url: "https://chandra.harvard.edu/photo/2002/0052/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Crab_Nebula" }
    ]
  },
  {
    id: "andromeda",
    name: "Andromeda Galaxy",
    type: "Galaxy",
    emoji: "G",
    color: "#ffe2a8",
    position: [190, 44, -260],
    visualRadius: 7.2,
    distance: "About 2.5 million light-years",
    discovered: "Known since ancient times; identified as a galaxy by Edwin Hubble",
    description: "The nearest large spiral galaxy to the Milky Way and our galaxy's future merger partner.",
    whyItMatters: "It helps learners grasp that the Milky Way is only one galaxy among billions.",
    facts: [
      "Andromeda contains roughly one trillion stars.",
      "It is moving toward the Milky Way.",
      "The two galaxies may merge in about 4-5 billion years."
    ],
    links: [
      { label: "NASA", url: "https://science.nasa.gov/universe/galaxies/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Andromeda_Galaxy" }
    ]
  },
  {
    id: "whirlpool",
    name: "Whirlpool Galaxy",
    type: "Galaxy",
    emoji: "G",
    color: "#9ed8ff",
    position: [-220, 58, -285],
    visualRadius: 5.8,
    distance: "About 31 million light-years",
    discovered: "Discovered by Charles Messier in 1773",
    description: "A beautiful spiral galaxy interacting with a smaller companion galaxy.",
    whyItMatters: "It shows that galaxies are dynamic systems that can pull and reshape each other.",
    facts: [
      "It is also known as Messier 51.",
      "Its spiral arms are full of star-forming regions.",
      "The companion galaxy helps make the spiral shape stand out."
    ],
    links: [
      { label: "NASA Hubble", url: "https://science.nasa.gov/mission/hubble/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Whirlpool_Galaxy" }
    ]
  }
];

export const DEEP_SPACE_BY_ID: Record<string, DeepSpaceObject> = Object.fromEntries(
  DEEP_SPACE_OBJECTS.map(object => [object.id, object])
);
