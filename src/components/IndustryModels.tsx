import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, Suspense, useMemo } from "react";
import * as THREE from "three";
import { getCSSVar } from "@/utils/cssVar";
import { useTheme } from "@/hooks/use-theme";

/* ──────── Shared colors — runtime token sync (phase-11A-extended) ────────
 * useTheme dependency: tema değişiminde palette yeniden hesaplanır ve
 * material'lar useMemo referans değişikliği ile güncellenmiş yeni Color
 * instance'larını kullanır. Fallback hex'ler EXEMPT (SSR/hydration güvenli). */
const usePalette = () => {
  const { theme } = useTheme();
  return useMemo(
    () => ({
      teal: new THREE.Color(getCSSVar("--precision-steel", "#0688AD")),
      metal: new THREE.Color(getCSSVar("--material-chrome", "#94a3b8")),
      dark: new THREE.Color(getCSSVar("--surface-base", "#1e293b")),
      white: new THREE.Color(getCSSVar("--text-primary", "#e2e8f0")),
    }),
    // getCSSVar değerleri DOM'dan okunuyor; linter theme bağımlılığını
    // "gereksiz" sanıyor ama tema değişince renkler yeniden çözülmeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );
};

/* 1 — Havacılık & Uzay: Jet Engine Nacelle */
const TurbineModel = () => {
  const g = useRef<THREE.Group>(null);
  const fan = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => {
    if (g.current) { g.current.rotation.y += d * 0.15; }
    if (fan.current) { fan.current.rotation.z += d * 3.0; }
  });
  return (
    <group ref={g} rotation={[0, 0, Math.PI / 2]}>
      {/* Nacelle outer shell */}
      <mesh><cylinderGeometry args={[0.7, 0.55, 1.8, 32]} /><meshStandardMaterial color={dark} metalness={0.92} roughness={0.08} /></mesh>
      {/* Intake ring */}
      <mesh position={[0, 0.9, 0]}><torusGeometry args={[0.65, 0.08, 16, 32]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>
      {/* Exhaust ring */}
      <mesh position={[0, -0.9, 0]}><torusGeometry args={[0.5, 0.06, 12, 32]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.2} /></mesh>
      {/* Inner cone */}
      <mesh position={[0, 0.7, 0]}><coneGeometry args={[0.2, 0.5, 16]} /><meshStandardMaterial color={metal} metalness={0.95} roughness={0.05} /></mesh>
      {/* Fan blades */}
      <group ref={fan} position={[0, 0.6, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35]} rotation={[0.15, -a, Math.PI / 2]}>
              <boxGeometry args={[0.04, 0.35, 0.12]} />
              <meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} />
            </mesh>
          );
        })}
      </group>
      {/* Exhaust nozzle inner */}
      <mesh position={[0, -0.7, 0]}><cylinderGeometry args={[0.45, 0.35, 0.4, 24]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.15} /></mesh>
      {/* Body ribbing */}
      {[-0.2, 0.1, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.72, 0.012, 8, 32]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.15} /></mesh>
      ))}
    </group>
  );
};

/* 2 — Savunma Sanayi: Projectile */
const ProjectileModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 0.6; g.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1; } });
  return (
    <group ref={g}>
      <mesh position={[0, 0.6, 0]}><coneGeometry args={[0.3, 0.8, 16]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.15} /></mesh>
      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.3, 0.3, 1.2, 16]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      {[0.2, -0.1, -0.4].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.32, 0.015, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>))}
      <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.3, 0.22, 0.3, 16]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.1} /></mesh>
    </group>
  );
};

/* 3 — Robotik: Joint */
const RoboticJointModel = () => {
  const g = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame(() => { if (g.current) g.current.rotation.y += 0.003; if (arm.current) arm.current.rotation.z = Math.sin(Date.now() * 0.0015) * 0.5; });
  return (
    <group ref={g}>
      <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.6, 0.7, 0.3, 24]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.15} /></mesh>
      <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 0.35, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, -0.05, 0]}><boxGeometry args={[0.18, 0.7, 0.15]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.3, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.25} /></mesh>
      <group ref={arm} position={[0, 0.35, 0]}>
        <mesh position={[0.35, 0.15, 0]}><boxGeometry args={[0.6, 0.12, 0.12]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
        <mesh position={[0.65, 0.15, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.5} /></mesh>
      </group>
    </group>
  );
};

