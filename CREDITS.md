# Credits

SpaceVerse is an open-source educational astronomy app. Planet maps, orbital math, and UI ideas were adapted from public datasets and laptop-era Three.js explorers. **We do not ship those desktop stacks** (Next/Vite/drei/postprocessing) on the phone.

## Textures

- Planet and dwarf maps: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, based on NASA imagery.
- Pluto map, Saturn/Uranus ring images, Earth night/atmosphere, Moon bump (when bundled): [N3rson/Solar-System-3D](https://github.com/N3rson/Solar-System-3D), MIT License.
- Moon albedo maps (Io, Europa, Callisto, 1k): converted from [Ajayprakashk7/solar-system-emulator](https://github.com/Ajayprakashk7/solar-system-emulator) WebP, MIT License.

- Galaxy discs (Andromeda, Whirlpool): phone-scale educational spirals generated for the APK after NASA/ESA CDNs blocked hotlinking. Appearance inspired by Hubble public-domain photographs; not those original files.

## Algorithms and catalogs (rewritten for Expo / expo-gl)

- Kepler solver (Newton–Raphson, ecliptic → Y-up): public Keplerian mechanics, matching the approach documented in [iam-sandipmaity/solar-system-simulation](https://github.com/iam-sandipmaity/solar-system-simulation) (README claims MIT; no LICENSE file on GitHub — we rewrote the math, did not copy their repo).
- Orbital JSON fields (`semimajor`, `eccentricity`, `inclination`, comet `tail`): schema inspired by [jshor/tycho](https://github.com/jshor/tycho), MIT.
- Earth day/night mix shader: port of the GLSL in [N3rson/Solar-System-3D](https://github.com/N3rson/Solar-System-3D) `src/script.js`, MIT.
- Phone quality tiers: pattern from [Ajayprakashk7/solar-system-emulator](https://github.com/Ajayprakashk7/solar-system-emulator) `performanceOptimizer.js`, MIT.
- Dual compact vs true-AU scale: idea from [sanderblue/solar-system-threejs](https://github.com/sanderblue/solar-system-threejs) `Constants.js`, Apache-2.0.
- Spiral galaxy field: independent implementation of the well-known Three.js Journey galaxy generator (branches, spin, radial color lerp). Destination *names* (Sirius, Alpha Centauri, Sgr A*, …) are astronomical facts. We did **not** copy [SKT1803/3d-milkyway-explorer](https://github.com/SKT1803/3d-milkyway-explorer) (no license).

## Explicitly not included

- ISS / Hubble / Voyager GLBs (too large; ISS ~44 MB).
- TurboSquid Phobos/Deimos meshes.
- 8k / 10k planet maps in the Android APK.
- 8,000 Horizons asteroid CSVs.
- Desktop bloom / outline postprocessing.

## Runtime

- 3D: Three.js + @react-three/fiber (native) + expo-gl.
- Facts: NASA / ESA / ISRO public pages.
- Cosmo AI: Groq (optional `EXPO_PUBLIC_GROQ_API_KEY`).
