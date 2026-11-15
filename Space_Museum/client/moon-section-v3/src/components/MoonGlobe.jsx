import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { MOON_ARTIFACT as A } from "../data/moonArtifact";

// Tranquility Base, Apollo 11 landing site (about 0.67 N, 23.47 E).
const SITE = { lat: 0.67, lon: 23.47 };
const R = 10; // globe radius in scene units

// Same maths three.js uses to wrap a flat map on a sphere, so the pin sits on the right spot of the texture.
function surfacePoint(latDeg, lonDeg, radius) {
  const theta = ((90 - latDeg) * Math.PI) / 180;
  const phi = ((lonDeg + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function MiniLander({ onOpen }) {
  const { scene } = useGLTF(A.model);
  const ring = useRef();
  const group = useRef();
  const hovered = useRef(false);

  const { object, scale } = useMemo(() => {
    const obj = scene.clone(true);
    obj.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone();
        o.castShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    obj.position.set(-c.x, -box.min.y, -c.z);
    return { object: obj, scale: 1.7 / size.y }; // drawn much bigger than life so it can be tapped
  }, [scene]);

  const { pos, quat } = useMemo(() => {
    const p = surfacePoint(SITE.lat, SITE.lon, R);
    const up = p.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    return { pos: p, quat: q };
  }, []);

  useFrame(() => {
    const t = performance.now() / 1000;
    if (ring.current) {
      const k = 1 + (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.9;
      ring.current.scale.set(k, k, k);
      ring.current.material.opacity = 0.9 - (k - 1) * 0.85;
    }
    if (group.current) {
      const s = hovered.current ? 1.18 : 1;
      group.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
    }
  });

  return (
    <group position={pos} quaternion={quat}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = "";
        }}
      >
        <group scale={scale}>
          <primitive object={object} />
        </group>
        {/* invisible bigger target so a finger can hit it */}
        <mesh position={[0, 0.6, 0]} visible={false}>
          <sphereGeometry args={[1.0, 12, 12]} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} raycast={() => null}>
        <ringGeometry args={[0.8, 0.95, 64]} />
        <meshBasicMaterial color="#c7ff35" transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 3.3, 0]} center zIndexRange={[20, 0]}>
        <div style={{ transform: "translateY(-46px)" }}>
          <button type="button" className="moon-hotspot" onClick={onOpen} aria-label="Open the Apollo 11 lander">
            <span className="moon-hotspot-dot" />
            <span className="moon-hotspot-label">TAP THE EAGLE</span>
          </button>
        </div>
      </Html>
    </group>
  );
}

function Globe({ onOpen }) {
  const map = useLoader(THREE.TextureLoader, "/images/moon-globe.jpg");
  return (
    // rotate so longitude 0 faces the viewer
    <group rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <sphereGeometry args={[R, 128, 96]} />
        <meshStandardMaterial map={map} map-colorSpace={THREE.SRGBColorSpace} map-anisotropy={8} roughness={1} metalness={0} emissiveMap={map} emissive="#ffffff" emissiveIntensity={0.18} />
      </mesh>
      <MiniLander onOpen={onOpen} />
    </group>
  );
}

// the camera starts looking straight at Tranquility Base
const START = surfacePoint(SITE.lat, SITE.lon, 1)
  .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2)
  .multiplyScalar(38);

export default function MoonGlobe({ onOpen, visible }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={visible ? "always" : "never"}
      camera={{ position: START.toArray(), fov: 38, near: 0.1, far: 400 }}
    >
      <color attach="background" args={["#050711"]} />
      <ambientLight intensity={0.55} color="#aab8ff" />
      <directionalLight position={[-30, 12, 30]} intensity={2.6} color="#fff3e0" />
      <Stars radius={150} depth={60} count={3000} factor={4} fade speed={0.4} />
      <Suspense fallback={null}>
        <Globe onOpen={onOpen} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={17}
        maxDistance={52}
        minAzimuthAngle={-Math.PI * 0.55}
        maxAzimuthAngle={Math.PI * 0.55}
      />
    </Canvas>
  );
}
