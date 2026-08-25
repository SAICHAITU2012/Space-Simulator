export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  emoji: string;
  category: "planets" | "missions" | "physics" | "stars" | "general";
  objectId?: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which planet has the largest volcano in the Solar System?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
    explanation: "Olympus Mons on Mars is 22 km high — nearly 3× taller than Mount Everest — and so wide you couldn't see its edges from the center.",
    emoji: "🌋",
    category: "planets",
    objectId: "mars"
  },
  {
    id: "q2",
    question: "Which planet spins in the opposite direction to most others?",
    options: ["Mars", "Saturn", "Venus", "Neptune"],
    correctIndex: 2,
    explanation: "Venus rotates retrograde (backwards). On Venus, the Sun rises in the west and sets in the east.",
    emoji: "🔄",
    category: "planets",
    objectId: "venus"
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
    category: "missions",
    objectId: "jwst"
  },
  {
    id: "q5",
    question: "How many moons does Mars have?",
    options: ["0", "1", "2", "5"],
    correctIndex: 2,
    explanation: "Mars has two tiny moons: Phobos and Deimos, named after the Greek gods of fear and dread.",
    emoji: "🔴",
    category: "planets",
    objectId: "mars"
  },
  {
    id: "q6",
    question: "Which country successfully landed near the Moon's south pole first?",
    options: ["USA", "China", "Russia", "India"],
    correctIndex: 3,
    explanation: "India's Chandrayaan-3 made history on August 23, 2023, as the first mission to soft-land near the lunar south pole.",
    emoji: "🇮🇳",
    category: "missions",
    objectId: "chandrayaan3"
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
    category: "planets",
    objectId: "neptune"
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
    category: "planets",
    objectId: "jupiter"
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
    category: "missions",
    objectId: "voyager1"
  },
  {
    id: "q14",
    question: "Saturn could float on water. True or False?",
    options: ["True", "False", "Only its rings would float", "It depends on the temperature"],
    correctIndex: 0,
    explanation: "Saturn has a density of only 687 kg/m³ — less than water (1000 kg/m³). If you could find an ocean big enough, Saturn would float!",
    emoji: "💧",
    category: "planets",
    objectId: "saturn"
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
    category: "missions",
    objectId: "mangalyaan"
  },
  {
    id: "q18",
    question: "What type of object is Uranus?",
    options: ["Gas giant", "Rocky planet", "Ice giant", "Dwarf planet"],
    correctIndex: 2,
    explanation: "Uranus is classified as an ice giant — its interior is made mostly of icy materials like water, methane, and ammonia, unlike gas giants Jupiter and Saturn.",
    emoji: "🔵",
    category: "planets",
    objectId: "uranus"
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
    category: "planets",
    objectId: "jupiter"
  },
  {
    id: "q21",
    question: "What is special about Europa?",
    options: ["It has rings", "A subsurface ocean under ice", "It is a gas giant", "It is hotter than Venus"],
    correctIndex: 1,
    explanation: "Europa's icy crust covers a global saltwater ocean — a prime target in the search for life.",
    emoji: "🧊",
    category: "planets",
    objectId: "europa"
  },
  {
    id: "q22",
    question: "Titan's lakes are mostly made of...",
    options: ["Water", "Lava", "Methane and ethane", "Liquid nitrogen"],
    correctIndex: 2,
    explanation: "Titan is the only moon with stable surface liquids, but they are hydrocarbons, not water.",
    emoji: "🟠",
    category: "planets",
    objectId: "titan"
  },
  {
    id: "q23",
    question: "The ISS orbits Earth roughly how often?",
    options: ["Once a week", "Once a day", "About 16 times a day", "Once a month"],
    correctIndex: 2,
    explanation: "At about 400 km altitude the station completes an orbit in ~93 minutes — about 16 sunrises per crew day.",
    emoji: "🛸",
    category: "missions",
    objectId: "iss"
  },
  {
    id: "q24",
    question: "NavIC is...",
    options: ["A Mars rover", "India's regional satellite navigation system", "A crew capsule", "A lunar lander"],
    correctIndex: 1,
    explanation: "NavIC (IRNSS) is ISRO's GNSS covering India and a surrounding region, independent of GPS.",
    emoji: "📍",
    category: "missions",
    objectId: "navic"
  },
  {
    id: "q25",
    question: "Aditya-L1 studies the Sun from...",
    options: ["Low Earth orbit", "The lunar south pole", "The L1 Lagrange point", "Mars orbit"],
    correctIndex: 2,
    explanation: "L1 is about 1.5 million km sunward of Earth, so Aditya-L1 can watch the Sun without Earth eclipses.",
    emoji: "☀️",
    category: "missions",
    objectId: "adityal1"
  },
  {
    id: "q26",
    question: "Ceres is located in...",
    options: ["The Kuiper Belt", "The asteroid belt", "Orbit around Jupiter", "Interstellar space"],
    correctIndex: 1,
    explanation: "Ceres is the largest body in the main asteroid belt between Mars and Jupiter, and a dwarf planet.",
    emoji: "🪨",
    category: "planets",
    objectId: "ceres"
  },
  {
    id: "q27",
    question: "The Moon is Earth's only natural satellite. About how far away is it?",
    options: ["400 km", "384,000 km", "150 million km", "1 light-year"],
    correctIndex: 1,
    explanation: "The Moon averages about 384,000 km from Earth — far enough that light takes about 1.3 seconds to get there.",
    emoji: "🌙",
    category: "planets",
    objectId: "luna"
  },
  {
    id: "q28",
    question: "Pluto is now classified as a...",
    options: ["Planet", "Moon", "Dwarf planet", "Comet"],
    correctIndex: 2,
    explanation: "In 2006 the IAU reclassified Pluto as a dwarf planet because it has not cleared its neighborhood in the Kuiper Belt.",
    emoji: "❄️",
    category: "planets",
    objectId: "pluto"
  },
  {
    id: "q29",
    question: "Halley's Comet returns to the inner Solar System about every...",
    options: ["4 years", "12 years", "76 years", "1,000 years"],
    correctIndex: 2,
    explanation: "Halley is a short-period comet. Its last perihelion was 1986; the next is expected in 2061.",
    emoji: "☄️",
    category: "general",
    objectId: "halley"
  },
  {
    id: "q30",
    question: "Sirius is famous for being...",
    options: ["The closest star to Earth", "The brightest star in Earth's night sky", "Our North Star", "A black hole"],
    correctIndex: 1,
    explanation: "Sirius in Canis Major is the brightest night-sky star. The closest star system is actually Alpha Centauri.",
    emoji: "✨",
    category: "stars",
    objectId: "sirius"
  },
  {
    id: "q31",
    question: "The Andromeda Galaxy is...",
    options: ["Inside the Solar System", "The nearest large galaxy to the Milky Way", "A nebula in Orion", "Earth's moon"],
    correctIndex: 1,
    explanation: "Andromeda (M31) is about 2.5 million light-years away and will eventually merge with the Milky Way.",
    emoji: "🌀",
    category: "stars",
    objectId: "andromeda"
  },
  {
    id: "q32",
    question: "The Whirlpool Galaxy is also known as...",
    options: ["M31", "M51", "M87", "M13"],
    correctIndex: 1,
    explanation: "Messier 51 is a face-on spiral interacting with a smaller companion — a classic classroom galaxy.",
    emoji: "🌀",
    category: "stars",
    objectId: "whirlpool"
  },
  {
    id: "q33",
    question: "What does ISRO stand for?",
    options: [
      "Indian Space Research Organisation",
      "International Satellite Relay Office",
      "Indian Solar Rover Observatory",
      "Interplanetary Science Research Office"
    ],
    correctIndex: 0,
    explanation: "ISRO is India's national space agency, known for cost-efficient missions like Chandrayaan and Mangalyaan.",
    emoji: "🇮🇳",
    category: "missions"
  },
  {
    id: "q34",
    question: "Astronauts on the ISS feel weightless because...",
    options: [
      "There is no gravity in space",
      "They are constantly falling around Earth",
      "The station has anti-gravity engines",
      "Earth's atmosphere holds them up"
    ],
    correctIndex: 1,
    explanation: "Orbit is free-fall. Gravity is still strong at 400 km; the crew and station fall together around Earth.",
    emoji: "🛸",
    category: "physics",
    objectId: "iss"
  },
  {
    id: "q35",
    question: "Mercury is the planet closest to the Sun. A Mercury year is about...",
    options: ["88 Earth days", "365 Earth days", "12 Earth years", "1 Earth hour"],
    correctIndex: 0,
    explanation: "Mercury zips around the Sun in 88 Earth days, but one Mercury day (sunrise to sunrise) lasts 176 Earth days.",
    emoji: "☿️",
    category: "planets",
    objectId: "mercury"
  },
  {
    id: "q36",
    question: "Earth is in the Sun's habitable zone because...",
    options: [
      "It has rings",
      "Liquid water can exist on the surface",
      "It is the biggest planet",
      "It has the most moons"
    ],
    correctIndex: 1,
    explanation: "The habitable zone is the distance range where a rocky planet can keep liquid water — a key ingredient for life as we know it.",
    emoji: "🌍",
    category: "planets",
    objectId: "earth"
  },
  {
    id: "q37",
    question: "A light-year measures...",
    options: ["Time", "Brightness", "Distance", "Temperature"],
    correctIndex: 2,
    explanation: "A light-year is how far light travels in one year — about 9.5 trillion km. It is a distance, not a length of time.",
    emoji: "📏",
    category: "general"
  },
  {
    id: "q38",
    question: "The Sun is a...",
    options: ["Planet", "Comet", "Star", "Galaxy"],
    correctIndex: 2,
    explanation: "The Sun is a G-type main-sequence star. Planets orbit it; galaxies are huge collections of stars.",
    emoji: "☀️",
    category: "stars"
  },
  {
    id: "q39",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Mercury", "Jupiter"],
    correctIndex: 1,
    explanation: "Iron oxide (rust) in Martian dust gives the planet its reddish color.",
    emoji: "🔴",
    category: "planets",
    objectId: "mars"
  },
  {
    id: "q40",
    question: "Saturn's rings are made mostly of...",
    options: ["Solid gold", "Ice and rock chunks", "Hot lava", "Clouds of oxygen"],
    correctIndex: 1,
    explanation: "Billions of icy particles — from snow-grain size to house-size boulders — orbit Saturn as rings.",
    emoji: "💍",
    category: "planets",
    objectId: "saturn"
  },
  {
    id: "q41",
    question: "Io is famous for...",
    options: ["Liquid methane lakes", "Active volcanoes", "Being Earth's moon", "Having rings"],
    correctIndex: 1,
    explanation: "Jupiter's moon Io is the most volcanically active world in the Solar System, squeezed by Jupiter's gravity.",
    emoji: "🌋",
    category: "planets",
    objectId: "io"
  },
  {
    id: "q42",
    question: "Callisto is a moon of...",
    options: ["Mars", "Saturn", "Jupiter", "Neptune"],
    correctIndex: 2,
    explanation: "Callisto is the outermost of Jupiter's four Galilean moons, heavily cratered and very old.",
    emoji: "🌑",
    category: "planets",
    objectId: "callisto"
  },
  {
    id: "q43",
    question: "If you jump on the Moon, you go higher because...",
    options: [
      "The Moon has no gravity",
      "The Moon's gravity is weaker than Earth's",
      "The Moon is hotter",
      "There is more air to push on"
    ],
    correctIndex: 1,
    explanation: "Lunar gravity is about 1/6 of Earth's, so the same jump sends you higher and you fall back more slowly.",
    emoji: "🤸",
    category: "physics",
    objectId: "luna"
  },
  {
    id: "q44",
    question: "NASA's name is short for...",
    options: [
      "National Astronomy and Space Agency",
      "National Aeronautics and Space Administration",
      "North American Satellite Association",
      "National Air and Star Academy"
    ],
    correctIndex: 1,
    explanation: "NASA was founded in 1958 and leads U.S. civil spaceflight, science, and aeronautics.",
    emoji: "🇺🇸",
    category: "missions"
  },
  {
    id: "q45",
    question: "A comet's tail always points...",
    options: ["Toward the Sun", "Away from the Sun", "Toward Earth", "Toward the nearest planet"],
    correctIndex: 1,
    explanation: "Solar wind and sunlight push dust and gas away from the Sun, so the tail streams outward even when the comet is leaving.",
    emoji: "☄️",
    category: "general"
  },
  {
    id: "q46",
    question: "How many planets are in our Solar System (official IAU count)?",
    options: ["8", "9", "12", "1"],
    correctIndex: 0,
    explanation: "Mercury through Neptune — eight planets. Pluto is a dwarf planet, not one of the eight.",
    emoji: "🪐",
    category: "general"
  },
  {
    id: "q47",
    question: "The Milky Way looks milky from Earth because...",
    options: [
      "It is made of milk",
      "We see the combined glow of billions of distant stars",
      "The Moon reflects extra light",
      "Clouds in our atmosphere are glowing"
    ],
    correctIndex: 1,
    explanation: "We live inside a disk galaxy. Looking along the disk, countless stars blend into a pale band.",
    emoji: "🌌",
    category: "stars"
  },
  {
    id: "q48",
    question: "Venus is hotter than Mercury even though it is farther from the Sun because...",
    options: [
      "It has a thick greenhouse atmosphere",
      "It is closer to Jupiter",
      "It has more volcanoes than the Sun",
      "It spins much faster"
    ],
    correctIndex: 0,
    explanation: "Venus's carbon-dioxide air traps heat. Surface temperatures are around 465°C — hotter than Mercury's.",
    emoji: "🌡️",
    category: "planets",
    objectId: "venus"
  },
  {
    id: "q49",
    question: "Jupiter is a...",
    options: ["Rocky planet", "Gas giant", "Dwarf planet", "Star"],
    correctIndex: 1,
    explanation: "Jupiter is mostly hydrogen and helium with no solid ground like Earth's crust.",
    emoji: "🟠",
    category: "planets",
    objectId: "jupiter"
  },
  {
    id: "q50",
    question: "Uranus is tipped on its side. A likely reason is...",
    options: [
      "It formed that way from a pancake of gas",
      "A giant collision long ago",
      "Earth's gravity pulls it over",
      "Its rings are too heavy"
    ],
    correctIndex: 1,
    explanation: "Uranus's axis is tilted about 98°. Models suggest a huge impact knocked it over early in Solar System history.",
    emoji: "🔄",
    category: "planets",
    objectId: "uranus"
  },
  {
    id: "q51",
    question: "Neptune was the first planet found by...",
    options: ["Naked-eye watching", "Math predicting its gravity tug", "A Mars rover", "Radio from aliens"],
    correctIndex: 1,
    explanation: "Uranus's orbit wobbled. Astronomers calculated where an unseen planet must be — and found Neptune in 1846.",
    emoji: "🔵",
    category: "planets",
    objectId: "neptune"
  },
  {
    id: "q52",
    question: "Earth's atmosphere is mostly...",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"],
    correctIndex: 2,
    explanation: "About 78% nitrogen and 21% oxygen, plus small amounts of argon, water vapor, and CO₂.",
    emoji: "💨",
    category: "planets",
    objectId: "earth"
  },
  {
    id: "q53",
    question: "A black hole is...",
    options: [
      "A hole in space with nothing around it",
      "A region where gravity is so strong light cannot escape",
      "A dark planet",
      "The shadow of the Moon"
    ],
    correctIndex: 1,
    explanation: "Sagittarius A* at the Milky Way's center is a supermassive black hole — not an empty 'drain'.",
    emoji: "🕳️",
    category: "stars",
    objectId: "sagittarius"
  },
  {
    id: "q54",
    question: "Satellites stay in orbit instead of falling straight down because they...",
    options: [
      "Are outside all gravity",
      "Move sideways fast enough to keep missing Earth",
      "Are held up by air",
      "Are lighter than air"
    ],
    correctIndex: 1,
    explanation: "Newton's cannonball idea: enough sideways speed and the curve of the fall matches Earth's curve.",
    emoji: "🛰",
    category: "physics"
  },
  {
    id: "q55",
    question: "The first artificial satellite was...",
    options: ["Hubble", "Sputnik 1", "ISS", "Apollo 11"],
    correctIndex: 1,
    explanation: "The Soviet Union launched Sputnik 1 in 1957, starting the Space Age.",
    emoji: "📡",
    category: "missions"
  },
  {
    id: "q56",
    question: "Apollo 11 is famous because it...",
    options: ["Orbited Mars", "Landed the first humans on the Moon", "Built the ISS", "Found Pluto"],
    correctIndex: 1,
    explanation: "In July 1969 Neil Armstrong and Buzz Aldrin walked on the Moon while Michael Collins orbited above.",
    emoji: "🚀",
    category: "missions"
  },
  {
    id: "q57",
    question: "Charon is...",
    options: ["A ring of Saturn", "Pluto's largest moon", "A NASA rover", "The Sun's twin"],
    correctIndex: 1,
    explanation: "Charon is so large compared with Pluto that the pair is often called a double dwarf-planet system.",
    emoji: "🌑",
    category: "planets",
    objectId: "pluto"
  },
  {
    id: "q58",
    question: "The asteroid belt is mainly between...",
    options: ["Earth and Venus", "Mars and Jupiter", "Saturn and Uranus", "Neptune and Pluto"],
    correctIndex: 1,
    explanation: "Most main-belt asteroids, including dwarf planet Ceres, orbit between Mars and Jupiter.",
    emoji: "🪨",
    category: "general"
  },
  {
    id: "q59",
    question: "Stars twinkle because...",
    options: [
      "They turn off and on",
      "Earth's air bends their light",
      "The Moon blocks them rapidly",
      "They are all planets"
    ],
    correctIndex: 1,
    explanation: "Turbulent air acts like a wavy lens. Planets usually twinkle less because they are tiny disks, not pinpoints.",
    emoji: "⭐",
    category: "stars"
  },
  {
    id: "q60",
    question: "The Kuiper Belt is...",
    options: [
      "A ring around Earth",
      "An icy region beyond Neptune",
      "The Sun's core",
      "A NASA building"
    ],
    correctIndex: 1,
    explanation: "Pluto, Haumea, Makemake, and many comets live in this distant disk of leftover icy worlds.",
    emoji: "❄️",
    category: "general"
  },
  {
    id: "q61",
    question: "Gravity on a planet gets stronger if you...",
    options: [
      "Increase the planet's mass (same size)",
      "Paint it blue",
      "Add more moons only",
      "Turn off the Sun"
    ],
    correctIndex: 0,
    explanation: "Surface gravity is GM/r². More mass with the same radius means a stronger pull under your feet.",
    emoji: "⚖️",
    category: "physics"
  },
  {
    id: "q62",
    question: "ESA is the space agency of...",
    options: ["Japan", "Europe", "India", "Brazil"],
    correctIndex: 1,
    explanation: "The European Space Agency coordinates missions like Rosetta, Gaia, and parts of the ISS Columbus lab.",
    emoji: "🇪🇺",
    category: "missions"
  },
  {
    id: "q63",
    question: "Phobos and Deimos are moons of...",
    options: ["Earth", "Mars", "Venus", "Mercury"],
    correctIndex: 1,
    explanation: "Mars's two tiny lumpy moons may be captured asteroids. They are named for fear and dread.",
    emoji: "🛰️",
    category: "planets",
    objectId: "mars"
  },
  {
    id: "q64",
    question: "The Orion Nebula is a place where...",
    options: ["Black holes eat planets", "New stars are being born", "Earth's weather starts", "Comets go to sleep"],
    correctIndex: 1,
    explanation: "It is a nearby stellar nursery in Orion's sword, visible as a fuzzy patch even in binoculars.",
    emoji: "N",
    category: "stars",
    objectId: "orion_nebula"
  },
  {
    id: "q65",
    question: "Ganymede is special because it is...",
    options: [
      "Smaller than Earth's Moon",
      "The largest moon in the Solar System",
      "A star",
      "Hotter than the Sun"
    ],
    correctIndex: 1,
    explanation: "Ganymede is bigger than Mercury and has its own magnetic field — unique among moons.",
    emoji: "🌕",
    category: "planets",
    objectId: "ganymede"
  },
  {
    id: "q66",
    question: "Day and night on Earth happen because...",
    options: [
      "The Sun orbits Earth each day",
      "Earth rotates on its axis",
      "The Moon blocks the Sun every night",
      "Stars turn off"
    ],
    correctIndex: 1,
    explanation: "Earth spins once in about 24 hours. The Sun only appears to move across the sky.",
    emoji: "🌅",
    category: "general"
  }
];
