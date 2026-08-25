export type PlanetLayer = {
  label: string;
  color: string;
  temp: string;
  depth: string;
};

export const PLANET_LAYERS: Record<string, PlanetLayer[]> = {
  mercury: [
    { label: "Inner Core", color: "#e87040", temp: "~1,800°C", depth: "0–600 km" },
    { label: "Outer Core", color: "#d45520", temp: "~1,000°C", depth: "600–1,800 km" },
    { label: "Mantle", color: "#8a4020", temp: "~700°C", depth: "1,800–2,350 km" },
    { label: "Crust", color: "#5a3010", temp: "~450°C", depth: "2,350–2,440 km" },
  ],
  venus: [
    { label: "Iron Core", color: "#d45020", temp: "~5,000°C", depth: "0–3,110 km" },
    { label: "Mantle", color: "#a06030", temp: "~2,000°C", depth: "3,110–6,051 km" },
    { label: "Crust", color: "#c09050", temp: "~465°C", depth: "surface" },
  ],
  earth: [
    { label: "Inner Core", color: "#ffbb44", temp: "~5,400°C", depth: "0–1,200 km" },
    { label: "Outer Core", color: "#ff8822", temp: "~4,000°C", depth: "1,200–3,400 km" },
    { label: "Mantle", color: "#883020", temp: "~2,000°C", depth: "3,400–6,335 km" },
    { label: "Crust", color: "#44aa66", temp: "~20°C", depth: "thin shell" },
  ],
  mars: [
    { label: "Iron Core", color: "#cc4422", temp: "~1,400°C", depth: "0–1,800 km" },
    { label: "Silicate Mantle", color: "#883322", temp: "~1,000°C", depth: "1,800–3,370 km" },
    { label: "Crust", color: "#bb5533", temp: "−60°C", depth: "thin shell" },
  ],
  jupiter: [
    { label: "Rocky Core", color: "#aa6622", temp: "~24,000°C", depth: "0–14,000 km" },
    { label: "Metallic H₂", color: "#446699", temp: "~10,000°C", depth: "14,000–50,000 km" },
    { label: "Liquid H₂", color: "#6688cc", temp: "~5,000°C", depth: "50,000–71,000 km" },
    { label: "Atmosphere", color: "#ccaa66", temp: "−110°C", depth: "outer layer" },
  ],
  saturn: [
    { label: "Rocky Core", color: "#aa8844", temp: "~15,000°C", depth: "0–9,000 km" },
    { label: "Metallic H₂", color: "#557799", temp: "~7,000°C", depth: "9,000–30,000 km" },
    { label: "Liquid H₂", color: "#7799bb", temp: "~3,000°C", depth: "30,000–60,000 km" },
    { label: "Atmosphere", color: "#ddbb88", temp: "−140°C", depth: "outer layer" },
  ],
  uranus: [
    { label: "Rocky Core", color: "#668899", temp: "~5,000°C", depth: "0–7,500 km" },
    { label: "Ice Mantle", color: "#4499bb", temp: "~2,000°C", depth: "7,500–25,000 km" },
    { label: "Atmosphere", color: "#88ccdd", temp: "−195°C", depth: "outer" },
  ],
  neptune: [
    { label: "Rocky Core", color: "#334466", temp: "~5,400°C", depth: "0–7,000 km" },
    { label: "Ice Mantle", color: "#335588", temp: "~2,500°C", depth: "7,000–24,000 km" },
    { label: "Atmosphere", color: "#4466aa", temp: "−200°C", depth: "outer" },
  ],
};

export function layersForPlanet(id: string): PlanetLayer[] {
  return PLANET_LAYERS[id] ?? PLANET_LAYERS.earth;
}
