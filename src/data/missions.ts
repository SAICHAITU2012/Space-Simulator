export type Mission = {
  id: string;
  name: string;
  agency: string;
  country: string;
  agencyColor: string;
  year: number;
  destination: string;
  destinationEmoji: string;
  status: "active" | "completed" | "historic";
  story: string;
  highlight: string;
};

export const MISSIONS: Mission[] = [
  {
    id: "apollo11",
    name: "Apollo 11",
    agency: "NASA",
    country: "🇺🇸",
    agencyColor: "#0b3d91",
    year: 1969,
    destination: "Moon",
    destinationEmoji: "🌕",
    status: "historic",
    story: "The mission that changed humanity forever. On July 20, 1969, Neil Armstrong and Buzz Aldrin became the first humans to set foot on another world. Armstrong's words — \"One small step for man, one giant leap for mankind\" — echoed across a planet holding its breath.",
    highlight: "First humans on the Moon"
  },
  {
    id: "voyager1",
    name: "Voyager 1",
    agency: "NASA",
    country: "🇺🇸",
    agencyColor: "#0b3d91",
    year: 1977,
    destination: "Interstellar Space",
    destinationEmoji: "🌌",
    status: "active",
    story: "Launched in 1977, Voyager 1 is the farthest human-made object ever. It has crossed into interstellar space and is still sending back data from over 23 billion km away. It carries a Golden Record — a message from Earth to the cosmos.",
    highlight: "Farthest spacecraft ever"
  },
  {
    id: "perseverance",
    name: "Perseverance",
    agency: "NASA",
    country: "🇺🇸",
    agencyColor: "#0b3d91",
    year: 2021,
    destination: "Mars",
    destinationEmoji: "🔴",
    status: "active",
    story: "Perseverance is searching for signs of ancient microbial life on Mars. It also brought Ingenuity, the first powered aircraft to fly on another planet. Every sol (Martian day), it drives across ancient river deltas collecting rock samples.",
    highlight: "Searching for life on Mars"
  },
  {
    id: "chandrayaan3",
    name: "Chandrayaan-3",
    agency: "ISRO",
    country: "🇮🇳",
    agencyColor: "#ff7f00",
    year: 2023,
    destination: "Moon — South Pole",
    destinationEmoji: "🌕",
    status: "completed",
    story: "India's historic mission that successfully soft-landed the Vikram lander near the lunar south pole on August 23, 2023 — a date now celebrated as National Space Day in India. ISRO became the fourth space agency to achieve a soft lunar landing and the first to reach the south pole.",
    highlight: "First soft landing near lunar south pole"
  },
  {
    id: "mangalyaan",
    name: "Mangalyaan (MOM)",
    agency: "ISRO",
    country: "🇮🇳",
    agencyColor: "#ff7f00",
    year: 2014,
    destination: "Mars",
    destinationEmoji: "🔴",
    status: "completed",
    story: "Mars Orbiter Mission — India's first interplanetary mission, reaching Mars orbit on its very first attempt. It made India the first Asian nation and only fourth space agency to reach Mars. Built in record time and at a fraction of the cost of similar missions.",
    highlight: "Asia's first Mars mission"
  },
  {
    id: "jwst",
    name: "James Webb Space Telescope",
    agency: "NASA / ESA / CSA",
    country: "🌍",
    agencyColor: "#7b2fff",
    year: 2022,
    destination: "L2 Lagrange Point",
    destinationEmoji: "🔭",
    status: "active",
    story: "The most powerful space telescope ever built. JWST can see galaxies formed just 300 million years after the Big Bang. Its infrared eyes pierce through dust clouds to reveal stellar nurseries, exoplanet atmospheres, and the deepest views of the universe ever captured.",
    highlight: "Deepest view of the universe"
  },
  {
    id: "adityaL1",
    name: "Aditya-L1",
    agency: "ISRO",
    country: "🇮🇳",
    agencyColor: "#ff7f00",
    year: 2024,
    destination: "L1 Lagrange Point (Sun)",
    destinationEmoji: "☀️",
    status: "active",
    story: "India's first solar observatory mission, positioned at the L1 Lagrange point — a gravitationally balanced spot 1.5 million km from Earth — for an unobstructed view of the Sun. It studies solar wind, coronal mass ejections, and the Sun's outer atmosphere in real time.",
    highlight: "India's first solar observatory"
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    agency: "NASA / ESA",
    country: "🌍",
    agencyColor: "#0b3d91",
    year: 1990,
    destination: "Low Earth Orbit",
    destinationEmoji: "🌏",
    status: "active",
    story: "Launched in 1990 and still operational, Hubble has fundamentally changed our understanding of the universe. It determined the age of the universe, confirmed dark energy's existence, discovered that nearly every galaxy has a supermassive black hole, and produced iconic images like the Pillars of Creation.",
    highlight: "34+ years of cosmic discovery"
  }
];