/* 4 — Otomotiv: Piston */
const PistonModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame(() => { if (g.current) { const t = Date.now() * 0.002; g.current.rotation.y = Math.sin(t) * 0.3; g.current.children[0].position.y = Math.sin(t * 2) * 0.25 + 0.3; } });
  return (
    <group ref={g}>
      <group position={[0, 0.3, 0]}>
        <mesh><cylinderGeometry args={[0.7, 0.7, 0.5, 32]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.15} /></mesh>
        {[0.18, 0.0, -0.18].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.72, 0.025, 8, 32]} /><meshStandardMaterial color={dark} metalness={0.95} roughness={0.05} /></mesh>))}
      </group>
      <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.12, 1.0, 0.08]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[0, -0.95, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.06, 12, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>
    </group>
  );
};

/* 5 — Medikal: Implant */
const ImplantModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, white } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 0.5; g.current.rotation.x = Math.sin(Date.now() * 0.0006) * 0.2; } });
  return (
    <group ref={g}>
      <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.45, 32, 32]} /><meshStandardMaterial color={white} metalness={0.95} roughness={0.05} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.15]}><cylinderGeometry args={[0.15, 0.2, 0.6, 16]} /><meshStandardMaterial color={white} metalness={0.9} roughness={0.1} /></mesh>
      <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.22, 0.08, 1.4, 16]} /><meshStandardMaterial color={white} metalness={0.9} roughness={0.1} /></mesh>
      {[-0.1, -0.5, -0.9].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.22 - i * 0.04, 0.015, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.35} /></mesh>))}
    </group>
  );
};

/* 6 — Yelken & Yat: Marine Winch */
const PropellerModel = () => {
  const g = useRef<THREE.Group>(null);
  const drum = useRef<THREE.Mesh>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.2;
    if (drum.current) drum.current.rotation.y += d * 0.6;
  });
  return (
    <group ref={g}>
      {/* Base plate */}
      <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.7, 0.8, 0.15, 24]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.15} /></mesh>
      {/* Support column */}
      <mesh position={[0, -0.35, 0]}><cylinderGeometry args={[0.2, 0.3, 0.8, 16]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      {/* Drum */}
      <mesh ref={drum} position={[0, 0.2, 0]}><cylinderGeometry args={[0.45, 0.45, 0.7, 24]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>
      {/* Drum flanges */}
      <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.55, 0.55, 0.06, 24]} /><meshStandardMaterial color={dark} metalness={0.92} roughness={0.08} /></mesh>
      <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.55, 0.55, 0.06, 24]} /><meshStandardMaterial color={dark} metalness={0.92} roughness={0.08} /></mesh>
      {/* Handle arms */}
      {[0, Math.PI].map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh position={[0.5, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.06, 0.4, 0.06]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.25} /></mesh>
          <mesh position={[0.65, 0.85, 0]}><sphereGeometry args={[0.06, 12, 12]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>
        </group>
      ))}
      {/* Rope grooves */}
      {[-0.05, 0.1, 0.25, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.47, 0.012, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.15} /></mesh>
      ))}
      {/* Mounting bolts */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (<mesh key={i} position={[Math.cos(a) * 0.6, -0.72, Math.sin(a) * 0.6]}><cylinderGeometry args={[0.035, 0.035, 0.12, 8]} /><meshStandardMaterial color={teal} metalness={0.95} roughness={0.05} /></mesh>);
      })}
    </group>
  );
};

/* 7 — Hidrolik & Pnömatik: Cylinder */
const HydraulicModel = () => {
  const g = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Mesh>(null);
  const { teal, metal, dark } = usePalette();
  useFrame(() => { if (rod.current) rod.current.position.y = Math.sin(Date.now() * 0.002) * 0.4 + 0.5; if (g.current) g.current.rotation.y += 0.003; });
  return (
    <group ref={g}>
      <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.4, 0.4, 1.2, 24]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.15} /></mesh>
      <mesh ref={rod} position={[0, 0.5, 0]}><cylinderGeometry args={[0.15, 0.15, 1.0, 16]} /><meshStandardMaterial color={metal} metalness={0.95} roughness={0.05} /></mesh>
      <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.5, 0.5, 0.15, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.2} /></mesh>
      {[0.0, -0.3, -0.6].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.42, 0.015, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.15} /></mesh>))}
    </group>
  );
};

