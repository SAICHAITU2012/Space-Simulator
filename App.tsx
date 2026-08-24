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
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import { Gyroscope } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as THREE from "three";

import { PLANETS, Planet, PLANET_BY_ID } from "./src/data/spaceData";
import { LabInputs, calculateLabOutcome } from "./src/lib/physics";
import { MISSIONS } from "./src/data/missions";
import { CONSTELLATIONS } from "./src/data/constellations";
import { QUIZ_QUESTIONS } from "./src/data/quiz";
import { EXPERIMENTS } from "./src/data/experiments";
import { AGENCIES, Agency, AGENCY_BY_ID } from "./src/data/agencies";
import {
  SATELLITES, Satellite, SATELLITE_BY_ID, SATELLITES_BY_AGENCY, satVisualRadius,
} from "./src/data/satellites";
import { TIMELINE, TimelineEvent } from "./src/data/timeline";

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

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         "#030611",
  panel:      "rgba(2,6,18,0.97)",
  border:     "rgba(60,120,240,0.18)",
  borderGlow: "rgba(77,249,255,0.45)",
  cyan:       "#4df9ff",
  violet:     "#9b4dff",
  gold:       "#ffc845",
  green:      "#4dffb4",
  red:        "#ff4d6d",
  orange:     "#ff8c1a",
  text:       "#e8f4ff",
  textSub:    "#5c8db5",
  textMuted:  "#243850",
  earthBlue:  "#1a6dff",
};

