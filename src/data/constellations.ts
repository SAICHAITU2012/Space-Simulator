export type StarPoint = { x: number; y: number; name?: string; bright?: boolean };

export type Constellation = {
  id: string;
  name: string;
  emoji: string;
  myth: string;
  season: string;
  stars: StarPoint[];
  lines: [number, number][]; // pairs of star indices to connect
  mainStar: string;
  funFact: string;
};

export const CONSTELLATIONS: Constellation[] = [
  {
    id: "orion",
    name: "Orion",
    emoji: "🏹",
    myth: "Orion was a giant hunter in Greek mythology, said to be the son of Poseidon. He boasted he could hunt any creature on Earth until a scorpion sent by Gaia killed him. Zeus placed him among the stars as an eternal tribute to his hunting prowess.",
    season: "Winter",
    mainStar: "Betelgeuse",
    funFact: "Betelgeuse is so massive that if it replaced our Sun, it would swallow Mercury, Venus, Earth, and Mars.",
    stars: [
      { x: 0.5, y: 0.05, name: "Betelgeuse", bright: true },
      { x: 0.7, y: 0.1, name: "Bellatrix", bright: true },
      { x: 0.38, y: 0.35, name: "Mintaka" },
      { x: 0.5, y: 0.38, name: "Alnilam", bright: true },
      { x: 0.62, y: 0.41, name: "Alnitak" },
      { x: 0.42, y: 0.65, name: "Saiph" },
      { x: 0.68, y: 0.62, name: "Rigel", bright: true },
      { x: 0.5, y: 0.55, name: "Meissa" }
    ],
    lines: [[0,2],[1,2],[2,3],[3,4],[4,6],[5,2],[6,4],[0,1],[0,7],[7,1]]
  },
  {
    id: "ursaMajor",
    name: "Ursa Major",
    emoji: "🐻",
    myth: "Zeus transformed Callisto into a bear to protect her from Hera's jealousy. Her son Arcas, about to unknowingly hunt her, was also transformed and placed in the sky as Ursa Minor. Hera, still angry, placed them where they could never dip below the horizon to rest.",
    season: "Spring",
    mainStar: "Alioth",
    funFact: "The Big Dipper's outer edge stars point directly to Polaris, the North Star — a navigation trick used by sailors for centuries.",
    stars: [
      { x: 0.15, y: 0.3, name: "Dubhe", bright: true },
      { x: 0.25, y: 0.38, name: "Merak", bright: true },
      { x: 0.38, y: 0.5, name: "Phecda" },
      { x: 0.32, y: 0.42, name: "Megrez" },
      { x: 0.55, y: 0.35, name: "Alioth", bright: true },
      { x: 0.68, y: 0.28, name: "Mizar", bright: true },
      { x: 0.82, y: 0.2, name: "Alkaid", bright: true }
    ],
    lines: [[0,1],[1,3],[3,2],[3,4],[4,5],[5,6]]
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    emoji: "👸",
    myth: "Cassiopeia was a vain Ethiopian queen who boasted that she and her daughter Andromeda were more beautiful than the sea nymphs. Poseidon punished her by chaining Andromeda to a rock to be devoured by a sea monster. Perseus eventually saved Andromeda.",
    season: "Autumn",
    mainStar: "Schedar",
    funFact: "Cassiopeia's W shape makes it one of the easiest constellations to find, and it points toward the Andromeda Galaxy — the most distant object visible with the naked eye.",
    stars: [
      { x: 0.1, y: 0.5, name: "Caph", bright: true },
      { x: 0.3, y: 0.2, name: "Schedar", bright: true },
      { x: 0.5, y: 0.45, name: "Gamma Cas" },
      { x: 0.7, y: 0.15, name: "Ruchbah", bright: true },
      { x: 0.9, y: 0.45, name: "Segin", bright: true }
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]]
  },
  {
    id: "scorpius",
    name: "Scorpius",
    emoji: "🦂",
    myth: "Scorpius is the scorpion sent by Gaia to kill Orion. Zeus placed both in the sky, but on opposite sides so they would never meet — which is why Orion sets as Scorpius rises. The two are forever chasing each other across the night sky.",
    season: "Summer",
    mainStar: "Antares",
    funFact: "Antares is a red supergiant about 700 times larger than our Sun. If placed at the center of our Solar System, it would reach between Mars and Jupiter.",
    stars: [
      { x: 0.5, y: 0.1, name: "Antares", bright: true },
      { x: 0.4, y: 0.2, name: "Graffias" },
      { x: 0.55, y: 0.25, name: "Dschubba" },
      { x: 0.45, y: 0.4, name: "Sigma Sco" },
      { x: 0.38, y: 0.55, name: "Tau Sco" },
      { x: 0.3, y: 0.7, name: "Epsilon Sco", bright: true },
      { x: 0.25, y: 0.82, name: "Mu Sco" },
      { x: 0.35, y: 0.9, name: "Zeta Sco", bright: true },
      { x: 0.2, y: 0.35, name: "Pi Sco" }
    ],
    lines: [[0,1],[0,2],[0,3],[3,4],[4,5],[5,6],[6,7],[1,8]]
  },
  {
    id: "leo",
    name: "Leo",
    emoji: "🦁",
    myth: "Leo represents the Nemean Lion killed by Hercules as the first of his twelve labors. The lion's hide was impenetrable, so Hercules strangled it. Zeus honored the lion by placing it among the stars, and Hercules wore its invincible hide as armor.",
    season: "Spring",
    mainStar: "Regulus",
    funFact: "Regulus is one of the brightest stars in the night sky and sits almost exactly on the ecliptic — the path the Sun, Moon, and planets travel across the sky.",
    stars: [
      { x: 0.15, y: 0.5, name: "Regulus", bright: true },
      { x: 0.3, y: 0.35, name: "Eta Leo" },
      { x: 0.45, y: 0.25, name: "Gamma Leo", bright: true },
      { x: 0.6, y: 0.2, name: "Zeta Leo" },
      { x: 0.7, y: 0.3, name: "Mu Leo" },
      { x: 0.78, y: 0.5, name: "Denebola", bright: true },
      { x: 0.4, y: 0.45, name: "Eta Leo 2" }
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,6],[6,5]]
  },
  {
    id: "cygnus",
    name: "Cygnus",
    emoji: "🦢",
    myth: "Cygnus represents a swan in several myths. One version says it's Orpheus transformed after death, placed next to his beloved lyre (Lyra). Another says it's Zeus disguised as a swan. The Northern Cross pattern within it is one of the most recognizable asterisms.",
    season: "Summer",
    mainStar: "Deneb",
    funFact: "Deneb is one of the most luminous stars known — it produces as much light in one day as our Sun does in an entire year.",
    stars: [
      { x: 0.5, y: 0.05, name: "Deneb", bright: true },
      { x: 0.5, y: 0.35, name: "Sadr", bright: true },
      { x: 0.5, y: 0.7, name: "Albireo", bright: true },
      { x: 0.15, y: 0.35, name: "Gienah" },
      { x: 0.85, y: 0.35, name: "Delta Cyg", bright: true }
    ],
    lines: [[0,1],[1,2],[3,1],[1,4]]
  },
  {
    id: "gemini",
    name: "Gemini",
    emoji: "♊",
    myth: "Gemini represents the twins Castor and Pollux — sons of Zeus and the queen Leda. Though Castor was mortal and Pollux immortal, Pollux asked Zeus to share his immortality with his brother so they'd never be separated. Zeus honored this bond by placing them together in the stars.",
    season: "Winter",
    mainStar: "Pollux",
    funFact: "Castor appears as one star but is actually a system of six stars gravitationally bound together.",
    stars: [
      { x: 0.2, y: 0.1, name: "Castor", bright: true },
      { x: 0.35, y: 0.1, name: "Pollux", bright: true },
      { x: 0.15, y: 0.35, name: "Epsilon Gem" },
      { x: 0.28, y: 0.38, name: "Mu Gem" },
      { x: 0.18, y: 0.6, name: "Nu Gem" },
      { x: 0.32, y: 0.62, name: "Xi Gem" },
      { x: 0.2, y: 0.82, name: "Eta Gem", bright: true },
      { x: 0.42, y: 0.82, name: "Alhena", bright: true }
    ],
    lines: [[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[2,3],[4,5],[6,7]]
  },
  {
    id: "taurus",
    name: "Taurus",
    emoji: "🐂",
    myth: "Taurus represents Zeus in disguise as a white bull to woo Europa, a Phoenician princess. He carried her across the sea to Crete. The Pleiades star cluster within Taurus represents seven sisters who were transformed into stars to escape the hunter Orion.",
    season: "Winter",
    mainStar: "Aldebaran",
    funFact: "The Pleiades star cluster, visible within Taurus, has been important to cultures worldwide — used for navigation, agriculture timing, and ceremony for over 100,000 years.",
    stars: [
      { x: 0.55, y: 0.45, name: "Aldebaran", bright: true },
      { x: 0.4, y: 0.35, name: "Epsilon Tau" },
      { x: 0.45, y: 0.55, name: "Gamma Tau" },
      { x: 0.62, y: 0.32, name: "Delta Tau" },
      { x: 0.68, y: 0.2, name: "Beta Tau", bright: true },
      { x: 0.72, y: 0.55, name: "Zeta Tau", bright: true },
      { x: 0.22, y: 0.22, name: "Pleiades", bright: true }
    ],
    lines: [[0,1],[0,2],[0,3],[3,4],[0,5],[1,6]]
  }
];
