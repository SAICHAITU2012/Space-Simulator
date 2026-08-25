/**
 * SpaceVerse — Living 3D Knowledge Graph of Humanity in Space
 * ─────────────────────────────────────────────────────────────
 * Sections:
 *  🌌 Universe   — 3D Solar System + planet explorer
 *  🌍 Earth Hub  — Earth with satellite orbits (the killer feature)
 *  🏛 Agencies   — Space agency knowledge graph
 *  🚀 Missions   — Historic mission cards
 *  🕒 Timeline   — Space history from 1957 to now
 *  🧪 Lab        — Interactive physics experiments
 *  🤖 Cosmo      — AI space buddy (knowledge graph queries)
 *  🎯 Quiz       — Gamified learning
 */

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Linking,
  View,
  useWindowDimensions,
} from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import { Gyroscope } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as THREE from "three";

import { PLANETS, Planet, PLANET_BY_ID } from "./src/data/spaceData";
import { LabInputs, calculateLabOutcome } from "./src/lib/physics";
import { MISSIONS } from "./src/data/missions";
import { QUIZ_QUESTIONS } from "./src/data/quiz";
import { EXPERIMENTS } from "./src/data/experiments";
import { AGENCIES, AGENCY_BY_ID } from "./src/data/agencies";
import {
  SATELLITES, Satellite, SATELLITE_BY_ID, SATELLITES_BY_AGENCY, satVisualRadius, satsForEarthHub,
} from "./src/data/satellites";
import { TIMELINE } from "./src/data/timeline";
import { MOONS, MOON_BY_ID, MOONS_BY_PLANET, Moon } from "./src/data/moons";
import { DWARF_PLANETS, DWARF_BY_ID, DwarfPlanet } from "./src/data/dwarfs";
import { DEEP_SPACE_OBJECTS, DEEP_SPACE_BY_ID, DeepSpaceObject } from "./src/data/deepSpace";
import { PLANET_TEXTURE_KEY, TEXTURE_CREDIT, useBodyTexture } from "./src/lib/textures";
import { askCosmo, CosmoAction } from "./src/lib/cosmo";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | "universe"
  | "earthhub"
  | "agencies"
  | "missions"
  | "timeline"
  | "lab"
  | "cosmo"
  | "quiz";

const SECTIONS: Array<{ id: Section; label: string; emoji: string }> = [
  { id: "universe",  label: "Universe",  emoji: "🌌" },
  { id: "earthhub",  label: "Earth Hub", emoji: "🌍" },
  { id: "agencies",  label: "Agencies",  emoji: "🏛" },
  { id: "missions",  label: "Missions",  emoji: "🚀" },
  { id: "timeline",  label: "Timeline",  emoji: "🕒" },
  { id: "lab",       label: "Lab",       emoji: "🧪" },
  { id: "cosmo",     label: "Cosmo AI",  emoji: "🤖" },
  { id: "quiz",      label: "Quiz",      emoji: "🎯" },
];

const initialWindow = Dimensions.get("window");
const SW = initialWindow.width;
const SH = initialWindow.height;
let screenW = initialWindow.width;
let screenH = initialWindow.height;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         "#01020a",
  panel:      "rgba(3,6,18,0.97)",
  panelSoft:  "rgba(10,20,44,0.80)",
  border:     "rgba(110,165,255,0.15)",
  borderGlow: "rgba(77,249,255,0.52)",
  cyan:       "#4df9ff",
  violet:     "#b58cff",
  gold:       "#ffd166",
  green:      "#4dffc3",
  red:        "#ff5580",
  orange:     "#ffac5f",
  text:       "#eef5ff",
  textSub:    "#8ab8d8",
  textMuted:  "#4d6e8a",
  ink:        "#060d1e",
  earthBlue:  "#3c82ff",
};

