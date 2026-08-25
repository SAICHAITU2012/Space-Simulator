import * as THREE from "three";

/** Solve M = E − e sin(E) with Newton–Raphson. */
export function solveKeplersEquation(M: number, e: number, tolerance = 1e-10): number {
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let i = 0; i < 40; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

export function getMeanAnomaly(orbitalPeriodDays: number, simulationDays: number, initialAngle = 0): number {
  if (!orbitalPeriodDays) return initialAngle;
  return ((2 * Math.PI * simulationDays) / orbitalPeriodDays + initialAngle) % (2 * Math.PI);
}

/**
 * Elliptical position in scene units. `semiMajor` is already in visual units
 * (compact orbitRadius or true-AU scaled). Y-up, matching Three.js.
 */
export function getOrbitalPosition(
  semiMajor: number,
  eccentricity: number,
  inclinationDeg: number,
  OmegaDeg: number,
  omegaDeg: number,
  meanAnomaly: number,
): THREE.Vector3 {
  const E = solveKeplersEquation(meanAnomaly, eccentricity);
  const xOrbit = semiMajor * (Math.cos(E) - eccentricity);
  const yOrbit = semiMajor * Math.sqrt(Math.max(0, 1 - eccentricity * eccentricity)) * Math.sin(E);

  const i = (inclinationDeg * Math.PI) / 180;
  const O = (OmegaDeg * Math.PI) / 180;
  const w = (omegaDeg * Math.PI) / 180;
  const cosO = Math.cos(O);
  const sinO = Math.sin(O);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);

  const x =
    (cosO * cosW - sinO * sinW * cosI) * xOrbit +
    (-cosO * sinW - sinO * cosW * cosI) * yOrbit;
  const y =
    (sinO * cosW + cosO * sinW * cosI) * xOrbit +
    (-sinO * sinW + cosO * cosW * cosI) * yOrbit;
  const z = sinW * sinI * xOrbit + cosW * sinI * yOrbit;

  return new THREE.Vector3(x, z, -y);
}

export function getOrbitPoints(
  semiMajor: number,
  eccentricity: number,
  inclinationDeg: number,
  OmegaDeg: number,
  omegaDeg: number,
  segments = 160,
): Float32Array {
  const pts = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const M = (2 * Math.PI * i) / segments;
    const v = getOrbitalPosition(semiMajor, eccentricity, inclinationDeg, OmegaDeg, omegaDeg, M);
    pts[i * 3] = v.x;
    pts[i * 3 + 1] = v.y;
    pts[i * 3 + 2] = v.z;
  }
  return pts;
}

export const AU_KM = 149_597_870.7;
/** Compact educational scale: 1 AU ≈ Earth's visual orbit radius (12). */
export const COMPACT_AU = 12;
/** True-AU visual scale (still compressed for a phone frustum). */
export const TRUE_AU = 4.2;

export function visualSemiMajor(distanceAU: number, trueScale: boolean): number {
  return distanceAU * (trueScale ? TRUE_AU : COMPACT_AU);
}
