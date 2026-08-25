import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import * as THREE from "three";
import {
  SATELLITES, Satellite, satVisualRadius, satsForEarthHub,
} from "../data/satellites";
import { CameraRig, ObjectTapDetector, projectToScreen } from "./camera";
import { StarSky, StarField, MilkyWayBand } from "./sky";
import { HubEarth } from "./bodies";

function OrbitingSatellite({
  sat, selected, screenPos, dimmed,
}: {
  sat: Satellite;
  selected: boolean;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  dimmed: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const vRadius = satVisualRadius(sat.altitude);
  const orbSpeed = (2 * Math.PI) / (sat.period * 30);
  const incRad = sat.inclination * (Math.PI / 180);
  const startAng = (sat.id.charCodeAt(0) * 137 + sat.id.charCodeAt(1) * 31) % (Math.PI * 2);

  const orbitPts = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(Math.cos(a) * vRadius, 0, Math.sin(a) * vRadius);
    }
    return new Float32Array(pts);
  }, [vRadius]);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * orbSpeed;
    if (selected && glowRef.current) {
      const t = state.clock.getElapsedTime();
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 3) * 0.2;
    }
    if (dotRef.current) screenPos.current[sat.id] = projectToScreen(dotRef.current, state.camera);
  });

  const orbitColor = dimmed ? "#152040" : sat.color;
  const dotColor = dimmed ? "#253060" : sat.color;
  const dotSize = selected ? 0.14 : 0.085;

  return (
    <group rotation={[incRad, 0, 0]}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbitPts, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={orbitColor} transparent opacity={selected ? 0.65 : dimmed ? 0.08 : 0.22} />
      </line>
      <group ref={groupRef} rotation={[0, startAng, 0]}>
        <group ref={dotRef} position={[vRadius, 0, 0]} scale={selected ? 1.25 : 1}>
          <SatelliteModel color={dotColor} size={dotSize} type={sat.type} />
        </group>
        {selected && (
          <mesh ref={glowRef} position={[vRadius, 0, 0]}>
            <sphereGeometry args={[dotSize * 2.5, 10, 10]} />
            <meshBasicMaterial color={sat.color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function SatelliteModel({ color, size, type }: { color: string; size: number; type: Satellite["type"] }) {
  const panelSpan = type === "Communication" || type === "Navigation" ? 3.8 : 2.8;
  const bodyLength = type === "Crewed" ? size * 2.6 : size * 1.8;
  return (
    <group rotation={[0.25, 0.45, 0.15]}>
      <mesh>
        <boxGeometry args={[bodyLength, size * 1.15, size * 1.15]} />
        <meshStandardMaterial color="#d8e6ff" roughness={0.38} metalness={0.48} emissive={color} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[-bodyLength * 0.72, 0, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.9, size * panelSpan]} />
        <meshStandardMaterial color="#153d8f" roughness={0.32} metalness={0.15} emissive="#0b4cff" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[bodyLength * 0.72, 0, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.9, size * panelSpan]} />
        <meshStandardMaterial color="#153d8f" roughness={0.32} metalness={0.15} emissive="#0b4cff" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, size * 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[size * 0.58, size * 0.5, 18]} />
        <meshStandardMaterial color="#cbd7e8" roughness={0.48} metalness={0.55} />
      </mesh>
      <mesh position={[0, -size * 0.74, 0]}>
        <sphereGeometry args={[size * 0.42, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

export function EarthHubScene({
  camRef, motionRef, isInteracting, pendingTap, satScreenPos, onSatTapped,
  agencyFilter, selectedSatId,
}: {
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  satScreenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  onSatTapped: (id: string) => void;
  agencyFilter: Satellite[] | null;
  selectedSatId: string | null;
}) {
  useEffect(() => {
    camRef.current = { yaw: 0.3, pitch: 0.5, zoom: 13 };
  }, [camRef]);

  const visibleSats = satsForEarthHub(agencyFilter ?? SATELLITES);

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[12, 4, 8]} intensity={2.2} color="#fff6e0" />
      <directionalLight position={[-5, -2, -5]} intensity={0.12} color="#2244aa" />
      <hemisphereLight args={["#001133", "#000011", 0.06]} />
      <CameraRig camRef={camRef} motionRef={motionRef} isInteracting={isInteracting} earthHub />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={satScreenPos} onTapped={onSatTapped} />
      <StarSky dim />
      <StarField dim />
      <MilkyWayBand />
      <HubEarth />
      {visibleSats.map(sat => (
        <OrbitingSatellite
          key={sat.id}
          sat={sat}
          selected={sat.id === selectedSatId}
          screenPos={satScreenPos}
          dimmed={agencyFilter !== null && sat.agencyId !== (agencyFilter[0]?.agencyId ?? "")}
        />
      ))}
    </>
  );
}
