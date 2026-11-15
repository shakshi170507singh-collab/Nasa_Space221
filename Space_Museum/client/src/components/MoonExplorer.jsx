import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useGLTF, useProgress } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import MoonGlobe from "./MoonGlobe";
import PatchRobot from "./PatchRobot";
import SafeSection from "./SafeSection";
import "./MoonExplorer.css";
import { MOON_ARTIFACT as A, GUIDE_NAME, SHOW_VERIFY_FLAGS } from "../data/moonArtifact";

// Draco decoder is served from /public/draco so the lander loads without internet access.
useGLTF.setDecoderPath("/draco/");

const LANDER_HEIGHT = 36; // the lander is drawn larger than life so it is visible on the terrain
const CAMERA = {
  home: { pos: new THREE.Vector3(190, 120, 230), target: new THREE.Vector3(0, 12, 0) },
  focus: { pos: new THREE.Vector3(78, 54, 98), target: new THREE.Vector3(0, 18, 0) },
  apart: { pos: new THREE.Vector3(150, 90, 190), target: new THREE.Vector3(0, 58, 0) },
};

/* ------------------------------------------------------------------ */
/* small hooks                                                          */
/* ------------------------------------------------------------------ */

function useReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

// Loads the heavy 3D scene only when the section is close to the screen, and pauses it when off screen.
function useInView(ref, margin = "300px") {
  const [state, setState] = useState(() => {
    const unsupported = typeof window !== "undefined" && !("IntersectionObserver" in window);
    return { everSeen: unsupported, visible: unsupported };
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) =>
        setState((s) => ({ everSeen: s.everSeen || entry.isIntersecting, visible: entry.isIntersecting })),
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return state;
}

function TypedText({ text, instant }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (instant) return undefined;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text, instant]);
  return <>{instant ? text : text.slice(0, n)}</>;
}

/* ------------------------------------------------------------------ */
/* 3D scene                                                             */
/* ------------------------------------------------------------------ */

function Terrain({ url }) {
  const stl = useLoader(STLLoader, url);

  const { geometry, surfaceY, frame } = useMemo(() => {
    // The NASA terrain is a Z-up 3D-print tile. Smooth it, and find the height at the centre.
    const g = stl.clone();
    g.deleteAttribute("normal");
    const smooth = mergeVertices(g, 1e-3);
    smooth.computeVertexNormals();
    smooth.computeBoundingBox();
    const bb = smooth.boundingBox;

    const pos = smooth.attributes.position;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getX(i)) < 14 && Math.abs(pos.getY(i)) < 14) {
        sum += pos.getZ(i);
        count += 1;
      }
    }
    const surface = count ? sum / count : bb.max.z;

    const w = bb.max.x - bb.min.x;
    const d = bb.max.y - bb.min.y;
    const h = bb.max.z - bb.min.z;
    const box = new THREE.BoxGeometry(w, h, d);
    return {
      geometry: smooth,
      surfaceY: surface,
      frame: { geometry: new THREE.EdgesGeometry(box), y: (bb.max.z + bb.min.z) / 2 - surface },
    };
  }, [stl]);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -surfaceY, 0]} receiveShadow>
        <meshStandardMaterial color="#aeb3bd" roughness={0.95} metalness={0} />
      </mesh>
      <lineSegments geometry={frame.geometry} position={[0, frame.y, 0]}>
        <lineBasicMaterial color="#c7ff35" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

const RISE = 4.8; // whole lander lifts this much (model units) when it comes apart, so no part sinks into the ground
const LIME = new THREE.Color("#c7ff35");