const PANEL_PEEK = 88;
const PANEL_OPEN = SH * 0.60;

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [entered,           setEntered]           = useState(false);
  const [section,           setSection]           = useState<Section>("universe");
  const [selectedPlanetId,  setSelectedPlanetId]  = useState("earth");
  const [selectedSatId,     setSelectedSatId]     = useState<string | null>(null);
  const [selectedAgencyId,  setSelectedAgencyId]  = useState<string | null>(null);
  const [paused,            setPaused]            = useState(false);
  const [speed,             setSpeed]             = useState(1);
  const [motionEnabled,     setMotionEnabled]     = useState(false);
  const [floatingCard,      setFloatingCard]      = useState<"planet" | "satellite" | null>(null);
  const [activeExperimentId,setActiveExperimentId]= useState<string | null>(null);
  const [labInputs,         setLabInputs]         = useState<LabInputs>({
    massScale: 1, radiusScale: 1, velocityScale: 1,
    gravityScale: 1, rotationScale: 1, moonDistScale: 1,
  });

  const camRef    = useRef({ yaw: 0.18, pitch: 0.36, zoom: 38 });
  const motionRef = useRef({ x: 0, y: 0 });
  const pendingTap       = useRef<{ x: number; y: number } | null>(null);
  const planetScreenPos  = useRef<Record<string, { x: number; y: number }>>({});
  const satScreenPos     = useRef<Record<string, { x: number; y: number }>>({});
  const isInteracting    = useRef(false);

  // Panel
  const panelAnim   = useRef(new Animated.Value(PANEL_PEEK)).current;
  const panelIsOpen = useRef(false);
  const panelStartH = useRef(PANEL_PEEK);

  const selectedPlanet = PLANET_BY_ID[selectedPlanetId] ?? PLANET_BY_ID.earth;
  const selectedSat    = selectedSatId ? SATELLITE_BY_ID[selectedSatId] : null;
  const selectedAgency = selectedAgencyId ? AGENCY_BY_ID[selectedAgencyId] : null;
  const agencyFilter   = selectedAgencyId
    ? SATELLITES.filter(s => s.agencyId === selectedAgencyId)
    : null;

  const labOutcome = useMemo(
    () => calculateLabOutcome(selectedPlanet, labInputs),
    [labInputs, selectedPlanet]
  );

  // Gyroscope
  useEffect(() => {
    if (!motionEnabled) { motionRef.current = { x: 0, y: 0 }; return undefined; }
    Gyroscope.setUpdateInterval(80);
    const sub = Gyroscope.addListener(({ x, y }) => {
      motionRef.current = {
        x: THREE.MathUtils.clamp(x, -1.2, 1.2),
        y: THREE.MathUtils.clamp(y, -1.2, 1.2),
      };
    });
    return () => sub.remove();
  }, [motionEnabled]);

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
          camRef.current.zoom = THREE.MathUtils.clamp(
            touchSnap.current.zoom + (touchSnap.current.dist - d) * 0.055, 8, 90
          );
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
        panelStartH.current = panelIsOpen.current ? PANEL_OPEN : PANEL_PEEK;
      },
      onPanResponderMove: (_, g) => {
        panelAnim.setValue(
          Math.max(PANEL_PEEK, Math.min(PANEL_OPEN, panelStartH.current - g.dy))
        );
      },
      onPanResponderRelease: (_, g) => {
        const mid = (PANEL_OPEN + PANEL_PEEK) / 2;
        snapPanel(g.vy < -0.4 || (g.vy >= 0 && panelStartH.current - g.dy > mid));
      },
    }),
    []
  );

  const snapPanel = (open: boolean) => {
    panelIsOpen.current = open;
    Animated.spring(panelAnim, { toValue: open ? PANEL_OPEN : PANEL_PEEK, tension: 85, friction: 13, useNativeDriver: false }).start();
  };

  const onPlanetTapped = useCallback((id: string) => {
    const p = PLANET_BY_ID[id]; if (!p) return;
    setSelectedPlanetId(id);
    setFloatingCard("planet");
    camRef.current.zoom = THREE.MathUtils.clamp(p.orbitRadius * 1.28 + 7, 14, 62);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, []);

  const onSatTapped = useCallback((id: string) => {
    if (!SATELLITE_BY_ID[id]) return;
    setSelectedSatId(id);
    setFloatingCard("satellite");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, []);

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

  if (!entered) {
    return <HomeScreen onEnter={() => setEntered(true)} onSection={s => { setSection(s as Section); setEntered(true); }} />;
  }

  const showEarthHub = section === "earthhub";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />

      {/* ── Full-screen 3D Canvas ── */}
      <View style={StyleSheet.absoluteFillObject} {...canvasPan.panHandlers}>
        <Canvas
          camera={{ position: [0, 18, 38], fov: 50, near: 0.01, far: 2000 }}
          gl={{
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
        >
          <color attach="background" args={[C.bg]} />
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
                motionRef={motionRef}
                isInteracting={isInteracting}
                pendingTap={pendingTap}
                planetScreenPos={planetScreenPos}
                labInputs={labInputs}
                onPlanetTapped={onPlanetTapped}
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
              <GlassBtn label="⌂" onPress={() => {
                camRef.current = showEarthHub ? { yaw: 0.2, pitch: 0.5, zoom: 14 } : { yaw: 0.18, pitch: 0.36, zoom: 38 };
                setFloatingCard(null);
              }} />
            </View>
          </View>
        </SafeAreaView>

        {/* Floating card — planet */}
        {floatingCard === "planet" && !showEarthHub && (
          <View style={ui.floatingCard} pointerEvents="auto">
            <View style={ui.fcRow}>
              <Text style={ui.fcEmoji}>{selectedPlanet.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={ui.fcName}>{selectedPlanet.name}</Text>
                <Text style={ui.fcNick}>{selectedPlanet.nickname.toUpperCase()}</Text>
              </View>
              <Pressable onPress={() => setFloatingCard(null)}>
                <Text style={{ color: C.textSub, fontSize: 22, paddingHorizontal: 8 }}>×</Text>
              </Pressable>
            </View>
            <Text style={ui.fcFact} numberOfLines={2}>{selectedPlanet.funFacts[0]}</Text>
            <View style={ui.fcBtns}>
              <Pressable style={ui.fcBtn} onPress={() => { setSection("universe"); snapPanel(true); }}>
                <Text style={ui.fcBtnText}>🔍  Explore</Text>
              </Pressable>
              <Pressable style={[ui.fcBtn, ui.fcBtnCyan]} onPress={() => activateExperiment("earth_spin_faster")}>
                <Text style={[ui.fcBtnText, { color: C.cyan }]}>🧪  Experiment</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Floating card — satellite */}
        {floatingCard === "satellite" && selectedSat && (
          <View style={ui.floatingCard} pointerEvents="auto">
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
                <Text style={{ color: C.textSub, fontSize: 22, paddingHorizontal: 8 }}>×</Text>
              </Pressable>
            </View>
            <View style={[ui.statusChip, { borderColor: selectedSat.status === "active" ? C.green + "55" : C.red + "55" }]}>
              <View style={[ui.statusDot, { backgroundColor: selectedSat.status === "active" ? C.green : selectedSat.status === "retired" ? C.gold : C.red }]} />
              <Text style={[ui.statusText, { color: selectedSat.status === "active" ? C.green : selectedSat.status === "retired" ? C.gold : C.red }]}>
                {selectedSat.status.toUpperCase()}  ·  Alt: {selectedSat.altitude.toLocaleString()} km  ·  {selectedSat.inclination}° inc
              </Text>
            </View>
            <Text style={ui.fcFact} numberOfLines={2}>{selectedSat.headline}</Text>
            <Pressable style={[ui.fcBtn, ui.fcBtnCyan, { marginTop: 4 }]} onPress={() => { setSection("earthhub"); snapPanel(true); }}>
              <Text style={[ui.fcBtnText, { color: C.cyan }]}>🔍  Full Mission Details</Text>
            </Pressable>
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

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.tabRail} style={ui.tabScroll}>
            {SECTIONS.map(s => (
              <Pressable key={s.id} style={[ui.tab, section === s.id && ui.tabActive]} onPress={() => switchToSection(s.id)}>
                <Text style={ui.tabEmoji}>{s.emoji}</Text>
                <Text style={[ui.tabLabel, section === s.id && ui.tabLabelActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Content */}
          <ScrollView style={ui.sheetContent} showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            {section === "universe"  && <UniversePanel selectedPlanet={selectedPlanet} onFocus={id => { setSelectedPlanetId(id); const r = PLANET_BY_ID[id]?.orbitRadius; camRef.current.zoom = THREE.MathUtils.clamp(r !== undefined ? r * 1.28 + 7 : 38, 14, 62); Haptics.selectionAsync().catch(() => undefined); }} speed={speed} setSpeed={setSpeed} zoomIn={() => { camRef.current.zoom = Math.max(8, camRef.current.zoom - 6); }} zoomOut={() => { camRef.current.zoom = Math.min(90, camRef.current.zoom + 6); }} />}
            {section === "earthhub" && <EarthHubPanel selectedSat={selectedSat} onSelectSat={id => { setSelectedSatId(id); setFloatingCard("satellite"); }} selectedAgencyId={selectedAgencyId} onSelectAgency={id => { setSelectedAgencyId(id === selectedAgencyId ? null : id); }} />}
            {section === "agencies" && <AgenciesPanel selectedAgencyId={selectedAgencyId} onSelect={id => { setSelectedAgencyId(id); setSection("earthhub"); snapPanel(true); }} />}
            {section === "missions" && <MissionsPanel />}
            {section === "timeline" && <TimelinePanel />}
            {section === "lab" && <LabPanel planet={selectedPlanet} inputs={labInputs} setInputs={setLabInputs} outcome={labOutcome} activeExperimentId={activeExperimentId} setActiveExperimentId={setActiveExperimentId} onActivateExperiment={activateExperiment} />}
            {section === "cosmo" && <CosmoPanel onActivateExperiment={activateExperiment} onSection={switchToSection} onSelectAgency={id => { setSelectedAgencyId(id); setSection("earthhub"); snapPanel(true); }} />}
            {section === "quiz" && <QuizPanel />}
            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HOME_TILES: Array<{ id: string; emoji: string; label: string; sub: string; grad: [string, string] }> = [
  { id: "universe",  emoji: "🌌", label: "Universe",  sub: "3D Solar System",        grad: ["#091e4a","#030c1e"] },
  { id: "earthhub",  emoji: "🌍", label: "Earth Hub", sub: "Satellites in orbit",    grad: ["#001a2e","#00090f"] },
  { id: "agencies",  emoji: "🏛",  label: "Agencies",  sub: "Who explores space",     grad: ["#1a0535","#07011a"] },
  { id: "missions",  emoji: "🚀", label: "Missions",  sub: "Historic journeys",      grad: ["#0f1c00","#060900"] },
  { id: "timeline",  emoji: "🕒", label: "Timeline",  sub: "From Sputnik to now",    grad: ["#001829","#00070f"] },
  { id: "lab",       emoji: "🧪", label: "Lab",       sub: "Play with physics",      grad: ["#001c12","#00080a"] },
  { id: "cosmo",     emoji: "🤖", label: "Cosmo AI",  sub: "Ask anything",           grad: ["#1a0020","#090010"] },
  { id: "quiz",      emoji: "🎯", label: "Quiz",      sub: "Test your knowledge",    grad: ["#140010","#060005"] },
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
              See 15 key satellites orbiting Earth in real-time 3D. Filter by agency. Tap to explore full mission details.
            </Text>
            <Pressable onPress={() => onSection("earthhub")}>
              <Text style={hs.killFeatCta}>Open Earth Hub →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── 3D SOLAR SYSTEM SCENE ───────────────────────────────────────────────────
function SolarScene({
  selectedId, paused, speed, camRef, motionRef, isInteracting,
  pendingTap, planetScreenPos, labInputs, onPlanetTapped,
}: {
  selectedId: string; paused: boolean; speed: number;
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  pendingTap: React.MutableRefObject<{ x: number; y: number } | null>;
  planetScreenPos: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  labInputs: LabInputs;
  onPlanetTapped: (id: string) => void;
}) {
  return (
    <>
      {/* Directional SUN light — positioned at [0,0,0] looking outward = realistic terminator */}
      <ambientLight intensity={0.04} />
      {/* Main sunlight — this is what creates the day/night terminator on planets */}
      <directionalLight
        position={[0, 0, 0]}
        target-position={[0, 0, 50]}
        intensity={0}
      />
      {/* Treat Sun as point light — radiates outward in all directions */}
      <pointLight position={[0, 0, 0]} intensity={1100} color="#fff8e0" decay={2} distance={0} />
      {/* Subtle blue fill from "opposite" side — simulates starlight */}
      <pointLight position={[0, 28, 0]} intensity={12} color="#2040cc" decay={2} />
      <CameraRig camRef={camRef} motionRef={motionRef} isInteracting={isInteracting} earthHub={false} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={planetScreenPos} onTapped={onPlanetTapped} />
      <MilkyWayBand />
      <StarField />
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

  const visibleSats = agencyFilter ?? SATELLITES;

  return (
    <>
      {/* Directional sun for Earth Hub — creates real day/night terminator on Earth */}
      <ambientLight intensity={0.08} />
      {/* Key light — Sun direction (comes from top-right, tilted 23.5° for Earth's axial tilt) */}
      <directionalLight
        position={[12, 4, 8]}
        intensity={2.2}
        color="#fff6e0"
      />
      {/* Earth-shine fill — faint blue bounce light from Earth itself */}
      <directionalLight position={[-5, -2, -5]} intensity={0.12} color="#2244aa" />
      {/* Cold space fill — very dim, stops the dark side being pure black */}
      <hemisphereLight args={["#001133", "#000011", 0.06]} />
      <CameraRig camRef={camRef} motionRef={motionRef} isInteracting={isInteracting} earthHub={true} />
      <ObjectTapDetector pendingTap={pendingTap} screenPos={satScreenPos} onTapped={onSatTapped} />
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
  const cloudRef  = useRef<THREE.Mesh>(null);
  const cloud2Ref = useRef<THREE.Mesh>(null);
  const atmoRef   = useRef<THREE.Mesh>(null);
  const limb1Ref  = useRef<THREE.Mesh>(null);
  const limb2Ref  = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    // Earth rotates — realistic ~24hr period scaled for visual
    if (earthRef.current)  earthRef.current.rotation.y  += delta * 0.068;
    // Clouds rotate slightly faster — simulates stratospheric winds
    if (cloudRef.current)  cloudRef.current.rotation.y  += delta * 0.085;
    if (cloud2Ref.current) cloud2Ref.current.rotation.y -= delta * 0.055; // counter-rotating band
    // Atmosphere limb pulse — simulates aurora-like variation
    if (atmoRef.current)  (atmoRef.current.material  as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(t * 0.55) * 0.06;
    if (limb1Ref.current) (limb1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.11 + Math.sin(t * 0.38 + 1.2) * 0.03;
    if (limb2Ref.current) (limb2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 0.22 + 2.5) * 0.012;
  });

  return (
    <group>
      {/* ── Layer 1: Earth Surface (PBR) ────────────────────────────────────
          MeshStandardMaterial gives realistic specular highlights on oceans
          and diffuse scattering on continents — the same principle as NASA Eyes */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 72, 72]} />
        <meshStandardMaterial
          color="#1a4fa8"        /* deep ocean blue */
          roughness={0.62}       /* oceans ~0.3, averaged with land ~0.85 */
          metalness={0.04}       /* slight specularity for water glint */
          emissive="#000820"     /* faint blue self-glow — night side city lights */
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* ── Layer 2: Continent patches (additive overlay gives land tone) ─── */}
      <mesh ref={cloudRef} rotation={[0.12, 0, 0.05]}>
        <sphereGeometry args={[2.21, 48, 48]} />
        <meshBasicMaterial
          color="#3a7a30"   /* vegetation green mixed with desert tan */
          transparent opacity={0.14}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* ── Layer 3: Cloud deck — realistic cloud layer ──────────────────────
          Rotates faster than surface (stratospheric winds ~10% faster)
          Tilted slightly to break perfect symmetry — looks natural */}
      <mesh ref={cloud2Ref} rotation={[0.08, 0.3, -0.06]}>
        <sphereGeometry args={[2.235, 48, 48]} />
        <meshBasicMaterial
          color="#d8eaff"
          transparent opacity={0.18}
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
  const dotRef    = useRef<THREE.Mesh>(null);
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
        x: ((wp.x + 1) / 2) * SW,
        y: ((-wp.y + 1) / 2) * SH,
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
        {/* The satellite marker is placed on the orbit ring */}
        <mesh ref={dotRef} position={[vRadius, 0, 0]}>
          <sphereGeometry args={[dotSize, 10, 10]} />
          <meshBasicMaterial color={dotColor} />
        </mesh>
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

// ── Camera Rig ────────────────────────────────────────────────────────────────
function CameraRig({
  camRef, motionRef, isInteracting, earthHub,
}: {
  camRef: React.MutableRefObject<{ yaw: number; pitch: number; zoom: number }>;
  motionRef: React.MutableRefObject<{ x: number; y: number }>;
  isInteracting: React.MutableRefObject<boolean>;
  earthHub: boolean;
}) {
  const { camera } = useThree();
  const lastInteract = useRef(0);
  const autoYaw      = useRef(camRef.current.yaw);

  useFrame((_, delta) => {
    if (isInteracting.current) lastInteract.current = Date.now();
    if (Date.now() - lastInteract.current > 3500 && !isInteracting.current) {
      autoYaw.current += delta * (earthHub ? 0.025 : 0.038);
      camRef.current.yaw = autoYaw.current;
    } else {
      autoYaw.current = camRef.current.yaw;
    }

    const yaw   = camRef.current.yaw   + motionRef.current.y * 0.1;
    const pitch = camRef.current.pitch + motionRef.current.x * 0.07;
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
  // layer refs: surface shimmer, inner corona, mid corona, outer halo, wide halo, mega halo
  const surf = useRef<THREE.Mesh>(null);
  const l1   = useRef<THREE.Mesh>(null);
  const l2   = useRef<THREE.Mesh>(null);
  const l3   = useRef<THREE.Mesh>(null);
  const l4   = useRef<THREE.Mesh>(null);
  const l5   = useRef<THREE.Mesh>(null);
  const sunCore = useRef<THREE.Mesh>(null);

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
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshStandardMaterial
          color="#fff8d0"
          emissive="#ffb200"
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
  const v1=useMemo(()=>mkStars(2400,92,180),[]);
  const v2=useMemo(()=>mkStars(600,90,155),[]);
  const v3=useMemo(()=>mkStars(120,90,145),[]);
  const v4=useMemo(()=>mkStars(200,108,170),[]);   // blue tint
  const v5=useMemo(()=>mkStars(60,95,150),[]);     // warm giant stars
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
  const v=useMemo(()=>{ const a:number[]=[];for(let i=0;i<4000;i++){const ang=Math.random()*Math.PI*2,r=120+Math.random()*60,sp=(Math.random()-0.5)*28*(1-Math.abs(Math.sin(ang))*0.5);a.push(Math.cos(ang)*r,sp,Math.sin(ang)*r);}return new Float32Array(a);},[]);
  return <points rotation={[0.42,0,0.26]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[v,3]}/></bufferGeometry><pointsMaterial size={0.07} color="#b8ccee" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false}/></points>;
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
      screenPos.current[planet.id] = { x:((wp.x+1)/2)*SW, y:((-wp.y+1)/2)*SH };
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
          <sphereGeometry args={[vR, 48, 48]} />
          {/* PBR MeshStandardMaterial — responds to directional sunlight realistically */}
          <meshStandardMaterial
            color={planet.color}
            roughness={planet.id === "earth" ? 0.55 : planet.id === "mercury" ? 0.92 : 0.78}
            metalness={planet.id === "mercury" ? 0.25 : 0.02}
            emissive={selected ? new THREE.Color(planet.color).multiplyScalar(0.12) : new THREE.Color(0, 0, 0)}
            emissiveIntensity={selected ? 1 : 0}
          />
        </mesh>
        <mesh><sphereGeometry args={[vR*1.12,32,32]}/><meshBasicMaterial color={planet.color} transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
        {selected&&<mesh ref={glowRef}><sphereGeometry args={[vR*1.28,24,24]}/><meshBasicMaterial color={C.cyan} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
        {planet.ring&&<mesh rotation={[Math.PI/2.1,0,0]}><ringGeometry args={[vR*1.42,vR*2.2,80]}/><meshBasicMaterial color="#d9c49c" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false}/></mesh>}
        {planet.moons>0&&planet.id!=="jupiter"&&<mesh position={[vR*2.4,0,0]}><sphereGeometry args={[Math.max(0.06,vR*0.22),16,16]}/><meshPhongMaterial color="#c8d0e0" shininess={5}/></mesh>}
      </group>
    </group>
  );
}

// ── Asteroid Belt ─────────────────────────────────────────────────────────────
function AsteroidBelt({ paused, speed }: { paused: boolean; speed: number }) {
  const gRef = useRef<THREE.Group>(null);
  const asts = useMemo(()=>Array.from({length:110},(_,i)=>{ const a=i*0.395,r=25.5+Math.sin(i*8.1)*2.3; return {pos:[Math.cos(a)*r,Math.sin(i*1.1)*0.2,Math.sin(a)*r] as [number,number,number], scale:0.055+(i%6)*0.018, color:["#7a706a","#8a8078","#6a5e58","#9a8e88"][i%4]}; }),[]);
  useFrame((_,delta)=>{ if(!paused&&gRef.current) gRef.current.rotation.y+=delta*0.022*speed; });
  return <group ref={gRef}>{asts.map((a,i)=><mesh key={i} position={a.pos} scale={a.scale}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={a.color} roughness={0.95}/></mesh>)}</group>;
}

// ─── UNIVERSE PANEL ──────────────────────────────────────────────────────────
function UniversePanel({ selectedPlanet, onFocus, speed, setSpeed, zoomIn, zoomOut }: {
  selectedPlanet: Planet; onFocus: (id: string) => void;
  speed: number; setSpeed: (v: number) => void; zoomIn: () => void; zoomOut: () => void;
}) {
  const [factIdx, setFactIdx] = useState(0);
  return (
    <View style={pw.wrap}>
      <LinearGradient colors={selectedPlanet.gradientColors} style={pw.hero}>
        <Text style={pw.heroEmoji}>{selectedPlanet.emoji}</Text>
        <View style={{ flex:1 }}>
          <Text style={pw.heroName}>{selectedPlanet.name}</Text>
          <Text style={pw.heroNick}>{selectedPlanet.nickname.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection:"row", gap:6 }}>
          <GlassBtn label="+" onPress={zoomIn} small /><GlassBtn label="−" onPress={zoomOut} small />
        </View>
      </LinearGradient>

      <Pressable style={pw.factCard} onPress={() => setFactIdx(i => (i+1)%3)}>
        <Text style={pw.factQuote}>"{selectedPlanet.funFacts[factIdx]}"</Text>
        <Text style={pw.factTap}>TAP FOR NEXT FACT</Text>
      </Pressable>

      <View style={pw.statsRow}><MiniStat l="Gravity" v={`${selectedPlanet.gravity}g`} accent={C.cyan}/><MiniStat l="Day" v={selectedPlanet.day} accent={C.gold}/><MiniStat l="Moons" v={`${selectedPlanet.moons}`} accent={C.violet}/></View>
      <View style={pw.statsRow}><MiniStat l="Temp" v={`${selectedPlanet.temperature}°C`} accent={C.red}/><MiniStat l="Year" v={selectedPlanet.year} accent={C.green}/><MiniStat l="Dist" v={`${selectedPlanet.distanceAU} AU`} accent={C.orange}/></View>

      <View style={pw.atmo}><Text style={pw.atmoLabel}>ATMOSPHERE</Text><Text style={pw.atmoText}>{selectedPlanet.atmosphere}</Text></View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:12 }}>
        <View style={{ flexDirection:"row", gap:7 }}>
          {PLANETS.map(pl=>(
            <Pressable key={pl.id} style={[pw.chip, pl.id===selectedPlanet.id&&pw.chipActive]} onPress={()=>onFocus(pl.id)}>
              <View style={[pw.chipDot,{backgroundColor:pl.color}]}/><Text style={[pw.chipText, pl.id===selectedPlanet.id&&{color:C.cyan}]}>{pl.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

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

// ─── LAB PANEL ───────────────────────────────────────────────────────────────
function LabPanel({ planet, inputs, setInputs, outcome, activeExperimentId, setActiveExperimentId, onActivateExperiment }: {
  planet: Planet; inputs: LabInputs; setInputs: (i: LabInputs) => void;
  outcome: ReturnType<typeof calculateLabOutcome>;
  activeExperimentId: string | null; setActiveExperimentId: (id: string | null) => void;
  onActivateExperiment: (id: string) => void;
}) {
  const activeExp = EXPERIMENTS.find(e => e.id === activeExperimentId);
  const expVals   = activeExp ? activeExp.params.reduce<Record<string,number>>((a,p)=>{ a[p.key]=(inputs as Record<string,number>)[p.key]??p.defaultValue; return a; },{}) : {};
  const set = (k: string, v: number) => setInputs({ ...inputs, [k]: v });
  const reset = () => { setInputs({massScale:1,radiusScale:1,velocityScale:1,gravityScale:1,rotationScale:1,moonDistScale:1}); setActiveExperimentId(null); };

  return (
    <View style={pw.wrap}>
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

function CosmoPanel({ onActivateExperiment, onSection, onSelectAgency }: {
  onActivateExperiment: (id: string) => void; onSection: (s: Section) => void;
  onSelectAgency: (id: string) => void;
}) {
  const [msgs, setMsgs] = useState<CosmoMsg[]>([
    { from:"cosmo", text:"👋 Hi! I'm Cosmo — your AI guide to humanity's presence in space.\n\nI can show you satellites, navigate to agencies, launch experiments, and answer anything about space. What would you like to explore?" }
  ]);

  const ask = (qa: typeof COSMO_QA[number]) => {
    setMsgs(prev => [...prev, {from:"user",text:qa.q}, {from:"cosmo",text:qa.a}]);
    setTimeout(() => {
      if (qa.expId) onActivateExperiment(qa.expId);
      else if (qa.agencyId) { onSelectAgency(qa.agencyId); if (qa.section) onSection(qa.section); }
      else if (qa.section) onSection(qa.section);
    }, 600);
  };

  return (
    <View style={pw.wrap}>
      <View style={co.header}>
        <Text style={co.avatar}>🤖</Text>
        <View>
          <Text style={co.name}>Cosmo</Text>
          <Text style={co.status}>● Space AI  ·  Knowledge Graph  ·  Offline-ready</Text>
        </View>
      </View>

      <View style={co.capabilities}>
        {["🛰 Navigate to any satellite","🏛 Filter by space agency","🧪 Launch experiments","🕒 Explore space history","🌍 Earth Hub guide"].map((c2,i)=>(
          <View key={i} style={co.capItem}><Text style={co.capText}>{c2}</Text></View>
        ))}
      </View>

      <View style={co.chat}>
        {msgs.map((m,i)=>(
          <View key={i} style={[co.bubble, m.from==="user"?co.bubbleUser:co.bubbleCosmo]}>
            <Text style={[co.bubbleText, m.from==="user"&&{color:C.bg}]}>{m.text}</Text>
          </View>
        ))}
      </View>

      <Text style={co.sugLabel}>ASK ME ANYTHING</Text>
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

// ─── QUIZ PANEL ───────────────────────────────────────────────────────────────
function QuizPanel() {
  const qs = useMemo(()=>QUIZ_QUESTIONS.slice(0,10),[]);
  const [qi,setQi]=useState(0);const [sel,setSel]=useState<number|null>(null);
  const [score,setScore]=useState(0);const [streak,setStreak]=useState(0);const [done,setDone]=useState(false);
  const q=qs[qi];
  const answer=(i:number)=>{ if(sel!==null||!q)return;setSel(i);if(i===q.correctIndex){setScore(s=>s+1);setStreak(s=>s+1);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>undefined);}else{setStreak(0);Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(()=>undefined);}};
  const next=()=>{ if(qi>=qs.length-1){setDone(true);return;}setQi(i=>i+1);setSel(null);};
  const restart=()=>{setQi(0);setSel(null);setScore(0);setStreak(0);setDone(false);};

  if(done)return(<View style={qz.done}><Text style={qz.doneEmoji}>🏆</Text><Text style={qz.doneTitle}>Quiz Complete!</Text><Text style={qz.doneScore}>{score}/{qs.length}</Text><Text style={qz.doneSub}>{score>=8?"Space genius! 🌟":score>=5?"Great explorer! 🚀":"Keep exploring! 🌌"}</Text><Pressable style={qz.restartBtn} onPress={restart}><Text style={qz.restartText}>Try Again</Text></Pressable></View>);
  if(!q)return null;

  return (
    <View style={pw.wrap}>
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
      {sel!==null&&(<View style={qz.expl}><Text style={qz.explTitle}>{sel===q.correctIndex?"✅ Correct!":"❌ Not quite"}</Text><Text style={qz.explText}>{q.explanation}</Text><Pressable style={qz.nextBtn} onPress={next}><Text style={qz.nextText}>{qi>=qs.length-1?"See Results":"Next →"}</Text></Pressable></View>)}
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
  topBar: { flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:16,paddingTop:8,paddingBottom:4 },
  topRight: { flexDirection:"row",gap:7 },
  appName: { color:C.textSub,fontSize:12,fontWeight:"900",letterSpacing:3 },
  appSub: { color:C.textMuted,fontSize:9,marginTop:1,letterSpacing:0.5 },
  glassBtn: { width:40,height:40,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(3,8,24,0.8)",borderWidth:1,borderColor:C.border },
  glassBtnSm: { width:34,height:34,borderRadius:10 },
  glassBtnText: { color:C.text,fontSize:17 },
  floatingCard: { position:"absolute",top:88,left:14,right:14,backgroundColor:"rgba(3,7,20,0.95)",borderRadius:18,borderWidth:1,borderColor:C.borderGlow,padding:14 },
  fcRow: { flexDirection:"row",alignItems:"center",gap:10,marginBottom:8 },
  fcEmoji: { fontSize:28 },
  fcName: { color:C.text,fontSize:17,fontWeight:"900" },
  fcNick: { color:C.textSub,fontSize:9,fontWeight:"800",letterSpacing:1.5,marginTop:2 },
  fcFact: { color:C.textSub,fontSize:12,lineHeight:17,marginBottom:10,fontStyle:"italic" },
  fcBtns: { flexDirection:"row",gap:8 },
  fcBtn: { flex:1,height:36,alignItems:"center",justifyContent:"center",borderRadius:10,backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:C.border },
  fcBtnCyan: { borderColor:"rgba(77,249,255,0.4)",backgroundColor:"rgba(77,249,255,0.08)" },
  fcBtnText: { color:C.text,fontSize:12,fontWeight:"800" },
  statusChip: { flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:8,paddingVertical:3,borderRadius:8,borderWidth:1,backgroundColor:"rgba(255,255,255,0.04)",alignSelf:"flex-start" },
  statusDot: { width:6,height:6,borderRadius:3 },
  statusText: { fontSize:9,fontWeight:"900" },
  earthBadge: { position:"absolute",top:90,alignSelf:"center",backgroundColor:"rgba(3,7,20,0.85)",borderRadius:20,paddingHorizontal:16,paddingVertical:8,borderWidth:1,borderColor:"rgba(26,109,255,0.4)" },
  earthBadgeText: { color:C.text,fontSize:13,fontWeight:"900",textAlign:"center" },
  earthBadgeSub: { color:C.textSub,fontSize:10,textAlign:"center",marginTop:2 },
  sheet: { position:"absolute",bottom:0,left:0,right:0,backgroundColor:C.panel,borderTopLeftRadius:22,borderTopRightRadius:22,borderTopWidth:1,borderLeftWidth:1,borderRightWidth:1,borderColor:C.border,overflow:"hidden" },
  handleArea: { paddingTop:10,paddingHorizontal:16,paddingBottom:6 },
  handle: { width:38,height:4,borderRadius:2,backgroundColor:C.textMuted,alignSelf:"center",marginBottom:8 },
  handleRow: { flexDirection:"row",alignItems:"center",gap:10 },
  handleEmoji: { fontSize:22 },
  handlePlanet: { color:C.text,fontSize:15,fontWeight:"900" },
  handleNick: { color:C.textSub,fontSize:10,marginTop:1 },
  handleToggle: { width:30,height:30,borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:C.border },
  handleToggleText: { color:C.textSub,fontSize:15,fontWeight:"900" },
  tabScroll: { borderBottomWidth:1,borderBottomColor:C.border },
  tabRail: { gap:6,paddingHorizontal:12,paddingVertical:7 },
  tab: { flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:11,paddingVertical:7,borderRadius:20,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border },
  tabActive: { backgroundColor:"rgba(77,249,255,0.12)",borderColor:C.borderGlow },
  tabEmoji: { fontSize:13 },
  tabLabel: { color:C.textSub,fontSize:11,fontWeight:"800" },
  tabLabelActive: { color:C.cyan },
  sheetContent: { flex:1 },
});

const hs = StyleSheet.create({
  scroll: { paddingHorizontal:22,paddingTop:52,paddingBottom:44 },
  eyebrow: { color:C.textSub,fontSize:11,fontWeight:"900",letterSpacing:3,marginBottom:10 },
  headline: { color:C.text,fontSize:44,fontWeight:"900",letterSpacing:-1,lineHeight:48,marginBottom:14 },
  tagline: { color:C.textSub,fontSize:15,lineHeight:23,marginBottom:20 },
  agencyFlag: { alignItems:"center",paddingVertical:8,paddingHorizontal:12,borderRadius:12,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border },
  agencyFlagText: { fontSize:20 },
  agencyFlagLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",marginTop:3 },
  statsRow: { flexDirection:"row",gap:8,marginBottom:22 },
  statChip: { flex:1,alignItems:"center",paddingVertical:8,backgroundColor:"rgba(255,255,255,0.04)",borderRadius:12,borderWidth:1,borderColor:C.border },
  statN: { color:C.cyan,fontSize:18,fontWeight:"900" },
  statL: { color:C.textSub,fontSize:9,marginTop:2,fontWeight:"700" },
  ctaWrap: { alignSelf:"flex-start",borderRadius:30,overflow:"hidden" },
  cta: { paddingHorizontal:28,paddingVertical:16,borderRadius:30 },
  ctaText: { color:"#fff",fontSize:16,fontWeight:"900" },
  gridLabel: { color:C.textMuted,fontSize:10,fontWeight:"900",letterSpacing:2.5,marginBottom:12 },
  grid: { flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:28 },
  tile: { width:(SW-54)/2,borderRadius:16,overflow:"hidden" },
  tileGrad: { padding:16,minHeight:100,justifyContent:"flex-end" },
  tileEmoji: { fontSize:26,marginBottom:8 },
  tileLabel: { color:C.text,fontSize:14,fontWeight:"900" },
  tileSub: { color:C.textSub,fontSize:10,marginTop:2 },
  killFeat: { borderRadius:16,borderWidth:1,borderColor:"rgba(77,249,255,0.25)",backgroundColor:"rgba(3,10,30,0.85)",padding:18 },
  killFeatTag: { color:C.cyan,fontSize:10,fontWeight:"900",letterSpacing:2,marginBottom:6 },
  killFeatTitle: { color:C.text,fontSize:16,fontWeight:"900",marginBottom:8 },
  killFeatText: { color:C.textSub,fontSize:13,lineHeight:20,marginBottom:10 },
  killFeatCta: { color:C.cyan,fontWeight:"900",fontSize:13 },
  nebula: { position:"absolute",width:260,height:260,borderRadius:130,opacity:0.3,transform:[{scaleX:1.7}] },
});

const pw = StyleSheet.create({
  wrap: { paddingHorizontal:14,paddingTop:10 },
  hero: { flexDirection:"row",alignItems:"center",gap:12,borderRadius:16,padding:14,marginBottom:10,overflow:"hidden" },
  heroEmoji: { fontSize:28 },
  heroName: { color:C.text,fontSize:20,fontWeight:"900" },
  heroNick: { color:C.textSub,fontSize:9,fontWeight:"800",letterSpacing:1.5,marginTop:2 },
  factCard: { backgroundColor:"rgba(77,249,255,0.05)",borderRadius:12,borderWidth:1,borderColor:"rgba(77,249,255,0.14)",padding:12,marginBottom:10 },
  factQuote: { color:C.text,fontSize:13,lineHeight:20,fontStyle:"italic" },
  factTap: { color:C.textSub,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginTop:7 },
  statsRow: { flexDirection:"row",gap:6,marginBottom:6 },
  stat: { flex:1,borderRadius:10,backgroundColor:"rgba(255,255,255,0.04)",borderTopWidth:2,padding:9 },
  statVal: { fontSize:13,fontWeight:"900" },
  statL: { color:C.textMuted,fontSize:9,marginTop:2,textTransform:"uppercase",fontWeight:"700" },
  atmo: { backgroundColor:"rgba(255,255,255,0.03)",borderRadius:10,padding:10,marginBottom:4 },
  atmoLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:4 },
  atmoText: { color:C.textSub,fontSize:12 },
  chip: { flexDirection:"row",alignItems:"center",gap:5,borderRadius:20,paddingHorizontal:10,paddingVertical:7,backgroundColor:"rgba(255,255,255,0.05)",borderWidth:1,borderColor:C.border },
  chipActive: { borderColor:C.borderGlow,backgroundColor:"rgba(77,249,255,0.08)" },
  chipDot: { width:8,height:8,borderRadius:4 },
  chipText: { color:C.textSub,fontSize:11,fontWeight:"800" },
  speedRow: { marginTop:14,gap:6 },
  speedLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5 },
  speedBtns: { flexDirection:"row",gap:6 },
  speedBtn: { flex:1,height:34,alignItems:"center",justifyContent:"center",borderRadius:8,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:C.border },
  speedBtnActive: { backgroundColor:"rgba(77,249,255,0.18)",borderColor:C.borderGlow },
  speedBtnT: { color:C.textSub,fontSize:13,fontWeight:"900" },
  speedBtnTActive: { color:C.cyan },
});

const eh = StyleSheet.create({
  selectedCard: { backgroundColor:"rgba(6,14,38,0.95)",borderRadius:16,borderWidth:1,borderColor:C.borderGlow,padding:14,marginBottom:14 },
  selectedTop: { flexDirection:"row",gap:12,alignItems:"flex-start",marginBottom:10 },
  selectedEmoji: { fontSize:30 },
  selectedName: { color:C.text,fontSize:16,fontWeight:"900" },
  metaRow: { flexDirection:"row",gap:8,marginBottom:8 },
  metaItem: { flex:1 },
  metaL: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:2 },
  metaV: { color:C.text,fontSize:12,fontWeight:"700" },
  headline: { color:C.gold,fontSize:13,fontWeight:"800",marginBottom:8 },
  story: { color:C.textSub,fontSize:12,lineHeight:18,marginBottom:10 },
  discovLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:6 },
  discovItem: { flexDirection:"row",gap:8,marginBottom:5 },
  discovBullet: { color:C.cyan,fontSize:12,fontWeight:"900",width:12 },
  discovText: { color:C.text,fontSize:12,flex:1,lineHeight:17 },
  satRow: { flexDirection:"row",alignItems:"center",gap:10,padding:10,borderRadius:12,marginBottom:7,backgroundColor:"rgba(255,255,255,0.03)",borderWidth:1,borderColor:C.border },
  satRowActive: { backgroundColor:"rgba(77,249,255,0.08)",borderColor:C.borderGlow },
  satEmoji: { fontSize:20 },
  satName: { color:C.text,fontSize:13,fontWeight:"800" },
  satMeta: { color:C.textSub,fontSize:10,marginTop:2 },
  satStatus: { paddingHorizontal:7,paddingVertical:3,borderRadius:8,borderWidth:1 },
  satStatusText: { fontSize:9,fontWeight:"900" },
});

const ag = StyleSheet.create({
  chip: { flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:10,paddingVertical:8,borderRadius:20,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1 },
  chipActive: { },
  chipFlag: { fontSize:16 },
  chipName: { fontSize:11,fontWeight:"900" },
  card: { borderRadius:18,borderWidth:1,overflow:"hidden",marginBottom:8 },
  cardGrad: { padding:18 },
  cardTop: { flexDirection:"row",gap:14,alignItems:"flex-start",marginBottom:14 },
  cardFlag: { fontSize:40 },
  cardName: { color:C.text,fontSize:24,fontWeight:"900" },
  cardCountry: { fontSize:11,fontWeight:"800",marginTop:2 },
  cardFull: { color:C.textSub,fontSize:10,marginTop:4 },
  tagline: { color:C.textSub,fontSize:13,fontStyle:"italic",marginBottom:14 },
  statsGrid: { flexDirection:"row",gap:0,borderRadius:12,overflow:"hidden",borderWidth:1,borderColor:C.border,marginBottom:10 },
  statBox: { flex:1,alignItems:"center",paddingVertical:10,borderRightWidth:1,borderRightColor:C.border },
  statN: { fontSize:18,fontWeight:"900" },
  statL: { color:C.textSub,fontSize:9,marginTop:2,fontWeight:"700" },
  budgetRow: { color:C.textSub,fontSize:12,marginBottom:12 },
  story: { color:C.textSub,fontSize:13,lineHeight:20,marginBottom:12 },
  achLabel: { color:C.gold,fontSize:10,fontWeight:"900",letterSpacing:1.5,marginBottom:8 },
  achItem: { flexDirection:"row",gap:8,marginBottom:6 },
  achBullet: { fontSize:12,fontWeight:"900",width:14 },
  achText: { color:C.text,fontSize:12,flex:1,lineHeight:17 },
  jumpBtn: { borderRadius:12,borderWidth:1,padding:12,alignItems:"center",marginTop:14 },
  jumpBtnText: { fontSize:13,fontWeight:"900" },
});

const ms2 = StyleSheet.create({
  card: { borderRadius:16,padding:16,borderWidth:1,borderColor:"rgba(77,149,255,0.2)" },
  cardTop: { flexDirection:"row",gap:12,alignItems:"flex-start",marginBottom:12 },
  cardEmoji: { fontSize:32 },
  cardName: { color:C.text,fontSize:17,fontWeight:"900",marginBottom:6 },
  badges: { flexDirection:"row",gap:6,flexWrap:"wrap" },
  badge: { paddingHorizontal:8,paddingVertical:3,borderRadius:6,borderWidth:1,backgroundColor:"rgba(255,255,255,0.04)" },
  badgeT: { fontSize:10,fontWeight:"900" },
  infoRow: { flexDirection:"row",gap:12,marginBottom:10 },
  info: { flex:1 },
  infoL: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:3 },
  infoV: { color:C.text,fontSize:13,fontWeight:"700" },
  highlight: { color:C.gold,fontSize:13,fontWeight:"800",marginBottom:8 },
  story: { color:C.textSub,fontSize:12,lineHeight:19 },
});

const tl = StyleSheet.create({
  detail: { backgroundColor:"rgba(4,10,28,0.95)",borderRadius:16,borderWidth:1,padding:14,marginBottom:16 },
  detailTop: { flexDirection:"row",gap:10,alignItems:"flex-start",marginBottom:8 },
  detailEmoji: { fontSize:24 },
  detailTitle: { color:C.text,fontSize:15,fontWeight:"900" },
  detailCat: { fontSize:9,fontWeight:"900",letterSpacing:1.5,marginTop:3 },
  detailDesc: { color:C.textSub,fontSize:12,lineHeight:19,marginBottom:10 },
  significance: { borderRadius:10,borderWidth:1,padding:10 },
  sigLabel: { fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:4 },
  sigText: { color:C.text,fontSize:13,fontWeight:"700" },
  row: { flexDirection:"row",alignItems:"flex-start",gap:10,marginBottom:4,paddingVertical:6,paddingHorizontal:8,borderRadius:12 },
  rowActive: { backgroundColor:"rgba(77,249,255,0.06)",borderWidth:1,borderColor:C.borderGlow },
  yearCol: { width:38 },
  year: { color:C.textMuted,fontSize:10,fontWeight:"900" },
  dot: { width:10,height:10,borderRadius:5,marginTop:3,flexShrink:0 },
  line: { position:"absolute",left:60,top:20,width:1.5,backgroundColor:C.border },
  content: { flex:1,flexDirection:"row",alignItems:"flex-start",gap:8 },
  eventEmoji: { fontSize:20 },
  eventTitle: { color:C.text,fontSize:13,fontWeight:"800",flex:1 },
  eventMeta: { color:C.textSub,fontSize:10,marginTop:2 },
  catBadge: { paddingHorizontal:7,paddingVertical:3,borderRadius:8,borderWidth:1 },
  catText: { fontSize:8,fontWeight:"900" },
});

const lab = StyleSheet.create({
  header: { flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 },
  title: { color:C.text,fontSize:17,fontWeight:"900" },
  sub: { color:C.textSub,fontSize:12,marginTop:2,fontStyle:"italic" },
  resetBtn: { paddingHorizontal:12,paddingVertical:6,borderRadius:8,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:1,borderColor:C.border },
  resetText: { color:C.textSub,fontSize:12,fontWeight:"800" },
  expCard: { width:135,borderRadius:14,padding:12,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border },
  expCardActive: { backgroundColor:"rgba(77,249,255,0.1)",borderColor:C.borderGlow },
  expEmoji: { fontSize:20,marginBottom:5 },
  expTitle: { color:C.text,fontSize:11,fontWeight:"900" },
  expSub: { color:C.textSub,fontSize:9,marginTop:3,lineHeight:13 },
  activeHeader: { marginBottom:10 },
  activeName: { color:C.text,fontSize:14,fontWeight:"900" },
  activeSub: { color:C.textSub,fontSize:11,marginTop:2 },
  formulaBox: { backgroundColor:"rgba(155,77,255,0.08)",borderRadius:10,borderWidth:1,borderColor:"rgba(155,77,255,0.25)",padding:10,marginBottom:8 },
  formulaLabel: { color:C.violet,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:4 },
  formula: { color:C.text,fontSize:12,fontFamily:"monospace" },
  liveBox: { backgroundColor:"rgba(77,249,255,0.06)",borderRadius:10,borderWidth:1,borderColor:"rgba(77,249,255,0.18)",padding:10,marginBottom:8 },
  liveLabel: { color:C.cyan,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:4 },
  liveText: { color:C.text,fontSize:12,lineHeight:18 },
  compareRow: { flexDirection:"row",alignItems:"center",gap:8,marginBottom:10 },
  compareBox: { flex:1,borderRadius:10,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border,padding:10 },
  compareBoxAfter: { backgroundColor:"rgba(77,249,255,0.06)",borderColor:"rgba(77,249,255,0.28)" },
  compareTag: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:5 },
  compareVal: { color:C.text,fontSize:13,fontWeight:"900" },
  compareUnit: { color:C.textMuted,fontSize:9,marginBottom:5 },
  compareArrow: { color:C.textMuted,fontSize:18 },
  resultBox: { backgroundColor:"rgba(77,249,255,0.07)",borderRadius:12,borderWidth:1,borderColor:"rgba(77,249,255,0.18)",padding:12,marginBottom:10 },
  resultTitle: { color:C.text,fontSize:14,fontWeight:"900",marginBottom:4 },
  resultBody: { color:C.textSub,fontSize:12,lineHeight:18 },
  takeaway: { backgroundColor:"rgba(255,200,69,0.06)",borderRadius:12,borderWidth:1,borderColor:"rgba(255,200,69,0.2)",padding:12,marginBottom:8 },
  takeawayTag: { color:C.gold,fontSize:10,fontWeight:"900",letterSpacing:1.5,marginBottom:6 },
  takeawayText: { color:C.text,fontSize:12,lineHeight:18,marginBottom:8 },
  disclaimer: { color:C.textMuted,fontSize:9,lineHeight:13,fontStyle:"italic" },
  freeLabel: { color:C.textSub,fontSize:12,marginBottom:10,fontStyle:"italic" },
});

const sl = StyleSheet.create({
  wrap: { marginBottom:14 },
  row: { flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:8 },
  label: { color:C.textSub,fontSize:11,fontWeight:"800",textTransform:"uppercase" },
  val: { color:C.cyan,fontSize:14,fontWeight:"900" },
  trackRow: { flexDirection:"row",alignItems:"center",gap:8 },
  arrow: { width:30,height:30,borderRadius:8,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,0.07)",borderWidth:1,borderColor:C.border },
  arrowT: { color:C.text,fontSize:20,fontWeight:"900" },
  track: { flex:1,height:5,borderRadius:3,backgroundColor:"rgba(255,255,255,0.09)",position:"relative",overflow:"visible" },
  fill: { height:5,borderRadius:3,backgroundColor:C.cyan,position:"absolute" },
  thumb: { width:16,height:16,borderRadius:8,backgroundColor:"#fff",position:"absolute",top:-5.5,marginLeft:-8,borderWidth:2.5,borderColor:C.cyan },
  ticks: { flexDirection:"row",justifyContent:"space-between",marginTop:3 },
  tick: { color:C.textMuted,fontSize:9 },
});

const co = StyleSheet.create({
  header: { flexDirection:"row",alignItems:"center",gap:12,marginBottom:12 },
  avatar: { fontSize:34 },
  name: { color:C.text,fontSize:16,fontWeight:"900" },
  status: { color:C.green,fontSize:10,marginTop:2 },
  capabilities: { flexDirection:"row",flexWrap:"wrap",gap:6,marginBottom:14 },
  capItem: { paddingHorizontal:10,paddingVertical:5,borderRadius:20,backgroundColor:"rgba(255,255,255,0.05)",borderWidth:1,borderColor:C.border },
  capText: { color:C.textSub,fontSize:11 },
  chat: { gap:8,marginBottom:14 },
  bubble: { borderRadius:14,padding:11,maxWidth:"88%" },
  bubbleCosmo: { backgroundColor:"rgba(5,12,36,0.95)",borderWidth:1,borderColor:C.border,alignSelf:"flex-start" },
  bubbleUser: { backgroundColor:C.cyan,alignSelf:"flex-end" },
  bubbleText: { color:C.text,fontSize:13,lineHeight:19 },
  sugLabel: { color:C.textMuted,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginBottom:8 },
  sugs: { gap:6 },
  sug: { borderRadius:10,padding:11,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border },
  sugQ: { color:C.textSub,fontSize:12 },
});

const qz = StyleSheet.create({
  bar: { flexDirection:"row",alignItems:"center",gap:10,marginBottom:10 },
  prog: { flex:1,height:5,borderRadius:3,backgroundColor:"rgba(255,255,255,0.08)" },
  progFill: { height:5,borderRadius:3,backgroundColor:C.cyan },
  scoreText: { color:C.textSub,fontSize:13,fontWeight:"900" },
  qNum: { color:C.textMuted,fontSize:10,fontWeight:"900",letterSpacing:1.5,marginBottom:8 },
  qCard: { backgroundColor:"rgba(5,12,34,0.9)",borderRadius:14,borderWidth:1,borderColor:C.border,padding:16,alignItems:"center",marginBottom:12 },
  qEmoji: { fontSize:30,marginBottom:10 },
  qText: { color:C.text,fontSize:14,fontWeight:"700",textAlign:"center",lineHeight:21 },
  opts: { gap:8,marginBottom:10 },
  opt: { flexDirection:"row",alignItems:"center",gap:10,borderRadius:12,padding:12,backgroundColor:"rgba(255,255,255,0.04)",borderWidth:1,borderColor:C.border },
  optOk: { flexDirection:"row",alignItems:"center",gap:10,borderRadius:12,padding:12,backgroundColor:"rgba(77,255,180,0.1)",borderWidth:1,borderColor:"rgba(77,255,180,0.5)" },
  optErr: { flexDirection:"row",alignItems:"center",gap:10,borderRadius:12,padding:12,backgroundColor:"rgba(255,77,109,0.1)",borderWidth:1,borderColor:"rgba(255,77,109,0.5)" },
  optLetter: { width:26,height:26,borderRadius:7,backgroundColor:"rgba(255,255,255,0.08)",color:C.textSub,fontSize:11,fontWeight:"900",textAlign:"center",lineHeight:26 },
  optText: { color:C.text,fontSize:13,flex:1 },
  expl: { backgroundColor:"rgba(77,249,255,0.06)",borderRadius:12,borderWidth:1,borderColor:"rgba(77,249,255,0.18)",padding:14 },
  explTitle: { color:C.text,fontSize:14,fontWeight:"900",marginBottom:6 },
  explText: { color:C.textSub,fontSize:12,lineHeight:18,marginBottom:12 },
  nextBtn: { backgroundColor:C.cyan,borderRadius:10,padding:12,alignItems:"center" },
  nextText: { color:C.bg,fontSize:14,fontWeight:"900" },
  done: { alignItems:"center",paddingVertical:28,paddingHorizontal:14,gap:10 },
  doneEmoji: { fontSize:60 },
  doneTitle: { color:C.text,fontSize:24,fontWeight:"900" },
  doneScore: { color:C.cyan,fontSize:42,fontWeight:"900" },
  doneSub: { color:C.textSub,fontSize:14,textAlign:"center",lineHeight:20 },
  restartBtn: { marginTop:8,backgroundColor:"rgba(77,249,255,0.12)",borderRadius:12,paddingHorizontal:24,paddingVertical:12,borderWidth:1,borderColor:C.borderGlow },
  restartText: { color:C.cyan,fontSize:14,fontWeight:"900" },
});

const sect = StyleSheet.create({
  title: { color:C.text,fontSize:18,fontWeight:"900",marginBottom:4 },
  sub: { color:C.textSub,fontSize:12,marginBottom:12 },
});
