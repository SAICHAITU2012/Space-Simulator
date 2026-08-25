import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { cacheDirectory, copyAsync, deleteAsync, getInfoAsync } from "expo-file-system/legacy";
import { Platform } from "react-native";
import * as THREE from "three";

// .xjpg / .xpng so Android does not pack maps as drawables.
export const TEXTURE_SOURCES = {
  sun:             require("../../assets/2k_sun.xjpg"),
  mercury:         require("../../assets/2k_mercury.xjpg"),
  venus:           require("../../assets/2k_venus_surface.xjpg"),
  venusAtmosphere: require("../../assets/2k_venus_atmosphere.xjpg"),
  earth:           require("../../assets/2k_earth_daymap.xjpg"),
  earthNight:      require("../../assets/2k_earth_nightmap.xjpg"),
  moon:            require("../../assets/2k_moon.xjpg"),
  moonBump:        require("../../assets/2k_moon_bump.xjpg"),
  mars:            require("../../assets/2k_mars.xjpg"),
  jupiter:         require("../../assets/2k_jupiter.xjpg"),
  saturn:          require("../../assets/2k_saturn.xjpg"),
  saturnRing:      require("../../assets/saturn_ring.xpng"),
  uranus:          require("../../assets/2k_uranus.xjpg"),
  uranusRing:      require("../../assets/uranus_ring.xpng"),
  neptune:         require("../../assets/2k_neptune.xjpg"),
  stars:           require("../../assets/2k_stars.xjpg"),
  milkyWay:        require("../../assets/2k_stars_milky_way.xjpg"),
  ceres:           require("../../assets/2k_ceres_fictional.xjpg"),
  haumea:          require("../../assets/2k_haumea_fictional.xjpg"),
  makemake:        require("../../assets/2k_makemake_fictional.xjpg"),
  eris:            require("../../assets/2k_eris_fictional.xjpg"),
  pluto:           require("../../assets/2k_pluto.xjpg"),
  io:              require("../../assets/1k_io.xjpg"),
  europa:          require("../../assets/1k_europa.xjpg"),
  callisto:        require("../../assets/1k_callisto.xjpg"),
  andromeda:       require("../../assets/1k_andromeda.xjpg"),
  whirlpool:       require("../../assets/1k_whirlpool.xjpg"),
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

function cacheExt(key: TextureKey): string {
  return key === "saturnRing" || key === "uranusRing" ? "png" : "jpg";
}

function toFileUri(path: string): string {
  if (path.startsWith("file://")) return path;
  if (path.startsWith("/")) return `file://${path}`;
  return path;
}

/** Web: create THREE.Texture via browser HTMLImageElement. */
async function loadViaImage(url: string, key: TextureKey): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = new THREE.Texture(img);
      configureMap(tex);
      resolve(tex);
    };
    img.onerror = (e) => {
      console.warn(`[textures] Image failed "${key}" (${url})`);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Native expo-gl: copy the packed asset to a real file:// JPEG/PNG, then
 * hand Three a synthetic image with `localUri`. Never TextureLoader.
 * expo-gl only decodes URIs that start with file:// (see EXGLImageUtils).
 */
async function loadViaLocalUri(key: TextureKey): Promise<THREE.Texture> {
  if (!cacheDirectory) throw new Error("no cacheDirectory");

  const asset = Asset.fromModule(TEXTURE_SOURCES[key]);
  await asset.downloadAsync();
  const srcRaw = asset.localUri ?? asset.uri;
  if (!srcRaw) throw new Error(`no uri for ${key}`);
  const src = toFileUri(srcRaw);

  const dest = toFileUri(`${cacheDirectory}sv_${key}.${cacheExt(key)}`);
  const info = await getInfoAsync(dest);
  const stale = !info.exists || (("size" in info) && (info.size ?? 0) < 64);
  if (stale) {
    if (info.exists) {
      await deleteAsync(dest, { idempotent: true });
    }
    await copyAsync({ from: src, to: dest });
  }

  const copied = await getInfoAsync(dest);
  const size = "size" in copied ? (copied.size ?? 0) : 0;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[textures] ${key} src=${src} dest=${dest} bytes=${size}`);
  }
  if (size < 64) throw new Error(`empty cache file for ${key}`);

  const tex = new THREE.Texture();
  const w = asset.width || 1024;
  const h = asset.height || 1024;
  const image = { localUri: dest, data: { localUri: dest }, width: w, height: h };
  tex.image = image as unknown as HTMLImageElement;
  configureMap(tex);
  return tex;
}

export async function loadBodyTexture(key: TextureKey): Promise<THREE.Texture | null> {
  if (cache.has(key)) return cache.get(key) ?? null;
  const pending = inflight.get(key);
  if (pending) return pending;

  const job = (async () => {
    try {
      const tex = Platform.OS === "web"
        ? await (async () => {
          const asset = Asset.fromModule(TEXTURE_SOURCES[key]);
          await asset.downloadAsync();
          const url = asset.localUri ?? asset.uri;
          if (!url) throw new Error(`no url for ${key}`);
          return loadViaImage(url, key);
        })()
        : await loadViaLocalUri(key);
      cache.set(key, tex);
      return tex;
    } catch (e) {
      console.warn(`[textures] failed "${key}":`, e);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, job);
  return job;
}

export function countCachedTextures(): number {
  let n = 0;
  cache.forEach(v => { if (v) n += 1; });
  return n;
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
  "Planet maps: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0. Galaxy discs: NASA/ESA Hubble (public domain). See CREDITS.md.";