function Lander({ url, selected, exploded, activePart, onSelect, onPartSelect }) {
  const { scene } = useGLTF(url);
  const ringRef = useRef();
  const t = useRef(0);

  const { object, scale, footprint, meshes, labels } = useMemo(() => {
    const obj = scene.clone(true);
    const list = [];
    obj.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.material = o.material.clone(); // so highlighting one part never tints another
        list.push(o);
      }
    });
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // which part does each piece of the model belong to?
    const byIndex = new Map();
    A.parts.forEach((p) => {
      if (Array.isArray(p.meshIds)) p.meshIds.forEach((i) => byIndex.set(i, p.id));
    });
    const ascentId = A.parts.find((p) => p.meshIds === "ascent")?.id;
    const descentId = A.parts.find((p) => p.meshIds === "descent")?.id;
    const split = box.min.y + size.y * 0.58; // above this line = crew cabin, below = descent stage
    const sums = {};
    list.forEach((m, i) => {
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
      const id = byIndex.get(i) ?? (c.y >= split ? ascentId : descentId);
      m.userData.partId = id;
      m.userData.base = m.position.clone();
      const part = A.parts.find((p) => p.id === id);
      const off = new THREE.Vector3(...(part?.lift ?? [0, 0, 0]));
      if (part?.radial) {
        const r = new THREE.Vector3(c.x - center.x, 0, c.z - center.z);
        if (r.lengthSq() > 1e-6) off.addScaledVector(r.normalize(), part.radial);
      }
      off.y += RISE;
      m.userData.off = off;
      (sums[id] ??= { v: new THREE.Vector3(), n: 0, off }).v.add(c);
      sums[id].n += 1;
    });
    const labelList = A.parts.map((p) => {
      const e = sums[p.id];
      if (!e) return null;
      const c = e.v.clone().divideScalar(e.n);
      const part = A.parts.find((x) => x.id === p.id);
      const off = new THREE.Vector3(...(part.lift ?? [0, 0, 0]));
      off.y += RISE;
      return { id: p.id, name: p.name, pos: c, off };
    }).filter(Boolean);

    obj.position.set(-center.x, -box.min.y, -center.z); // stand it on the ground, centred
    const sc = LANDER_HEIGHT / size.y;
    return { object: obj, scale: sc, footprint: Math.max(size.x, size.z) * sc, meshes: list, labels: labelList };
  }, [scene]);

  // slide the pieces apart / back together, and glow the chosen part
  useFrame((_, dt) => {
    const goal = exploded ? 1 : 0;
    t.current += (goal - t.current) * (1 - Math.exp(-dt * 3.2));
    if (Math.abs(goal - t.current) < 0.001) t.current = goal;
    const e = t.current * t.current * (3 - 2 * t.current);
    for (const m of meshes) {
      m.position.copy(m.userData.base).addScaledVector(m.userData.off, e);
      const lit = exploded && activePart && m.userData.partId === activePart;
      if (m.material.emissive) {
        m.material.emissive.copy(LIME).multiplyScalar(lit ? 0.35 : 0);
      }
    }
    if (ringRef.current) {
      const now = performance.now() / 1000;
      const k = 1 + Math.sin(now * 2.2) * 0.05;
      ringRef.current.scale.set(k, k, k);
      ringRef.current.material.opacity = (selected ? 0.95 : 0.55 + Math.sin(now * 2.2) * 0.25) * (1 - e);
    }
  });

  const ringR = footprint * 0.68;

  return (
    <group position={[0, -0.5, 0]}>
      <group
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          const id = e.object?.userData?.partId;
          if (exploded && id) onPartSelect(id);
          else if (!exploded) onSelect();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={object} />
        {exploded &&
          labels.map((l) => (
            <PartLabel key={l.id} label={l} active={activePart === l.id} onPick={() => onPartSelect(l.id)} />
          ))}
      </group>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]} raycast={() => null}>
        <ringGeometry args={[ringR, ringR + 1.3, 96]} />
        <meshBasicMaterial color="#c7ff35" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>

      {!exploded && (
        <Html position={[0, LANDER_HEIGHT + 16, 0]} center zIndexRange={[20, 0]}>
          <button type="button" className="moon-hotspot" onClick={onSelect} aria-label="Open the Eagle story">
            <span className="moon-hotspot-dot" />
            <span className="moon-hotspot-label">ARTIFACT 01</span>
          </button>
        </Html>
      )}
    </group>
  );
}

// A small tappable tag that floats beside each part once the lander is apart.
function PartLabel({ label, active, onPick }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.position.copy(label.pos).add(label.off);
  });
  return (
    <group ref={ref} position={label.pos.toArray()}>
      <Html center zIndexRange={[30, 0]}>
        <button type="button" className={`moon-partlabel${active ? " active" : ""}`} onClick={onPick}>
          {label.name.toUpperCase()}
        </button>
      </Html>
    </group>
  );
}

