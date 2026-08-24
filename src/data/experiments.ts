export type ExperimentParam = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type Experiment = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: "rotation" | "mass" | "gravity" | "orbit" | "velocity";
  targetPlanetId: string;
  params: ExperimentParam[];
  formula: string;
  formulaLabel: string;
  explanation: (vals: Record<string, number>) => string;
  takeaway: string;
  disclaimer: string;
};

export const EXPERIMENTS: Experiment[] = [
  {
    id: "earth_spin_faster",
    emoji: "🌍",
    title: "Earth Spins 2× Faster",
    subtitle: "What happens if Earth rotates twice as fast?",
    category: "rotation",
    targetPlanetId: "earth",
    params: [
      { key: "rotationScale", label: "Rotation Speed", unit: "×", min: 0.1, max: 5, step: 0.1, defaultValue: 2 }
    ],
    formula: "v = ω × r   |   ω = 2π / T",
    formulaLabel: "Angular & tangential velocity",
    explanation: (vals) => {
      const omega = (2 * Math.PI) / (86400 / vals.rotationScale);
      const v = omega * 6371000;
      return `At ${vals.rotationScale.toFixed(1)}× rotation, Earth's surface at the equator moves at ~${(v / 1000).toFixed(0)} km/s. A day now lasts ${(24 / vals.rotationScale).toFixed(1)} hours.`;
    },
    takeaway: "The faster a planet rotates, the faster objects on its surface move sideways. At very high speeds, the outward rotational force would counteract gravity at the equator.",
    disclaimer: "Simplified rotation model. Real effects on climate, oceans, and atmosphere would be far more complex."
  },
  {
    id: "earth_stop_rotating",
    emoji: "⏸️",
    title: "Stop Earth's Rotation",
    subtitle: "What if Earth suddenly stopped spinning?",
    category: "rotation",
    targetPlanetId: "earth",
    params: [
      { key: "rotationScale", label: "Rotation Speed", unit: "×", min: 0, max: 1, step: 0.05, defaultValue: 0 }
    ],
    formula: "ω = 2π / T   →   ω = 0 means T = ∞",
    formulaLabel: "Angular velocity equals zero",
    explanation: (vals) => {
      const dayHours = vals.rotationScale < 0.01 ? "∞" : (24 / vals.rotationScale).toFixed(0);
      return `At ${(vals.rotationScale * 100).toFixed(0)}% rotation, a day lasts ${dayHours} hours. One side of Earth would be in permanent day, the other in permanent night.`;
    },
    takeaway: "Earth's rotation gives us our 24-hour cycle. Without it, extreme temperature differences would build up between the lit and dark sides.",
    disclaimer: "Simplified model. Real atmospheric and oceanic effects would be extreme and complex."
  },
  {
    id: "change_earth_radius",
    emoji: "📏",
    title: "Change Earth's Radius",
    subtitle: "What if Earth were bigger or smaller?",
    category: "mass",
    targetPlanetId: "earth",
    params: [
      { key: "radiusScale", label: "Radius", unit: "×", min: 0.25, max: 3, step: 0.05, defaultValue: 1.5 }
    ],
    formula: "g = GM / r²   |   A = 4πr²   |   V = (4/3)πr³",
    formulaLabel: "Surface gravity & size formulas",
    explanation: (vals) => {
      const g = 9.8 / (vals.radiusScale * vals.radiusScale);
      const areaRatio = vals.radiusScale * vals.radiusScale;
      const volRatio = vals.radiusScale * vals.radiusScale * vals.radiusScale;
      return `At ${vals.radiusScale.toFixed(1)}× radius (mass unchanged), surface gravity = ${g.toFixed(2)} m/s². Surface area is ${areaRatio.toFixed(1)}× larger, volume is ${volRatio.toFixed(1)}× larger.`;
    },
    takeaway: "If mass stays constant but radius grows, gravity weakens because you're farther from the center. Bigger ≠ heavier gravity!",
    disclaimer: "Mass is held constant in this model. In reality, a larger planet would likely have greater mass."
  },
  {
    id: "change_mass",
    emoji: "⚖️",
    title: "Change Earth's Mass",
    subtitle: "What if Earth were heavier or lighter?",
    category: "mass",
    targetPlanetId: "earth",
    params: [
      { key: "massScale", label: "Mass", unit: "×", min: 0.1, max: 5, step: 0.1, defaultValue: 2 }
    ],
    formula: "g = G × M / r²   |   F = G × m₁m₂ / r²",
    formulaLabel: "Surface gravity & gravitational force",
    explanation: (vals) => {
      const g = 9.8 * vals.massScale;
      const weight30kg = (30 * vals.massScale).toFixed(0);
      return `At ${vals.massScale.toFixed(1)}× mass (radius unchanged), surface gravity = ${g.toFixed(1)} m/s². A 30 kg child would feel like ${weight30kg} kg here.`;
    },
    takeaway: "More mass means stronger gravity — objects are pulled more strongly toward the center. Mass and gravity are directly proportional.",
    disclaimer: "Radius is held constant. In reality, more mass would compress the planet to a different radius."
  },
  {
    id: "moon_distance",
    emoji: "🌙",
    title: "Change Moon's Distance",
    subtitle: "What if the Moon were closer or farther?",
    category: "orbit",
    targetPlanetId: "earth",
    params: [
      { key: "moonDistScale", label: "Moon Distance", unit: "×", min: 0.25, max: 3, step: 0.05, defaultValue: 2 }
    ],
    formula: "F = Gm₁m₂ / r²   |   T = 2π√(r³/GM)",
    formulaLabel: "Gravity & orbital period (Kepler III)",
    explanation: (vals) => {
      const forceRatio = 1 / (vals.moonDistScale * vals.moonDistScale);
      const period = 27.3 * Math.pow(vals.moonDistScale, 1.5);
      return `At ${vals.moonDistScale.toFixed(1)}× distance, gravitational pull is ${forceRatio.toFixed(2)}× normal (inverse-square law). The Moon's orbital period becomes ~${period.toFixed(0)} days.`;
    },
    takeaway: "The inverse-square law means small increases in distance cause large drops in gravitational force. Double the distance → ¼ the pull.",
    disclaimer: "Simplified circular orbit model. Tidal effects, which would also change dramatically, are not shown."
  },
  {
    id: "change_gravity",
    emoji: "🌌",
    title: "Change Gravity Itself",
    subtitle: "What if Newton's G were different?",
    category: "gravity",
    targetPlanetId: "earth",
    params: [
      { key: "gravityScale", label: "Gravity Strength", unit: "×", min: 0.1, max: 5, step: 0.1, defaultValue: 0.5 }
    ],
    formula: "F = G × m₁m₂ / r²   where G = 6.674×10⁻¹¹",
    formulaLabel: "Universal gravitational constant",
    explanation: (vals) => {
      const g = 9.8 * vals.gravityScale;
      const escV = (11200 * Math.sqrt(vals.gravityScale)).toFixed(0);
      return `At ${vals.gravityScale.toFixed(1)}× gravity, surface acceleration = ${g.toFixed(2)} m/s². Escape velocity = ${escV} m/s. Jump height scales by ${(1/vals.gravityScale).toFixed(1)}×.`;
    },
    takeaway: "Gravity is the fundamental glue of the universe. Weaker gravity means lighter jumps, slower orbits, and easier atmospheric escape.",
    disclaimer: "Changing the gravitational constant G would affect every mass-dependent process in the universe — this shows only local surface effects."
  },
  {
    id: "orbital_velocity",
    emoji: "🚀",
    title: "Change Orbital Velocity",
    subtitle: "What happens when a spacecraft speeds up?",
    category: "velocity",
    targetPlanetId: "earth",
    params: [
      { key: "velocityScale", label: "Orbital Speed", unit: "×", min: 0.3, max: 2.5, step: 0.05, defaultValue: 1.5 }
    ],
    formula: "v_orbit = √(GM/r)   |   v_escape = √(2GM/r)",
    formulaLabel: "Orbital & escape velocity",
    explanation: (vals) => {
      const vOrbit = 7900;
      const vEscape = 11200;
      const vCurrent = vOrbit * vals.velocityScale;
      let status = "";
      if (vCurrent < vOrbit * 0.7) status = "🔴 Too slow — would fall back to Earth";
      else if (vCurrent < vOrbit * 0.95) status = "🟡 Low orbit — elliptical path";
      else if (vCurrent < vEscape) status = "🟢 Stable orbit";
      else status = "🔵 Escape trajectory — leaving orbit!";
      return `Speed: ${(vCurrent/1000).toFixed(1)} km/s. ${status}`;
    },
    takeaway: "Orbital mechanics is about balance: too slow = fall down, just right = orbit, too fast = escape. There's no engine needed once in orbit!",
    disclaimer: "Simplified 2D circular orbit model. Real orbital mechanics involves 3D Keplerian trajectories."
  },
  {
    id: "jupiter_mass",
    emoji: "🟠",
    title: "Double Jupiter's Mass",
    subtitle: "What if the Solar System's giant grew?",
    category: "mass",
    targetPlanetId: "jupiter",
    params: [
      { key: "massScale", label: "Jupiter's Mass", unit: "×", min: 0.25, max: 5, step: 0.25, defaultValue: 2 }
    ],
    formula: "g = GM / r²   |   F_gravity ∝ M",
    formulaLabel: "Surface gravity & gravitational influence",
    explanation: (vals) => {
      const gJupiter = 24.8 * vals.massScale;
      const shieldFactor = vals.massScale > 1 ? "stronger" : "weaker";
      return `At ${vals.massScale.toFixed(1)}× mass, Jupiter's surface gravity = ${gJupiter.toFixed(0)} m/s² (Earth is 9.8). Its gravitational shield for the inner Solar System becomes ${shieldFactor}.`;
    },
    takeaway: "Jupiter's massive gravity already protects Earth by deflecting many comets. A heavier Jupiter would be an even stronger shield — but also perturb inner planet orbits.",
    disclaimer: "Jupiter's mass changes could destabilize inner planet orbits over long timescales — this model only shows immediate local effects."
  }
];
