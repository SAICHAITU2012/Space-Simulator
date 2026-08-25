import React, { useMemo } from "react";
import * as THREE from "three";
import { CONSTELLATIONS } from "../data/constellations";
import { STAR_SYSTEMS, StarSystem } from "../data/starSystems";
import { DEEP_SPACE_OBJECTS } from "../data/deepSpace";
import { CameraRig, ObjectTapDetector, projectToScreen } from "./camera";
import { GalaxyField } from "./sky";
import { GalaxyDisc } from "./bodies";
import { useFrame } from "@react-three/fiber/native";

function ConstellationLines() {
  const geos = useMemo(() => {
    return CONSTELLATIONS.map(c => {
      const pts: number[] = [];
      const to3 = (s: { x: number; y: number }) => {
        const x = (s.x - 0.5) * 10;
        const y = (0.5 - s.y) * 6 + 2.2;
        const z = -6.5;
        return [x, y, z] as const;
      };
      for (const [a, b] of c.lines) {
        const pa = to3(c.stars[a]);
        const pb = to3(c.stars[b]);
        pts.push(...pa, ...pb);
      }
      return { id: c.id, pts: new Float32Array(pts) };
    });
  }, []);

  return (
    <group>
      {geos.map(g => (
        <lineSegments key={g.id}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[g.pts, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#8ab4ff" transparent opacity={0.35} />
        </lineSegments>
      ))}
    </group>
  );
}

function StarBeacon({
  system, screenPos, selected,
}: {
  system: StarSystem;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  selected: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.scale.setScalar(selected ? 1.35 + Math.sin(t * 3) * 0.08 : 1);
      screenPos.current[system.id] = projectToScreen(meshRef.current, state.camera);
    }
  });
  const r = system.kind === "blackhole" ? 0.18 : system.kind === "binary" ? 0.12 : 0.1;
  return (
    <group position={system.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[r, 12, 12]} />
        <meshBasicMaterial color={system.kind === "blackhole" ? "#110022" : system.color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[r * (system.kind === "blackhole" ? 2.8 : 2.2), 12, 12]} />
        <meshBasicMaterial
          color={system.kind === "blackhole" ? "#6622ff" : system.color}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function GalaxyScene({
  camRef, camTarget, motionRef, isInteracting, pendingTap, screenPos, onWarp, selectedId, onReady,
}: {
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  camTarget: React.MutableRefObject<{ yaw: number; active: boolean }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  onWarp: (id: string) => void;
  selectedId: string | null;
  onReady?: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={40} color="#ffaa66" />
      <CameraRig camRef={camRef} camTarget={camTarget} motionRef={motionRef} isInteracting={isInteracting} earthHub={false} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={screenPos} onTapped={onWarp} />
      <GalaxyField onReady={onReady} />
      <ConstellationLines />
      {STAR_SYSTEMS.map(s => (
        <StarBeacon key={s.id} system={s} screenPos={screenPos} selected={s.id === selectedId} />
      ))}
      {DEEP_SPACE_OBJECTS.filter(o => o.type === "Galaxy").map(g => (
        <GalaxyDisc key={g.id} object={g} screenPos={screenPos} compact />
      ))}
    </>
  );
}
