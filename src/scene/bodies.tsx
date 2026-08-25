import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import * as THREE from "three";
import { Planet } from "../data/spaceData";
import { Moon, MOONS_BY_PLANET } from "../data/moons";
import { DwarfPlanet } from "../data/dwarfs";
import { DeepSpaceObject } from "../data/deepSpace";
import { LabInputs } from "../lib/physics";
import { PLANET_OVERVIEW_TEXTURE_KEY, PLANET_TEXTURE_KEY, useBodyTexture } from "../lib/textures";
import { getOrbitPoints, getOrbitalPosition, getMeanAnomaly, visualSemiMajor } from "../lib/kepler";
import { DWARF_ELEMENTS, HALLEY, PLANET_ELEMENTS } from "../data/orbitals";
import { getQuality } from "../lib/quality";
import { makeEarthDayNightMaterial } from "../lib/earthShader";
import { layersForPlanet, PlanetLayer } from "../data/planetLayers";
import { C } from "./viewport";
import { projectToScreen } from "./camera";

export function SimTicker({
  paused, speed, simDaysRef, daysPerSecond,
}: {
  paused: boolean;
  speed: number;
  simDaysRef: React.MutableRefObject<number>;
  daysPerSecond: number;
}) {
  useFrame((_, delta) => {
    if (!paused) simDaysRef.current += delta * daysPerSecond * speed;
  });
  return null;
}

