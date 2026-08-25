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

/** Resolve URL using expo-asset (works on both web and native). */
async function resolveUrl(key: TextureKey): Promise<string | null> {
  try {
    const asset = Asset.fromModule(TEXTURE_SOURCES[key]);
    await asset.downloadAsync();
    // web:    localUri=null, uri="http://localhost:8081/assets/..."
    // native: localUri="file://...", uri=fallback
    const url = asset.localUri ?? asset.uri ?? null;
    if (!url) console.warn(`[textures] no URL for "${key}"`, asset);
    else      console.log(`[textures] resolved "${key}" → ${url}`);
    return url;
  } catch (e) {
    console.warn(`[textures] resolveUrl failed "${key}":`, e);
    return null;
  }
}

/** Web: create THREE.Texture via browser HTMLImageElement — always works in WebGL. */
async function loadViaImage(url: string, key: TextureKey): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = new THREE.Texture(img);
      configureMap(tex);
      console.log(`[textures] ✓ "${key}" loaded via Image (${img.naturalWidth}×${img.naturalHeight})`);
      resolve(tex);
    };
    img.onerror = (e) => {
      console.warn(`[textures] ✗ Image failed "${key}" (${url}):`, e);
      reject(e);
    };
    img.src = url;
  });
}

/** Native: load via THREE.TextureLoader. */
async function loadViaThree(url: string, key: TextureKey): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => { configureMap(tex); console.log(`[textures] ✓ "${key}" via THREE`); resolve(tex); },
      undefined,
      (err) => { console.warn(`[textures] ✗ THREE failed "${key}":`, err); reject(err); }
    );
  });
}

export async function loadBodyTexture(key: TextureKey): Promise<THREE.Texture | null> {
  if (cache.has(key))  return cache.get(key) ?? null;
  const pending = inflight.get(key);
  if (pending)         return pending;

  const job = (async () => {
    try {
      const url = await resolveUrl(key);
      if (!url) { cache.set(key, null); return null; }

      const tex = Platform.OS === "web"
        ? await loadViaImage(url, key)   // browser HTMLImageElement path
        : await loadViaThree(url, key);  // expo-gl TextureLoader path

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
