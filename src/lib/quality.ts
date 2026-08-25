import { Platform } from "react-native";

export type QualityTier = "low" | "mid" | "high";

export type QualitySettings = {
  tier: QualityTier;
  sphereSegments: number;
  moonSegments: number;
  asteroidCount: number;
  kuiperCount: number;
  galaxyCount: number;
  bumpMaps: boolean;
  earthShader: boolean;
};

const TIERS: Record<QualityTier, Omit<QualitySettings, "tier">> = {
  low: {
    sphereSegments: 16,
    moonSegments: 12,
    asteroidCount: 40,
    kuiperCount: 400,
    galaxyCount: 8000,
    bumpMaps: false,
    earthShader: false,
  },
  mid: {
    sphereSegments: 24,
    moonSegments: 16,
    asteroidCount: 70,
    kuiperCount: 600,
    galaxyCount: 10000,
    bumpMaps: true,
    earthShader: true,
  },
  high: {
    sphereSegments: 32,
    moonSegments: 20,
    asteroidCount: 90,
    kuiperCount: 800,
    galaxyCount: 12000,
    bumpMaps: true,
    earthShader: true,
  },
};

export function getQualityTier(): QualityTier {
  if (Platform.OS === "web") return "high";
  return "mid";
}

export function getQuality(): QualitySettings {
  const tier = getQualityTier();
  return { tier, ...TIERS[tier] };
}
