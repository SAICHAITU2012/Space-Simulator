import React from "react";
import { PLANETS } from "../data/spaceData";
import { DWARF_PLANETS } from "../data/dwarfs";
import { DEEP_SPACE_OBJECTS } from "../data/deepSpace";
import { LabInputs } from "../lib/physics";
import { CameraRig, ObjectTapDetector } from "./camera";
import { StarSky, MilkyWayBand, StarField, DeepSpaceEnvironment } from "./sky";
import {
  AsteroidBelt,
  DeepSpaceMarker,
  HalleyComet,
  KuiperBelt,
  OrbitingDwarf,
  OrbitingPlanet,
  SimTicker,
  Sun,
} from "./bodies";

export function SolarScene({
  selectedId, paused, speed, camRef, camTarget, motionRef, isInteracting,
  pendingTap, planetScreenPos, labInputs, onPlanetTapped, zoomLevel,
  simDaysRef, daysPerSecond, trueScale, showCutaway,
}: {
  selectedId: string;
  paused: boolean;
  speed: number;
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  camTarget: React.MutableRefObject<{ yaw: number; active: boolean }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  planetScreenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  labInputs: LabInputs;
  onPlanetTapped: (id: string) => void;
  zoomLevel: number;
  simDaysRef: React.MutableRefObject<number>;
  daysPerSecond: number;
  trueScale: boolean;
  showCutaway?: boolean;
}) {
  return (
    <>
      <SimTicker paused={paused} speed={speed} simDaysRef={simDaysRef} daysPerSecond={daysPerSecond} />
      <ambientLight intensity={0.018} color="#0a1020" />
      <pointLight position={[0, 0, 0]} intensity={900} color="#fff4cc" decay={2} distance={0} />
      <pointLight position={[0, 40, 0]} intensity={6} color="#1020aa" decay={2} />
      <CameraRig camRef={camRef} camTarget={camTarget} motionRef={motionRef} isInteracting={isInteracting} earthHub={false} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={planetScreenPos} onTapped={onPlanetTapped} />
      <StarSky />
      <MilkyWayBand />
      <StarField />
      {zoomLevel > 65 && <DeepSpaceEnvironment zoom={zoomLevel} />}
      <Sun />
      <AsteroidBelt paused={paused} speed={speed} />
      <KuiperBelt paused={paused} speed={speed} />
      <HalleyComet paused={paused} simDaysRef={simDaysRef} trueScale={trueScale} screenPos={planetScreenPos} />
      {PLANETS.map(pl => (
        <OrbitingPlanet
          key={pl.id}
          planet={pl}
          selected={pl.id === selectedId}
          paused={paused}
          speed={speed}
          labInputs={pl.id === selectedId ? labInputs : undefined}
          screenPos={planetScreenPos}
          simDaysRef={simDaysRef}
          trueScale={trueScale}
          showCutaway={showCutaway}
        />
      ))}
      {DWARF_PLANETS.map(d => (
        <OrbitingDwarf
          key={d.id}
          dwarf={d}
          selected={d.id === selectedId}
          paused={paused}
          speed={speed}
          screenPos={planetScreenPos}
          simDaysRef={simDaysRef}
          trueScale={trueScale}
        />
      ))}
      {DEEP_SPACE_OBJECTS.map(object => (
        <DeepSpaceMarker key={object.id} object={object} screenPos={planetScreenPos} />
      ))}
    </>
  );
}