const PANEL_PEEK = 88;

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { width: viewW, height: viewH } = useWindowDimensions();
  const isLandscape = viewW > viewH;
  const panelOpen = isLandscape ? viewH * 0.78 : viewH * 0.60;
  const panelPeek = isLandscape ? 74 : PANEL_PEEK;
  const [entered,           setEntered]           = useState(false);
  const [section,           setSection]           = useState<Section>("universe");
  const [selectedPlanetId,  setSelectedPlanetId]  = useState("earth");
  const [selectedSatId,     setSelectedSatId]     = useState<string | null>(null);
  const [selectedAgencyId,  setSelectedAgencyId]  = useState<string | null>(null);
  const [paused,            setPaused]            = useState(false);
  const [speed,             setSpeed]             = useState(1);
  const [motionEnabled,     setMotionEnabled]     = useState(false);
  const [floatingCard,      setFloatingCard]      = useState<"planet" | "satellite" | "moon" | "dwarf" | null>(null);
  const [selectedMoonId,    setSelectedMoonId]    = useState<string | null>(null);
  const [selectedDwarfId,   setSelectedDwarfId]   = useState<string | null>(null);
  const [selectedDeepId,    setSelectedDeepId]    = useState<string | null>(null);
  const [zoomLevel,         setZoomLevel]         = useState(38);
  const [exploredIds,       setExploredIds]       = useState<string[]>(["earth"]);
  const [showCredits,       setShowCredits]       = useState(false);
  const [activeExperimentId,setActiveExperimentId]= useState<string | null>(null);
  const [labInputs,         setLabInputs]         = useState<LabInputs>({
    massScale: 1, radiusScale: 1, velocityScale: 1,
    gravityScale: 1, rotationScale: 1, moonDistScale: 1,
  });

  const camRef    = useRef({ yaw: 0.18, pitch: 0.36, zoom: 38 });
  const camTarget = useRef<{ yaw: number; active: boolean }>({ yaw: 0.18, active: false });
  const motionRef = useRef({ x: 0, y: 0 });
  const pendingTap       = useRef<{ x: number; y: number } | null>(null);
  const planetScreenPos  = useRef<Record<string, { x: number; y: number }>>({});
  const satScreenPos     = useRef<Record<string, { x: number; y: number }>>({});
  const isInteracting    = useRef(false);
  const canvasContainerRef = useRef<View>(null);

  // Panel
  const panelAnim   = useRef(new Animated.Value(PANEL_PEEK)).current;
  const panelIsOpen = useRef(false);
  const panelStartH = useRef(PANEL_PEEK);

  const selectedPlanet = PLANET_BY_ID[selectedPlanetId] ?? PLANET_BY_ID.earth;
  const selectedSat    = selectedSatId ? SATELLITE_BY_ID[selectedSatId] : null;
  const selectedMoon   = selectedMoonId ? MOON_BY_ID[selectedMoonId] : null;
  const selectedDwarf  = selectedDwarfId ? DWARF_BY_ID[selectedDwarfId] : null;
  const selectedDeep   = selectedDeepId ? DEEP_SPACE_BY_ID[selectedDeepId] : null;
  const selectedAgency = selectedAgencyId ? AGENCY_BY_ID[selectedAgencyId] : null;
  const agencyFilter   = selectedAgencyId
    ? SATELLITES.filter(s => s.agencyId === selectedAgencyId)
    : null;

  const labOutcome = useMemo(
    () => calculateLabOutcome(selectedPlanet, labInputs),
    [labInputs, selectedPlanet]
  );

  useEffect(() => {
    screenW = viewW;
    screenH = viewH;
    panelAnim.setValue(panelIsOpen.current ? panelOpen : panelPeek);
  }, [viewW, viewH, panelOpen, panelPeek, panelAnim]);

  // Gyroscope — only available on native (iOS/Android) or mobile web
  useEffect(() => {
    if (!motionEnabled) { motionRef.current = { x: 0, y: 0 }; return undefined; }
    if (Platform.OS === "web" && typeof DeviceOrientationEvent === "undefined") {
      // Desktop browser — no gyroscope
      setMotionEnabled(false);
      return undefined;
    }
    Gyroscope.setUpdateInterval(80);
    const sub = Gyroscope.addListener(({ x, y }) => {
      motionRef.current = {
        x: THREE.MathUtils.clamp(x * 0.55, -0.7, 0.7),
        y: THREE.MathUtils.clamp(y * 0.55, -0.7, 0.7),
      };
    });
    return () => sub.remove();
  }, [motionEnabled]);

  // Mouse wheel zoom (web desktop)
  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const handler = (e: Event) => {
      const we = e as WheelEvent;
      we.preventDefault();
      setCameraZoom(camRef.current.zoom + we.deltaY * 0.06);
    };
    // Attach to the document since canvasContainerRef may not have a DOM node directly
    document.addEventListener("wheel", handler, { passive: false });
    return () => document.removeEventListener("wheel", handler);
  }, []);

  // Touch handling
  const touchSnap = useRef({ yaw: 0, pitch: 0, zoom: 38, dist: 0, tapX: 0, tapY: 0, t: 0 });

  const canvasPan = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (ev) => {
        const touches = ev.nativeEvent.touches;
        const t0 = touches[0];
        touchSnap.current = {
          yaw: camRef.current.yaw, pitch: camRef.current.pitch, zoom: camRef.current.zoom,
          dist: touches.length >= 2 ? td(touches[0], touches[1]) : 0,
          tapX: t0?.pageX ?? 0, tapY: t0?.pageY ?? 0, t: Date.now(),
        };
        isInteracting.current = true;
      },
      onPanResponderMove: (ev, g) => {
        const touches = ev.nativeEvent.touches;
        if (touches.length >= 2) {
          const d = td(touches[0], touches[1]);
          const nextZoom = THREE.MathUtils.clamp(
            touchSnap.current.zoom + (touchSnap.current.dist - d) * 0.075, 8, 180
          );
          camRef.current.zoom = nextZoom;
          setZoomLevel(nextZoom);
          return;
        }
        camRef.current.yaw   = touchSnap.current.yaw   + g.dx * 0.0072;
        camRef.current.pitch = THREE.MathUtils.clamp(
          touchSnap.current.pitch + g.dy * 0.0048, -0.22, 1.12
        );
      },
      onPanResponderRelease: (ev, g) => {
        isInteracting.current = false;
        if (Math.abs(g.dx) < 9 && Math.abs(g.dy) < 9 && Date.now() - touchSnap.current.t < 380) {
          const ct = ev.nativeEvent.changedTouches[0];
          if (ct) pendingTap.current = { x: ct.pageX, y: ct.pageY };
        }
      },
    }),
    []
  );

  // Panel pan
  const panelPan = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        panelStartH.current = panelIsOpen.current ? panelOpen : panelPeek;
      },
      onPanResponderMove: (_, g) => {
        panelAnim.setValue(
          Math.max(panelPeek, Math.min(panelOpen, panelStartH.current - g.dy))
        );
      },
      onPanResponderRelease: (_, g) => {
        const mid = (panelOpen + panelPeek) / 2;
        snapPanel(g.vy < -0.4 || (g.vy >= 0 && panelStartH.current - g.dy > mid));
      },
    }),
    [panelOpen, panelPeek]
  );

  const snapPanel = (open: boolean) => {
    panelIsOpen.current = open;
    Animated.spring(panelAnim, { toValue: open ? panelOpen : panelPeek, tension: 85, friction: 13, useNativeDriver: false }).start();
  };

  const setCameraZoom = (nextZoom: number) => {
    const zoom = THREE.MathUtils.clamp(nextZoom, 8, 180);
    camRef.current.zoom = zoom;
    setZoomLevel(zoom);
  };

  const markExplored = useCallback((id: string) => {
    setExploredIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const onPlanetTapped = useCallback((id: string) => {
    const p = PLANET_BY_ID[id]; if (!p) return;
    setSelectedPlanetId(id);
    setSelectedMoonId(null);
    setSelectedDwarfId(null);
    setSelectedDeepId(null);
    setFloatingCard("planet");
    markExplored(id);
    // Smooth zoom to planet
    const nextZoom = THREE.MathUtils.clamp(p.orbitRadius * 1.28 + 7, 14, 62);
    setCameraZoom(nextZoom);
    // Aim camera yaw toward the planet's current position (approx from screenPos)
    const sp = planetScreenPos.current[id];
    if (sp) {
      // Convert screen position to yaw offset
      const nx = (sp.x / screenW) * 2 - 1; // -1..1
      camTarget.current = { yaw: camRef.current.yaw - nx * 0.4, active: true };
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [markExplored]);

  const onMoonTapped = useCallback((id: string) => {
    const m = MOON_BY_ID[id]; if (!m) return;
    setSelectedMoonId(id);
    setSelectedPlanetId(m.planetId);
    setSelectedDwarfId(null);
    setSelectedDeepId(null);
    setFloatingCard("moon");
    markExplored(id);
    markExplored(m.planetId);
    const p = PLANET_BY_ID[m.planetId];
    if (p) setCameraZoom(THREE.MathUtils.clamp(p.orbitRadius * 1.15 + 6, 12, 58));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [markExplored]);

  const onDwarfTapped = useCallback((id: string) => {
    const d = DWARF_BY_ID[id]; if (!d) return;
    setSelectedDwarfId(id);
    setSelectedMoonId(null);
    setSelectedDeepId(null);
    setFloatingCard("dwarf");
    markExplored(id);
    setCameraZoom(THREE.MathUtils.clamp(d.orbitRadius * 1.2 + 6, 16, 80));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [markExplored]);

  const onDeepTapped = useCallback((id: string) => {
    const object = DEEP_SPACE_BY_ID[id]; if (!object) return;
    setSelectedDeepId(id);
    setSelectedMoonId(null);
    setSelectedDwarfId(null);
    setFloatingCard(null);
    markExplored(id);
    setCameraZoom(150);
    snapPanel(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [markExplored]);

  const onSolarTapped = useCallback((id: string) => {
    if (PLANET_BY_ID[id]) onPlanetTapped(id);
    else if (MOON_BY_ID[id]) onMoonTapped(id);
    else if (DWARF_BY_ID[id]) onDwarfTapped(id);
    else if (DEEP_SPACE_BY_ID[id]) onDeepTapped(id);
  }, [onPlanetTapped, onMoonTapped, onDwarfTapped, onDeepTapped]);

  const onSatTapped = useCallback((id: string) => {
    if (!SATELLITE_BY_ID[id]) return;
    setSelectedSatId(id);
    setFloatingCard("satellite");
    markExplored(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [markExplored]);

  const activateExperiment = useCallback((eid: string) => {
    const exp = EXPERIMENTS.find(e => e.id === eid); if (!exp) return;
    setActiveExperimentId(eid);
    setSelectedPlanetId(exp.targetPlanetId);
    setLabInputs(prev => ({
      ...prev,
      ...exp.params.reduce<Record<string, number>>((a, p2) => { a[p2.key] = p2.defaultValue; return a; }, {})
    }));
    setSection("lab"); snapPanel(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, []);

  const switchToSection = (s: Section) => { setSection(s); if (!panelIsOpen.current) snapPanel(true); };

  const applyCosmoAction = useCallback((action: CosmoAction) => {
    if (action.type === "openSection") switchToSection(action.section);
    if (action.type === "focusPlanet") { onPlanetTapped(action.id); switchToSection("universe"); }
    if (action.type === "focusMoon") { onMoonTapped(action.id); switchToSection("universe"); }
    if (action.type === "focusDwarf") { onDwarfTapped(action.id); switchToSection("universe"); }
    if (action.type === "focusSatellite") { onSatTapped(action.id); switchToSection("earthhub"); }
    if (action.type === "filterAgency") { setSelectedAgencyId(action.id); switchToSection("earthhub"); }
    if (action.type === "startExperiment") activateExperiment(action.id);
  }, [onPlanetTapped, onMoonTapped, onDwarfTapped, onSatTapped, activateExperiment]);

  if (!entered) {
    return <HomeScreen onEnter={() => setEntered(true)} onSection={s => { setSection(s as Section); setEntered(true); }} />;
  }

  const showEarthHub = section === "earthhub";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ── Full-screen 3D Canvas ── */}
      <View ref={canvasContainerRef} style={StyleSheet.absoluteFillObject} {...canvasPan.panHandlers}>
        <Canvas
          camera={{ position: [0, 18, 38], fov: 50, near: 0.01, far: 2000 }}
          gl={{
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.72;
          }}
        >
          <color attach="background" args={["#00000f"]} />
          <Suspense fallback={null}>
            {showEarthHub ? (
              <EarthHubScene
                camRef={camRef}
                motionRef={motionRef}
                isInteracting={isInteracting}
                pendingTap={pendingTap}
                satScreenPos={satScreenPos}
                onSatTapped={onSatTapped}
                agencyFilter={agencyFilter}
                selectedSatId={selectedSatId}
              />
            ) : (
              <SolarScene
                selectedId={selectedPlanetId}
                paused={paused}
                speed={speed}
                camRef={camRef}
                camTarget={camTarget}
                motionRef={motionRef}
                isInteracting={isInteracting}
                pendingTap={pendingTap}
                planetScreenPos={planetScreenPos}
                labInputs={labInputs}
                onPlanetTapped={onSolarTapped}
                zoomLevel={zoomLevel}
              />
            )}
          </Suspense>
        </Canvas>
      </View>

      {/* ── UI Overlay ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <SafeAreaView pointerEvents="box-none">
          <View style={ui.topBar} pointerEvents="auto">
            <View>
              <Text style={ui.appName}>SPACEVERSE</Text>
              <Text style={ui.appSub}>Living Knowledge Graph of Humanity in Space</Text>
            </View>
            <View style={ui.topRight}>
              {!showEarthHub && <GlassBtn label={paused ? "▶" : "⏸"} onPress={() => setPaused(v => !v)} />}
              <GlassBtn label={motionEnabled ? "🧭" : "👆"} onPress={() => setMotionEnabled(v => !v)} />
              <GlassBtn label="i" onPress={() => setShowCredits(v => !v)} />
              <GlassBtn label="⌂" onPress={() => {
                camRef.current = showEarthHub ? { yaw: 0.2, pitch: 0.5, zoom: 14 } : { yaw: 0.18, pitch: 0.36, zoom: 38 };
                setZoomLevel(camRef.current.zoom);
                setFloatingCard(null);
              }} />
            </View>
          </View>
        </SafeAreaView>

        {/* Floating card — planet */}
        {floatingCard === "planet" && !showEarthHub && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <LinearGradient colors={selectedPlanet.gradientColors} style={ui.fcGradHeader}>
              <View style={ui.fcRow}>
                <Text style={ui.fcEmoji}>{selectedPlanet.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={ui.fcName}>{selectedPlanet.name}</Text>
                  <Text style={ui.fcNick}>{selectedPlanet.nickname.toUpperCase()}</Text>
                </View>
                <Pressable onPress={() => setFloatingCard(null)}>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 24, paddingHorizontal: 8 }}>×</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={ui.fcBody}>
              <Text style={ui.fcFact} numberOfLines={2}>{selectedPlanet.funFacts[0]}</Text>
              {/* Planet Internal Structure */}
              <PlanetStructureView planet={selectedPlanet} />
              <View style={ui.fcBtns}>
                <Pressable style={ui.fcBtn} onPress={() => { setSection("universe"); snapPanel(true); }}>
                  <Text style={ui.fcBtnText}>🔍  Explore</Text>
                </Pressable>
                <Pressable style={[ui.fcBtn, ui.fcBtnCyan]} onPress={() => activateExperiment("earth_spin_faster")}>
                  <Text style={[ui.fcBtnText, { color: C.cyan }]}>🧪  Lab</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {floatingCard === "moon" && selectedMoon && !showEarthHub && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <LinearGradient colors={["#1a2a5e","#060c22"]} style={ui.fcGradHeader}>
              <View style={ui.fcRow}>
                <Text style={ui.fcEmoji}>{selectedMoon.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={ui.fcName}>{selectedMoon.name}</Text>
                  <Text style={ui.fcNick}>{selectedMoon.nickname.toUpperCase()}  ·  {PLANET_BY_ID[selectedMoon.planetId]?.name.toUpperCase()}</Text>
                </View>
                <Pressable onPress={() => setFloatingCard(null)}>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 24, paddingHorizontal: 8 }}>×</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={ui.fcBody}>
              <Text style={ui.fcFact} numberOfLines={3}>{selectedMoon.fact}</Text>
              <Pressable style={[ui.fcBtn, ui.fcBtnCyan]} onPress={() => { setSection("universe"); snapPanel(true); }}>
                <Text style={[ui.fcBtnText, { color: C.cyan }]}>🔍  Moon facts</Text>
              </Pressable>
            </View>
          </View>
        )}

        {floatingCard === "dwarf" && selectedDwarf && !showEarthHub && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <LinearGradient colors={["#1e1040","#080520"]} style={ui.fcGradHeader}>
              <View style={ui.fcRow}>
                <Text style={ui.fcEmoji}>{selectedDwarf.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={ui.fcName}>{selectedDwarf.name}</Text>
                  <Text style={ui.fcNick}>{selectedDwarf.nickname.toUpperCase()}</Text>
                </View>
                <Pressable onPress={() => setFloatingCard(null)}>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 24, paddingHorizontal: 8 }}>×</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={ui.fcBody}>
              <Text style={ui.fcFact} numberOfLines={3}>{selectedDwarf.fact}</Text>
            </View>
          </View>
        )}

        {showCredits && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <LinearGradient colors={["#0a1a3a","#030c1e"]} style={ui.fcGradHeader}>
              <View style={ui.fcRow}>
                <Text style={ui.fcName}>Credits &amp; Info</Text>
                <Pressable onPress={() => setShowCredits(false)}>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 24, paddingHorizontal: 8 }}>×</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={ui.fcBody}>
              <Text style={ui.fcFact}>{TEXTURE_CREDIT}</Text>
              <Text style={ui.fcFact}>Facts compiled from NASA, ESA, and ISRO public materials. Physics runs on-device. Cosmo uses Groq when online.</Text>
            </View>
          </View>
        )}
        {floatingCard === "satellite" && selectedSat && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <LinearGradient colors={["#002244","#000c1e"]} style={ui.fcGradHeader}>
              <View style={ui.fcRow}>
                <Text style={ui.fcEmoji}>{selectedSat.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={ui.fcName}>{selectedSat.shortName}</Text>
                  <Text style={ui.fcNick}>
                    {selectedSat.flag}  {selectedSat.country.toUpperCase()}
                    {"  ·  "}{selectedSat.orbitClass}{"  ·  "}{selectedSat.launchYear}
                  </Text>
                </View>
                <Pressable onPress={() => { setFloatingCard(null); setSelectedSatId(null); }}>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 24, paddingHorizontal: 8 }}>×</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={ui.fcBody}>
              <View style={[ui.statusChip, { borderColor: selectedSat.status === "active" ? C.green + "55" : C.red + "55" }]}>
                <View style={[ui.statusDot, { backgroundColor: selectedSat.status === "active" ? C.green : selectedSat.status === "retired" ? C.gold : C.red }]} />
                <Text style={[ui.statusText, { color: selectedSat.status === "active" ? C.green : selectedSat.status === "retired" ? C.gold : C.red }]}>
                  {selectedSat.status.toUpperCase()}  ·  Alt: {selectedSat.altitude.toLocaleString()} km  ·  {selectedSat.inclination}° inc
                </Text>
              </View>
              <Text style={[ui.fcFact, { marginTop: 10 }]} numberOfLines={2}>{selectedSat.headline}</Text>
              <Pressable style={[ui.fcBtn, ui.fcBtnCyan, { marginTop: 4 }]} onPress={() => { setSection("earthhub"); snapPanel(true); }}>
                <Text style={[ui.fcBtnText, { color: C.cyan }]}>🔍  Full Mission Details</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* EarthHub satellite count badge */}
        {showEarthHub && (
          <View style={ui.earthBadge} pointerEvents="none">
            <Text style={ui.earthBadgeText}>
              {agencyFilter ? `${selectedAgency?.flag} ${agencyFilter.length} satellites` : `🛰  ${SATELLITES.length} key satellites`}
            </Text>
            <Text style={ui.earthBadgeSub}>Tap any satellite to explore</Text>
          </View>
        )}

        {/* Bottom Sheet */}
        <Animated.View style={[ui.sheet, { height: panelAnim }]} pointerEvents="auto">
          {/* Handle */}
          <View {...panelPan.panHandlers} style={ui.handleArea}>
            <View style={ui.handle} />
            <View style={ui.handleRow}>
              {showEarthHub ? (
                <>
                  <Text style={ui.handleEmoji}>🌍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ui.handlePlanet}>Earth Hub</Text>
                    <Text style={ui.handleNick}>
                      {agencyFilter ? `${selectedAgency?.shortName} filter active` : "All agencies"}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={ui.handleEmoji}>{selectedPlanet.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={ui.handlePlanet}>{selectedPlanet.name}</Text>
                    <Text style={ui.handleNick}>{selectedPlanet.nickname}</Text>
                  </View>
                </>
              )}
              <Pressable style={ui.handleToggle} onPress={() => snapPanel(!panelIsOpen.current)}>
                <Text style={ui.handleToggleText}>⌃</Text>
              </Pressable>
            </View>
          </View>

          {/* Tab grid — 2 rows × 4 columns, compact and professional */}
          <View style={ui.tabGrid}>
            {SECTIONS.map(s => (
              <Pressable
                key={s.id}
                style={[ui.tabTile, section === s.id && ui.tabTileActive]}
                onPress={() => switchToSection(s.id)}
              >
                <Text style={[ui.tabTileEmoji, section === s.id && ui.tabTileEmojiActive]}>{s.emoji}</Text>
                <Text style={[ui.tabTileLabel, section === s.id && ui.tabTileLabelActive]} numberOfLines={1}>{s.label}</Text>
                {section === s.id && <View style={ui.tabTileDot} />}
              </Pressable>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={ui.sheetContent} showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            {section === "universe"  && <UniversePanel selectedPlanet={selectedPlanet} selectedMoon={selectedMoon} selectedDeep={selectedDeep} onFocus={id => { onPlanetTapped(id); }} onMoon={id => onMoonTapped(id)} onDeep={id => onDeepTapped(id)} speed={speed} setSpeed={setSpeed} zoomLevel={zoomLevel} zoomIn={() => setCameraZoom(camRef.current.zoom - 8)} zoomOut={() => setCameraZoom(camRef.current.zoom + 12)} onLearnLink={(url) => Linking.openURL(url).catch(() => undefined)} />}
            {section === "earthhub" && <EarthHubPanel selectedSat={selectedSat} onSelectSat={id => { onSatTapped(id); }} selectedAgencyId={selectedAgencyId} onSelectAgency={id => { setSelectedAgencyId(id === selectedAgencyId ? null : id); }} />}
            {section === "agencies" && <AgenciesPanel selectedAgencyId={selectedAgencyId} onSelect={id => { setSelectedAgencyId(id); setSection("earthhub"); snapPanel(true); }} />}
            {section === "missions" && <MissionsPanel />}
            {section === "timeline" && <TimelinePanel />}
            {section === "lab" && <LabPanel planet={selectedPlanet} inputs={labInputs} setInputs={setLabInputs} outcome={labOutcome} activeExperimentId={activeExperimentId} setActiveExperimentId={setActiveExperimentId} onActivateExperiment={activateExperiment} />}
            {section === "cosmo" && <CosmoPanel onActivateExperiment={activateExperiment} onSection={switchToSection} onSelectAgency={id => { setSelectedAgencyId(id); setSection("earthhub"); snapPanel(true); }} onAction={applyCosmoAction} />}
            {section === "quiz" && <QuizPanel exploredIds={exploredIds} />}
            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HOME_TILES: Array<{ id: string; emoji: string; label: string; sub: string; grad: [string, string] }> = [
  { id: "universe",  emoji: "🌌", label: "Universe",  sub: "3D Solar System",        grad: ["#0d1f52","#030b22"] },
  { id: "earthhub",  emoji: "🌍", label: "Earth Hub", sub: "Satellites in orbit",    grad: ["#012240","#000d18"] },
  { id: "agencies",  emoji: "🏛",  label: "Agencies",  sub: "Who explores space",     grad: ["#220644","#0c0120"] },
  { id: "missions",  emoji: "🚀", label: "Missions",  sub: "Historic journeys",      grad: ["#281400","#100600"] },
  { id: "timeline",  emoji: "🕒", label: "Timeline",  sub: "From Sputnik to now",    grad: ["#002030","#000c14"] },
  { id: "lab",       emoji: "🧪", label: "Lab",       sub: "Play with physics",      grad: ["#002618","#000d0a"] },
  { id: "cosmo",     emoji: "🤖", label: "Cosmo AI",  sub: "Ask anything",           grad: ["#220030","#0d0018"] },
  { id: "quiz",      emoji: "🎯", label: "Quiz",      sub: "Test your knowledge",    grad: ["#1e1400","#0d0900"] },
];

function HomeScreen({ onEnter, onSection }: { onEnter: () => void; onSection: (s: string) => void }) {
  const stars = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      left: `${(i * 41 + 3) % 97}%` as `${number}%`,
      top:  `${(i * 67 + 7) % 97}%` as `${number}%`,
      size: 1 + (i % 5) * 0.5,
      color: ["#ffffff","#aac8ff","#ffeedd","#ffffff","#99aaff"][i % 5],
      anim: new Animated.Value(0.08 + (i % 7) * 0.1),
      delay: i * 80,
    })),
    []
  );

  useEffect(() => {
    stars.forEach(s => {
      setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(s.anim, { toValue: 1, duration: 1000 + s.delay * 0.25, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(s.anim, { toValue: 0.05, duration: 1400 + s.delay * 0.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])).start();
      }, s.delay);
    });
  }, []);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.07, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.00, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <LinearGradient colors={["#010209","#030d1f","#07021a"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {stars.map((s, i) => (
          <Animated.View key={i} style={{ position:"absolute", left:s.left, top:s.top, width:s.size, height:s.size, borderRadius:s.size/2, backgroundColor:s.color, opacity:s.anim }} />
        ))}
        <View style={[hs.nebula, { left:-80, top:SH*0.1, backgroundColor:"#3a0878" }]} />
        <View style={[hs.nebula, { right:-60, top:SH*0.4, backgroundColor:"#061c60" }]} />
        <View style={[hs.nebula, { left:SW*0.3, bottom:60, backgroundColor:"#180430" }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={hs.scroll} showsVerticalScrollIndicator={false}>
          <Text style={hs.eyebrow}>🌌  SPACEVERSE</Text>
          <Text style={hs.headline}>Humanity's{"\n"}Presence{"\n"}in Space</Text>
          <Text style={hs.tagline}>
            Not just a 3D viewer.{"\n"}A <Text style={{ color: C.cyan }}>living knowledge graph</Text> — all agencies, missions, satellites, and physics in one place.
          </Text>

          {/* Agency flags row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection:"row", gap:8, alignItems:"center" }}>
              {AGENCIES.map(a => (
                <Pressable key={a.id} style={hs.agencyFlag} onPress={() => onSection("agencies")}>
                  <Text style={hs.agencyFlagText}>{a.flag}</Text>
                  <Text style={hs.agencyFlagLabel}>{a.shortName}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Stats */}
          <View style={hs.statsRow}>
            {[["10","Agencies"],["15","Satellites"],["15","Milestones"],["8","Experiments"]].map(([n,l]) => (
              <View key={l} style={hs.statChip}>
                <Text style={hs.statN}>{n}</Text>
                <Text style={hs.statL}>{l}</Text>
              </View>
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: pulse }], alignSelf:"flex-start", marginBottom:28, marginTop:4 }}>
            <Pressable onPress={onEnter} style={hs.ctaWrap}>
              <LinearGradient colors={["#4df9ff","#9b4dff"]} start={{x:0,y:0}} end={{x:1,y:0}} style={hs.cta}>
                <Text style={hs.ctaText}>🚀  Enter the Universe</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={hs.gridLabel}>CHOOSE WHERE TO START</Text>
          <View style={hs.grid}>
            {HOME_TILES.map(t => (
              <Pressable key={t.id} style={hs.tile} onPress={() => onSection(t.id)}>
                <LinearGradient colors={t.grad} style={hs.tileGrad}>
                  <Text style={hs.tileEmoji}>{t.emoji}</Text>
                  <Text style={hs.tileLabel}>{t.label}</Text>
                  <Text style={hs.tileSub}>{t.sub}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <View style={hs.killFeat}>
            <Text style={hs.killFeatTag}>✨  KILLER FEATURE</Text>
            <Text style={hs.killFeatTitle}>Earth Hub — Tap any satellite in orbit</Text>
            <Text style={hs.killFeatText}>
              See key satellites orbiting Earth in 3D. Filter by agency. Tap to explore full mission details. Planet maps from Solar System Scope (CC BY 4.0). Physics runs on this phone.
            </Text>
            <Pressable onPress={() => onSection("earthhub")}>
              <Text style={hs.killFeatCta}>Open Earth Hub →</Text>
            </Pressable>
          </View>
          <View style={[hs.killFeat, { marginTop: 12 }]}>
            <Text style={hs.killFeatTag}>MAPS & DATA</Text>
            <Text style={hs.killFeatTitle}>Public textures, on-device sim</Text>
            <Text style={hs.killFeatText}>{TEXTURE_CREDIT} Facts from NASA, ESA, and ISRO public pages. Cosmo uses Groq when online; exploration works offline.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── 3D SOLAR SYSTEM SCENE ───────────────────────────────────────────────────
function SolarScene({
  selectedId, paused, speed, camRef, camTarget, motionRef, isInteracting,
  pendingTap, planetScreenPos, labInputs, onPlanetTapped, zoomLevel,
}: {
  selectedId: string; paused: boolean; speed: number;
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  camTarget: React.MutableRefObject<{ yaw: number; active: boolean }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  planetScreenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  labInputs: LabInputs;
  onPlanetTapped: (id: string) => void;
  zoomLevel: number;
}) {
  return (
    <>
      {/* Realistic space lighting: dim ambient + point sun */}
      <ambientLight intensity={0.018} color="#0a1020" />
      <pointLight position={[0, 0, 0]} intensity={900} color="#fff4cc" decay={2} distance={0} />
      {/* Very subtle cold fill from opposite */}
      <pointLight position={[0, 40, 0]} intensity={6} color="#1020aa" decay={2} />
      <CameraRig camRef={camRef} camTarget={camTarget} motionRef={motionRef} isInteracting={isInteracting} earthHub={false} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={planetScreenPos} onTapped={onPlanetTapped} />
      <StarSky />
      <MilkyWayBand />
      <StarField />
      {/* Deep space nebulae + galaxies visible when zoomed out */}
      {zoomLevel > 65 && <DeepSpaceEnvironment zoom={zoomLevel} />}
      <Sun />
      <AsteroidBelt paused={paused} speed={speed} />
      {PLANETS.map(pl => (
        <OrbitingPlanet
          key={pl.id} planet={pl} selected={pl.id === selectedId}
          paused={paused} speed={speed}
          labInputs={pl.id === selectedId ? labInputs : undefined}
          screenPos={planetScreenPos}
        />
      ))}
      {DWARF_PLANETS.map(d => (
        <OrbitingDwarf key={d.id} dwarf={d} selected={d.id === selectedId} paused={paused} speed={speed} screenPos={planetScreenPos} />
      ))}
      {DEEP_SPACE_OBJECTS.map(object => (
        <DeepSpaceMarker key={object.id} object={object} screenPos={planetScreenPos} />
      ))}
    </>
  );
}

// ─── 3D EARTH HUB SCENE ──────────────────────────────────────────────────────
function EarthHubScene({
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
  // Override camera for Earth Hub
  useEffect(() => {
    camRef.current = { yaw: 0.3, pitch: 0.5, zoom: 13 };
  }, []);

  const visibleSats = satsForEarthHub(agencyFilter ?? SATELLITES);

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[12, 4, 8]}
        intensity={2.2}
        color="#fff6e0"
      />
      <directionalLight position={[-5, -2, -5]} intensity={0.12} color="#2244aa" />
      <hemisphereLight args={["#001133", "#000011", 0.06]} />
      <CameraRig camRef={camRef} motionRef={motionRef} isInteracting={isInteracting} earthHub={true} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={satScreenPos} onTapped={onSatTapped} />
      <StarSky dim />
      <StarField dim />
      <MilkyWayBand />
      {/* Earth */}
      <Earth />
      {/* Satellite orbits */}
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

// ── Earth ─────────────────────────────────────────────────────────────────────
function Earth() {
  const earthRef  = useRef<THREE.Mesh>(null);
  const cloud2Ref = useRef<THREE.Mesh>(null);
  const atmoRef   = useRef<THREE.Mesh>(null);
  const limb1Ref  = useRef<THREE.Mesh>(null);
  const limb2Ref  = useRef<THREE.Mesh>(null);
  const dayMap = useBodyTexture("earth");

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current)  earthRef.current.rotation.y  += delta * 0.068;
    if (cloud2Ref.current) cloud2Ref.current.rotation.y -= delta * 0.055;
    if (atmoRef.current)  (atmoRef.current.material  as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(t * 0.55) * 0.06;
    if (limb1Ref.current) (limb1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.11 + Math.sin(t * 0.38 + 1.2) * 0.03;
    if (limb2Ref.current) (limb2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.22 + 2.5) * 0.012;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial
          map={dayMap ?? undefined}
          color={dayMap ? "#ffffff" : "#1a4fa8"}
          roughness={0.62}
          metalness={0.04}
          emissive="#000820"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh ref={cloud2Ref} rotation={[0.08, 0.3, -0.06]}>
        <sphereGeometry args={[2.235, 32, 32]} />
        <meshBasicMaterial
          color="#d8eaff"
          transparent opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* ── Layer 4: Inner Atmosphere — Rayleigh scattering simulation ──────
          BackSide renders the limb glow visible from space (blue edge of Earth)
          This is the technique SpaceEngine uses for atmospheric scattering */}
      <mesh ref={atmoRef}>
        <sphereGeometry args={[2.38, 48, 48]} />
        <meshBasicMaterial
          color="#2060ff"
          transparent opacity={0.22}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* ── Layer 5: Outer atmosphere limb — the blue halo visible from ISS ─ */}
      <mesh ref={limb1Ref}>
        <sphereGeometry args={[2.58, 36, 36]} />
        <meshBasicMaterial
          color="#1144cc"
          transparent opacity={0.11}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* ── Layer 6: Far outer halo — exosphere/magnetosphere glow ──────────  */}
      <mesh ref={limb2Ref}>
        <sphereGeometry args={[2.90, 24, 24]} />
        <meshBasicMaterial
          color="#0822aa"
          transparent opacity={0.04}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
    </group>
  );
}


// ── Orbiting Satellite (Earth Hub) ───────────────────────────────────────────
function OrbitingSatellite({
  sat, selected, screenPos, dimmed,
}: {
  sat: Satellite; selected: boolean;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  dimmed: boolean;
}) {
  const groupRef  = useRef<THREE.Group>(null);
  const dotRef    = useRef<THREE.Group>(null);
  const glowRef   = useRef<THREE.Mesh>(null);

  const vRadius = satVisualRadius(sat.altitude);
  const orbSpeed = (2 * Math.PI) / (sat.period * 30); // scale for visual interest
  const incRad   = sat.inclination * (Math.PI / 180);
  const startAng = (sat.id.charCodeAt(0) * 137 + sat.id.charCodeAt(1) * 31) % (Math.PI * 2);

  useFrame((state, delta) => {
    const { camera } = state;
    if (groupRef.current) groupRef.current.rotation.y += delta * orbSpeed;

    if (selected && glowRef.current) {
      const t = state.clock.getElapsedTime();
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 3) * 0.2;
    }

    if (dotRef.current) {
      const wp = new THREE.Vector3();
      dotRef.current.getWorldPosition(wp);
      wp.project(camera);
      screenPos.current[sat.id] = {
        x: ((wp.x + 1) / 2) * screenW,
        y: ((-wp.y + 1) / 2) * screenH,
      };
    }
  });

  const orbitColor = dimmed ? "#152040" : sat.color;
  const dotColor   = dimmed ? "#253060" : sat.color;
  const dotSize    = selected ? 0.14 : 0.085;

  // Orbit ring is a circle at the satellite's inclination
  const orbitPts = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(Math.cos(a) * vRadius, 0, Math.sin(a) * vRadius);
    }
    return new Float32Array(pts);
  }, [vRadius]);

  return (
    <group rotation={[incRad, 0, 0]}>
      {/* Orbit ring */}
      <line>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[orbitPts, 3]} /></bufferGeometry>
        <lineBasicMaterial color={orbitColor} transparent opacity={selected ? 0.65 : dimmed ? 0.08 : 0.22} />
      </line>
      {/* Satellite dot, orbiting the ring */}
      <group ref={groupRef} rotation={[0, startAng, 0]}>
        <group ref={dotRef} position={[vRadius, 0, 0]} scale={selected ? 1.25 : 1}>
          <SatelliteModel color={dotColor} size={dotSize} type={sat.type} />
        </group>
        {/* Selection glow */}
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

// ── Camera Rig ────────────────────────────────────────────────────────────────
function CameraRig({
  camRef, camTarget, motionRef, isInteracting, earthHub,
}: {
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  camTarget?: React.MutableRefObject<{ yaw: number; active: boolean }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  earthHub: boolean;
}) {
  const { camera } = useThree();
  const lastInteract = useRef(0);
  const autoYaw      = useRef(camRef.current.yaw);
  const dampMotion   = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (isInteracting.current) {
      lastInteract.current = Date.now();
      if (camTarget?.current) camTarget.current.active = false; // user took over
    }

    // Smooth yaw focus animation toward tapped planet
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
    const yaw   = camRef.current.yaw   + dampMotion.current.y * 0.08;
    const pitch = camRef.current.pitch + dampMotion.current.x * 0.05;
    const r     = camRef.current.zoom;
    camera.position.lerp(
      new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch) * r,
        Math.sin(pitch) * r,
        Math.cos(yaw) * Math.cos(pitch) * r
      ),
      0.07
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Generic object tap detector ───────────────────────────────────────────────
function ObjectTapDetector({
  pendingTap, screenPos, onTapped,
}: {
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  onTapped: (id: string) => void;
}) {
  useFrame(() => {
    if (!pendingTap.current) return;
    const tap = pendingTap.current; pendingTap.current = null;
    let best: string | null = null; let bestDist = 75;
    Object.entries(screenPos.current).forEach(([id, pos]) => {
      const d = Math.hypot(pos.x - tap.x, pos.y - tap.y);
      if (d < bestDist) { bestDist = d; best = id; }
    });
    if (best) onTapped(best);
  });
  return null;
}

// ── Sun — 6-layer animated corona + solar shimmer ────────────────────────────
function Sun() {
  const surf = useRef<THREE.Mesh>(null);
  const l1   = useRef<THREE.Mesh>(null);
  const l2   = useRef<THREE.Mesh>(null);
  const l3   = useRef<THREE.Mesh>(null);
  const l4   = useRef<THREE.Mesh>(null);
  const l5   = useRef<THREE.Mesh>(null);
  const sunCore = useRef<THREE.Mesh>(null);
  const sunMap = useBodyTexture("sun");

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime();
    // Animated corona — each layer pulses independently (simulates solar wind)
    const s1 = Math.sin(t * 1.80);
    const s2 = Math.sin(t * 1.15 + 1.1);
    const s3 = Math.sin(t * 0.72 + 2.3);
    const s4 = Math.sin(t * 0.44 + 0.7);
    const s5 = Math.sin(t * 0.28 + 3.1);

    // Solar surface shimmer — rotate slowly and vary color intensity
    if (sunCore.current) {
      sunCore.current.rotation.y += 0.0008;
      sunCore.current.rotation.z += 0.0003;
      const mat = sunCore.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + s1 * 0.25;
    }
    if (surf.current) {
      (surf.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + s1 * 0.15;
      surf.current.rotation.y += 0.0012;
    }
    if (l1.current) (l1.current.material as THREE.MeshBasicMaterial).opacity = 0.32 + s1 * 0.10;
    if (l2.current) (l2.current.material as THREE.MeshBasicMaterial).opacity = 0.14 + s2 * 0.06;
    if (l3.current) (l3.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + s3 * 0.03;
    if (l4.current) (l4.current.material as THREE.MeshBasicMaterial).opacity = 0.035 + s4 * 0.015;
    if (l5.current) (l5.current.material as THREE.MeshBasicMaterial).opacity = 0.012 + s5 * 0.006;
  });

  return (
    <group>
      {/* Core — PBR emissive for realistic glowing ball */}
      <mesh ref={sunCore}>
        <sphereGeometry args={[3.2, 48, 48]} />
        <meshStandardMaterial
          map={sunMap ?? undefined}
          color={sunMap ? "#ffffff" : "#fff8d0"}
          emissive="#ffb200"
          emissiveMap={sunMap ?? undefined}
          emissiveIntensity={1.4}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      {/* Surface convection shimmer */}
      <mesh ref={surf}>
        <sphereGeometry args={[3.26, 48, 48]} />
        <meshBasicMaterial color="#ffd500" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Layer 1 — inner corona (deep yellow-orange) */}
      <mesh ref={l1}>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Layer 2 — mid corona (orange-red transition) */}
      <mesh ref={l2}>
        <sphereGeometry args={[5.6, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Layer 3 — outer corona (red) */}
      <mesh ref={l3}>
        <sphereGeometry args={[7.2, 24, 24]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Layer 4 — wide solar wind halo */}
      <mesh ref={l4}>
        <sphereGeometry args={[10.0, 24, 24]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Layer 5 — mega far halo (lens flare simulation) */}
      <mesh ref={l5}>
        <sphereGeometry args={[14.0, 16, 16]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.012} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Star Field ────────────────────────────────────────────────────────────────
function StarSky({ dim }: { dim?: boolean }) {
  const milky = useBodyTexture("milkyWay");
  const stars = useBodyTexture("stars");
  const map = milky ?? stars;
  return (
    <mesh>
      <sphereGeometry args={[380, 24, 16]} />
      <meshBasicMaterial
        map={map ?? undefined}
        color={map ? "#ffffff" : "#050816"}
        side={THREE.BackSide}
        depthWrite={false}
        opacity={dim ? 0.55 : 1}
        transparent={!!dim}
      />
    </mesh>
  );
}

function mkStars(n: number, r0: number, r1: number) {
  const v: number[] = [];
  for (let i = 0; i < n; i++) {
    const r=r0+Math.random()*(r1-r0), theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1);
    v.push(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
  }
  return new Float32Array(v);
}
function StarField({ dim }: { dim?: boolean }) {
  // Size-attenuated stars look far more realistic — stars scale with camera distance
  const v1=useMemo(()=>mkStars(900,92,180),[]);
  const v2=useMemo(()=>mkStars(280,90,155),[]);
  const v3=useMemo(()=>mkStars(80,90,145),[]);
  const v4=useMemo(()=>mkStars(90,108,170),[]);
  const v5=useMemo(()=>mkStars(28,95,150),[]);
  const o = dim ? 0.35 : 1;
  return (
    <>
      {/* Dim distant field */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[v1,3]}/></bufferGeometry>
        <pointsMaterial size={0.12} sizeAttenuation color="#c8d8ff" transparent opacity={0.42*o}/></points>
      {/* Medium white */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[v2,3]}/></bufferGeometry>
        <pointsMaterial size={0.28} sizeAttenuation color="#ffffff" transparent opacity={0.92*o}/></points>
      {/* Large warm giants */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[v3,3]}/></bufferGeometry>
        <pointsMaterial size={0.60} sizeAttenuation color="#fff3d8" transparent opacity={o}/></points>
      {/* Blue-tinted stars (hot O/B type) — additive for glow */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[v4,3]}/></bufferGeometry>
        <pointsMaterial size={0.20} sizeAttenuation color="#88aaff" transparent opacity={0.70*o} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      {/* Super-bright warm giants — bloom simulation */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[v5,3]}/></bufferGeometry>
        <pointsMaterial size={1.1} sizeAttenuation color="#ffeecc" transparent opacity={0.95*o} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
    </>
  );
}

// ── Milky Way Band ────────────────────────────────────────────────────────────
function MilkyWayBand() {
  const v=useMemo(()=>{ const a:number[]=[];for(let i=0;i<1600;i++){const ang=Math.random()*Math.PI*2,r=120+Math.random()*60,sp=(Math.random()-0.5)*28*(1-Math.abs(Math.sin(ang))*0.5);a.push(Math.cos(ang)*r,sp,Math.sin(ang)*r);}return new Float32Array(a);},[]);
  return <points rotation={[0.42,0,0.26]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[v,3]}/></bufferGeometry><pointsMaterial size={0.07} color="#b8ccee" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
}

// ── Deep Space Environment (nebulae + galaxy clusters) ────────────────────────
function mkCloud(cx:number,cy:number,cz:number,radius:number,count:number){
  const v:number[]=[];
  for(let i=0;i<count;i++){
    const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);
    const r=radius*(0.3+Math.random()*0.7);
    v.push(cx+r*Math.sin(phi)*Math.cos(theta),cy+r*Math.cos(phi)*0.45,cz+r*Math.sin(phi)*Math.sin(theta));
  }
  return new Float32Array(v);
}
function DeepSpaceEnvironment({ zoom }: { zoom: number }) {
  const opacity = Math.min(1,(zoom-65)/35);
  // Orion Nebula lookalike — warm orange/pink, 300 units away
  const orion    = useMemo(()=>mkCloud(-220,40,-180,38,420),[]);
  // Pillars of Creation lookalike — teal/blue
  const pillars  = useMemo(()=>mkCloud(280,-30,260,28,320),[]);
  // Carina nebula — violet/purple
  const carina   = useMemo(()=>mkCloud(60,80,-320,42,360),[]);
  // Distant galaxy clusters (tight balls of stars)
  const gal1 = useMemo(()=>mkCloud(-380,20,0,18,180),[]);
  const gal2 = useMemo(()=>mkCloud(0,-40,400,14,140),[]);
  const gal3 = useMemo(()=>mkCloud(350,60,-350,16,160),[]);
  const gal4 = useMemo(()=>mkCloud(-300,-50,300,12,120),[]);
  return (
    <>
      {/* Orion Nebula */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[orion,3]}/></bufferGeometry>
        <pointsMaterial size={0.55} color="#ff8844" transparent opacity={0.28*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[orion,3]}/></bufferGeometry>
        <pointsMaterial size={1.2}  color="#ff4488" transparent opacity={0.14*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      {/* Pillars of Creation */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[pillars,3]}/></bufferGeometry>
        <pointsMaterial size={0.48} color="#44ddcc" transparent opacity={0.24*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[pillars,3]}/></bufferGeometry>
        <pointsMaterial size={1.0}  color="#88ffee" transparent opacity={0.10*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      {/* Carina Nebula */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[carina,3]}/></bufferGeometry>
        <pointsMaterial size={0.52} color="#cc44ff" transparent opacity={0.22*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[carina,3]}/></bufferGeometry>
        <pointsMaterial size={1.1}  color="#ff88ff" transparent opacity={0.09*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      {/* Distant Galaxies */}
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[gal1,3]}/></bufferGeometry>
        <pointsMaterial size={0.3} color="#ffe8cc" transparent opacity={0.55*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[gal2,3]}/></bufferGeometry>
        <pointsMaterial size={0.3} color="#ccddff" transparent opacity={0.55*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[gal3,3]}/></bufferGeometry>
        <pointsMaterial size={0.3} color="#ffd8aa" transparent opacity={0.50*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[gal4,3]}/></bufferGeometry>
        <pointsMaterial size={0.3} color="#ddeeff" transparent opacity={0.48*opacity} blending={THREE.AdditiveBlending} depthWrite={false}/></points>
    </>
  );
}

// ── Orbiting Planet ───────────────────────────────────────────────────────────
function OrbitingPlanet({
  planet, selected, paused, speed, labInputs, screenPos,
}: {
  planet: Planet; selected: boolean; paused: boolean; speed: number;
  labInputs?: LabInputs;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const orbitRef  = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const glowRef   = useRef<THREE.Mesh>(null);
  const vR = Math.max(0.15, planet.visualRadius * (selected ? (labInputs?.radiusScale ?? 1) : 1));
  const texKey = PLANET_TEXTURE_KEY[planet.id];
  const map = useBodyTexture(texKey);
  const venusAtmo = useBodyTexture(planet.id === "venus" ? "venusAtmosphere" : undefined);
  const moons = MOONS_BY_PLANET[planet.id] ?? [];

  useFrame((state, delta) => {
    if (!paused) {
      if (orbitRef.current)  orbitRef.current.rotation.y  += delta * planet.orbitSpeed  * speed;
      if (planetRef.current) planetRef.current.rotation.y += delta * planet.rotationSpeed * (labInputs?.rotationScale ?? 1) * speed;
    }
    if (selected && glowRef.current) {
      const t = state.clock.getElapsedTime();
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(t * 2.2) * 0.07;
    }
    if (planetRef.current) {
      const wp = new THREE.Vector3(); planetRef.current.getWorldPosition(wp); wp.project(state.camera);
      screenPos.current[planet.id] = { x:((wp.x+1)/2)*screenW, y:((-wp.y+1)/2)*screenH };
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Orbit ring */}
      {(() => {
        const pts = new THREE.EllipseCurve(0,0,planet.orbitRadius,planet.orbitRadius,0,Math.PI*2).getPoints(160);
        const arr = new Float32Array(pts.flatMap(p=>[p.x,0,p.y]));
        return (
          <line><bufferGeometry><bufferAttribute attach="attributes-position" args={[arr,3]}/></bufferGeometry>
          <lineBasicMaterial color={selected?C.cyan:"#152850"} transparent opacity={selected?0.75:0.22}/></line>
        );
      })()}
      <group position={[planet.orbitRadius,0,0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[vR, 64, 64]} />
          <meshStandardMaterial
            key={map?.uuid ?? "nomap_" + planet.id}
            map={map ?? undefined}
            color={map ? "#ffffff" : planet.color}
            roughness={planet.id === "earth" ? 0.52 : planet.id === "mercury" ? 0.92 : planet.id === "venus" ? 0.72 : 0.76}
            metalness={planet.id === "mercury" ? 0.28 : 0.02}
            emissive={selected ? new THREE.Color(planet.color).multiplyScalar(0.10) : new THREE.Color(0, 0, 0)}
            emissiveIntensity={selected ? 1 : 0}
          />
        </mesh>
        {planet.id === "venus" && (
          <mesh>
            <sphereGeometry args={[vR * 1.03, 24, 24]} />
            <meshStandardMaterial map={venusAtmo ?? undefined} color={venusAtmo ? "#ffffff" : "#e0b56e"} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}
        <mesh><sphereGeometry args={[vR*1.10,32,32]}/><meshBasicMaterial color={planet.color} transparent opacity={0.10} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
        {selected&&<mesh ref={glowRef}><sphereGeometry args={[vR*1.26,24,24]}/><meshBasicMaterial color={C.cyan} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
        {planet.ring&&(
          <group>
            <mesh rotation={[Math.PI/2.15,0,0.18]}><ringGeometry args={[vR*1.38,vR*1.90,128]}/><meshBasicMaterial color="#e8d9a8" transparent opacity={0.60} side={THREE.DoubleSide} depthWrite={false}/></mesh>
            <mesh rotation={[Math.PI/2.15,0,0.18]}><ringGeometry args={[vR*1.92,vR*2.26,128]}/><meshBasicMaterial color="#c8b880" transparent opacity={0.38} side={THREE.DoubleSide} depthWrite={false}/></mesh>
          </group>
        )}
        {moons.map(moon => (
          <OrbitingMoon key={moon.id} moon={moon} planetRadius={vR} paused={paused} speed={speed} screenPos={screenPos} />
        ))}
      </group>
    </group>
  );
}

function OrbitingMoon({
  moon, planetRadius, paused, speed, screenPos,
}: {
  moon: Moon; planetRadius: number; paused: boolean; speed: number;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useBodyTexture(moon.textureKey);
  const r = Math.max(0.05, planetRadius * moon.visualRadius);
  const d = planetRadius * moon.orbitScale;
  const tilt = moon.orbitTilt * (Math.PI / 180);
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
    if (meshRef.current) {
      const wp = new THREE.Vector3(); meshRef.current.getWorldPosition(wp); wp.project(state.camera);
      screenPos.current[moon.id] = { x: ((wp.x + 1) / 2) * screenW, y: ((-wp.y + 1) / 2) * screenH };
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <line>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[orbitPts, 3]} /></bufferGeometry>
        <lineBasicMaterial color={moon.color} transparent opacity={0.18} />
      </line>
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[d, 0, 0]}>
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial map={map ?? undefined} color={map ? "#ffffff" : moon.color} roughness={0.9} />
      </mesh>
    </group>
    </group>
  );
}

function DeepSpaceMarker({
  object,
  screenPos,
}: {
  object: DeepSpaceObject;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z += object.type === "Galaxy" ? 0.0015 : 0.0005;
      const wp = new THREE.Vector3(); meshRef.current.getWorldPosition(wp); wp.project(state.camera);
      screenPos.current[object.id] = { x: ((wp.x + 1) / 2) * screenW, y: ((-wp.y + 1) / 2) * screenH };
    }
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(time * 0.8) * 0.06;
    }
  });

  if (object.type === "Galaxy") {
    return (
      <group position={object.position} rotation={[0.35, 0.2, -0.45]}>
        <mesh ref={meshRef} scale={[1.9, 0.34, 1]}>
          <sphereGeometry args={[object.visualRadius, 32, 16]} />
          <meshBasicMaterial color={object.color} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={haloRef} scale={[3.0, 0.12, 1.55]}>
          <sphereGeometry args={[object.visualRadius, 24, 12]} />
          <meshBasicMaterial color={object.color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    );
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

function OrbitingDwarf({
  dwarf, selected, paused, speed, screenPos,
}: {
  dwarf: DwarfPlanet; selected: boolean; paused: boolean; speed: number;
  screenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useBodyTexture(dwarf.textureKey);

  useFrame((state, delta) => {
    if (!paused && orbitRef.current) orbitRef.current.rotation.y += delta * dwarf.orbitSpeed * speed;
    if (!paused && meshRef.current) meshRef.current.rotation.y += delta * dwarf.rotationSpeed * speed;
    if (meshRef.current) {
      const wp = new THREE.Vector3(); meshRef.current.getWorldPosition(wp); wp.project(state.camera);
      screenPos.current[dwarf.id] = { x: ((wp.x + 1) / 2) * screenW, y: ((-wp.y + 1) / 2) * screenH };
    }
  });

  const pts = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, dwarf.orbitRadius, dwarf.orbitRadius, 0, Math.PI * 2);
    return new Float32Array(curve.getPoints(120).flatMap(p => [p.x, 0, p.y]));
  }, [dwarf.orbitRadius]);

  return (
    <group ref={orbitRef}>
      <line>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[pts, 3]} /></bufferGeometry>
        <lineBasicMaterial color={selected ? C.gold : "#1a2840"} transparent opacity={selected ? 0.7 : 0.16} />
      </line>
      <mesh ref={meshRef} position={[dwarf.orbitRadius, 0, 0]}>
        <sphereGeometry args={[dwarf.visualRadius, 24, 24]} />
        <meshStandardMaterial map={map ?? undefined} color={map ? "#ffffff" : dwarf.color} roughness={0.88} />
      </mesh>
    </group>
  );
}

// ── Asteroid Belt ─────────────────────────────────────────────────────────────
function AsteroidBelt({ paused, speed }: { paused: boolean; speed: number }) {
  const gRef = useRef<THREE.Group>(null);
  const asts = useMemo(()=>Array.from({length:70},(_,i)=>{ const a=i*0.395,r=25.5+Math.sin(i*8.1)*2.3; return {pos:[Math.cos(a)*r,Math.sin(i*1.1)*0.2,Math.sin(a)*r] as [number,number,number], scale:0.055+(i%6)*0.018, color:["#7a706a","#8a8078","#6a5e58","#9a8e88"][i%4]}; }),[]);
  useFrame((_,delta)=>{ if(!paused&&gRef.current) gRef.current.rotation.y+=delta*0.022*speed; });
  return <group ref={gRef}>{asts.map((a,i)=><mesh key={i} position={a.pos} scale={a.scale}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={a.color} roughness={0.95}/></mesh>)}</group>;
}

// ─── UNIVERSE PANEL ──────────────────────────────────────────────────────────
function UniversePanel({ selectedPlanet, selectedMoon, selectedDeep, onFocus, onMoon, onDeep, speed, setSpeed, zoomLevel, zoomIn, zoomOut, onLearnLink }: {
  selectedPlanet: Planet; selectedMoon: Moon | null; selectedDeep: DeepSpaceObject | null;
  onFocus: (id: string) => void; onMoon: (id: string) => void; onDeep: (id: string) => void;
  speed: number; setSpeed: (v: number) => void; zoomLevel: number; zoomIn: () => void; zoomOut: () => void;
  onLearnLink: (url: string) => void;
}) {
  const [factIdx, setFactIdx] = useState(0);
  const planetMoons = MOONS_BY_PLANET[selectedPlanet.id] ?? [];
  const facts = selectedDeep ? selectedDeep.facts : selectedMoon ? selectedMoon.funFacts : selectedPlanet.funFacts;
  return (
    <View style={pw.wrap}>
      <LinearGradient colors={selectedPlanet.gradientColors} style={pw.hero}>
        <Text style={pw.heroEmoji}>{selectedDeep ? selectedDeep.emoji : selectedMoon ? selectedMoon.emoji : selectedPlanet.emoji}</Text>
        <View style={{ flex:1 }}>
          <Text style={pw.heroName}>{selectedDeep ? selectedDeep.name : selectedMoon ? selectedMoon.name : selectedPlanet.name}</Text>
          <Text style={pw.heroNick}>{(selectedDeep ? selectedDeep.type : selectedMoon ? selectedMoon.nickname : selectedPlanet.nickname).toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection:"row", gap:6 }}>
          <GlassBtn label="+" onPress={zoomIn} small /><GlassBtn label="−" onPress={zoomOut} small />
        </View>
      </LinearGradient>

      <Pressable style={pw.factCard} onPress={() => setFactIdx(i => (i+1)%3)}>
        <Text style={pw.factQuote}>"{facts[factIdx]}"</Text>
        <Text style={pw.factTap}>TAP FOR NEXT FACT</Text>
      </Pressable>

      {selectedDeep ? (
        <>
          <View style={pw.atmo}><Text style={pw.atmoLabel}>WHY IT MATTERS</Text><Text style={pw.atmoText}>{selectedDeep.whyItMatters}</Text></View>
          <View style={pw.statsRow}><MiniStat l="Type" v={selectedDeep.type} accent={C.cyan}/><MiniStat l="Distance" v={selectedDeep.distance} accent={C.gold}/></View>
          <View style={pw.atmo}><Text style={pw.atmoLabel}>DISCOVERY</Text><Text style={pw.atmoText}>{selectedDeep.discovered}</Text></View>
        </>
      ) : selectedMoon ? (
        <View style={pw.atmo}><Text style={pw.atmoLabel}>ORBITS</Text><Text style={pw.atmoText}>{selectedMoon.fact}</Text></View>
      ) : (
        <>
          <View style={pw.statsRow}><MiniStat l="Gravity" v={`${selectedPlanet.gravity}g`} accent={C.cyan}/><MiniStat l="Day" v={selectedPlanet.day} accent={C.gold}/><MiniStat l="Moons" v={`${selectedPlanet.moons}`} accent={C.violet}/></View>
          <View style={pw.statsRow}><MiniStat l="Temp" v={`${selectedPlanet.temperature}°C`} accent={C.red}/><MiniStat l="Year" v={selectedPlanet.year} accent={C.green}/><MiniStat l="Dist" v={`${selectedPlanet.distanceAU} AU`} accent={C.orange}/></View>
          <View style={pw.atmo}><Text style={pw.atmoLabel}>ATMOSPHERE</Text><Text style={pw.atmoText}>{selectedPlanet.atmosphere}</Text></View>
          <View style={pw.atmo}><Text style={pw.atmoLabel}>NAME & DISCOVERY</Text><Text style={pw.atmoText}>{selectedPlanet.namedFor} {selectedPlanet.discovery}</Text></View>
          <Text style={[pw.atmoLabel, { marginTop: 12 }]}>MISSIONS & ORGANIZATIONS</Text>
          <Text style={pw.atmoText}>Missions: {selectedPlanet.missions.join(", ")}</Text>
          <Text style={pw.atmoText}>Upcoming: {selectedPlanet.upcomingMissions.join(", ")}</Text>
          <Text style={pw.atmoText}>Organizations: {selectedPlanet.organizations.join(", ")}</Text>
        </>
      )}

      {planetMoons.length > 0 && (
        <>
          <Text style={[pw.atmoLabel, { marginTop: 12 }]}>MAJOR MOONS — TAP TO EXPLORE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection:"row", gap:7 }}>
              {planetMoons.map(m => (
                <Pressable key={m.id} style={[pw.chip, selectedMoon?.id===m.id&&pw.chipActive]} onPress={()=>onMoon(m.id)}>
                  <Text style={[pw.chipText, selectedMoon?.id===m.id&&{color:C.cyan}]}>{m.emoji} {m.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:12 }}>
        <View style={{ flexDirection:"row", gap:7 }}>
          {PLANETS.map(pl=>(
            <Pressable key={pl.id} style={[pw.chip, pl.id===selectedPlanet.id&&pw.chipActive]} onPress={()=>onFocus(pl.id)}>
              <View style={[pw.chipDot,{backgroundColor:pl.color}]}/><Text style={[pw.chipText, pl.id===selectedPlanet.id&&{color:C.cyan}]}>{pl.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {zoomLevel > 72 && (
        <>
          <Text style={[pw.atmoLabel, { marginTop: 12 }]}>DEEP SPACE — TAP TO EXPLORE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:8 }}>
            <View style={{ flexDirection:"row", gap:7 }}>
              {DEEP_SPACE_OBJECTS.map(object => (
                <Pressable key={object.id} style={[pw.chip, selectedDeep?.id===object.id&&pw.chipActive]} onPress={()=>onDeep(object.id)}>
                  <Text style={[pw.chipText, selectedDeep?.id===object.id&&{color:C.cyan}]}>{object.emoji} {object.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {!selectedMoon && !selectedDeep && (
        <>
          <Text style={[pw.atmoLabel, { marginTop: 12 }]}>LEARN MORE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection:"row", gap:7 }}>
              {selectedPlanet.links.map(link => (
                <Pressable key={link.url} style={pw.chip} onPress={() => onLearnLink(link.url)}>
                  <Text style={pw.chipText}>↗ {link.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {selectedDeep && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection:"row", gap:7 }}>
            {selectedDeep.links.map(link => (
              <Pressable key={link.url} style={pw.chip} onPress={() => onLearnLink(link.url)}>
                <Text style={pw.chipText}>↗ {link.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={pw.speedRow}>
        <Text style={pw.speedLabel}>SIMULATION SPEED</Text>
        <View style={pw.speedBtns}>
          {[0.5,1,2,4].map(s=>(
            <Pressable key={s} style={[pw.speedBtn,speed===s&&pw.speedBtnActive]} onPress={()=>setSpeed(s)}>
              <Text style={[pw.speedBtnT,speed===s&&pw.speedBtnTActive]}>{s}×</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── EARTH HUB PANEL ─────────────────────────────────────────────────────────
function EarthHubPanel({
  selectedSat, onSelectSat, selectedAgencyId, onSelectAgency,
}: {
  selectedSat: Satellite | null; onSelectSat: (id: string) => void;
  selectedAgencyId: string | null; onSelectAgency: (id: string) => void;
}) {
  const orbitClasses: Array<Satellite["orbitClass"]> = ["LEO","MEO","GEO","Lunar","Interplanetary"];
  const [orbitFilter, setOrbitFilter] = useState<Satellite["orbitClass"] | "All">("All");

  const visibleSats = useMemo(() => {
    let s = SATELLITES;
    if (selectedAgencyId) s = s.filter(x => x.agencyId === selectedAgencyId);
    if (orbitFilter !== "All") s = s.filter(x => x.orbitClass === orbitFilter);
    return s;
  }, [selectedAgencyId, orbitFilter]);

  return (
    <View style={pw.wrap}>
      <Text style={sect.title}>🌍  Earth Hub</Text>
      <Text style={sect.sub}>Humanity's presence around our planet</Text>

      {/* Agency filter chips */}
      <Text style={pw.atmoLabel}>FILTER BY AGENCY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
        <View style={{ flexDirection:"row", gap:7 }}>
          <Pressable style={[pw.chip, !selectedAgencyId && pw.chipActive]} onPress={() => onSelectAgency("")}>
            <Text style={[pw.chipText, !selectedAgencyId && {color:C.cyan}]}>🌍 All</Text>
          </Pressable>
          {AGENCIES.map(a=>(
            <Pressable key={a.id} style={[pw.chip, selectedAgencyId===a.id&&pw.chipActive]} onPress={()=>onSelectAgency(a.id)}>
              <Text style={[pw.chipText, selectedAgencyId===a.id&&{color:C.cyan}]}>{a.flag} {a.shortName}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Orbit class filter */}
      <Text style={pw.atmoLabel}>FILTER BY ORBIT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
        <View style={{ flexDirection:"row", gap:7 }}>
          {(["All", ...orbitClasses] as Array<"All" | Satellite["orbitClass"]>).map(oc=>(
            <Pressable key={oc} style={[pw.chip, orbitFilter===oc&&pw.chipActive]} onPress={()=>setOrbitFilter(oc)}>
              <Text style={[pw.chipText, orbitFilter===oc&&{color:C.cyan}]}>{oc}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Selected satellite detail */}
      {selectedSat && (
        <View style={eh.selectedCard}>
          <View style={eh.selectedTop}>
            <Text style={eh.selectedEmoji}>{selectedSat.emoji}</Text>
            <View style={{ flex:1 }}>
              <Text style={eh.selectedName}>{selectedSat.name}</Text>
              <View style={[ui.statusChip, { borderColor: selectedSat.status==="active"?C.green+"55":C.red+"55", marginTop:4 }]}>
                <View style={[ui.statusDot, {backgroundColor: selectedSat.status==="active"?C.green:selectedSat.status==="retired"?C.gold:C.red}]}/>
                <Text style={[ui.statusText, {color: selectedSat.status==="active"?C.green:selectedSat.status==="retired"?C.gold:C.red}]}>
                  {selectedSat.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <View style={eh.metaRow}>
            <View style={eh.metaItem}><Text style={eh.metaL}>ORBIT CLASS</Text><Text style={eh.metaV}>{selectedSat.orbitClass}</Text></View>
            <View style={eh.metaItem}><Text style={eh.metaL}>ALTITUDE</Text><Text style={eh.metaV}>{selectedSat.altitude.toLocaleString()} km</Text></View>
            <View style={eh.metaItem}><Text style={eh.metaL}>INCLINATION</Text><Text style={eh.metaV}>{selectedSat.inclination}°</Text></View>
          </View>
          <View style={eh.metaRow}>
            <View style={eh.metaItem}><Text style={eh.metaL}>LAUNCHED</Text><Text style={eh.metaV}>{selectedSat.launchYear}</Text></View>
            <View style={eh.metaItem}><Text style={eh.metaL}>MASS</Text><Text style={eh.metaV}>{selectedSat.mass.toLocaleString()} kg</Text></View>
            <View style={eh.metaItem}><Text style={eh.metaL}>VEHICLE</Text><Text style={eh.metaV}>{selectedSat.launchVehicle}</Text></View>
          </View>
          <Text style={eh.headline}>⭐ {selectedSat.headline}</Text>
          <Text style={eh.story}>{selectedSat.story}</Text>
          <Text style={eh.discovLabel}>KEY FACTS</Text>
          {selectedSat.discoveries.slice(0,3).map((d,i)=>(
            <View key={i} style={eh.discovItem}><Text style={eh.discovBullet}>→</Text><Text style={eh.discovText}>{d}</Text></View>
          ))}
        </View>
      )}

      {/* Satellite list */}
      <Text style={[pw.atmoLabel, { marginTop:14 }]}>
        {visibleSats.length} SATELLITE{visibleSats.length !== 1 ? "S" : ""}
      </Text>
      {visibleSats.map(sat=>(
        <Pressable key={sat.id} style={[eh.satRow, selectedSat?.id===sat.id&&eh.satRowActive]} onPress={()=>onSelectSat(sat.id)}>
          <Text style={eh.satEmoji}>{sat.emoji}</Text>
          <View style={{ flex:1 }}>
            <Text style={eh.satName}>{sat.name}</Text>
            <Text style={eh.satMeta}>{sat.flag}  {sat.orbitClass}  ·  {sat.altitude.toLocaleString()}km  ·  {sat.launchYear}</Text>
          </View>
          <View style={[eh.satStatus, {backgroundColor: sat.status==="active"?C.green+"22":sat.status==="retired"?C.gold+"22":C.red+"22", borderColor: sat.status==="active"?C.green+"55":sat.status==="retired"?C.gold+"55":C.red+"55"}]}>
            <Text style={[eh.satStatusText, {color: sat.status==="active"?C.green:sat.status==="retired"?C.gold:C.red}]}>{sat.status}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ─── AGENCIES PANEL ──────────────────────────────────────────────────────────
function AgenciesPanel({ selectedAgencyId, onSelect }: { selectedAgencyId: string | null; onSelect: (id: string) => void }) {
  const [selId, setSelId] = useState(selectedAgencyId ?? AGENCIES[0].id);
  const agency = AGENCY_BY_ID[selId] ?? AGENCIES[0];

  return (
    <View style={pw.wrap}>
      <Text style={sect.title}>🏛  Space Agencies</Text>
      <Text style={sect.sub}>Who is exploring space and how</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
        <View style={{ flexDirection:"row", gap:8 }}>
          {AGENCIES.map(a=>(
            <Pressable key={a.id} style={[ag.chip, selId===a.id&&ag.chipActive, { borderColor: selId===a.id ? a.color+"aa" : C.border }]} onPress={()=>setSelId(a.id)}>
              <Text style={ag.chipFlag}>{a.flag}</Text>
              <Text style={[ag.chipName, { color: selId===a.id ? a.color : C.textSub }]}>{a.shortName}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Agency hero card */}
      <View style={[ag.card, { borderColor: agency.color+"44" }]}>
        <LinearGradient colors={[agency.color+"22", "transparent"]} style={ag.cardGrad}>
          <View style={ag.cardTop}>
            <Text style={ag.cardFlag}>{agency.flag}</Text>
            <View style={{ flex:1 }}>
              <Text style={ag.cardName}>{agency.shortName}</Text>
              <Text style={[ag.cardCountry, { color: agency.color }]}>{agency.country}</Text>
              <Text style={ag.cardFull}>{agency.name}</Text>
            </View>
          </View>
          <Text style={ag.tagline}>"{agency.tagline}"</Text>

          {/* Stats grid */}
          <View style={ag.statsGrid}>
            <View style={ag.statBox}><Text style={[ag.statN, { color: agency.color }]}>{agency.founded}</Text><Text style={ag.statL}>Founded</Text></View>
            <View style={ag.statBox}><Text style={[ag.statN, { color: agency.color }]}>{agency.launches}</Text><Text style={ag.statL}>Launches</Text></View>
            <View style={ag.statBox}><Text style={[ag.statN, { color: agency.color }]}>{agency.activeSats}</Text><Text style={ag.statL}>Active Sats</Text></View>
            <View style={ag.statBox}><Text style={[ag.statN, { color: agency.color }]}>{agency.humans}</Text><Text style={ag.statL}>Humans</Text></View>
          </View>

          <Text style={ag.budgetRow}>💰 Annual Budget: <Text style={{ color: agency.color, fontWeight:"900" }}>{agency.budget}</Text></Text>

          <Text style={ag.story}>{agency.story}</Text>

          <Text style={ag.achLabel}>🏆  KEY ACHIEVEMENTS</Text>
          {agency.achievements.map((a2,i)=>(
            <View key={i} style={ag.achItem}><Text style={[ag.achBullet, {color:agency.color}]}>★</Text><Text style={ag.achText}>{a2}</Text></View>
          ))}

          {/* Jump to satellites */}
          <Pressable style={[ag.jumpBtn, { borderColor: agency.color+"55", backgroundColor: agency.color+"11" }]} onPress={() => onSelect(agency.id)}>
            <Text style={[ag.jumpBtnText, { color: agency.color }]}>
              🛰  Show {SATELLITES_BY_AGENCY[agency.id]?.length ?? 0} {agency.shortName} satellites in Earth Hub →
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
}

// ─── MISSIONS PANEL ──────────────────────────────────────────────────────────
function MissionsPanel() {
  const [sel, setSel] = useState(MISSIONS[0].id);
  const m = MISSIONS.find(x => x.id === sel) ?? MISSIONS[0];
  const sc: Record<string, string> = { active: C.green, completed: "#4d99ff", historic: C.gold };
  return (
    <View style={pw.wrap}>
      <Text style={sect.title}>🚀  Missions</Text>
      <Text style={sect.sub}>Humanity's greatest journeys</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
        <View style={{ flexDirection:"row", gap:8 }}>
          {MISSIONS.map(ms=>(
            <Pressable key={ms.id} style={[pw.chip, sel===ms.id&&pw.chipActive]} onPress={()=>setSel(ms.id)}>
              <Text style={pw.chipText}>{ms.country}</Text>
              <Text style={[pw.chipText, sel===ms.id&&{color:C.cyan}]}>{ms.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <LinearGradient colors={["#0a1840","#040c20"]} style={ms2.card}>
        <View style={ms2.cardTop}>
          <Text style={ms2.cardEmoji}>{m.destinationEmoji}</Text>
          <View style={{ flex:1 }}>
            <Text style={ms2.cardName}>{m.name}</Text>
            <View style={ms2.badges}>
              <View style={[ms2.badge, {borderColor:m.agencyColor+"55"}]}><Text style={[ms2.badgeT,{color:m.agencyColor}]}>{m.agency}</Text></View>
              <View style={[ms2.badge, {borderColor:sc[m.status]+"55"}]}><Text style={[ms2.badgeT,{color:sc[m.status]}]}>{m.status.toUpperCase()}</Text></View>
            </View>
          </View>
        </View>
        <View style={ms2.infoRow}>
          <View style={ms2.info}><Text style={ms2.infoL}>YEAR</Text><Text style={ms2.infoV}>{m.year}</Text></View>
          <View style={ms2.info}><Text style={ms2.infoL}>DESTINATION</Text><Text style={ms2.infoV}>{m.destination}</Text></View>
        </View>
        <Text style={ms2.highlight}>⭐ {m.highlight}</Text>
        <Text style={ms2.story}>{m.story}</Text>
      </LinearGradient>
    </View>
  );
}

// ─── TIMELINE PANEL ──────────────────────────────────────────────────────────
function TimelinePanel() {
  const [sel, setSel] = useState<string | null>(null);
  const selEvent = sel ? TIMELINE.find(t => t.id === sel) : null;
  const catColor: Record<string, string> = {
    milestone:"#ffc845", mission:"#4d7dff", disaster:"#ff4d6d",
    discovery:"#4dffb4", technology:"#9b4dff",
  };

  return (
    <View style={pw.wrap}>
      <Text style={sect.title}>🕒  Space Timeline</Text>
      <Text style={sect.sub}>1957 → Present: Humanity's journey beyond Earth</Text>

      {selEvent && (
        <View style={[tl.detail, { borderColor: catColor[selEvent.category] + "55" }]}>
          <View style={tl.detailTop}>
            <Text style={tl.detailEmoji}>{selEvent.emoji}</Text>
            <View style={{ flex:1 }}>
              <Text style={tl.detailTitle}>{selEvent.title}</Text>
              <Text style={[tl.detailCat, { color: catColor[selEvent.category] }]}>{selEvent.category.toUpperCase()}  ·  {selEvent.flag} {selEvent.year}</Text>
            </View>
            <Pressable onPress={()=>setSel(null)}><Text style={{color:C.textSub,fontSize:20,padding:6}}>×</Text></Pressable>
          </View>
          <Text style={tl.detailDesc}>{selEvent.description}</Text>
          <View style={[tl.significance, { borderColor: catColor[selEvent.category]+"44" }]}>
            <Text style={[tl.sigLabel, { color: catColor[selEvent.category] }]}>SIGNIFICANCE</Text>
            <Text style={tl.sigText}>{selEvent.significance}</Text>
          </View>
        </View>
      )}

      {/* Timeline events */}
      {TIMELINE.map((ev, i) => (
        <Pressable key={ev.id} style={[tl.row, sel===ev.id&&tl.rowActive]} onPress={()=>setSel(sel===ev.id?null:ev.id)}>
          <View style={tl.yearCol}>
            <Text style={tl.year}>{ev.year}</Text>
          </View>
          <View style={[tl.dot, { backgroundColor: catColor[ev.category] }]} />
          {i < TIMELINE.length-1 && <View style={[tl.line, {height:48}]} />}
          <View style={tl.content}>
            <Text style={tl.eventEmoji}>{ev.emoji}</Text>
            <View style={{ flex:1 }}>
              <Text style={tl.eventTitle} numberOfLines={2}>{ev.title}</Text>
              <Text style={tl.eventMeta}>{ev.flag} {ev.subtitle}</Text>
            </View>
            <View style={[tl.catBadge, {backgroundColor:catColor[ev.category]+"18", borderColor:catColor[ev.category]+"44"}]}>
              <Text style={[tl.catText, {color:catColor[ev.category]}]}>{ev.category}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}


// ─── PLANET INTERNAL STRUCTURE ────────────────────────────────────────────────
const PLANET_LAYERS: Record<string, Array<{ label: string; color: string; temp: string; depth: string }>> = {
  mercury: [
    { label:"Inner Core",   color:"#e87040", temp:"~1,800°C", depth:"0–600 km" },
    { label:"Outer Core",   color:"#d45520", temp:"~1,000°C", depth:"600–1,800 km" },
    { label:"Mantle",       color:"#8a4020", temp:"~700°C",   depth:"1,800–2,350 km" },
    { label:"Crust",        color:"#5a3010", temp:"~450°C",   depth:"2,350–2,440 km" },
  ],
  venus: [
    { label:"Iron Core",    color:"#d45020", temp:"~5,000°C", depth:"0–3,110 km" },
    { label:"Mantle",       color:"#a06030", temp:"~2,000°C", depth:"3,110–6,051 km" },
    { label:"Crust",        color:"#c09050", temp:"~465°C",   depth:"surface" },
  ],
  earth: [
    { label:"Inner Core",   color:"#ffbb44", temp:"~5,400°C", depth:"0–1,200 km" },
    { label:"Outer Core",   color:"#ff8822", temp:"~4,000°C", depth:"1,200–3,400 km" },
    { label:"Mantle",       color:"#883020", temp:"~2,000°C", depth:"3,400–6,335 km" },
    { label:"Crust",        color:"#44aa66", temp:"~20°C",    depth:"thin shell" },
  ],
  mars: [
    { label:"Iron Core",    color:"#cc4422", temp:"~1,400°C", depth:"0–1,800 km" },
    { label:"Silicate Mantle",color:"#883322", temp:"~1,000°C",depth:"1,800–3,370 km" },
    { label:"Crust",        color:"#bb5533", temp:"−60°C",   depth:"thin shell" },
  ],
  jupiter: [
    { label:"Rocky Core",   color:"#aa6622", temp:"~24,000°C",depth:"0–14,000 km" },
    { label:"Metallic H₂",  color:"#446699", temp:"~10,000°C",depth:"14,000–50,000 km" },
    { label:"Liquid H₂",    color:"#6688cc", temp:"~5,000°C", depth:"50,000–71,000 km" },
    { label:"Atmosphere",   color:"#ccaa66", temp:"−110°C",  depth:"outer layer" },
  ],
  saturn: [
    { label:"Rocky Core",   color:"#aa8844", temp:"~15,000°C",depth:"0–9,000 km" },
    { label:"Metallic H₂",  color:"#557799", temp:"~7,000°C", depth:"9,000–30,000 km" },
    { label:"Liquid H₂",    color:"#7799bb", temp:"~3,000°C", depth:"30,000–60,000 km" },
    { label:"Atmosphere",   color:"#ddbb88", temp:"−140°C",  depth:"outer layer" },
  ],
  uranus: [
    { label:"Rocky Core",   color:"#668899", temp:"~5,000°C", depth:"0–7,500 km" },
    { label:"Ice Mantle",   color:"#4499bb", temp:"~2,000°C", depth:"7,500–25,000 km" },
    { label:"Atmosphere",   color:"#88ccdd", temp:"−195°C",  depth:"outer" },
  ],
  neptune: [
    { label:"Rocky Core",   color:"#334466", temp:"~5,400°C", depth:"0–7,000 km" },
    { label:"Ice Mantle",   color:"#335588", temp:"~2,500°C", depth:"7,000–24,000 km" },
    { label:"Atmosphere",   color:"#4466aa", temp:"−200°C",  depth:"outer" },
  ],
};
function PlanetStructureView({ planet }: { planet: Planet }) {
  const layers = PLANET_LAYERS[planet.id] ?? PLANET_LAYERS.earth;
  const n = layers.length;
  const R = 52; // outer radius px
  return (
    <View style={{ marginVertical:10 }}>
      <Text style={{ color:"rgba(160,210,240,0.7)", fontSize:9, fontWeight:"900", letterSpacing:1.5, marginBottom:8 }}>INTERNAL STRUCTURE</Text>
      <View style={{ flexDirection:"row", alignItems:"center", gap:12 }}>
        {/* Concentric ring diagram */}
        <View style={{ width:R*2+4, height:R*2+4, position:"relative" }}>
          {layers.map((layer, i) => {
            const frac = (n - i) / n;
            const d = frac * (R * 2 + 4);
            const offset = (R * 2 + 4 - d) / 2;
            return (
              <View key={layer.label} style={{
                position:"absolute", left:offset, top:offset,
                width:d, height:d, borderRadius:d/2,
                backgroundColor: layer.color,
                opacity: 0.85 + i * 0.03,
              }}/>
            );
          })}
        </View>
        {/* Legend */}
        <View style={{ flex:1, gap:4 }}>
          {layers.map((layer) => (
            <View key={layer.label} style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
              <View style={{ width:8, height:8, borderRadius:4, backgroundColor:layer.color }}/>
              <View style={{ flex:1 }}>
                <Text style={{ color:"#eef5ff", fontSize:10, fontWeight:"800" }}>{layer.label}</Text>
                <Text style={{ color:"rgba(140,190,220,0.65)", fontSize:8.5 }}>{layer.temp} · {layer.depth}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── ROCKET LAUNCH SIMULATOR ──────────────────────────────────────────────────
const ROCKET_TARGETS = [
  { id:"mars",    name:"Mars",    emoji:"🔴", r:1.52, color:"#e05030", dv1:3.6, dv2:2.1, days:259, info:"Closest approach every 26 months" },
  { id:"venus",   name:"Venus",   emoji:"🟡", r:0.72, color:"#e8b040", dv1:3.5, dv2:3.2, days:146, info:"Inner planet — counterintuitive braking needed" },
  { id:"jupiter", name:"Jupiter", emoji:"🟠", r:5.20, color:"#d8a060", dv1:8.8, dv2:6.4, days:998, info:"Needs gravity assist from inner planets" },
];
type RocketPhase = "setup" | "launch" | "result";
function RocketLaunchSim() {
  const [target, setTarget]     = useState(ROCKET_TARGETS[0]);
  const [fuel, setFuel]         = useState(75);
  const [phase, setPhase]       = useState<RocketPhase>("setup");
  const [animProg, setAnimProg] = useState(0);
  const [score, setScore]       = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hohmann transfer math (simplified, AU-based)
  const r1 = 1.0; // Earth
  const r2 = target.r;
  const a  = (r1 + r2) / 2; // semi-major axis
  const transferDays = Math.round(Math.PI * Math.sqrt(a ** 3 / 1) * 365.25); // Kepler
  const requiredDv   = target.dv1 + target.dv2; // km/s total delta-v budget
  const availableDv  = fuel * 0.18; // fuel% → km/s (scale for game)
  const fuelOk       = availableDv >= requiredDv * 0.9;

  const launch = () => {
    setPhase("launch");
    setAnimProg(0);
    let p = 0;
    animRef.current = setInterval(() => {
      p += 2;
      setAnimProg(p);
      if (p >= 100) {
        clearInterval(animRef.current!);
        const sc = fuelOk ? Math.round(((availableDv - requiredDv*0.9)/(requiredDv*0.3))*40 + 60) : Math.round((availableDv/requiredDv)*50);
        setScore(Math.min(100, Math.max(5, sc)));
        setPhase("result");
      }
    }, 40);
  };
  const reset = () => { setPhase("setup"); setAnimProg(0); if(animRef.current) clearInterval(animRef.current!); };

  // Draw orbit animation (SVG-style using Views)
  const W = 260, H = 200, cx = W/2, cy = H/2;
  const earthR = 55, targetR = Math.round(earthR * Math.min(3, r2/r1));
  // Transfer ellipse: draw as partial arc using a View approach
  const rocketAngle = (animProg / 100) * Math.PI; // 0 = Earth departure, π = target arrival
  const ellipseA = (earthR + targetR) / 2;
  const ellipseB = earthR * 0.85;
  const rocketX = cx - ellipseA * Math.cos(rocketAngle);
  const rocketY = cy - ellipseB * Math.sin(rocketAngle);

  return (
    <View style={{ paddingHorizontal:16, paddingVertical:12 }}>
      <View style={{ flexDirection:"row", alignItems:"center", gap:10, marginBottom:14 }}>
        <Text style={{ fontSize:28 }}>🚀</Text>
        <View>
          <Text style={{ color:"#eef5ff", fontSize:17, fontWeight:"900" }}>Mission Control</Text>
          <Text style={{ color:"#8ab8d8", fontSize:11, marginTop:2 }}>Plan your Hohmann transfer orbit</Text>
        </View>
      </View>

      {phase === "setup" && (
        <>
          {/* Target planet selector */}
          <Text style={{ color:"rgba(160,210,240,0.7)", fontSize:9, fontWeight:"900", letterSpacing:1.5, marginBottom:8 }}>TARGET PLANET</Text>
          <View style={{ flexDirection:"row", gap:8, marginBottom:16 }}>
            {ROCKET_TARGETS.map(t => (
              <Pressable key={t.id} onPress={() => setTarget(t)} style={{
                flex:1, alignItems:"center", paddingVertical:10, borderRadius:14,
                backgroundColor: target.id===t.id ? "rgba(77,249,255,0.14)" : "rgba(255,255,255,0.06)",
                borderWidth:1, borderColor: target.id===t.id ? "rgba(77,249,255,0.5)" : "rgba(255,255,255,0.1)",
              }}>
                <Text style={{ fontSize:22, marginBottom:4 }}>{t.emoji}</Text>
                <Text style={{ color:"#eef5ff", fontSize:11, fontWeight:"900" }}>{t.name}</Text>
                <Text style={{ color:"#8ab8d8", fontSize:9, marginTop:2 }}>{t.r} AU</Text>
              </Pressable>
            ))}
          </View>

          {/* Info card */}
          <View style={{ backgroundColor:"rgba(77,249,255,0.06)", borderRadius:12, padding:12, marginBottom:14, borderWidth:1, borderColor:"rgba(77,249,255,0.2)" }}>
            <Text style={{ color:"#4df9ff", fontSize:10, fontWeight:"900", letterSpacing:1, marginBottom:5 }}>MISSION PROFILE</Text>
            <Text style={{ color:"#eef5ff", fontSize:13, fontWeight:"700" }}>Earth → {target.name}</Text>
            <Text style={{ color:"#8ab8d8", fontSize:11.5, marginTop:4 }}>Transfer time: ~{transferDays} days</Text>
            <Text style={{ color:"#8ab8d8", fontSize:11.5, marginTop:2 }}>Delta-v needed: ~{requiredDv.toFixed(1)} km/s</Text>
            <Text style={{ color:"#8ab8d8", fontSize:10.5, marginTop:6, fontStyle:"italic" }}>{target.info}</Text>
          </View>

          {/* Fuel slider */}
          <Text style={{ color:"rgba(160,210,240,0.7)", fontSize:9, fontWeight:"900", letterSpacing:1.5, marginBottom:8 }}>
            FUEL BUDGET — {fuel}%  ({(availableDv).toFixed(1)} km/s available)
          </Text>
          <View style={{ flexDirection:"row", gap:8, marginBottom:6 }}>
            {[25,50,60,75,90,100].map(v => (
              <Pressable key={v} onPress={() => setFuel(v)} style={{
                flex:1, height:36, alignItems:"center", justifyContent:"center", borderRadius:10,
                backgroundColor: fuel===v ? "rgba(77,249,255,0.16)" : "rgba(255,255,255,0.06)",
                borderWidth:1, borderColor: fuel===v ? "rgba(77,249,255,0.5)" : "rgba(255,255,255,0.08)",
              }}>
                <Text style={{ color: fuel===v ? "#4df9ff" : "#8ab8d8", fontSize:12, fontWeight:"900" }}>{v}%</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: fuelOk ? "#4dffc3" : "#ff5580", fontSize:11, fontWeight:"900", marginBottom:14 }}>
            {fuelOk ? "✓ Sufficient delta-v for mission" : `✗ Need ${(requiredDv*0.9 - availableDv).toFixed(1)} km/s more — add fuel!`}
          </Text>

          <Pressable onPress={launch} style={{
            borderRadius:14, padding:15, alignItems:"center",
            backgroundColor: fuelOk ? "rgba(77,249,255,0.2)" : "rgba(255,255,255,0.07)",
            borderWidth:1, borderColor: fuelOk ? "rgba(77,249,255,0.6)" : "rgba(255,255,255,0.12)",
          }}>
            <Text style={{ color: fuelOk ? "#4df9ff" : "#8ab8d8", fontSize:15, fontWeight:"900" }}>
              🚀  Launch Mission
            </Text>
          </Pressable>

          {/* Learning tip */}
          <View style={{ backgroundColor:"rgba(255,209,102,0.07)", borderRadius:12, padding:12, marginTop:14, borderWidth:1, borderColor:"rgba(255,209,102,0.22)" }}>
            <Text style={{ color:"#ffd166", fontSize:9.5, fontWeight:"900", letterSpacing:1, marginBottom:5 }}>💡 HOHMANN TRANSFER</Text>
            <Text style={{ color:"#eef5ff", fontSize:12, lineHeight:18 }}>
              A Hohmann transfer uses two engine burns to travel between orbits using the least fuel. First burn raises your orbit to match the target. Second burn circularizes at destination.
            </Text>
          </View>
        </>
      )}

      {phase === "launch" && (
        <View style={{ alignItems:"center" }}>
          {/* Orbit animation */}
          <View style={{ width:W, height:H, position:"relative", marginBottom:14 }}>
            {/* Sun */}
            <View style={{ position:"absolute", left:cx-8, top:cy-8, width:16, height:16, borderRadius:8, backgroundColor:"#ffcc44" }}/>
            {/* Earth orbit */}
            <View style={{ position:"absolute", left:cx-earthR, top:cy-earthR, width:earthR*2, height:earthR*2, borderRadius:earthR, borderWidth:1, borderColor:"rgba(77,249,255,0.3)", backgroundColor:"transparent" }}/>
            {/* Target orbit */}
            <View style={{ position:"absolute", left:cx-targetR, top:cy-targetR, width:targetR*2, height:targetR*2, borderRadius:targetR, borderWidth:1, borderColor:target.color+"66", backgroundColor:"transparent" }}/>
            {/* Earth */}
            <View style={{ position:"absolute", left:cx+earthR-7, top:cy-7, width:14, height:14, borderRadius:7, backgroundColor:"#4488ff" }}/>
            {/* Target planet */}
            <View style={{ position:"absolute", left:cx-targetR-7, top:cy-7, width:14, height:14, borderRadius:7, backgroundColor:target.color }}/>
            {/* Rocket */}
            <View style={{ position:"absolute", left:rocketX-6, top:rocketY-6, width:12, height:12, borderRadius:6, backgroundColor:"#ffffff", borderWidth:2, borderColor:"#4df9ff" }}/>
            {/* Progress trail dots */}
            {[20,40,60,80].map(p => {
              const a = (p/100)*Math.PI;
              const rx = cx - ellipseA*Math.cos(a);
              const ry = cy - ellipseB*Math.sin(a);
              return p <= animProg ? (
                <View key={p} style={{ position:"absolute", left:rx-2, top:ry-2, width:4, height:4, borderRadius:2, backgroundColor:"rgba(77,249,255,0.5)" }}/>
              ) : null;
            })}
          </View>
          <Text style={{ color:"#4df9ff", fontSize:14, fontWeight:"900", marginBottom:4 }}>
            T+ {Math.round(animProg/100 * transferDays)} days
          </Text>
          <Text style={{ color:"#8ab8d8", fontSize:12 }}>{animProg}% of transfer complete…</Text>
          <View style={{ width:W, height:6, borderRadius:3, backgroundColor:"rgba(255,255,255,0.1)", marginTop:14, overflow:"hidden" }}>
            <View style={{ width:`${animProg}%` as `${number}%`, height:6, borderRadius:3, backgroundColor:"#4df9ff" }}/>
          </View>
        </View>
      )}

      {phase === "result" && (
        <View style={{ alignItems:"center", gap:10 }}>
          <Text style={{ fontSize:64 }}>{score >= 70 ? "🎉" : score >= 40 ? "🛸" : "💥"}</Text>
          <Text style={{ color:"#eef5ff", fontSize:22, fontWeight:"900" }}>
            {score >= 70 ? "Mission Success!" : score >= 40 ? "Partial Success" : "Mission Failed"}
          </Text>
          <Text style={{ color:"#4df9ff", fontSize:52, fontWeight:"900" }}>{score}</Text>
          <Text style={{ color:"#8ab8d8", fontSize:12, textAlign:"center" }}>out of 100 pts</Text>
          <View style={{ backgroundColor:"rgba(4,10,28,0.95)", borderRadius:16, padding:16, gap:8, width:"100%", borderWidth:1, borderColor:"rgba(77,249,255,0.2)" }}>
            <Text style={{ color:"#4df9ff", fontSize:10, fontWeight:"900", letterSpacing:1 }}>MISSION DEBRIEF</Text>
            <Text style={{ color:"#eef5ff", fontSize:12.5 }}>Target: Earth → {target.name}</Text>
            <Text style={{ color:"#8ab8d8", fontSize:12 }}>Transfer duration: {transferDays} days</Text>
            <Text style={{ color:fuelOk ? "#4dffc3" : "#ff5580", fontSize:12 }}>
              Fuel used: {fuel}% ({availableDv.toFixed(1)} km/s)
            </Text>
            <Text style={{ color:"#8ab8d8", fontSize:12 }}>Required delta-v: {requiredDv.toFixed(1)} km/s</Text>
            <Text style={{ color:"#ffd166", fontSize:11.5, marginTop:4, lineHeight:17 }}>
              {score >= 70 ? `Perfect Hohmann transfer! Your spacecraft will reach ${target.name} in ${transferDays} Earth days using optimal fuel.`
              : score >= 40 ? "You made it, but used more fuel than needed. Try a 60–75% fuel load next time."
              : `Insufficient delta-v! You needed ${requiredDv.toFixed(1)} km/s. Load more fuel.`}
            </Text>
          </View>
          <Pressable onPress={reset} style={{ borderRadius:14, paddingHorizontal:28, paddingVertical:14, backgroundColor:"rgba(77,249,255,0.14)", borderWidth:1, borderColor:"rgba(77,249,255,0.44)", marginTop:4 }}>
            <Text style={{ color:"#4df9ff", fontSize:14, fontWeight:"900" }}>🔄  Try Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── LAB PANEL ───────────────────────────────────────────────────────────────

function LabPanel({ planet, inputs, setInputs, outcome, activeExperimentId, setActiveExperimentId, onActivateExperiment }: {
  planet: Planet; inputs: LabInputs; setInputs: (i: LabInputs) => void;
  outcome: ReturnType<typeof calculateLabOutcome>;
  activeExperimentId: string | null; setActiveExperimentId: (id: string | null) => void;
  onActivateExperiment: (id: string) => void;
}) {
  const [labMode, setLabMode] = useState<"physics" | "rocket">("physics");
  const activeExp = EXPERIMENTS.find(e => e.id === activeExperimentId);
  const expVals   = activeExp ? activeExp.params.reduce<Record<string,number>>((a,p)=>{ a[p.key]=(inputs as Record<string,number>)[p.key]??p.defaultValue; return a; },{}) : {};
  const set = (k: string, v: number) => setInputs({ ...inputs, [k]: v });
  const reset = () => { setInputs({massScale:1,radiusScale:1,velocityScale:1,gravityScale:1,rotationScale:1,moonDistScale:1}); setActiveExperimentId(null); };

  return (
    <View style={pw.wrap}>
      {/* Mode switcher */}
      <View style={{ flexDirection:"row", gap:8, marginHorizontal:16, marginVertical:10 }}>
        <Pressable onPress={() => setLabMode("physics")} style={{
          flex:1, paddingVertical:10, borderRadius:14, alignItems:"center",
          backgroundColor: labMode==="physics" ? "rgba(77,249,255,0.14)" : "rgba(255,255,255,0.05)",
          borderWidth:1, borderColor: labMode==="physics" ? "rgba(77,249,255,0.5)" : "rgba(255,255,255,0.1)",
        }}>
          <Text style={{ fontSize:18, marginBottom:2 }}>🧪</Text>
          <Text style={{ color: labMode==="physics" ? "#4df9ff" : "#8ab8d8", fontSize:11, fontWeight:"900" }}>Physics Lab</Text>
        </Pressable>
        <Pressable onPress={() => setLabMode("rocket")} style={{
          flex:1, paddingVertical:10, borderRadius:14, alignItems:"center",
          backgroundColor: labMode==="rocket" ? "rgba(255,100,100,0.14)" : "rgba(255,255,255,0.05)",
          borderWidth:1, borderColor: labMode==="rocket" ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.1)",
        }}>
          <Text style={{ fontSize:18, marginBottom:2 }}>🚀</Text>
          <Text style={{ color: labMode==="rocket" ? "#ff9988" : "#8ab8d8", fontSize:11, fontWeight:"900" }}>Mission Control</Text>
        </Pressable>
      </View>

      {labMode === "rocket" ? <RocketLaunchSim /> : (
      <>
      <View style={lab.header}>
        <View><Text style={lab.title}>🧪  SPACE LAB</Text><Text style={lab.sub}>What happens if…?</Text></View>
        <Pressable onPress={reset} style={lab.resetBtn}><Text style={lab.resetText}>Reset</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
        <View style={{ flexDirection:"row", gap:9 }}>
          {EXPERIMENTS.map(exp=>(
            <Pressable key={exp.id} style={[lab.expCard, activeExperimentId===exp.id&&lab.expCardActive]} onPress={()=>onActivateExperiment(exp.id)}>
              <Text style={lab.expEmoji}>{exp.emoji}</Text>
              <Text style={lab.expTitle}>{exp.title}</Text>
              <Text style={lab.expSub} numberOfLines={2}>{exp.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {activeExp ? (
        <>
          <View style={lab.activeHeader}><Text style={lab.activeName}>{activeExp.emoji}  {activeExp.title}</Text><Text style={lab.activeSub}>{activeExp.subtitle}</Text></View>
          {activeExp.params.map(param=>(
            <LabSlider key={param.key} label={param.label} unit={param.unit} min={param.min} max={param.max} step={param.step} value={(inputs as Record<string,number>)[param.key]??param.defaultValue} onChange={v=>set(param.key,v)}/>
          ))}
          <View style={lab.formulaBox}><Text style={lab.formulaLabel}>{activeExp.formulaLabel}</Text><Text style={lab.formula}>{activeExp.formula}</Text></View>
          <View style={lab.liveBox}><Text style={lab.liveLabel}>LIVE READING</Text><Text style={lab.liveText}>{activeExp.explanation(expVals)}</Text></View>
          <View style={lab.compareRow}>
            <View style={lab.compareBox}><Text style={lab.compareTag}>BEFORE</Text><Text style={lab.compareVal}>{outcome.before.surfaceGravityG.toFixed(2)}g</Text><Text style={lab.compareUnit}>Surface gravity</Text><Text style={lab.compareVal}>{(outcome.before.escapeVelocity/1000).toFixed(1)} km/s</Text><Text style={lab.compareUnit}>Escape velocity</Text></View>
            <Text style={lab.compareArrow}>→</Text>
            <View style={[lab.compareBox,lab.compareBoxAfter]}><Text style={[lab.compareTag,{color:C.cyan}]}>AFTER</Text><Text style={[lab.compareVal,{color:C.cyan}]}>{outcome.after.surfaceGravityG.toFixed(2)}g</Text><Text style={lab.compareUnit}>Surface gravity</Text><Text style={[lab.compareVal,{color:C.cyan}]}>{(outcome.after.escapeVelocity/1000).toFixed(1)} km/s</Text><Text style={lab.compareUnit}>Escape velocity</Text></View>
          </View>
          <View style={lab.resultBox}><Text style={lab.resultTitle}>{outcome.headline}</Text><Text style={lab.resultBody}>{outcome.explanation}</Text></View>
          <View style={lab.takeaway}><Text style={lab.takeawayTag}>💡  WHAT DID WE LEARN?</Text><Text style={lab.takeawayText}>{activeExp.takeaway}</Text><Text style={lab.disclaimer}>⚠️ {activeExp.disclaimer}</Text></View>
        </>
      ) : (
        <>
          <Text style={lab.freeLabel}>Explore freely — adjust any parameter:</Text>
          <LabSlider label="Mass" unit="×" min={0.25} max={5} step={0.25} value={inputs.massScale} onChange={v=>set("massScale",v)}/>
          <LabSlider label="Radius" unit="×" min={0.25} max={3} step={0.25} value={inputs.radiusScale} onChange={v=>set("radiusScale",v)}/>
          <LabSlider label="Velocity" unit="×" min={0.25} max={3} step={0.25} value={inputs.velocityScale} onChange={v=>set("velocityScale",v)}/>
          <LabSlider label="Gravity" unit="×" min={0.1} max={5} step={0.1} value={inputs.gravityScale} onChange={v=>set("gravityScale",v)}/>
          <View style={lab.resultBox}><Text style={lab.resultTitle}>{outcome.headline}</Text><Text style={lab.resultBody}>{outcome.explanation}</Text></View>
        </>
      )}
      </>
      )}
    </View>
  );
}

function LabSlider({ label,unit,min,max,step,value,onChange }: { label:string;unit:string;min:number;max:number;step:number;value:number;onChange:(v:number)=>void }) {
  const pct = (value-min)/(max-min);
  const bump = (d: number) => { const v=Math.max(min,Math.min(max,parseFloat((Math.round((value+d)/step)*step).toFixed(3)))); onChange(v); };
  return (
    <View style={sl.wrap}>
      <View style={sl.row}><Text style={sl.label}>{label}</Text><Text style={sl.val}>{value.toFixed(2)}{unit}</Text></View>
      <View style={sl.trackRow}>
        <Pressable style={sl.arrow} onPress={()=>bump(-step)}><Text style={sl.arrowT}>‹</Text></Pressable>
        <View style={sl.track}><View style={[sl.fill,{width:`${pct*100}%`}]}/><View style={[sl.thumb,{left:`${Math.min(97,pct*100)}%`}]}/></View>
        <Pressable style={sl.arrow} onPress={()=>bump(step)}><Text style={sl.arrowT}>›</Text></Pressable>
      </View>
      <View style={sl.ticks}><Text style={sl.tick}>{min}{unit}</Text><Text style={sl.tick}>{((min+max)/2).toFixed(1)}{unit}</Text><Text style={sl.tick}>{max}{unit}</Text></View>
    </View>
  );
}

// ─── COSMO AI PANEL ──────────────────────────────────────────────────────────
type CosmoMsg = { from: "user" | "cosmo"; text: string };
const COSMO_QA: Array<{
  q: string; a: string; action?: () => void;
  expId?: string; section?: Section; agencyId?: string;
}> = [
  { q: "Show me all Indian satellites", a: "Showing all ISRO satellites in Earth Hub orbit view! 🇮🇳", agencyId:"isro", section:"earthhub" },
  { q: "Where is the ISS right now?", a: "The ISS orbits at 408km altitude, 51.6° inclination — completing 16 orbits every day. I've highlighted it in Earth Hub! Tap it in the 3D view to explore.", section:"earthhub" },
  { q: "What if Earth spins faster?", a: "Great experiment! Loading it now — move the slider to see what happens to gravity, day length, and whether the atmosphere would escape!", expId:"earth_spin_faster" },
  { q: "Which country reached Mars first?", a: "The USA was first (Mariner 4, 1965 flyby). The Soviet Union, ESA, India, China, and UAE have also reached Mars. India is unique — ISRO succeeded on their FIRST attempt with Mangalyaan in 2014, making it the cheapest Mars mission ever at just $74 million." },
  { q: "What is Chandrayaan-3?", a: "Chandrayaan-3 made India the 4th country to soft-land on the Moon — and the FIRST EVER to land near the Moon's south pole in August 2023. The Vikram lander and Pragyan rover confirmed sulphur, oxygen, and water-ice evidence in the region. A world historic achievement.", section:"earthhub", agencyId:"isro" },
  { q: "Show me SpaceX satellites", a: "Loading SpaceX Starlink constellation! 🚀 With 6,700+ satellites, Starlink is the largest constellation ever built.", agencyId:"spacex", section:"earthhub" },
  { q: "What is escape velocity?", a: "Escape velocity is the minimum speed to break free from gravity forever without extra thrust. For Earth it's 11.2 km/s (40,000 km/h!). Let me show you how mass and radius change it!", expId:"orbital_velocity" },
  { q: "How many satellites orbit Earth?", a: "According to ESA (2026): ~18,840 satellites still in space, of which ~16,000 are functional. Plus an estimated 54,000 objects >10cm, 1.2 million objects 1-10cm, and 140 million pieces of debris 1mm-1cm. Space is busier than you think!" },
  { q: "Take me to the Space Timeline", a: "Here's the full history of human spaceflight — from Sputnik in 1957 to Chandrayaan-3 in 2023! 🕒", section:"timeline" },
  { q: "Compare NASA and ISRO", a: "NASA: founded 1958, $24.9B budget, 430 launches, 68 active satellites. ISRO: founded 1969, $1.7B budget, 94 launches. ISRO is arguably the world's most cost-efficient agency — their Mars mission cost less than making the movie Gravity!", section:"agencies" },
];

function CosmoPanel({ onActivateExperiment, onSection, onSelectAgency, onAction }: {
  onActivateExperiment: (id: string) => void; onSection: (s: Section) => void;
  onSelectAgency: (id: string) => void; onAction: (action: CosmoAction) => void;
}) {
  const [msgs, setMsgs] = useState<CosmoMsg[]>([
    { from:"cosmo", text:"Hi — I'm Cosmo. Ask in your own words, or tap a suggestion. I use the local catalog plus Groq when the network is up." }
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(!!process.env.EXPO_PUBLIC_GROQ_API_KEY);

  const runActions = (qa: typeof COSMO_QA[number]) => {
    setTimeout(() => {
      if (qa.expId) onActivateExperiment(qa.expId);
      else if (qa.agencyId) { onSelectAgency(qa.agencyId); if (qa.section) onSection(qa.section); }
      else if (qa.section) onSection(qa.section);
    }, 400);
  };

  const ask = (qa: typeof COSMO_QA[number]) => {
    setMsgs(prev => [...prev, {from:"user",text:qa.q}, {from:"cosmo",text:qa.a}]);
    runActions(qa);
  };

  const sendFree = async () => {
    const q = draft.trim();
    if (!q || busy) return;
    setDraft("");
    setMsgs(prev => [...prev, { from: "user", text: q }]);
    setBusy(true);
    try {
      const history = msgs.slice(-8).map(m => ({
        role: (m.from === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));
      const result = await askCosmo(q, history);
      setOnline(true);
      setMsgs(prev => [...prev, { from: "cosmo", text: result.text }]);
      result.actions.forEach(onAction);
    } catch {
      setOnline(false);
      setMsgs(prev => [...prev, { from: "cosmo", text: "I couldn't reach Groq just now. Use a suggestion chip — those work offline from the local catalog." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={pw.wrap}>
      <View style={co.header}>
        <Text style={co.avatar}>🤖</Text>
        <View>
          <Text style={co.name}>Cosmo</Text>
          <Text style={co.status}>{online ? "Groq + local catalog" : "Offline chips — Groq unreachable"}</Text>
        </View>
      </View>

      <View style={co.chat}>
        {msgs.map((m,i)=>(
          <View key={i} style={[co.bubble, m.from==="user"?co.bubbleUser:co.bubbleCosmo]}>
            <Text style={[co.bubbleText, m.from==="user"&&{color:C.bg}]}>{m.text}</Text>
          </View>
        ))}
      </View>

      <View style={co.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask Cosmo…"
          placeholderTextColor={C.textMuted}
          style={co.input}
          editable={!busy}
          returnKeyType="send"
          onSubmitEditing={sendFree}
        />
        <Pressable style={co.sendBtn} onPress={sendFree} disabled={busy}>
          <Text style={co.sendText}>{busy ? "…" : "Send"}</Text>
        </Pressable>
      </View>

      <Text style={co.sugLabel}>SUGGESTIONS (OFFLINE)</Text>
      <View style={co.sugs}>
        {COSMO_QA.map((qa,i)=>(
          <Pressable key={i} style={co.sug} onPress={()=>ask(qa)}>
            <Text style={co.sugQ}>{qa.q}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function QuizPanel({ exploredIds }: { exploredIds: string[] }) {
  const qs = useMemo(() => {
    const unlocked = QUIZ_QUESTIONS.filter(q => !q.objectId || exploredIds.includes(q.objectId));
    return unlocked.slice(0, 10);
  }, [exploredIds]);
  const [qi,setQi]=useState(0);const [sel,setSel]=useState<number|null>(null);
  const [score,setScore]=useState(0);const [streak,setStreak]=useState(0);const [done,setDone]=useState(false);
  const q=qs[qi];
  const answer=(i:number)=>{ if(sel!==null||!q)return;setSel(i);if(i===q.correctIndex){setScore(s=>s+1);setStreak(s=>s+1);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>undefined);}else{setStreak(0);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(()=>undefined);}};
  const next=()=>{ if(qi>=qs.length-1){setDone(true);return;}setQi(i=>i+1);setSel(null);};
  const restart=()=>{setQi(0);setSel(null);setScore(0);setStreak(0);setDone(false);};

  if (qs.length === 0) {
    return (
      <View style={pw.wrap}>
        <Text style={qz.doneTitle}>Explore first</Text>
        <Text style={qz.doneSub}>Tap a planet, moon, or satellite in the 3D view to unlock quiz questions about it.</Text>
      </View>
    );
  }

  if(done)return(<View style={qz.done}><Text style={qz.doneEmoji}>🏆</Text><Text style={qz.doneTitle}>Quiz Complete!</Text><Text style={qz.doneScore}>{score}/{qs.length}</Text><Text style={qz.doneSub}>{score>=8?"Space genius!":score>=5?"Great explorer!":"Keep exploring!"}</Text><Pressable style={qz.restartBtn} onPress={restart}><Text style={qz.restartText}>Try Again</Text></Pressable></View>);
  if(!q)return null;

  return (
    <View style={pw.wrap}>
      <Text style={co.status}>Unlocked by exploring {exploredIds.length} object{exploredIds.length===1?"":"s"}</Text>
      <View style={qz.bar}><View style={qz.prog}><View style={[qz.progFill,{width:`${(qi/qs.length)*100}%`}]}/></View><Text style={qz.scoreText}>⭐{score} 🔥×{streak}</Text></View>
      <Text style={qz.qNum}>Question {qi+1} of {qs.length}</Text>
      <View style={qz.qCard}><Text style={qz.qEmoji}>{q.emoji}</Text><Text style={qz.qText}>{q.question}</Text></View>
      <View style={qz.opts}>
        {q.options.map((opt,i)=>{
          const ok=sel!==null&&i===q.correctIndex;const err=sel!==null&&i===sel&&i!==q.correctIndex;
          return(<Pressable key={i} style={[qz.opt,ok&&qz.optOk,err&&qz.optErr]} onPress={()=>answer(i)}>
            <Text style={qz.optLetter}>{["A","B","C","D"][i]}</Text><Text style={qz.optText}>{opt}</Text>
          </Pressable>);
        })}
      </View>
      {sel!==null&&(<View style={qz.expl}><Text style={qz.explTitle}>{sel===q.correctIndex?"Correct":"Not quite"}</Text><Text style={qz.explText}>{q.explanation}</Text><Pressable style={qz.nextBtn} onPress={next}><Text style={qz.nextText}>{qi>=qs.length-1?"See Results":"Next →"}</Text></Pressable></View>)}
    </View>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function GlassBtn({ label, onPress, small }: { label: string; onPress: () => void; small?: boolean }) {
  return (
    <Pressable style={[ui.glassBtn, small&&ui.glassBtnSm]} onPress={onPress}>
      <Text style={[ui.glassBtnText, small&&{fontSize:14}]}>{label}</Text>
    </Pressable>
  );
}
function MiniStat({ l, v, accent }: { l: string; v: string; accent: string }) {
  return (<View style={[pw.stat,{borderTopColor:accent}]}><Text style={[pw.statVal,{color:accent}]}>{v}</Text><Text style={pw.statL}>{l}</Text></View>);
}
function td(a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) {
  return Math.hypot(a.pageX-b.pageX, a.pageY-b.pageY);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const ui = StyleSheet.create({
  topBar: { flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:18,paddingTop:10,paddingBottom:8,backgroundColor:"rgba(1,2,10,0.82)",borderBottomWidth:1,borderBottomColor:"rgba(77,249,255,0.07)" },
  topRight: { flexDirection:"row",gap:8 },
  appName: { color:"#eef5ff",fontSize:15,fontWeight:"900",letterSpacing:2 },
  appSub: { color:C.textMuted,fontSize:9.5,marginTop:2 },
  glassBtn: { width:44,height:44,borderRadius:13,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(8,16,36,0.90)",borderWidth:1,borderColor:"rgba(140,200,255,0.22)" },
  glassBtnSm: { width:36,height:36,borderRadius:10 },
  glassBtnText: { color:"#eef5ff",fontSize:18 },
  floatingCard: { position:"absolute",top:90,left:14,right:14,backgroundColor:"rgba(3,6,18,0.98)",borderRadius:20,borderWidth:1,borderColor:"rgba(77,249,255,0.42)",overflow:"hidden" },
  fcGradHeader: { padding:15,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,0.09)" },
  fcBody: { padding:15 },
  fcRow: { flexDirection:"row",alignItems:"center",gap:12 },
  fcEmoji: { fontSize:34 },
  fcName: { color:"#f0f6ff",fontSize:18,fontWeight:"900" },
  fcNick: { color:"rgba(160,210,240,0.82)",fontSize:9.5,fontWeight:"800",letterSpacing:1,marginTop:3 },
  fcFact: { color:"#8ab8d8",fontSize:12.5,lineHeight:19,marginBottom:12,fontStyle:"italic" },
  fcBtns: { flexDirection:"row",gap:8 },
  fcBtn: { flex:1,minHeight:42,alignItems:"center",justifyContent:"center",borderRadius:12,backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:"rgba(160,200,255,0.18)",paddingHorizontal:10 },
  fcBtnCyan: { borderColor:"rgba(77,249,255,0.46)",backgroundColor:"rgba(77,249,255,0.11)" },
  fcBtnText: { color:"#f0f6ff",fontSize:12.5,fontWeight:"900" },
  statusChip: { flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:9,paddingVertical:4,borderRadius:10,borderWidth:1,backgroundColor:"rgba(255,255,255,0.05)",alignSelf:"flex-start" },
  statusDot: { width:7,height:7,borderRadius:3.5 },
  statusText: { fontSize:9,fontWeight:"900",letterSpacing:0.5 },
  earthBadge: { position:"absolute",top:90,alignSelf:"center",backgroundColor:"rgba(3,8,22,0.94)",borderRadius:18,paddingHorizontal:20,paddingVertical:10,borderWidth:1,borderColor:"rgba(77,249,255,0.36)" },
  earthBadgeText: { color:"#eef5ff",fontSize:14,fontWeight:"900",textAlign:"center" },
  earthBadgeSub: { color:"#8ab8d8",fontSize:10.5,textAlign:"center",marginTop:3 },
  sheet: { position:"absolute",bottom:0,left:0,right:0,backgroundColor:"rgba(2,5,16,0.99)",borderTopLeftRadius:26,borderTopRightRadius:26,borderTopWidth:1,borderLeftWidth:1,borderRightWidth:1,borderColor:"rgba(77,249,255,0.14)",overflow:"hidden" },
  handleArea: { paddingTop:12,paddingHorizontal:16,paddingBottom:6 },
  handle: { width:58,height:5,borderRadius:3,backgroundColor:"rgba(77,249,255,0.30)",alignSelf:"center",marginBottom:10 },
  handleRow: { flexDirection:"row",alignItems:"center",gap:12 },
  handleEmoji: { fontSize:24 },
  handlePlanet: { color:"#eef5ff",fontSize:16,fontWeight:"900" },
  handleNick: { color:C.textMuted,fontSize:10.5,marginTop:2 },
  handleToggle: { width:32,height:32,borderRadius:11,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:"rgba(120,180,255,0.22)" },
  handleToggleText: { color:C.textSub,fontSize:16,fontWeight:"900" },
  tabScroll: { borderBottomWidth:1,borderBottomColor:"rgba(77,249,255,0.08)" },
  tabRail: { gap:7,paddingHorizontal:14,paddingVertical:8 },
  tab: { flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:14,paddingVertical:9,borderRadius:13,backgroundColor:"rgba(255,255,255,0.045)",borderWidth:1,borderColor:"rgba(100,155,255,0.14)" },
  tabActive: { backgroundColor:"rgba(77,249,255,0.13)",borderColor:"rgba(77,249,255,0.52)" },
  tabEmoji: { fontSize:15 },
  tabLabel: { color:C.textMuted,fontSize:11.5,fontWeight:"800" },
  tabLabelActive: { color:"#4df9ff",fontWeight:"900" },
  // ── 2×4 grid tabs ──────────────────────────────────────────
  tabGrid: {
    flexDirection:"row", flexWrap:"wrap",
    borderBottomWidth:1, borderBottomColor:"rgba(77,249,255,0.09)",
    paddingHorizontal:8, paddingTop:6, paddingBottom:6,
  },
  tabTile: {
    width:"25%", alignItems:"center", justifyContent:"center",
    paddingVertical:8, paddingHorizontal:2, borderRadius:12,
    backgroundColor:"transparent", position:"relative",
  },
  tabTileActive: {
    backgroundColor:"rgba(77,249,255,0.10)",
  },
  tabTileEmoji: { fontSize:18, marginBottom:3 },
  tabTileEmojiActive: {},
  tabTileLabel: {
    color:C.textMuted, fontSize:9.5, fontWeight:"800",
    textAlign:"center", letterSpacing:0.3,
  },
  tabTileLabelActive: { color:"#4df9ff", fontWeight:"900" },
  tabTileDot: {
    position:"absolute", bottom:3, left:"50%", marginLeft:-3,
    width:6, height:6, borderRadius:3, backgroundColor:"#4df9ff",
  },
  sheetContent: { flex:1 },
});

const hs = StyleSheet.create({
  scroll: { paddingHorizontal:22,paddingTop:52,paddingBottom:48 },
  eyebrow: { color:"#4df9ff",fontSize:11,fontWeight:"900",letterSpacing:2.5,marginBottom:14 },
  headline: { color:"#eef5ff",fontSize:44,fontWeight:"900",letterSpacing:-1,lineHeight:50,marginBottom:16 },
  tagline: { color:"#8ab8d8",fontSize:15.5,lineHeight:24,marginBottom:26 },
  agencyFlag: { alignItems:"center",paddingVertical:10,paddingHorizontal:14,borderRadius:14,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:"rgba(120,170,255,0.20)" },
  agencyFlagText: { fontSize:22 },
  agencyFlagLabel: { color:C.textMuted,fontSize:9.5,fontWeight:"900",marginTop:4,letterSpacing:0.5 },
  statsRow: { flexDirection:"row",gap:8,marginBottom:26 },
  statChip: { flex:1,alignItems:"center",paddingVertical:12,backgroundColor:"rgba(255,255,255,0.058)",borderRadius:14,borderWidth:1,borderColor:"rgba(77,249,255,0.18)" },
  statN: { color:"#4df9ff",fontSize:21,fontWeight:"900" },
  statL: { color:"#8ab8d8",fontSize:9,marginTop:3,fontWeight:"700",letterSpacing:0.3 },
  ctaWrap: { alignSelf:"flex-start",borderRadius:18,overflow:"hidden" },
  cta: { paddingHorizontal:32,paddingVertical:17,borderRadius:18 },
  ctaText: { color:"#fff",fontSize:17,fontWeight:"900" },
  gridLabel: { color:C.textMuted,fontSize:10,fontWeight:"900",letterSpacing:2,marginBottom:14 },
  grid: { flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:32 },
  tile: { width:(SW-54)/2,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(120,170,255,0.18)" },
  tileGrad: { padding:18,minHeight:112,justifyContent:"flex-end" },
  tileEmoji: { fontSize:30,marginBottom:10 },
  tileLabel: { color:"#eef5ff",fontSize:15,fontWeight:"900" },
  tileSub: { color:"rgba(140,190,220,0.72)",fontSize:10.5,marginTop:3 },
  killFeat: { borderRadius:18,borderWidth:1,borderColor:"rgba(77,249,255,0.22)",backgroundColor:"rgba(5,12,30,0.92)",padding:20 },
  killFeatTag: { color:"#4df9ff",fontSize:10,fontWeight:"900",letterSpacing:1.5,marginBottom:8 },
  killFeatTitle: { color:"#eef5ff",fontSize:17,fontWeight:"900",marginBottom:9 },
  killFeatText: { color:"#8ab8d8",fontSize:13.5,lineHeight:21,marginBottom:12 },
  killFeatCta: { color:"#4df9ff",fontWeight:"900",fontSize:13.5 },
  nebula: { position:"absolute",width:280,height:280,borderRadius:140,opacity:0.20,transform:[{scaleX:1.8}] },
});

const pw = StyleSheet.create({
  wrap: { paddingHorizontal:16,paddingTop:12 },
  hero: { flexDirection:"row",alignItems:"center",gap:14,borderRadius:18,padding:17,marginBottom:12,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,0.12)" },
  heroEmoji: { fontSize:34 },
  heroName: { color:"#eef5ff",fontSize:21,fontWeight:"900" },
  heroNick: { color:"rgba(140,200,230,0.82)",fontSize:10,fontWeight:"800",letterSpacing:1,marginTop:4 },
  factCard: { backgroundColor:"rgba(77,249,255,0.07)",borderRadius:14,borderWidth:1,borderColor:"rgba(77,249,255,0.26)",padding:15,marginBottom:12 },
  factQuote: { color:"#eef5ff",fontSize:14,lineHeight:22,fontStyle:"italic" },
  factTap: { color:"#4d6e8a",fontSize:9.5,fontWeight:"900",letterSpacing:1,marginTop:8 },
  statsRow: { flexDirection:"row",gap:6,marginBottom:7 },
  stat: { flex:1,borderRadius:13,backgroundColor:"rgba(255,255,255,0.058)",borderTopWidth:2.5,padding:11,minHeight:62 },
  statVal: { fontSize:14,fontWeight:"900" },
  statL: { color:C.textMuted,fontSize:9,marginTop:3,textTransform:"uppercase",fontWeight:"700",letterSpacing:0.3 },
  atmo: { backgroundColor:"rgba(255,255,255,0.050)",borderRadius:14,padding:13,marginBottom:7,borderWidth:1,borderColor:"rgba(255,255,255,0.07)" },
  atmoLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1,marginBottom:6 },
  atmoText: { color:"#8ab8d8",fontSize:12.5,lineHeight:19 },
  chip: { flexDirection:"row",alignItems:"center",gap:6,borderRadius:13,paddingHorizontal:12,paddingVertical:9,backgroundColor:"rgba(255,255,255,0.058)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",minHeight:38 },
  chipActive: { borderColor:"rgba(77,249,255,0.54)",backgroundColor:"rgba(77,249,255,0.12)" },
  chipDot: { width:8,height:8,borderRadius:4 },
  chipText: { color:"#8ab8d8",fontSize:11.5,fontWeight:"800" },
  speedRow: { marginTop:16,gap:7 },
  speedLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1 },
  speedBtns: { flexDirection:"row",gap:6 },
  speedBtn: { flex:1,height:40,alignItems:"center",justifyContent:"center",borderRadius:12,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)" },
  speedBtnActive: { backgroundColor:"rgba(77,249,255,0.18)",borderColor:"rgba(77,249,255,0.54)" },
  speedBtnT: { color:"#8ab8d8",fontSize:14,fontWeight:"900" },
  speedBtnTActive: { color:"#4df9ff" },
});

const eh = StyleSheet.create({
  selectedCard: { backgroundColor:"rgba(4,10,28,0.97)",borderRadius:18,borderWidth:1,borderColor:"rgba(77,249,255,0.38)",padding:16,marginBottom:16 },
  selectedTop: { flexDirection:"row",gap:14,alignItems:"flex-start",marginBottom:12 },
  selectedEmoji: { fontSize:36 },
  selectedName: { color:"#eef5ff",fontSize:17,fontWeight:"900" },
  metaRow: { flexDirection:"row",gap:8,marginBottom:9 },
  metaItem: { flex:1,backgroundColor:"rgba(255,255,255,0.04)",borderRadius:12,padding:9,borderWidth:1,borderColor:"rgba(255,255,255,0.055)" },
  metaL: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:0.5,marginBottom:3 },
  metaV: { color:"#eef5ff",fontSize:12.5,fontWeight:"700" },
  headline: { color:"#ffd166",fontSize:13.5,fontWeight:"900",marginBottom:9 },
  story: { color:"#8ab8d8",fontSize:12.5,lineHeight:19,marginBottom:11 },
  discovLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:0.5,marginBottom:7 },
  discovItem: { flexDirection:"row",gap:9,marginBottom:6 },
  discovBullet: { color:"#4df9ff",fontSize:12.5,fontWeight:"900",width:14 },
  discovText: { color:"#eef5ff",fontSize:12.5,flex:1,lineHeight:18 },
  satRow: { flexDirection:"row",alignItems:"center",gap:10,padding:12,borderRadius:14,marginBottom:8,backgroundColor:"rgba(255,255,255,0.050)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",minHeight:62 },
  satRowActive: { backgroundColor:"rgba(77,249,255,0.10)",borderColor:"rgba(77,249,255,0.48)" },
  satEmoji: { fontSize:22 },
  satName: { color:"#eef5ff",fontSize:13.5,fontWeight:"800" },
  satMeta: { color:"#8ab8d8",fontSize:10.5,marginTop:2 },
  satStatus: { paddingHorizontal:8,paddingVertical:4,borderRadius:10,borderWidth:1 },
  satStatusText: { fontSize:9.5,fontWeight:"900" },
});

const ag = StyleSheet.create({
  chip: { flexDirection:"row",alignItems:"center",gap:7,paddingHorizontal:12,paddingVertical:10,borderRadius:14,backgroundColor:"rgba(255,255,255,0.058)",borderWidth:1 },
  chipActive: { },
  chipFlag: { fontSize:18 },
  chipName: { fontSize:11.5,fontWeight:"900" },
  card: { borderRadius:18,borderWidth:1,overflow:"hidden",marginBottom:10,backgroundColor:"rgba(5,10,24,0.78)" },
  cardGrad: { padding:20 },
  cardTop: { flexDirection:"row",gap:16,alignItems:"flex-start",marginBottom:16 },
  cardFlag: { fontSize:46 },
  cardName: { color:"#eef5ff",fontSize:26,fontWeight:"900" },
  cardCountry: { fontSize:11.5,fontWeight:"800",marginTop:3 },
  cardFull: { color:"#8ab8d8",fontSize:10.5,marginTop:5 },
  tagline: { color:"#8ab8d8",fontSize:13.5,fontStyle:"italic",marginBottom:16 },
  statsGrid: { flexDirection:"row",gap:0,borderRadius:14,overflow:"hidden",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",marginBottom:12,backgroundColor:"rgba(255,255,255,0.040)" },
  statBox: { flex:1,alignItems:"center",paddingVertical:12,borderRightWidth:1,borderRightColor:"rgba(110,165,255,0.12)" },
  statN: { fontSize:20,fontWeight:"900" },
  statL: { color:"#8ab8d8",fontSize:9,marginTop:3,fontWeight:"700" },
  budgetRow: { color:"#8ab8d8",fontSize:12.5,marginBottom:14 },
  story: { color:"#8ab8d8",fontSize:13.5,lineHeight:21,marginBottom:14 },
  achLabel: { color:"#ffd166",fontSize:10,fontWeight:"900",letterSpacing:1,marginBottom:10 },
  achItem: { flexDirection:"row",gap:9,marginBottom:7 },
  achBullet: { fontSize:12.5,fontWeight:"900",width:16 },
  achText: { color:"#eef5ff",fontSize:12.5,flex:1,lineHeight:18 },
  jumpBtn: { borderRadius:14,borderWidth:1,padding:14,alignItems:"center",marginTop:16 },
  jumpBtnText: { fontSize:13.5,fontWeight:"900" },
});

const ms2 = StyleSheet.create({
  card: { borderRadius:18,padding:18,borderWidth:1,borderColor:"rgba(77,249,255,0.22)",backgroundColor:"rgba(4,10,26,0.90)" },
  cardTop: { flexDirection:"row",gap:14,alignItems:"flex-start",marginBottom:14 },
  cardEmoji: { fontSize:38 },
  cardName: { color:"#eef5ff",fontSize:18,fontWeight:"900",marginBottom:7 },
  badges: { flexDirection:"row",gap:7,flexWrap:"wrap" },
  badge: { paddingHorizontal:9,paddingVertical:4,borderRadius:8,borderWidth:1,backgroundColor:"rgba(255,255,255,0.05)" },
  badgeT: { fontSize:10.5,fontWeight:"900" },
  infoRow: { flexDirection:"row",gap:14,marginBottom:12 },
  info: { flex:1 },
  infoL: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:0.5,marginBottom:4 },
  infoV: { color:"#eef5ff",fontSize:14,fontWeight:"700" },
  highlight: { color:"#ffd166",fontSize:13.5,fontWeight:"800",marginBottom:9 },
  story: { color:"#8ab8d8",fontSize:12.5,lineHeight:20 },
});

const tl = StyleSheet.create({
  detail: { backgroundColor:"rgba(8,16,38,0.97)",borderRadius:18,borderWidth:1,padding:16,marginBottom:18 },
  detailTop: { flexDirection:"row",gap:12,alignItems:"flex-start",marginBottom:10 },
  detailEmoji: { fontSize:28 },
  detailTitle: { color:"#eef5ff",fontSize:16,fontWeight:"900" },
  detailCat: { fontSize:9.5,fontWeight:"900",letterSpacing:0.5,marginTop:3 },
  detailDesc: { color:"#8ab8d8",fontSize:12.5,lineHeight:20,marginBottom:12 },
  significance: { borderRadius:14,borderWidth:1,padding:13,backgroundColor:"rgba(255,255,255,0.040)" },
  sigLabel: { fontSize:9.5,fontWeight:"900",letterSpacing:0.5,marginBottom:5 },
  sigText: { color:"#eef5ff",fontSize:13.5,fontWeight:"700" },
  row: { flexDirection:"row",alignItems:"flex-start",gap:10,marginBottom:0,paddingVertical:10,paddingHorizontal:10,borderRadius:14 },
  rowActive: { backgroundColor:"rgba(77,249,255,0.08)",borderWidth:1,borderColor:"rgba(77,249,255,0.36)" },
  yearCol: { width:42 },
  year: { color:C.textMuted,fontSize:10,fontWeight:"900",letterSpacing:0.5 },
  dot: { width:12,height:12,borderRadius:6,marginTop:2,flexShrink:0 },
  line: { position:"absolute",left:62,top:22,width:1.5,backgroundColor:"rgba(110,165,255,0.22)" },
  content: { flex:1,flexDirection:"row",alignItems:"flex-start",gap:9 },
  eventEmoji: { fontSize:22 },
  eventTitle: { color:"#eef5ff",fontSize:13.5,fontWeight:"800",flex:1 },
  eventMeta: { color:"#8ab8d8",fontSize:10.5,marginTop:2 },
  catBadge: { paddingHorizontal:8,paddingVertical:4,borderRadius:9,borderWidth:1 },
  catText: { fontSize:8.5,fontWeight:"900" },
});

const lab = StyleSheet.create({
  header: { flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 },
  title: { color:"#eef5ff",fontSize:18,fontWeight:"900" },
  sub: { color:"#8ab8d8",fontSize:12.5,marginTop:3,fontStyle:"italic" },
  resetBtn: { paddingHorizontal:14,paddingVertical:9,borderRadius:12,backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:"rgba(110,165,255,0.20)" },
  resetText: { color:"#8ab8d8",fontSize:12.5,fontWeight:"800" },
  expCard: { width:154,minHeight:100,borderRadius:16,padding:14,backgroundColor:"rgba(255,255,255,0.058)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)" },
  expCardActive: { backgroundColor:"rgba(77,249,255,0.11)",borderColor:"rgba(77,249,255,0.52)" },
  expEmoji: { fontSize:22,marginBottom:6 },
  expTitle: { color:"#eef5ff",fontSize:11.5,fontWeight:"900" },
  expSub: { color:"#8ab8d8",fontSize:9.5,marginTop:4,lineHeight:14 },
  activeHeader: { marginBottom:12 },
  activeName: { color:"#eef5ff",fontSize:15,fontWeight:"900" },
  activeSub: { color:"#8ab8d8",fontSize:11.5,marginTop:3 },
  formulaBox: { backgroundColor:"rgba(181,140,255,0.09)",borderRadius:14,borderWidth:1,borderColor:"rgba(181,140,255,0.30)",padding:13,marginBottom:9 },
  formulaLabel: { color:"#b58cff",fontSize:9.5,fontWeight:"900",letterSpacing:0.5,marginBottom:5 },
  formula: { color:"#eef5ff",fontSize:12.5,fontFamily:"monospace" },
  liveBox: { backgroundColor:"rgba(77,249,255,0.07)",borderRadius:14,borderWidth:1,borderColor:"rgba(77,249,255,0.24)",padding:13,marginBottom:9 },
  liveLabel: { color:"#4df9ff",fontSize:9.5,fontWeight:"900",letterSpacing:0.5,marginBottom:5 },
  liveText: { color:"#eef5ff",fontSize:12.5,lineHeight:19 },
  compareRow: { flexDirection:"row",alignItems:"center",gap:9,marginBottom:11 },
  compareBox: { flex:1,borderRadius:14,backgroundColor:"rgba(255,255,255,0.052)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",padding:13 },
  compareBoxAfter: { backgroundColor:"rgba(77,249,255,0.09)",borderColor:"rgba(77,249,255,0.34)" },
  compareTag: { color:C.textMuted,fontSize:9.5,fontWeight:"900",letterSpacing:0.5,marginBottom:6 },
  compareVal: { color:"#eef5ff",fontSize:14,fontWeight:"900" },
  compareUnit: { color:C.textMuted,fontSize:9,marginBottom:6 },
  compareArrow: { color:C.textMuted,fontSize:20 },
  resultBox: { backgroundColor:"rgba(77,249,255,0.08)",borderRadius:14,borderWidth:1,borderColor:"rgba(77,249,255,0.26)",padding:15,marginBottom:11 },
  resultTitle: { color:"#eef5ff",fontSize:15,fontWeight:"900",marginBottom:5 },
  resultBody: { color:"#8ab8d8",fontSize:12.5,lineHeight:19 },
  takeaway: { backgroundColor:"rgba(255,209,102,0.08)",borderRadius:14,borderWidth:1,borderColor:"rgba(255,209,102,0.28)",padding:15,marginBottom:9 },
  takeawayTag: { color:"#ffd166",fontSize:10,fontWeight:"900",letterSpacing:1,marginBottom:7 },
  takeawayText: { color:"#eef5ff",fontSize:12.5,lineHeight:19,marginBottom:9 },
  disclaimer: { color:C.textMuted,fontSize:9.5,lineHeight:14,fontStyle:"italic" },
  freeLabel: { color:"#8ab8d8",fontSize:12.5,marginBottom:11,fontStyle:"italic" },
});

const sl = StyleSheet.create({
  wrap: { marginBottom:16 },
  row: { flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:9 },
  label: { color:"#8ab8d8",fontSize:11.5,fontWeight:"800",textTransform:"uppercase",letterSpacing:0.5 },
  val: { color:"#4df9ff",fontSize:15,fontWeight:"900" },
  trackRow: { flexDirection:"row",alignItems:"center",gap:9 },
  arrow: { width:38,height:38,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:"rgba(110,165,255,0.20)" },
  arrowT: { color:"#eef5ff",fontSize:22,fontWeight:"900" },
  track: { flex:1,height:7,borderRadius:4,backgroundColor:"rgba(255,255,255,0.10)",position:"relative",overflow:"visible" },
  fill: { height:7,borderRadius:4,backgroundColor:"#4df9ff",position:"absolute" },
  thumb: { width:20,height:20,borderRadius:10,backgroundColor:"#fff",position:"absolute",top:-7,marginLeft:-10,borderWidth:3,borderColor:"#4df9ff" },
  ticks: { flexDirection:"row",justifyContent:"space-between",marginTop:4 },
  tick: { color:C.textMuted,fontSize:9.5 },
});

const co = StyleSheet.create({
  header: { flexDirection:"row",alignItems:"center",gap:14,marginBottom:14,backgroundColor:"rgba(77,255,195,0.07)",borderRadius:18,borderWidth:1,borderColor:"rgba(77,255,195,0.22)",padding:14 },
  avatar: { fontSize:36 },
  name: { color:"#eef5ff",fontSize:18,fontWeight:"900" },
  status: { color:"#4dffc3",fontSize:10.5,marginTop:3,fontWeight:"800" },
  capabilities: { flexDirection:"row",flexWrap:"wrap",gap:6,marginBottom:14 },
  capItem: { paddingHorizontal:10,paddingVertical:5,borderRadius:20,backgroundColor:"rgba(255,255,255,0.05)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)" },
  capText: { color:"#8ab8d8",fontSize:11 },
  chat: { gap:9,marginBottom:16 },
  bubble: { borderRadius:16,padding:13,maxWidth:"90%" },
  bubbleCosmo: { backgroundColor:"rgba(4,10,28,0.97)",borderWidth:1,borderColor:"rgba(110,165,255,0.20)",alignSelf:"flex-start" },
  bubbleUser: { backgroundColor:"#4df9ff",alignSelf:"flex-end" },
  bubbleText: { color:"#eef5ff",fontSize:13.5,lineHeight:20 },
  sugLabel: { color:C.textMuted,fontSize:9.5,fontWeight:"900",letterSpacing:1,marginBottom:9 },
  sugs: { gap:8 },
  sug: { borderRadius:14,padding:13,backgroundColor:"rgba(255,255,255,0.050)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",minHeight:44,justifyContent:"center" },
  sugQ: { color:"#8ab8d8",fontSize:12.5,lineHeight:18 },
  inputRow: { flexDirection:"row",gap:9,marginBottom:14,alignItems:"center" },
  input: { flex:1,height:46,borderRadius:14,paddingHorizontal:14,color:"#eef5ff",backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:"rgba(110,165,255,0.22)",fontSize:13.5 },
  sendBtn: { height:46,paddingHorizontal:16,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(77,249,255,0.16)",borderWidth:1,borderColor:"rgba(77,249,255,0.46)" },
  sendText: { color:"#4df9ff",fontSize:12.5,fontWeight:"900" },
});

const qz = StyleSheet.create({
  bar: { flexDirection:"row",alignItems:"center",gap:10,marginBottom:12 },
  prog: { flex:1,height:7,borderRadius:4,backgroundColor:"rgba(255,255,255,0.09)" },
  progFill: { height:7,borderRadius:4,backgroundColor:"#4df9ff" },
  scoreText: { color:"#8ab8d8",fontSize:14,fontWeight:"900" },
  qNum: { color:C.textMuted,fontSize:10.5,fontWeight:"900",letterSpacing:0.5,marginBottom:10 },
  qCard: { backgroundColor:"rgba(4,10,28,0.97)",borderRadius:18,borderWidth:1,borderColor:"rgba(255,209,102,0.26)",padding:18,alignItems:"center",marginBottom:14 },
  qEmoji: { fontSize:38,marginBottom:12 },
  qText: { color:"#eef5ff",fontSize:15,fontWeight:"700",textAlign:"center",lineHeight:23 },
  opts: { gap:9,marginBottom:12 },
  opt: { flexDirection:"row",alignItems:"center",gap:12,borderRadius:14,padding:14,backgroundColor:"rgba(255,255,255,0.050)",borderWidth:1,borderColor:"rgba(110,165,255,0.16)",minHeight:56 },
  optOk: { flexDirection:"row",alignItems:"center",gap:12,borderRadius:14,padding:14,backgroundColor:"rgba(77,255,195,0.10)",borderWidth:1,borderColor:"rgba(77,255,195,0.52)" },
  optErr: { flexDirection:"row",alignItems:"center",gap:12,borderRadius:14,padding:14,backgroundColor:"rgba(255,85,128,0.10)",borderWidth:1,borderColor:"rgba(255,85,128,0.52)" },
  optLetter: { width:30,height:30,borderRadius:9,backgroundColor:"rgba(77,249,255,0.14)",color:"#4df9ff",fontSize:12,fontWeight:"900",textAlign:"center",lineHeight:30 },
  optText: { color:"#eef5ff",fontSize:13.5,flex:1,lineHeight:19 },
  expl: { backgroundColor:"rgba(77,249,255,0.06)",borderRadius:14,borderWidth:1,borderColor:"rgba(77,249,255,0.22)",padding:16 },
  explTitle: { color:"#eef5ff",fontSize:15,fontWeight:"900",marginBottom:7 },
  explText: { color:"#8ab8d8",fontSize:12.5,lineHeight:19,marginBottom:14 },
  nextBtn: { backgroundColor:"#4df9ff",borderRadius:12,padding:14,alignItems:"center" },
  nextText: { color:"#01020a",fontSize:14.5,fontWeight:"900" },
  done: { alignItems:"center",paddingVertical:32,paddingHorizontal:14,gap:12 },
  doneEmoji: { fontSize:64 },
  doneTitle: { color:"#eef5ff",fontSize:26,fontWeight:"900" },
  doneScore: { color:"#4df9ff",fontSize:46,fontWeight:"900" },
  doneSub: { color:"#8ab8d8",fontSize:14.5,textAlign:"center",lineHeight:22 },
  restartBtn: { marginTop:10,backgroundColor:"rgba(77,249,255,0.12)",borderRadius:14,paddingHorizontal:28,paddingVertical:14,borderWidth:1,borderColor:"rgba(77,249,255,0.44)" },
  restartText: { color:"#4df9ff",fontSize:14.5,fontWeight:"900" },
});

const sect = StyleSheet.create({
  title: { color:"#eef5ff",fontSize:19,fontWeight:"900",marginBottom:5 },
  sub: { color:"#8ab8d8",fontSize:12.5,marginBottom:14 },
});
