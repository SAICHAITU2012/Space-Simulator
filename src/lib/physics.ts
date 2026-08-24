import { Planet, EARTH_MASS, EARTH_RADIUS, G } from "../data/spaceData";

// Physical constants
export const G_CONST = G;
const EARTH_SURFACE_GRAVITY = 9.80665; // m/s²
const EARTH_ROTATION_PERIOD = 86400;    // seconds

export type LabInputs = {
  massScale: number;
  radiusScale: number;
  velocityScale: number;
  gravityScale: number;
  rotationScale: number;
  moonDistScale: number;
};

export type PhysicsBefore = {
  surfaceGravity: number;    // m/s²
  escapeVelocity: number;    // m/s
  orbitalVelocity: number;   // m/s
  orbitalPeriod: number;     // days
  angularVelocity: number;   // rad/s
  tangentialVelocity: number;// m/s
  surfaceArea: number;       // m²  (ratio vs Earth)
  volume: number;            // m³  (ratio vs Earth)
  surfaceGravityG: number;   // relative to Earth
};

export type PhysicsResult = {
  before: PhysicsBefore;
  after: PhysicsBefore;
  headline: string;
  explanation: string;
  orbitCategory: "spiral_in" | "stable" | "escape" | "elongated";
};

function computePhysics(planet: Planet, massScale: number, radiusScale: number, velocityScale: number, gravityScale: number): PhysicsBefore {
  const planetMass = planet.massKg;
  const planetRadius = planet.radiusKm * 1000; // convert to meters

  const M = planetMass * massScale;
  const r = planetRadius * radiusScale;
  const effectiveG = G_CONST * gravityScale;

  const surfaceGravity = (effectiveG * M) / (r * r);
  const escapeVelocity = Math.sqrt((2 * effectiveG * M) / r);

  // Orbital params relative to Earth orbit radius (~1 AU) scaled by planet distance
  const orbitRadius = planet.distanceAU * 1.496e11; // metres
  const orbitalVelocity = Math.sqrt((effectiveG * 1.989e30) / orbitRadius) * velocityScale;
  const orbitalPeriod = (2 * Math.PI * orbitRadius) / Math.sqrt((effectiveG * 1.989e30) / orbitRadius) / 86400; // days

  // Rotation
  const rotPeriod = EARTH_ROTATION_PERIOD; // reference
  const angularVelocity = (2 * Math.PI) / rotPeriod;
  const tangentialVelocity = angularVelocity * EARTH_RADIUS;

  const surfaceArea = (r * r) / (EARTH_RADIUS * EARTH_RADIUS);
  const volume = (r * r * r) / (EARTH_RADIUS * EARTH_RADIUS * EARTH_RADIUS);

  return {
    surfaceGravity,
    escapeVelocity,
    orbitalVelocity,
    orbitalPeriod,
    angularVelocity,
    tangentialVelocity,
    surfaceArea,
    volume,
    surfaceGravityG: surfaceGravity / EARTH_SURFACE_GRAVITY
  };
}

export function calculateLabOutcome(planet: Planet, inputs: LabInputs): PhysicsResult {
  const before = computePhysics(planet, 1, 1, 1, 1);
  const after = computePhysics(planet, inputs.massScale, inputs.radiusScale, inputs.velocityScale, inputs.gravityScale);

  const orbitalEnergy = (inputs.velocityScale * inputs.velocityScale) / Math.max(inputs.gravityScale * inputs.massScale, 0.01);

  let orbitCategory: PhysicsResult["orbitCategory"];
  if (orbitalEnergy > 2.0) orbitCategory = "escape";
  else if (orbitalEnergy < 0.5) orbitCategory = "spiral_in";
  else if (orbitalEnergy > 1.3) orbitCategory = "elongated";
  else orbitCategory = "stable";

  const gAfterG = after.surfaceGravityG;
  const gRatio = after.surfaceGravity / before.surfaceGravity;

  let headline = "";
  let explanation = "";

  if (orbitCategory === "escape") {
    headline = "🚀 Escape trajectory!";
    explanation = `${planet.name} is moving too fast for gravity to hold it. At ${inputs.velocityScale.toFixed(1)}× orbital velocity, it breaks free. Surface gravity is ${gAfterG.toFixed(2)}g — escape velocity is ${(after.escapeVelocity / 1000).toFixed(1)} km/s.`;
  } else if (orbitCategory === "spiral_in") {
    headline = "🌀 Gravity wins the tug-of-war";
    explanation = `With only ${inputs.velocityScale.toFixed(1)}× orbital speed, ${planet.name} can't maintain orbit. It spirals inward. Surface gravity is ${gAfterG.toFixed(2)}g.`;
  } else if (gRatio > 2.2) {
    headline = "💪 Crushing gravity";
    explanation = `At ${gAfterG.toFixed(1)}g, you'd feel ${gAfterG.toFixed(1)}× your normal weight. A 30 kg child becomes ${(30 * gAfterG).toFixed(0)} kg here. The planet's pull is intense.`;
  } else if (gRatio < 0.4) {
    headline = "🪶 Float-worthy lightness";
    explanation = `Surface gravity dropped to ${gAfterG.toFixed(2)}g. Every jump lasts ${(1 / gAfterG).toFixed(1)}× longer. Atmospheres escape more easily at low gravity.`;
  } else if (Math.abs(inputs.radiusScale - 1) > 0.3) {
    headline = inputs.radiusScale > 1 ? "🌍 Bigger world, weaker pull" : "🔵 Compact and dense";
    explanation = `Radius is ${inputs.radiusScale.toFixed(1)}× normal. Surface area: ${after.surfaceArea.toFixed(1)}× Earth's. Volume: ${after.volume.toFixed(1)}× Earth's. Gravity: ${gAfterG.toFixed(2)}g.`;
  } else {
    headline = "✅ Stable experiment zone";
    explanation = `${planet.name} is in a balanced state. Surface gravity: ${gAfterG.toFixed(2)}g. Orbital speed: ${(after.orbitalVelocity / 1000).toFixed(1)} km/s. Escape velocity: ${(after.escapeVelocity / 1000).toFixed(1)} km/s.`;
  }

  return { before, after, headline, explanation, orbitCategory };
}

// Standalone rotation physics calculator
export function calculateRotation(rotationScale: number) {
  const T = EARTH_ROTATION_PERIOD / rotationScale; // seconds per rotation
  const omega = (2 * Math.PI) / T; // rad/s
  const v = omega * EARTH_RADIUS; // m/s tangential at equator
  const centAccel = omega * omega * EARTH_RADIUS; // m/s² centrifugal
  const dayHours = 24 / rotationScale;
  return { omega, v, centAccel, dayHours, T };
}

// Moon orbital mechanics
export function calculateMoonOrbit(moonDistScale: number) {
  const MOON_MASS = 7.342e22; // kg
  const EARTH_MOON_DIST = 384400e3; // m
  const r = EARTH_MOON_DIST * moonDistScale;
  const T = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G_CONST * EARTH_MASS)); // seconds
  const v = Math.sqrt((G_CONST * EARTH_MASS) / r); // orbital velocity m/s
  const F = (G_CONST * EARTH_MASS * MOON_MASS) / (r * r); // force N
  const F0 = (G_CONST * EARTH_MASS * MOON_MASS) / (EARTH_MOON_DIST * EARTH_MOON_DIST);
  return {
    distance_km: r / 1000,
    period_days: T / 86400,
    velocity_ms: v,
    force_N: F,
    force_ratio: F / F0
  };
}