// Glides the camera towards the lander when its story opens, and back home when it closes.
function CameraRig({ focused, exploded }) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const animating = useRef(false);

  useEffect(() => {
    animating.current = true;
  }, [focused, exploded]);

  useEffect(() => {
    if (!controls) return undefined;
    const stop = () => {
      animating.current = false;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!animating.current || !controls) return;
    const goal = exploded ? CAMERA.apart : focused ? CAMERA.focus : CAMERA.home;
    const k = 1 - Math.exp(-dt * 3);
    camera.position.lerp(goal.pos, k);
    controls.target.lerp(goal.target, k);
    controls.update();
    if (camera.position.distanceTo(goal.pos) < 0.6 && controls.target.distanceTo(goal.target) < 0.3) {
      animating.current = false;
    }
  });

  return null;
}

function Scene({ selected, exploded, activePart, onSelect, onPartSelect, autoRotate }) {
  return (
    <>
      <color attach="background" args={["#050711"]} />
      <ambientLight intensity={0.35} color="#9fb4ff" />
      {/* low "sun" so the crater relief throws long shadows */}
      <directionalLight
        position={[-170, 80, 120]}
        intensity={3.4}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-170}
        shadow-camera-right={170}
        shadow-camera-top={170}
        shadow-camera-bottom={-170}
        shadow-camera-near={10}
        shadow-camera-far={600}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[140, 50, -150]} intensity={0.9} color="#4f7dff" />
      <Stars radius={420} depth={80} count={4000} factor={5} fade speed={0.4} />

      <Suspense fallback={null}>
        <Terrain url={A.terrain} />
        <Lander url={A.model} selected={selected} exploded={exploded} activePart={activePart} onSelect={onSelect} onPartSelect={onPartSelect} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        minDistance={55}
        maxDistance={520}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 12, 0]}
      />
      <CameraRig focused={selected} exploded={exploded} />
    </>
  );
}

