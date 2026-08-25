import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { Platform } from "react-native";
import * as THREE from "three";

export const TEXTURE_SOURCES = {
  sun:             require("../../assets/2k_sun.jpg"),
  mercury:         require("../../assets/8k_mercury.jpg"),
  venus:           require("../../assets/8k_venus_surface.jpg"),
  venusAtmosphere: require("../../assets/2k_venus_atmosphere.jpg"),
  earth:           require("../../assets/8k_earth_daymap.jpg"),
  moon:            require("../../assets/2k_moon.jpg"),
  mars:            require("../../assets/8k_mars.jpg"),
  jupiter:         require("../../assets/8k_jupiter.jpg"),
  saturn:          require("../../assets/8k_saturn.jpg"),
  uranus:          require("../../assets/2k_uranus.jpg"),
  neptune:         require("../../assets/2k_neptune.jpg"),
  stars:           require("../../assets/2k_stars.jpg"),
  milkyWay:        require("../../assets/2k_stars_milky_way.jpg"),
  ceres:           require("../../assets/2k_ceres_fictional.jpg"),
  haumea:          require("../../assets/2k_haumea_fictional.jpg"),
  makemake:        require("../../assets/2k_makemake_fictional.jpg"),
  eris:            require("../../assets/2k_eris_fictional.jpg"),
} as const;

export type TextureKey = keyof typeof TEXTURE_SOURCES;

export const PLANET_TEXTURE_KEY: Record<string, TextureKey> = {
  mercury: "mercury",
  venus:   "venus",
  earth:   "earth",
  mars:    "mars",
  jupiter: "jupiter",
  saturn:  "saturn",
  uranus:  "uranus",
  neptune: "neptune",
};

const cache    = new Map<TextureKey, THREE.Texture | null>();
const inflight = new Map<TextureKey, Promise<THREE.Texture | null>>();

function configureMap(tex: THREE.Texture) {
  tex.colorSpace      = THREE.SRGBColorSpace;
  tex.wrapS           = THREE.ClampToEdgeWrapping;
  tex.wrapT           = THREE.ClampToEdgeWrapping;
  tex.minFilter       = THREE.LinearMipmapLinearFilter;
  tex.magFilter       = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy      = 4;
  tex.needsUpdate     = true;
  return tex;
}

/** Resolve the URI string for a given texture source module. */
async function resolveUri(key: TextureKey): Promise<string | null> {
  const src = TEXTURE_SOURCES[key] as unknown;

  if (Platform.OS === "web") {
    // Metro bundler resolves require() of image assets to a URL string on web.
    if (typeof src === "string" && src.length > 0) return src;
    // Object with uri (some bundler configs)
    if (src && typeof src === "object" && "uri" in (src as object)) {
      return (src as { uri: string }).uri;
    }
    // Number fallback: expo-asset should resolve it to an absolute URL even on web
  }

  // Native (and web number-module fallback): use expo-asset
  try {
    const asset = Asset.fromModule(TEXTURE_SOURCES[key]);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri ?? null;
  } catch {
    return null;
  }
}

export async function loadBodyTexture(key: TextureKey): Promise<THREE.Texture | null> {
  if (cache.has(key))  return cache.get(key) ?? null;
  const pending = inflight.get(key);
  if (pending)         return pending;

  const job = (async () => {
    try {
      const uri = await resolveUri(key);
      if (!uri) {
        console.warn(`[textures] no URI for "${key}"`);
        cache.set(key, null);
        return null;
      }
      const tex = await new Promise<THREE.Texture>((resolve, reject) => {
        new THREE.TextureLoader().load(uri, resolve, undefined, (err) => {
          console.warn(`[textures] failed "${key}" (${uri}):`, err);
          reject(err);
        });
      });
      configureMap(tex);
      cache.set(key, tex);
      return tex;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, job);
  return job;
}

export function useBodyTexture(key: TextureKey | undefined): THREE.Texture | null {
  const [map, setMap] = useState<THREE.Texture | null>(
    key ? (cache.get(key) ?? null) : null
  );

  useEffect(() => {
    if (!key) { setMap(null); return undefined; }
    let live = true;
    if (cache.has(key)) { setMap(cache.get(key) ?? null); return undefined; }
    loadBodyTexture(key).then((tex) => { if (live) setMap(tex); });
    return () => { live = false; };
  }, [key]);

  return map;
}

export const TEXTURE_CREDIT =
  "Planet maps: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0. Based on NASA imagery.";