/* 8 — Boru & Bağlantı: Pipe fitting */
const PipeFittingModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 0.4; } });
  return (
    <group ref={g}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 1.6, 24, 1, true]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.15} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.5, 0, 0]}><cylinderGeometry args={[0.25, 0.25, 1.0, 24, 1, true]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.15} side={THREE.DoubleSide} /></mesh>
      <mesh><sphereGeometry args={[0.35, 24, 24]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.1} /></mesh>
      {[[-0.8, 0, 0], [0.8, 0, 0], [0, 0, -1.0], [0, 0, 1.0]].map((p, i) => (<mesh key={i} position={p as [number, number, number]}><torusGeometry args={[0.3, 0.04, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.3} /></mesh>))}
    </group>
  );
};

/* 9 — İklim Teknolojileri: Heat Exchanger / Compressor Unit */
const FanModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 0.25; } });
  return (
    <group ref={g}>
      {/* Main body - rectangular compressor housing */}
      <mesh position={[0, 0, 0]}><boxGeometry args={[1.0, 0.8, 0.7]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.12} /></mesh>
      {/* Heat exchanger fins */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.35 + i * 0.1, 0.15, 0.38]}>
          <boxGeometry args={[0.02, 0.5, 0.08]} />
          <meshStandardMaterial color={metal} metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {/* Inlet pipe */}
      <mesh position={[0.6, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.35, 16]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>
      {/* Outlet pipe */}
      <mesh position={[-0.6, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.35, 16]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>
      {/* Pipe flanges */}
      <mesh position={[0.78, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.04, 16]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.25} /></mesh>
      <mesh position={[-0.78, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.04, 16]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.25} /></mesh>
      {/* Control panel */}
      <mesh position={[0, 0.42, 0.2]}><boxGeometry args={[0.3, 0.04, 0.2]} /><meshStandardMaterial color={teal} metalness={0.85} roughness={0.15} emissive={teal} emissiveIntensity={0.2} /></mesh>
      {/* Mounting feet */}
      {[[-0.35, -0.5, -0.25], [0.35, -0.5, -0.25], [-0.35, -0.5, 0.25], [0.35, -0.5, 0.25]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}><boxGeometry args={[0.15, 0.12, 0.15]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      ))}
      {/* Accent lines */}
      {[-0.15, 0.15].map((y, i) => (
        <mesh key={i} position={[0, y, 0.36]}><boxGeometry args={[1.02, 0.015, 0.01]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.15} /></mesh>
      ))}
    </group>
  );
};

/* 11 — Yenilenebilir Enerji: Wind turbine */
const WindTurbineModel = () => {
  const blades = useRef<THREE.Group>(null);
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (blades.current) blades.current.rotation.z += d * 1.8; if (g.current) g.current.rotation.y += d * 0.1; });
  return (
    <group ref={g}>
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.12, 0.18, 1.5, 12]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.1} /></mesh>
      <group ref={blades} position={[0, 0.3, 0.2]}>
        {Array.from({ length: 3 }).map((_, i) => { const a = (i / 3) * Math.PI * 2; return (
          <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.08, 1.0, 0.03]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.25} />
          </mesh>
        ); })}
      </group>
    </group>
  );
};

/* 12 — Petrol & Gaz: Valve */
const ValveModel = () => {
  const g = useRef<THREE.Group>(null);
  const wheel = useRef<THREE.Mesh>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.3; if (wheel.current) wheel.current.rotation.y += d * 0.8; });
  return (
    <group ref={g}>
      <mesh><cylinderGeometry args={[0.4, 0.4, 0.8, 24]} /><meshStandardMaterial color={dark} metalness={0.9} roughness={0.15} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 1.4, 24]} /><meshStandardMaterial color={metal} metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.08, 0.5, 12]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>
      <mesh ref={wheel} position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.04, 8, 24]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.35} /></mesh>
      {Array.from({ length: 4 }).map((_, i) => { const a = (i / 4) * Math.PI * 2; return (<mesh key={i} position={[Math.cos(a) * 0.3, 0.8, Math.sin(a) * 0.3]}><boxGeometry args={[0.04, 0.04, 0.12]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} /></mesh>); })}
    </group>
  );
};

