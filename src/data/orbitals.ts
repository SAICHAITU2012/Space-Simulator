/** J2000-ish Kepler elements. Distances in AU. Rewritten from public NASA/JPL values. */

export type KeplerElements = {
  distanceAU: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  argumentOfPerihelion: number;
  orbitalPeriodDays: number;
};

export const PLANET_ELEMENTS: Record<string, KeplerElements> = {
  mercury: {
    distanceAU: 0.387,
    eccentricity: 0.20563,
    inclination: 7.005,
    longitudeOfAscendingNode: 48.331,
    argumentOfPerihelion: 29.124,
    orbitalPeriodDays: 87.969,
  },
  venus: {
    distanceAU: 0.723,
    eccentricity: 0.00677,
    inclination: 3.3947,
    longitudeOfAscendingNode: 76.68,
    argumentOfPerihelion: 54.884,
    orbitalPeriodDays: 224.701,
  },
  earth: {
    distanceAU: 1,
    eccentricity: 0.0167,
    inclination: 0.00005,
    longitudeOfAscendingNode: -11.26064,
    argumentOfPerihelion: 114.20783,
    orbitalPeriodDays: 365.256,
  },
  mars: {
    distanceAU: 1.524,
    eccentricity: 0.0934,
    inclination: 1.85,
    longitudeOfAscendingNode: 49.558,
    argumentOfPerihelion: 286.502,
    orbitalPeriodDays: 686.98,
  },
  jupiter: {
    distanceAU: 5.203,
    eccentricity: 0.0489,
    inclination: 1.303,
    longitudeOfAscendingNode: 100.464,
    argumentOfPerihelion: 273.867,
    orbitalPeriodDays: 4332.589,
  },
  saturn: {
    distanceAU: 9.537,
    eccentricity: 0.0565,
    inclination: 2.485,
    longitudeOfAscendingNode: 113.665,
    argumentOfPerihelion: 339.392,
    orbitalPeriodDays: 10759.22,
  },
  uranus: {
    distanceAU: 19.19,
    eccentricity: 0.0457,
    inclination: 0.773,
    longitudeOfAscendingNode: 74.006,
    argumentOfPerihelion: 96.998857,
    orbitalPeriodDays: 30685.4,
  },
  neptune: {
    distanceAU: 30.07,
    eccentricity: 0.0113,
    inclination: 1.77,
    longitudeOfAscendingNode: 131.784,
    argumentOfPerihelion: 273.187,
    orbitalPeriodDays: 60190,
  },
};

export const DWARF_ELEMENTS: Record<string, KeplerElements> = {
  ceres: {
    distanceAU: 2.77,
    eccentricity: 0.0758,
    inclination: 10.59,
    longitudeOfAscendingNode: 80.31,
    argumentOfPerihelion: 73.47,
    orbitalPeriodDays: 1680,
  },
  pluto: {
    distanceAU: 39.48,
    eccentricity: 0.2488,
    inclination: 17.16,
    longitudeOfAscendingNode: 110.3,
    argumentOfPerihelion: 113.8,
    orbitalPeriodDays: 90560,
  },
  haumea: {
    distanceAU: 43.13,
    eccentricity: 0.191,
    inclination: 28.21,
    longitudeOfAscendingNode: 121.9,
    argumentOfPerihelion: 239.0,
    orbitalPeriodDays: 103774,
  },
  makemake: {
    distanceAU: 45.79,
    eccentricity: 0.155,
    inclination: 29.0,
    longitudeOfAscendingNode: 79.4,
    argumentOfPerihelion: 294.8,
    orbitalPeriodDays: 112897,
  },
  eris: {
    distanceAU: 67.86,
    eccentricity: 0.436,
    inclination: 44.04,
    longitudeOfAscendingNode: 35.95,
    argumentOfPerihelion: 151.6,
    orbitalPeriodDays: 204199,
  },
};

export type CometTail = {
  length: number;
  width: number;
  dustColor: string;
  ionColor: string;
  activeDistance: number;
};

export const HALLEY: {
  id: string;
  name: string;
  elements: KeplerElements;
  tail: CometTail;
} = {
  id: "halley",
  name: "Halley's Comet",
  elements: {
    distanceAU: 17.8,
    eccentricity: 0.967,
    inclination: 162.3,
    longitudeOfAscendingNode: 58.42,
    argumentOfPerihelion: 111.33,
    orbitalPeriodDays: 27798,
  },
  tail: {
    length: 6.5,
    width: 1.4,
    dustColor: "#ffe2a8",
    ionColor: "#7ec8ff",
    activeDistance: 22,
  },
};
