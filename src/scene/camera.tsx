import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";
import { screenW, screenH } from "./viewport";

export function CameraRig({
  camRef, camTarget, motionRef, isInteracting, earthHub, lookAt,
}: {
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  camTarget?: React.MutableRefObject<{ yaw: number; active: boolean }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  earthHub: boolean;
  lookAt?: [number, number, number];
}) {
  const { camera } = useThree();
  const lastInteract = useRef(0);
  const autoYaw = useRef(camRef.current.yaw);
  const dampMotion = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (isInteracting.current) {
      lastInteract.current = Date.now();
      if (camTarget?.current) camTarget.current.active = false;
    }

    if (camTarget?.current.active) {
      const diff = camTarget.current.yaw - camRef.current.yaw;
      camRef.current.yaw += diff * 0.08;
      if (Math.abs(diff) < 0.002) camTarget.current.active = false;
      autoYaw.current = camRef.current.yaw;
    } else if (Date.now() - lastInteract.current > 3500 && !isInteracting.current) {
      autoYaw.current += delta * (earthHub ? 0.025 : 0.038);
      camRef.current.yaw = autoYaw.current;
    } else {
      autoYaw.current = camRef.current.yaw;
    }

    dampMotion.current.x += (motionRef.current.x - dampMotion.current.x) * 0.12;
    dampMotion.current.y += (motionRef.current.y - dampMotion.current.y) * 0.12;
    const yaw = camRef.current.yaw + dampMotion.current.y * 0.08;
    const pitch = camRef.current.pitch + dampMotion.current.x * 0.05;
    const r = camRef.current.zoom;
    camera.position.lerp(
      new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch) * r,
        Math.sin(pitch) * r,
        Math.cos(yaw) * Math.cos(pitch) * r,
      ),
      0.07,
    );
    camera.lookAt(lookAt ? new THREE.Vector3(...lookAt) : new THREE.Vector3(0, 0, 0));
  });
  return null;
}

export function ObjectTapDetector({
  pendingTap, screenPos, onTapped,
}: {
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  onTapped: (id: string) => void;
}) {
  useFrame(() => {
    if (!pendingTap.current) return;
    const tap = pendingTap.current;
    pendingTap.current = null;
    let best: string | null = null;
    let bestDist = 75;
    Object.entries(screenPos.current).forEach(([id, pos]) => {
      const d = Math.hypot(pos.x - tap.x, pos.y - tap.y);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    });
    if (best) onTapped(best);
  });
  return null;
}

export function projectToScreen(
  object: THREE.Object3D,
  camera: THREE.Camera,
): { x: number; y: number } {
  const wp = new THREE.Vector3();
  object.getWorldPosition(wp);
  wp.project(camera);
  return { x: ((wp.x + 1) / 2) * screenW, y: ((-wp.y + 1) / 2) * screenH };
}
