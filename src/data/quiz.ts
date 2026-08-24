export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  emoji: string;
  category: "planets" | "missions" | "physics" | "stars" | "general";
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which planet has the largest volcano in the Solar System?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
    explanation: "Olympus Mons on Mars is 22 km high — nearly 3× taller than Mount Everest — and so wide you couldn't see its edges from the center.",
    emoji: "🌋",
    category: "planets"
  },
  {
    id: "q2",
    question: "Which planet spins in the opposite direction to most others?",
    options: ["Mars", "Saturn", "Venus", "Neptune"],
    correctIndex: 2,
    explanation: "Venus rotates retrograde (backwards). On Venus, the Sun rises in the west and sets in the east.",
    emoji: "🔄",
    category: "planets"
  },
  {
    id: "q3",
    question: "What force keeps planets in orbit around the Sun?",
    options: ["Magnetism", "Gravity", "Solar Wind", "Nuclear Force"],
    correctIndex: 1,
    explanation: "Gravity is the attractive force between any two masses. The Sun's massive gravity bends planet paths into orbits.",
    emoji: "🪐",
    category: "physics"
  },
  {
    id: "q4",
    question: "Which space telescope took the deepest images of the universe in infrared?",
    options: ["Hubble", "Kepler", "James Webb", "Chandra"],
    correctIndex: 2,
    explanation: "The James Webb Space Telescope can see galaxies formed just 300 million years after the Big Bang, far deeper than Hubble.",
    emoji: "🔭",
    category: "missions"
  },
  {
    id: "q5",
    question: "How many moons does Mars have?",
    options: ["0", "1", "2", "5"],
    correctIndex: 2,
    explanation: "Mars has two tiny moons: Phobos and Deimos, named after the Greek gods of fear and dread.",
    emoji: "🔴",
    category: "planets"
  },
  {
    id: "q6",
    question: "Which country successfully landed near the Moon's south pole first?",
    options: ["USA", "China", "Russia", "India"],
    correctIndex: 3,
    explanation: "India's Chandrayaan-3 made history on August 23, 2023, as the first mission to soft-land near the lunar south pole.",
    emoji: "🇮🇳",
    category: "missions"
  },
  {
    id: "q7",
    question: "If Earth's mass doubled (radius unchanged), what happens to surface gravity?",
    options: ["Stays the same", "Halves", "Doubles", "Quadruples"],
    correctIndex: 2,
    explanation: "Surface gravity g = GM/r². Doubling mass M while keeping radius r the same doubles the surface gravity.",
    emoji: "⚖️",
    category: "physics"
  },
  {
    id: "q8",
    question: "Which planet has the fastest winds in the Solar System?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 3,
    explanation: "Neptune's winds exceed 2,100 km/h — faster than the speed of sound on Earth.",
    emoji: "💨",
    category: "planets"
  },
  {
    id: "q9",
    question: "What is the Milky Way?",
    options: ["A nebula", "Our galaxy", "A star cluster", "A comet trail"],
    correctIndex: 1,
    explanation: "The Milky Way is our home galaxy — a barred spiral galaxy containing over 300 billion stars.",
    emoji: "🌌",
    category: "general"
  },
  {
    id: "q10",
    question: "What happens to orbital period if you move a moon farther away?",
    options: ["Gets shorter", "Stays the same", "Gets longer", "It falls into the planet"],
    correctIndex: 2,
    explanation: "By Kepler's third law, T = 2π√(r³/GM). As r increases, the period T gets longer — the moon takes more time to complete each orbit.",
    emoji: "🌙",
    category: "physics"
  },
  {
    id: "q11",
    question: "Which is the largest planet in our Solar System?",
    options: ["Saturn", "Uranus", "Neptune", "Jupiter"],
    correctIndex: 3,
    explanation: "Jupiter is so large that over 1,300 Earths could fit inside it. It contains more than twice the mass of all other planets combined.",
    emoji: "🟠",
    category: "planets"
  },
  {
    id: "q12",
    question: "What would happen if Earth stopped rotating?",
    options: ["Nothing changes", "Day becomes infinite on one side", "Earth would explode", "Gravity would disappear"],
    correctIndex: 1,
    explanation: "If Earth stopped rotating, one side would have eternal day and the other eternal night. Winds of hundreds of km/h would also sweep the surface from atmospheric inertia.",
    emoji: "🌍",
    category: "physics"
  },
  {
    id: "q13",
    question: "Voyager 1 is famous for being...",
    options: ["First to Mars", "Farthest human-made object", "First space station", "First to Jupiter"],
    correctIndex: 1,
    explanation: "Launched in 1977, Voyager 1 has crossed into interstellar space and is over 23 billion km from Earth — the most distant human artifact.",
    emoji: "🚀",
    category: "missions"
  },
  {
    id: "q14",
    question: "Saturn could float on water. True or False?",
    options: ["True", "False", "Only its rings would float", "It depends on the temperature"],
    correctIndex: 0,
    explanation: "Saturn has a density of only 687 kg/m³ — less than water (1000 kg/m³). If you could find an ocean big enough, Saturn would float!",
    emoji: "💧",
    category: "planets"
  },
  {
    id: "q15",
    question: "What is escape velocity?",
    options: [
      "Speed to orbit Earth",
      "Speed needed to leave a planet's gravity forever",
      "Speed of light",
      "Speed to reach the Moon"
    ],
    correctIndex: 1,
    explanation: "Escape velocity is the minimum speed an object needs to break free from a planet's gravitational pull without further propulsion. For Earth it's ~11.2 km/s.",
    emoji: "🛸",
    category: "physics"
  },
  {
    id: "q16",
    question: "Which star is directly above Earth's North Pole?",
    options: ["Sirius", "Vega", "Polaris", "Betelgeuse"],
    correctIndex: 2,
    explanation: "Polaris (the North Star) sits almost directly above Earth's North Pole, making it appear motionless while all other stars rotate around it.",
    emoji: "⭐",
    category: "stars"
  },
  {
    id: "q17",
    question: "India's first mission to orbit Mars was called...",
    options: ["Chandrayaan-1", "Mangalyaan", "Aditya-L1", "ASTROSAT"],
    correctIndex: 1,
    explanation: "Mangalyaan (Mars Orbiter Mission) reached Mars on its first attempt in 2014, making India the first Asian nation to successfully orbit Mars.",
    emoji: "🇮🇳",
    category: "missions"
  },
  {
    id: "q18",
    question: "What type of object is Uranus?",
    options: ["Gas giant", "Rocky planet", "Ice giant", "Dwarf planet"],
    correctIndex: 2,
    explanation: "Uranus is classified as an ice giant — its interior is made mostly of icy materials like water, methane, and ammonia, unlike gas giants Jupiter and Saturn.",
    emoji: "🔵",
    category: "planets"
  },
  {
    id: "q19",
    question: "How does gravitational force change if you double the distance between two objects?",
    options: [
      "Force doubles",
      "Force halves",
      "Force becomes ¼",
      "Force stays the same"
    ],
    correctIndex: 2,
    explanation: "Newton's law: F = Gm₁m₂/r². Doubling r means r² quadruples, so force becomes 1/4. This is called the inverse-square law.",
    emoji: "🧲",
    category: "physics"
  },
  {
    id: "q20",
    question: "Which planet has a Great Red Spot?",
    options: ["Mars", "Jupiter", "Saturn", "Neptune"],
    correctIndex: 1,
    explanation: "Jupiter's Great Red Spot is a storm that has been raging for over 350 years. It's so large that two Earths could fit inside it.",
    emoji: "🌀",
    category: "planets"
  }
];