export function Sun() {
  const surf = useRef<THREE.Mesh>(null);
  const l1 = useRef<THREE.Mesh>(null);
  const l2 = useRef<THREE.Mesh>(null);
  const l3 = useRef<THREE.Mesh>(null);
  const sunCore = useRef<THREE.Mesh>(null);
  const sunMap = useBodyTexture("sunOverview", "core");
  const segs = getQuality().sphereSegments;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s1 = Math.sin(t * 1.8);
    const s2 = Math.sin(t * 1.15 + 1.1);
    const s3 = Math.sin(t * 0.72 + 2.3);
    if (sunCore.current) {
      sunCore.current.rotation.y += 0.0008;
      const mat = sunCore.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.0 + s1 * 0.18;
    }
    if (surf.current) (surf.current.material as THREE.MeshBasicMaterial).opacity = 0.38 + s1 * 0.08;
    if (l1.current) (l1.current.material as THREE.MeshBasicMaterial).opacity = 0.14 + s2 * 0.04;
    if (l2.current) (l2.current.material as THREE.MeshBasicMaterial).opacity = 0.055 + s3 * 0.018;
    if (l3.current) (l3.current.material as THREE.MeshBasicMaterial).opacity = 0.018 + s1 * 0.006;
  });

  return (
    <group>
      <mesh ref={sunCore}>
        <sphereGeometry args={[3.2, segs, segs]} />
        <meshStandardMaterial
          key={sunMap?.uuid ?? "nomap_sun"}
          map={sunMap ?? undefined}
          color={sunMap ? "#ffffff" : "#fff4a0"}
          emissive="#ff9200"
          emissiveMap={sunMap ?? undefined}
          emissiveIntensity={1.0}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      <mesh ref={surf}>
        <sphereGeometry args={[3.28, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.38} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={l1}>
        <sphereGeometry args={[4.0, 24, 24]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={l2}>
        <sphereGeometry args={[5.2, 24, 24]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={l3}>
        <sphereGeometry args={[7.0, 16, 16]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.018} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HubEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloud2Ref = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);
  const dayMap = useBodyTexture("earth");
  const nightMap = useBodyTexture("earthNight");
  const q = getQuality();
  const shader = useMemo(() => {
    if (!q.earthShader || !dayMap || !nightMap) return null;
    return makeEarthDayNightMaterial(dayMap, nightMap);
  }, [q.earthShader, dayMap, nightMap]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.068;
    if (cloud2Ref.current) cloud2Ref.current.rotation.y -= delta * 0.055;
    if (atmoRef.current) (atmoRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(t * 0.55) * 0.06;
    if (shader) {
      (shader.uniforms.sunPosition.value as THREE.Vector3).set(12, 4, 8);
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, q.sphereSegments + 16, q.sphereSegments + 16]} />
        {shader ? (
          <primitive object={shader} attach="material" />
        ) : (
          <meshStandardMaterial
            map={dayMap ?? undefined}
            color={dayMap ? "#ffffff" : "#1a4fa8"}
            roughness={0.62}
            metalness={0.04}
            emissive="#000820"
            emissiveIntensity={0.25}
          />
        )}
      </mesh>
      <mesh ref={cloud2Ref} rotation={[0.08, 0.3, -0.06]}>
        <sphereGeometry args={[2.235, 32, 32]} />
        <meshBasicMaterial color="#d8eaff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh ref={atmoRef}>
        <sphereGeometry args={[2.38, 48, 48]} />
        <meshBasicMaterial color="#2060ff" transparent opacity={0.22} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function OrbitingPlanet({
  planet, selected, focusedMoonId, paused, speed, labInputs, screenPos, simDaysRef, trueScale, showCutaway,
}: {
  planet: Planet;
  selected: boolean;
  focusedMoonId?: string | null;
  paused: boolean;
  speed: number;
  labInputs?: LabInputs;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  simDaysRef: React.MutableRefObject<number>;
  trueScale: boolean;
  showCutaway?: boolean;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const q = getQuality();
  const vR = Math.max(0.15, planet.visualRadius * (selected ? (labInputs?.radiusScale ?? 1) : 1));
  const texKey = selected ? PLANET_TEXTURE_KEY[planet.id] : PLANET_OVERVIEW_TEXTURE_KEY[planet.id];
  const map = useBodyTexture(texKey, selected ? "detail" : "core");
  const venusAtmo = useBodyTexture(selected && planet.id === "venus" ? "venusAtmosphere" : undefined);
  const saturnRing = useBodyTexture(selected && planet.id === "saturn" ? "saturnRing" : undefined);
  const uranusRing = useBodyTexture(selected && planet.id === "uranus" ? "uranusRing" : undefined);
  const earthNight = useBodyTexture(selected && planet.id === "earth" ? "earthNight" : undefined);
  const earthMat = useMemo(() => {
    if (planet.id !== "earth" || !q.earthShader || !map || !earthNight) return null;
    return makeEarthDayNightMaterial(map, earthNight);
  }, [planet.id, q.earthShader, map, earthNight]);
  const moons = MOONS_BY_PLANET[planet.id] ?? [];
  const el = PLANET_ELEMENTS[planet.id];
  const a = el ? visualSemiMajor(el.distanceAU, trueScale) : planet.orbitRadius;
  const orbitPts = useMemo(
    () => el
      ? getOrbitPoints(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion)
      : new Float32Array(0),
    [a, el, trueScale],
  );

  useFrame((state, delta) => {
    if (el && bodyRef.current) {
      const M = getMeanAnomaly(el.orbitalPeriodDays, simDaysRef.current);
      const p = getOrbitalPosition(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion, M);
      bodyRef.current.position.copy(p);
    }
    if (!paused && spinRef.current) {
      spinRef.current.rotation.y += delta * planet.rotationSpeed * (labInputs?.rotationScale ?? 1) * speed;
    }
    if (selected && glowRef.current) {
      const t = state.clock.getElapsedTime();
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(t * 2.2) * 0.07;
    }
    if (planetRef.current) {
      screenPos.current[planet.id] = projectToScreen(planetRef.current, state.camera);
    }
    if (earthMat && bodyRef.current) {
      (earthMat.uniforms.sunPosition.value as THREE.Vector3).set(0, 0, 0);
    }
  });

  const ringMap = planet.id === "saturn" ? saturnRing : planet.id === "uranus" ? uranusRing : null;

  return (
    <group>
      {orbitPts.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbitPts, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={selected ? C.cyan : "#152850"} transparent opacity={selected ? 0.75 : 0.22} />
        </line>
      )}
      <group ref={bodyRef}>
        <group ref={spinRef}>
        {showCutaway && selected ? (
          <>
            <PlanetCutaway radius={vR} layers={layersForPlanet(planet.id)} />
            <mesh ref={planetRef} visible={false}>
              <sphereGeometry args={[vR, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </>
        ) : (
          <mesh ref={planetRef}>
            <sphereGeometry args={[vR, q.sphereSegments, q.sphereSegments]} />
            {earthMat ? (
              <primitive object={earthMat} attach="material" />
            ) : (
              <meshStandardMaterial
                key={map?.uuid ?? "nomap_" + planet.id}
                map={map ?? undefined}
                color={map ? "#ffffff" : planet.color}
                roughness={planet.id === "earth" ? 0.52 : planet.id === "mercury" ? 0.92 : 0.76}
                metalness={planet.id === "mercury" ? 0.28 : 0.02}
                emissive={selected ? new THREE.Color(planet.color).multiplyScalar(0.1) : new THREE.Color(0, 0, 0)}
                emissiveIntensity={selected ? 1 : 0}
              />
            )}
          </mesh>
        )}
        {planet.id === "venus" && !showCutaway && (
          <mesh>
            <sphereGeometry args={[vR * 1.03, 24, 24]} />
            <meshStandardMaterial map={venusAtmo ?? undefined} color={venusAtmo ? "#ffffff" : "#e0b56e"} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}
        <mesh>
          <sphereGeometry args={[vR * 1.1, 32, 32]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {selected && (
          <mesh ref={glowRef}>
            <sphereGeometry args={[vR * 1.26, 24, 24]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
        </group>
        {planet.ring && (
          <group rotation={[Math.PI / 2.15, 0, 0.18]}>
            <mesh>
              <ringGeometry args={[vR * 1.38, vR * (planet.id === "uranus" ? 1.85 : 2.26), 64]} />
              <meshBasicMaterial
                map={ringMap ?? undefined}
                color={ringMap ? "#ffffff" : planet.id === "uranus" ? "#9fd4d8" : "#e8d9a8"}
                transparent
                opacity={planet.id === "uranus" ? 0.45 : 0.7}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
        {moons.map(moon => (
          <OrbitingMoon key={moon.id} moon={moon} focused={moon.id === focusedMoonId} planetRadius={vR} paused={paused} speed={speed} screenPos={screenPos} />
        ))}
      </group>
    </group>
  );
}

export function OrbitingMoon({
  moon, focused = false, planetRadius, paused, speed, screenPos,
}: {
  moon: Moon;
  focused?: boolean;
  planetRadius: number;
  paused: boolean;
  speed: number;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useBodyTexture(focused ? moon.textureKey : moon.id === "luna" ? "moonOverview" : undefined, focused ? "detail" : "core");
  const bump = useBodyTexture(undefined);
  const r = Math.max(0.05, planetRadius * moon.visualRadius);
  const d = planetRadius * moon.orbitScale;
  const tilt = moon.orbitTilt * (Math.PI / 180);
  const segs = getQuality().moonSegments;
  const orbitPts = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      pts.push(Math.cos(a) * d, 0, Math.sin(a) * d);
    }
    return new Float32Array(pts);
  }, [d]);

  useFrame((state, delta) => {
    if (!paused && groupRef.current) groupRef.current.rotation.y += delta * moon.orbitSpeed * moon.orbitDirection * speed;
    if (meshRef.current) screenPos.current[moon.id] = projectToScreen(meshRef.current, state.camera);
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbitPts, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={moon.color} transparent opacity={0.18} />
      </line>
      <group ref={groupRef}>
        <mesh ref={meshRef} position={[d, 0, 0]}>
          <sphereGeometry args={[r, segs, segs]} />
          <meshStandardMaterial
            map={map ?? undefined}
            bumpMap={bump ?? undefined}
            bumpScale={bump ? 0.04 : 0}
            color={map ? "#ffffff" : moon.color}
            roughness={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}

export function OrbitingDwarf({
  dwarf, selected, focusedMoonId, paused, speed, screenPos, simDaysRef, trueScale,
}: {
  dwarf: DwarfPlanet;
  selected: boolean;
  focusedMoonId?: string | null;
  paused: boolean;
  speed: number;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  simDaysRef: React.MutableRefObject<number>;
  trueScale: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const map = useBodyTexture(selected ? dwarf.textureKey : undefined);
  const moons = MOONS_BY_PLANET[dwarf.id] ?? [];
  const el = DWARF_ELEMENTS[dwarf.id];
  const a = el ? visualSemiMajor(el.distanceAU, trueScale) : dwarf.orbitRadius;
  const orbitPts = useMemo(
    () => el
      ? getOrbitPoints(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion, 120)
      : new Float32Array(0),
    [a, el, trueScale],
  );

  useFrame((state, delta) => {
    if (el && bodyRef.current) {
      const M = getMeanAnomaly(el.orbitalPeriodDays, simDaysRef.current);
      const p = getOrbitalPosition(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion, M);
      bodyRef.current.position.copy(p);
    }
    if (!paused && meshRef.current) meshRef.current.rotation.y += delta * dwarf.rotationSpeed * speed;
    if (meshRef.current) screenPos.current[dwarf.id] = projectToScreen(meshRef.current, state.camera);
  });

  return (
    <group>
      {orbitPts.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[orbitPts, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={selected ? C.gold : "#1a2840"} transparent opacity={selected ? 0.7 : 0.16} />
        </line>
      )}
      <group ref={bodyRef}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[dwarf.visualRadius, 24, 24]} />
          <meshStandardMaterial map={map ?? undefined} color={map ? "#ffffff" : dwarf.color} roughness={0.88} />
        </mesh>
        {moons.map(moon => (
          <OrbitingMoon key={moon.id} moon={moon} focused={moon.id === focusedMoonId} planetRadius={dwarf.visualRadius} paused={paused} speed={speed} screenPos={screenPos} />
        ))}
      </group>
    </group>
  );
}

export function PlanetCutaway({
  radius, layers,
}: {
  radius: number;
  layers: PlanetLayer[];
}) {
  const n = layers.length;
  const segs = 22;
  return (
    <group>
      {layers.map((layer, i) => {
        const r = radius * ((i + 1) / n) * 0.98;
        const isCore = i === 0;
        return (
          <mesh key={layer.label}>
            <sphereGeometry
              args={isCore
                ? [Math.max(0.08, r), segs, segs]
                : [r, segs, segs, 0, Math.PI, 0, Math.PI]}
            />
            <meshStandardMaterial
              color={layer.color}
              emissive={isCore ? layer.color : "#000000"}
              emissiveIntensity={isCore ? 0.7 : 0}
              roughness={0.55}
              metalness={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function GalaxyDisc({
  object, screenPos, compact, focused = false,
}: {
  object: DeepSpaceObject;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  compact?: boolean;
  focused?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useBodyTexture(focused ? object.textureKey : undefined);
  const pos = compact && object.galaxyViewPosition ? object.galaxyViewPosition : object.position;
  const r = compact ? 0.55 : object.visualRadius;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0012;
      screenPos.current[object.id] = projectToScreen(meshRef.current, state.camera);
    }
  });

  return (
    <group position={pos} rotation={[0.85, 0.15, 0.2]}>
      <mesh ref={meshRef}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial
          map={map ?? undefined}
          color={map ? "#ffffff" : object.color}
          transparent
          opacity={map ? 0.95 : 0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[r * 1.18, 32]} />
        <meshBasicMaterial
          color={object.color}
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function DeepSpaceMarker({
  object, screenPos, focused = false,
}: {
  object: DeepSpaceObject;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  focused?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z += object.type === "Galaxy" ? 0.0015 : 0.0005;
      screenPos.current[object.id] = projectToScreen(meshRef.current, state.camera);
    }
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(time * 0.8) * 0.06;
    }
  });

  if (object.type === "Galaxy") {
    return <GalaxyDisc object={object} screenPos={screenPos} focused={focused} />;
  }

  if (object.type === "Nebula") {
    return (
      <group position={object.position}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[object.visualRadius, 24, 16]} />
          <meshBasicMaterial color={object.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={haloRef} scale={[1.8, 0.8, 1.25]}>
          <sphereGeometry args={[object.visualRadius, 18, 12]} />
          <meshBasicMaterial color={object.color} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={object.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[object.visualRadius, 16, 16]} />
        <meshBasicMaterial color={object.color} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[object.visualRadius * 3.4, 16, 16]} />
        <meshBasicMaterial color={object.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function AsteroidBelt({ paused, speed }: { paused: boolean; speed: number }) {
  const gRef = useRef<THREE.Group>(null);
  const n = getQuality().asteroidCount;
  const asts = useMemo(
    () => Array.from({ length: n }, (_, i) => {
      const a = i * 0.395;
      const r = 25.5 + Math.sin(i * 8.1) * 2.3;
      return {
        pos: [Math.cos(a) * r, Math.sin(i * 1.1) * 0.2, Math.sin(a) * r] as [number, number, number],
        scale: 0.055 + (i % 6) * 0.018,
        color: ["#7a706a", "#8a8078", "#6a5e58", "#9a8e88"][i % 4],
      };
    }),
    [n],
  );
  useFrame((_, delta) => {
    if (!paused && gRef.current) gRef.current.rotation.y += delta * 0.022 * speed;
  });
  return (
    <group ref={gRef}>
      {asts.map((a, i) => (
        <mesh key={i} position={a.pos} scale={a.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={a.color} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function KuiperBelt({ paused, speed }: { paused: boolean; speed: number }) {
  const gRef = useRef<THREE.Group>(null);
  const n = getQuality().kuiperCount;
  const pts = useMemo(() => {
    const v: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.sin(i * 12.7) * 0.15;
      const r = 48 + (i % 9) * 0.55 + Math.sin(i * 3.1) * 1.8;
      v.push(Math.cos(a) * r, (Math.sin(i * 2.2) * 0.8), Math.sin(a) * r);
    }
    return new Float32Array(v);
  }, [n]);
  useFrame((_, delta) => {
    if (!paused && gRef.current) gRef.current.rotation.y += delta * 0.006 * speed;
  });
  return (
    <points ref={gRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#9aa8c8" transparent opacity={0.45} />
    </points>
  );
}

export function HalleyComet({
  paused, simDaysRef, trueScale, screenPos,
}: {
  paused: boolean;
  simDaysRef: React.MutableRefObject<number>;
  trueScale: boolean;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const el = HALLEY.elements;
  const a = visualSemiMajor(el.distanceAU, trueScale);
  const orbitPts = useMemo(
    () => getOrbitPoints(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion, 180),
    [a, trueScale],
  );

  useFrame((state) => {
    if (!bodyRef.current) return;
    const M = getMeanAnomaly(el.orbitalPeriodDays, simDaysRef.current);
    const p = getOrbitalPosition(a, el.eccentricity, el.inclination, el.longitudeOfAscendingNode, el.argumentOfPerihelion, M);
    bodyRef.current.position.copy(p);
    bodyRef.current.lookAt(0, 0, 0);
    const dist = p.length();
    const grow = THREE.MathUtils.clamp(1 - dist / HALLEY.tail.activeDistance, 0.08, 1);
    if (tailRef.current) {
      tailRef.current.scale.set(grow, grow, grow);
      (tailRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + grow * 0.35;
    }
    screenPos.current[HALLEY.id] = projectToScreen(bodyRef.current, state.camera);
    void paused;
  });

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbitPts, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5a7aaa" transparent opacity={0.2} />
      </line>
      <group ref={bodyRef}>
        <mesh>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#c8d0dc" emissive="#8899aa" emissiveIntensity={0.4} />
        </mesh>
        <mesh ref={tailRef} position={[0, 0, HALLEY.tail.length * 0.45]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[HALLEY.tail.width * 0.35, HALLEY.tail.length, 10, 1, true]} />
          <meshBasicMaterial color={HALLEY.tail.ionColor} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