/* 13 — Güç Dağıtım: Busbar/connector */
const BusbarModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 0.4; g.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.1; } });
  return (
    <group ref={g}>
      {[-0.4, 0, 0.4].map((z, i) => (
        <group key={i}>
          <mesh position={[0, 0, z]}><boxGeometry args={[1.6, 0.1, 0.2]} /><meshStandardMaterial color={i === 1 ? teal : metal} metalness={0.9} roughness={0.1} emissive={i === 1 ? teal : undefined} emissiveIntensity={i === 1 ? 0.3 : 0} /></mesh>
          {[-0.6, 0, 0.6].map((x, j) => (<mesh key={j} position={[x, 0.15, z]}><cylinderGeometry args={[0.06, 0.06, 0.2, 12]} /><meshStandardMaterial color={dark} metalness={0.95} roughness={0.05} /></mesh>))}
        </group>
      ))}
      <mesh position={[0, -0.2, 0]}><boxGeometry args={[1.8, 0.08, 1.2]} /><meshStandardMaterial color={dark} metalness={0.85} roughness={0.2} /></mesh>
    </group>
  );
};

/* 14 — Madencilik: Drill bit */
const DrillBitModel = () => {
  const g = useRef<THREE.Group>(null);
  const { teal, metal, dark } = usePalette();
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d * 1.0; } });
  return (
    <group ref={g}>
      <mesh position={[0, 0.8, 0]}><coneGeometry args={[0.15, 0.5, 16]} /><meshStandardMaterial color={teal} metalness={0.95} roughness={0.05} emissive={teal} emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.15, 0.9, 16]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>
      {Array.from({ length: 4 }).map((_, i) => { const y = 0.5 - i * 0.2; const a = i * 1.2; return (
        <mesh key={i} position={[Math.cos(a) * 0.18, y, Math.sin(a) * 0.18]} rotation={[0, -a, 0.3]}>
          <boxGeometry args={[0.15, 0.08, 0.06]} /><meshStandardMaterial color={teal} metalness={0.9} roughness={0.1} emissive={teal} emissiveIntensity={0.2} />
        </mesh>
      ); })}
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.25, 0.25, 0.6, 24]} /><meshStandardMaterial color={dark} metalness={0.85} roughness={0.2} /></mesh>
      {[-0.3, -0.5, -0.7].map((y, i) => (<mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.27, 0.015, 8, 24]} /><meshStandardMaterial color={metal} metalness={0.9} roughness={0.1} /></mesh>))}
    </group>
  );
};

/* ──────── Model map ──────── */
export type IndustryType =
  | "aerospace" | "defense" | "robotics" | "automotive" | "medical"
  | "marine" | "hydraulic" | "piping" | "hvac"
  | "renewable" | "oilgas" | "power" | "mining";

const modelMap: Record<IndustryType, React.FC> = {
  aerospace: TurbineModel,
  defense: ProjectileModel,
  robotics: RoboticJointModel,
  automotive: PistonModel,
  medical: ImplantModel,
  marine: PropellerModel,
  hydraulic: HydraulicModel,
  piping: PipeFittingModel,
  hvac: FanModel,
  renewable: WindTurbineModel,
  oilgas: ValveModel,
  power: BusbarModel,
  mining: DrillBitModel,
};

/** Single Canvas for active industry model */
export const IndustryCanvas = ({ type }: { type: IndustryType }) => {
  const ModelComponent = modelMap[type];
  return (
    <div className="w-full h-full" style={{ minHeight: "192px" }}>
      <Canvas
        camera={{ position: [0, 1.2, 3.8], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: false }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        frameloop="always"
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow />
          {/* eslint-disable-next-line no-restricted-syntax */}
          <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#0688AD" /* OK: R3F runtime */ />
          {/* eslint-disable-next-line no-restricted-syntax */}
          <pointLight position={[0, -2, 4]} intensity={0.6} color="#0688AD" /* OK: R3F runtime */ />
          {/* eslint-disable-next-line no-restricted-syntax */}
          <pointLight position={[2, 3, -2]} intensity={0.3} color="#e2e8f0" /* OK: R3F runtime */ />
          {/* eslint-disable-next-line no-restricted-syntax */}
          <spotLight position={[-3, 4, -4]} intensity={0.4} angle={0.5} penumbra={1} color="#0688AD" /* OK: R3F runtime */ />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} dampingFactor={0.1} />
          <ModelComponent />
        </Suspense>
      </Canvas>
    </div>
  );
};