function LoadingOverlay() {
  const { progress } = useProgress();
  if (progress >= 100) return null;
  return (
    <div className="moon-loading" role="status">
      <span className="moon-loading-bar">
        <span style={{ width: `${Math.max(4, progress)}%` }} />
      </span>
      <p>LOADING NASA MODELS · {Math.round(progress)}%</p>
    </div>
  );
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="moon-fallback" role="alert">
          <p>THE 3D SCENE COULD NOT LOAD</p>
          <span>Your device may not support WebGL, or a model file is missing.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* page section                                                         */
/* ------------------------------------------------------------------ */

const LEVELS = [
  { id: "kid", label: "KID" },
  { id: "curious", label: "CURIOUS" },
  { id: "engineer", label: "ENGINEER" },
];

function PartsPanel({ parts, part, setPart, level, setLevel, onBack }) {
  return (
    <div className="moon-parts">
      <p className="moon-parts-title">THE EAGLE, TAKEN APART</p>
      <div className="moon-chiprow" role="group" aria-label="Parts of the lander">
        {parts.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`moon-pchip${part?.id === p.id ? " active" : ""}`}
            onClick={() => setPart(p.id)}
            aria-pressed={part?.id === p.id}
          >
            {p.name}
          </button>
        ))}
      </div>

      {part ? (
        <div className="moon-pcard" key={part.id}>
          <h4>{part.name.toUpperCase()}</h4>
          <p className="moon-psub">{part.short}</p>
          <div className="moon-levels" role="tablist" aria-label="Reading level">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={level === l.id}
                className={level === l.id ? "active" : ""}
                onClick={() => setLevel(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="moon-ptext">
            {part[level]}
            {SHOW_VERIFY_FLAGS && part.verify && <em className="moon-vtag">VERIFY</em>}
          </p>
          {part.photo ? (
            <figure className="moon-pphoto">
              <img src={part.photo.src} alt={part.photo.alt} loading="lazy" />
              <figcaption>{part.photo.credit}</figcaption>
            </figure>
          ) : (
            <a
              className="moon-pslot"
              href={`https://images.nasa.gov/search?q=${encodeURIComponent(part.search)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>PHOTO SLOT</span>
              Find a NASA photo of this part ↗
            </a>
          )}
        </div>
      ) : (
        <p className="moon-pprompt">Tap a piece of the lander, or a name above, to see what it did.</p>
      )}

      <div className="moon-actions">
        <button type="button" className="moon-btn moon-btn-primary" onClick={onBack}>
          ◂ PUT IT BACK TOGETHER
        </button>
      </div>
    </div>
  );
}

function GuideAvatar() {
  return (
    <svg viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
      <line x1="32" y1="4" x2="32" y2="14" stroke="#a3aedb" strokeWidth="2" />
      <circle cx="32" cy="4" r="3" fill="#c7ff35" />
      <rect x="10" y="14" width="44" height="36" rx="9" fill="#3a4a8a" />
      <rect x="10" y="14" width="18" height="14" rx="5" fill="#6b7bb8" />
      <rect x="38" y="36" width="16" height="14" rx="4" fill="#8a93b8" />
      <circle cx="23" cy="31" r="5" fill="#c7ff35" />
      <circle cx="41" cy="31" r="5" fill="#c7ff35" />
      <rect x="22" y="42" width="20" height="3" rx="1.5" fill="#0b1030" />
      <circle cx="14" cy="46" r="1.6" fill="#c7ff35" />
      <circle cx="50" cy="20" r="1.6" fill="#c7ff35" />
    </svg>
  );
}

function MoonExplorer() {
  const sectionRef = useRef(null);
  const { everSeen, visible } = useInView(sectionRef);
  const reduce = useReducedMotion();

  const [view, setView] = useState("moon"); // "moon" = the whole Moon, "site" = up close at the landing site
  const [selected, setSelected] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [activePart, setActivePart] = useState(null);
  const [level, setLevel] = useState("curious"); // kid | curious | engineer
  const part = A.parts.find((x) => x.id === activePart) ?? null;

  const intro = `Hi, I'm ${GUIDE_NAME}, built from things people left behind. Tap the little lander on the Moon and I'll take you to the machine that's still waiting there.`;
  const siteIntro = `This is Tranquility Base. Tap the glowing marker on the lander and I'll tell you its story.`;
  const guideText = view === "moon" ? intro : selected ? A.lines[lineIdx] : siteIntro;
  const isLast = lineIdx === A.lines.length - 1;
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  const goToSite = () => {
    window.speechSynthesis?.cancel();
    setView("site");
    setSelected(false);
    setExploded(false);
    setActivePart(null);
    setLineIdx(0);
  };
  const backToMoon = () => {
    window.speechSynthesis?.cancel();
    setView("moon");
    setSelected(false);
    setExploded(false);
    setActivePart(null);
  };
  const dismantle = () => {
    setSelected(true);
    setExploded(true);
    setActivePart(null);
    window.speechSynthesis?.cancel();
  };
  const reassemble = () => {
    setExploded(false);
    setActivePart(null);
  };
  const openStory = () => {
    setSelected(true);
    setLineIdx(0);
  };
  const next = () => setLineIdx((i) => (i + 1) % A.lines.length);
  const speak = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(guideText);
    u.lang = "en-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  return (
    <section className="moon-page" id="moon" ref={sectionRef} aria-labelledby="moon-title">
      <div className="moon-stars" aria-hidden="true" />
      <img className="moon-photo" src="/images/moon-apollo.webp" alt="" aria-hidden="true" loading="lazy" />

      <div className="moon-inner">
        <div className="moon-nav">
          <span>SPACE MUSEUM / THE MOON</span>
          <span>ARTIFACT 01 / 01</span>
        </div>

        <header className="moon-heading">
          <p className="moon-eyebrow">A MACHINE LEFT BEHIND</p>
          <h2 id="moon-title">
            AT <span>TRANQUILITY BASE</span>
          </h2>
          <p className="moon-intro">
            In 1969 two astronauts left the Moon. Part of their lander didn&apos;t. Meet the machine that stayed,
            and the story it still has to tell.
          </p>
        </header>

        <div className="moon-stage">
          <div className="moon-canvas-card">
            <div className="moon-chip">{view === "moon" ? "THE MOON · NEAR SIDE" : `APOLLO 11 · ${A.year}`}</div>
            {view === "site" && (
              <button type="button" className="moon-back" onClick={backToMoon}>
                ◂ BACK TO THE MOON
              </button>
            )}
            <div className="moon-chip moon-chip-right">NASA 3D MODELS</div>

            {everSeen ? (
              <SceneBoundary>
                {view === "moon" ? (
                  <MoonGlobe onOpen={goToSite} visible={visible} />
                ) : (
                <Canvas
                  shadows="percentage"
                  dpr={[1, 1.75]}
                  frameloop={visible ? "always" : "never"}
                  camera={{ position: CAMERA.home.pos.toArray(), fov: 38, near: 1, far: 1600 }}
                  gl={{ antialias: true }}
                >
                  <Scene selected={selected} exploded={exploded} activePart={activePart} onSelect={openStory} onPartSelect={setActivePart} autoRotate={!selected && !reduce} />
                </Canvas>
                )}
                <LoadingOverlay />
              </SceneBoundary>
            ) : (
              <div className="moon-loading">
                <p>SCROLL TO LOAD THE MOON</p>
              </div>
            )}

            <p className="moon-hint">{view === "moon" ? "DRAG TO TURN THE MOON · TAP THE LANDER" : exploded ? "TAP A PART TO LEARN WHAT IT DID" : "DRAG TO ORBIT · SCROLL TO ZOOM"}</p>
          </div>

          <aside className="moon-story" aria-label="Story of the Eagle">
            <div className="moon-guide-head">
              {everSeen ? (
                <SafeSection fallback={<GuideAvatar />}>
                  <PatchRobot size={112} />
                </SafeSection>
              ) : (
                <GuideAvatar />
              )}
              <div>
                <p className="moon-guide-name">{GUIDE_NAME.toUpperCase()}</p>
                <p className="moon-guide-role">YOUR GUIDE</p>
              </div>
            </div>

            <h3 className="moon-artifact-name">{view === "moon" ? "THE MOON" : A.name.toUpperCase()}</h3>
            <p className="moon-artifact-sub">{view === "moon" ? "Earth's only natural satellite" : `Descent stage · ${A.site}`}</p>

          {view === "moon" ? (
              <>
                <p className="moon-guide-text" aria-hidden="true">
                  <TypedText key={guideText} text={guideText} instant={reduce} />
                </p>
                <p className="moon-sr" aria-live="polite">{guideText}</p>
                <div className="moon-actions">
                  <button type="button" className="moon-btn moon-btn-primary" onClick={goToSite}>
                    GO TO TRANQUILITY BASE <span>↗</span>
                  </button>
                </div>
              </>
            ) : exploded ? (
              <PartsPanel parts={A.parts} part={part} setPart={setActivePart} level={level} setLevel={setLevel} onBack={reassemble} />
            ) : (
              <>
            <p className="moon-guide-text" aria-hidden="true">
              <TypedText key={guideText} text={guideText} instant={reduce} />
            </p>
            <p className="moon-sr" aria-live="polite">
              {guideText}
            </p>

            {selected && (
              <div className="moon-dots" role="group" aria-label="Story progress">
                {A.lines.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === lineIdx ? "active" : ""}
                    onClick={() => setLineIdx(i)}
                    aria-label={`Line ${i + 1} of ${A.lines.length}`}
                    aria-current={i === lineIdx}
                  />
                ))}
              </div>
            )}

            <div className="moon-actions">
              {!selected ? (
                <button type="button" className="moon-btn moon-btn-primary" onClick={openStory}>
                  MEET THE EAGLE <span>↗</span>
                </button>
              ) : (
                <>
                  <button type="button" className="moon-btn moon-btn-primary" onClick={next}>
                    {isLast ? "REPLAY ↺" : "NEXT ▸"}
                  </button>
                  {canSpeak && (
                    <button type="button" className="moon-btn" onClick={speak}>
                      READ ALOUD
                    </button>
                  )}
                </>
              )}
              <button type="button" className="moon-btn moon-btn-ghost" onClick={dismantle}>
                DISMANTLE ⟂
              </button>
            </div>
              </>
            )}

            <a className="moon-source" href={A.nssdca.url} target="_blank" rel="noreferrer">
              NASA RECORD · NSSDCA {A.nssdca.id} ↗
            </a>
          </aside>
        </div>

        <ul className="moon-facts">
          {A.facts.map((f) => (
            <li key={f.label}>
              <span className="moon-fact-label">
                {f.label}
                {SHOW_VERIFY_FLAGS && f.verify && <em title="Check this on NASA's page">VERIFY</em>}
              </span>
              <span className="moon-fact-value">{f.value}</span>
            </li>
          ))}
        </ul>

        <p className="moon-note">
          The lander is drawn larger than life so you can see it. The Moon map is a NASA photo of the near side, so the
          landing-site marker is approximate. The terrain and the lander are NASA 3D models.
        </p>

        <footer className="moon-credits">
          <span>CREDITS</span>
          {A.credits.map((c) => (
            <a key={c.label} href={c.url} target="_blank" rel="noreferrer">
              {c.label} · {c.by}
            </a>
          ))}
          <p>NASA does not endorse this project.</p>
        </footer>
      </div>
    </section>
  );
}

export default MoonExplorer;
