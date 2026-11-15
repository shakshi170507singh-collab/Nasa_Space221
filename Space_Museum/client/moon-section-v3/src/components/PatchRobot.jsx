import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { MOON_ARTIFACT as A } from "../data/moonArtifact";

// Patch is put together from leftovers: the antenna dish and the engine nozzle are real pieces of the
// NASA Apollo Lunar Module model (pieces 124 and 17 in its list); the rest is plain metal and gold foil.
const DISH_PIECE = 124;
const NOZZLE_PIECE = 17;

const gold = { color: "#d4a542", metalness: 0.85, roughness: 0.32 };
const steel = { color: "#aab4d4", metalness: 0.8, roughness: 0.35 };
const dark = { color: "#10162e", metalness: 0.4, roughness: 0.25 };

// takes one piece out of the lander model, centres it and scales it to a chosen width
function usePiece(index, width) {
  const { scene } = useGLTF(A.model);
  return useMemo(() => {
    const meshes = [];
    scene.traverse((o) => o.isMesh && meshes.push(o));
    const src = meshes[index];
    if (!src) return null;
    const geo = src.geometry.clone();
    geo.center();
    geo.computeBoundingBox();
    const size = geo.boundingBox.getSize(new THREE.Vector3());
    const s = width / Math.max(size.x, size.z, size.y);
    return { geo, s };
  }, [scene, index, width]);
}

function Robot() {
  const root = useRef();
  const eyes = useRef();
  const armL = useRef();
  const armR = useRef();
  const dish = usePiece(DISH_PIECE, 0.62);
  const nozzle = usePiece(NOZZLE_PIECE, 0.5);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.6) * 0.06;
      root.current.rotation.y = Math.sin(t * 0.7) * 0.45;
    }
    if (eyes.current) {
      const blink = Math.sin(t * 1.1) > 0.985 ? 0.1 : 1;
      eyes.current.scale.y = blink;
    }
    if (armL.current) armL.current.rotation.z = 0.25 + Math.sin(t * 1.6) * 0.08;
    if (armR.current) armR.current.rotation.z = -0.25 - Math.sin(t * 1.6) * 0.08;
  });

  return (
    <group ref={root} position={[0, -0.1, 0]}>
      {/* body: gold foil, like the lander's skin */}
      <RoundedBox args={[0.95, 0.95, 0.7]} radius={0.16} smoothness={4} position={[0, -0.55, 0]} castShadow>
        <meshStandardMaterial {...gold} />
      </RoundedBox>
      {/* foil creases */}
      {[-0.28, 0, 0.28].map((x) => (
        <mesh key={x} position={[x, -0.55, 0.356]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.02, 0.8, 0.01]} />
          <meshStandardMaterial color="#9c7424" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}
      {/* sewn-on patch, like the mission patches */}
      <mesh position={[0, -0.5, 0.37]}>
        <circleGeometry args={[0.17, 32]} />
        <meshStandardMaterial color="#1c2a66" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.5, 0.375]}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#c7ff35" toneMapped={false} />
      </mesh>

      {/* head */}
      <RoundedBox args={[1.05, 0.78, 0.8]} radius={0.2} smoothness={4} position={[0, 0.3, 0]}>
        <meshStandardMaterial {...steel} />
      </RoundedBox>
      {/* visor */}
      <RoundedBox args={[0.82, 0.42, 0.1]} radius={0.15} smoothness={4} position={[0, 0.3, 0.38]}>
        <meshStandardMaterial {...dark} />
      </RoundedBox>
      <group ref={eyes} position={[0, 0.3, 0.45]}>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshBasicMaterial color="#c7ff35" toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* smile */}
      <mesh position={[0, 0.17, 0.44]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.012, 8, 24, Math.PI]} />
        <meshBasicMaterial color="#c7ff35" toneMapped={false} />
      </mesh>

      {/* the real lander dish, as an ear */}
      {dish && (
        <mesh geometry={dish.geo} scale={dish.s} position={[0.66, 0.42, 0]} rotation={[0, 0, -Math.PI / 2.2]}>
          <meshStandardMaterial {...steel} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* antenna */}
      <mesh position={[-0.3, 0.86, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 8]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh position={[-0.3, 1.03, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#c7ff35" toneMapped={false} />
      </mesh>

      {/* the real descent-engine nozzle, worn as a backpack thruster */}
      {nozzle && (
        <mesh geometry={nozzle.geo} scale={nozzle.s} position={[0, -0.45, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#5b6384" metalness={0.8} roughness={0.4} />
        </mesh>
      )}

      {/* arms */}
      <group ref={armL} position={[-0.58, -0.3, 0]}>
        <mesh position={[-0.12, -0.22, 0]}>
          <capsuleGeometry args={[0.07, 0.42, 6, 12]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      </group>
      <group ref={armR} position={[0.58, -0.3, 0]}>
        <mesh position={[0.12, -0.22, 0]}>
          <capsuleGeometry args={[0.07, 0.42, 6, 12]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      </group>

      {/* legs and little footpads, like the lander's */}
      {[-0.26, 0.26].map((x) => (
        <group key={x} position={[x, -1.08, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.26, 12]} />
            <meshStandardMaterial {...steel} />
          </mesh>
          <mesh position={[0, -0.27, 0.04]}>
            <cylinderGeometry args={[0.15, 0.17, 0.04, 20]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function PatchRobot({ size = 104 }) {
  return (
    <div className="moon-patch3d" style={{ width: size, height: size }} aria-hidden="true">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0.1, 4.6], fov: 34 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.9} color="#b9c6ff" />
        <directionalLight position={[3, 4, 4]} intensity={3.2} color="#fff3e0" />
        <directionalLight position={[-4, 1, -2]} intensity={2} color="#6f8cff" />
        <pointLight position={[0, -1, 3]} intensity={6} color="#c7ff35" distance={8} />
        <Suspense fallback={null}>
          <Robot />
        </Suspense>
      </Canvas>
    </div>
  );
}
