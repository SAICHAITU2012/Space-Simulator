import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { cacheDirectory, copyAsync, deleteAsync, getInfoAsync } from "expo-file-system/legacy";
import { Platform } from "react-native";
import * as THREE from "three";

// The 512px overview maps reduce decoded GPU allocation; originals stay intact.
export const TEXTURE_SOURCES = {
  sun: require("../../assets/2k_sun.xjpg"), sunOverview: require("../../assets/512_sun.xjpg"),
  mercury: require("../../assets/2k_mercury.xjpg"), mercuryOverview: require("../../assets/512_mercury.xjpg"),
  venus: require("../../assets/2k_venus_surface.xjpg"), venusOverview: require("../../assets/512_venus_surface.xjpg"), venusAtmosphere: require("../../assets/2k_venus_atmosphere.xjpg"),
  earth: require("../../assets/2k_earth_daymap.xjpg"), earthOverview: require("../../assets/512_earth_daymap.xjpg"), earthNight: require("../../assets/2k_earth_nightmap.xjpg"),
  moon: require("../../assets/2k_moon.xjpg"), moonOverview: require("../../assets/512_moon.xjpg"), moonBump: require("../../assets/2k_moon_bump.xjpg"),
  mars: require("../../assets/2k_mars.xjpg"), marsOverview: require("../../assets/512_mars.xjpg"),
  jupiter: require("../../assets/2k_jupiter.xjpg"), jupiterOverview: require("../../assets/512_jupiter.xjpg"),
  saturn: require("../../assets/2k_saturn.xjpg"), saturnOverview: require("../../assets/512_saturn.xjpg"), saturnRing: require("../../assets/saturn_ring.xpng"),
  uranus: require("../../assets/2k_uranus.xjpg"), uranusOverview: require("../../assets/512_uranus.xjpg"), uranusRing: require("../../assets/uranus_ring.xpng"),
  neptune: require("../../assets/2k_neptune.xjpg"), neptuneOverview: require("../../assets/512_neptune.xjpg"),
  stars: require("../../assets/2k_stars.xjpg"), milkyWay: require("../../assets/2k_stars_milky_way.xjpg"),
  ceres: require("../../assets/2k_ceres_fictional.xjpg"), haumea: require("../../assets/2k_haumea_fictional.xjpg"), makemake: require("../../assets/2k_makemake_fictional.xjpg"), eris: require("../../assets/2k_eris_fictional.xjpg"), pluto: require("../../assets/2k_pluto.xjpg"),
  io: require("../../assets/1k_io.xjpg"), europa: require("../../assets/1k_europa.xjpg"), callisto: require("../../assets/1k_callisto.xjpg"), andromeda: require("../../assets/1k_andromeda.xjpg"), whirlpool: require("../../assets/1k_whirlpool.xjpg"),
} as const;
export type TextureKey = keyof typeof TEXTURE_SOURCES;
export type TextureTier = "core" | "detail";
export const PLANET_TEXTURE_KEY: Record<string, TextureKey> = { mercury: "mercury", venus: "venus", earth: "earth", mars: "mars", jupiter: "jupiter", saturn: "saturn", uranus: "uranus", neptune: "neptune" };
export const PLANET_OVERVIEW_TEXTURE_KEY: Record<string, TextureKey> = { mercury: "mercuryOverview", venus: "venusOverview", earth: "earthOverview", mars: "marsOverview", jupiter: "jupiterOverview", saturn: "saturnOverview", uranus: "uranusOverview", neptune: "neptuneOverview" };

type Entry = { texture: THREE.Texture | null; refs: number; tier: TextureTier };
const cache = new Map<TextureKey, Entry>();
const inflight = new Map<TextureKey, Promise<THREE.Texture | null>>();
const pngKeys = new Set<TextureKey>(["saturnRing", "uranusRing"]);
function configure(texture: THREE.Texture) { texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter; texture.generateMipmaps = true; texture.anisotropy = 2; texture.needsUpdate = true; return texture; }
function uri(path: string) { return path.startsWith("file://") || !path.startsWith("/") ? path : `file://${path}`; }
async function createTexture(key: TextureKey): Promise<THREE.Texture | null> {
  try {
    const asset = Asset.fromModule(TEXTURE_SOURCES[key]); await asset.downloadAsync();
    const source = asset.localUri ?? asset.uri; if (!source) throw new Error(`No URI for ${key}`);
    if (Platform.OS === "web") return await new Promise((resolve, reject) => { const image = document.createElement("img"); image.crossOrigin = "anonymous"; image.onload = () => resolve(configure(new THREE.Texture(image))); image.onerror = reject; image.src = source; });
    if (!cacheDirectory) throw new Error("No Expo cache directory");
    const destination = uri(`${cacheDirectory}sv_${key}.${pngKeys.has(key) ? "png" : "jpg"}`); const info = await getInfoAsync(destination);
    if (!info.exists || (("size" in info) && (info.size ?? 0) < 64)) { if (info.exists) await deleteAsync(destination, { idempotent: true }); await copyAsync({ from: uri(source), to: destination }); }
    const texture = new THREE.Texture(); texture.image = { localUri: destination, data: { localUri: destination }, width: asset.width || 1024, height: asset.height || 1024 } as unknown as HTMLImageElement; return configure(texture);
  } catch (error) { console.error("Failed to load texture:", key, error); return null; }
}

/** A detail lease is immediately disposed when its final displayed user releases it. */
export function loadBodyTexture(key: TextureKey, tier: TextureTier = "detail") {
  const entry = cache.get(key); if (entry?.texture) { entry.refs += 1; return Promise.resolve(entry.texture); }
  if (entry) entry.refs += 1; else cache.set(key, { texture: null, refs: 1, tier });
  const pending = inflight.get(key); if (pending) return pending;
  const job = createTexture(key).then(texture => { const current = cache.get(key); if (!current) { texture?.dispose(); return null; } current.texture = texture; if (current.tier === "detail" && current.refs === 0) { texture?.dispose(); cache.delete(key); return null; } return texture; }).finally(() => inflight.delete(key));
  inflight.set(key, job); return job;
}
export function releaseBodyTexture(key: TextureKey) { const entry = cache.get(key); if (!entry) return; entry.refs = Math.max(0, entry.refs - 1); if (entry.tier === "detail" && entry.refs === 0 && entry.texture) { entry.texture.dispose(); cache.delete(key); } }
export function countCachedTextures() { let count = 0; cache.forEach(entry => { if (entry.texture) count += 1; }); return count; }
export function useBodyTexture(key: TextureKey | undefined, tier: TextureTier = "detail"): THREE.Texture | null { const [map, setMap] = useState<THREE.Texture | null>(null); useEffect(() => { if (!key) { setMap(null); return undefined; } let active = true; void loadBodyTexture(key, tier).then(texture => { if (active) setMap(texture); }); return () => { active = false; releaseBodyTexture(key); }; }, [key, tier]); return map; }
export const TEXTURE_CREDIT = "Planet maps: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0. Galaxy discs: NASA/ESA Hubble (public domain). See CREDITS.md.";
