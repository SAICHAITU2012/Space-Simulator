import React, { useMemo } from "react";
import * as THREE from "three";
import { useBodyTexture } from "../lib/textures";
import { getQuality } from "../lib/quality";

function mkStars(n: number, r0: number, r1: number) {
  const v: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = r0 + Math.random() * (r1 - r0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    v.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }
  return new Float32Array(v);
}

export function StarSky({ dim }: { dim?: boolean }) {
  const milky = useBodyTexture("milkyWay");
  const stars = useBodyTexture("stars");
  const map = milky ?? stars;
  return (
    <mesh>
      <sphereGeometry args={[900, 24, 16]} />
      <meshBasicMaterial
        map={map ?? undefined}
        color={map ? "#202848" : "#050816"}
        side={THREE.BackSide}
        depthWrite={false}
        opacity={dim ? 0.28 : 0.42}
        transparent
      />
    </mesh>
  );
}

export function StarField({ dim }: { dim?: boolean }) {
  const v1 = useMemo(() => mkStars(900, 92, 180), []);
  const v2 = useMemo(() => mkStars(280, 90, 155), []);
  const v3 = useMemo(() => mkStars(80, 90, 145), []);
  const v4 = useMemo(() => mkStars(90, 108, 170), []);
  const v5 = useMemo(() => mkStars(28, 95, 150), []);
  const o = dim ? 0.35 : 1;
  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[v1, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} sizeAttenuation color="#c8d8ff" transparent opacity={0.42 * o} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[v2, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.28} sizeAttenuation color="#ffffff" transparent opacity={0.92 * o} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[v3, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.6} sizeAttenuation color="#fff3d8" transparent opacity={o} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[v4, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.2} sizeAttenuation color="#88aaff" transparent opacity={0.7 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[v5, 3]} />
        </bufferGeometry>
        <pointsMaterial size={1.1} sizeAttenuation color="#ffeecc" transparent opacity={0.95 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </>
  );
}

export function MilkyWayBand() {
  const v = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < 1600; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 60;
      const sp = (Math.random() - 0.5) * 28 * (1 - Math.abs(Math.sin(ang)) * 0.5);
      a.push(Math.cos(ang) * r, sp, Math.sin(ang) * r);
    }
    return new Float32Array(a);
  }, []);
  return (
    <points rotation={[0.42, 0, 0.26]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[v, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#b8ccee" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function mkCloud(cx: number, cy: number, cz: number, radius: number, count: number) {
  const v: number[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.3 + Math.random() * 0.7);
    v.push(cx + r * Math.sin(phi) * Math.cos(theta), cy + r * Math.cos(phi) * 0.45, cz + r * Math.sin(phi) * Math.sin(theta));
  }
  return new Float32Array(v);
}

export function DeepSpaceEnvironment({ zoom }: { zoom: number }) {
  const opacity = Math.min(1, (zoom - 65) / 35);
  const orion = useMemo(() => mkCloud(-220, 40, -180, 38, 420), []);
  const pillars = useMemo(() => mkCloud(280, -30, 260, 28, 320), []);
  const carina = useMemo(() => mkCloud(60, 80, -320, 42, 360), []);
  const gal1 = useMemo(() => mkCloud(-380, 20, 0, 18, 180), []);
  const gal2 = useMemo(() => mkCloud(0, -40, 400, 14, 140), []);
  const gal3 = useMemo(() => mkCloud(350, 60, -350, 16, 160), []);
  const gal4 = useMemo(() => mkCloud(-300, -50, 300, 12, 120), []);
  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orion, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.55} color="#ff8844" transparent opacity={0.28 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pillars, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.48} color="#44ddcc" transparent opacity={0.24 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[carina, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.52} color="#cc44ff" transparent opacity={0.22 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gal1, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ffe8cc" transparent opacity={0.55 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gal2, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ccddff" transparent opacity={0.55 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gal3, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ffd8aa" transparent opacity={0.5 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gal4, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#ddeeff" transparent opacity={0.48 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </>
  );
}

export function GalaxyField({ onReady }: { onReady?: () => void }) {
  const q = getQuality();
  const data = useMemo(() => {
    const count = q.galaxyCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const radius = 5;
    const branches = 4;
    const spin = 1;
    const randomness = 0.2;
    const randomnessPower = 3;
    const colorInside = new THREE.Color("#ff6030");
    const colorOutside = new THREE.Color("#1b3984");
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radiusRandom = Math.random() * radius;
      const spinAngle = radiusRandom * spin;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const rx = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusRandom;
      const ry = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusRandom;
      const rz = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusRandom;
      positions[i3] = Math.cos(branchAngle + spinAngle) * radiusRandom + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radiusRandom + rz;
      const mixed = colorInside.clone().lerp(colorOutside, radiusRandom / radius);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }
    onReady?.();
    return { positions, colors };
  }, [q.galaxyCount, onReady]);

  return (
    <points rotation={[0.35, 0, 0.1]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
