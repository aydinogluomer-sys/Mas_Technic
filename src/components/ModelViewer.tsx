import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Grid, Center, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { RotateCcw, Grid3x3, Scissors, Loader2, Box, Palette, TriangleRight, Ruler } from "lucide-react";
import { getCSSVar } from "@/utils/cssVar";
import { useTheme } from "@/hooks/use-theme";

// ── Types ──
interface ModelViewerProps {
  file: File | null;
  onDimensions?: (dims: { x: number; y: number; z: number }) => void;
}

interface Dimensions {
  x: number;
  y: number;
  z: number;
}

// Color presets — kullanıcıya gösterilen statik palet
/* eslint-disable no-restricted-syntax */
const COLOR_PRESETS = [
  { label: "Çelik", color: "#94a3b8" },   // OK: user-facing palette
  { label: "Altın", color: "#d4a574" },   // OK: user-facing palette
  { label: "Mavi", color: "#3b82f6" },    // OK: user-facing palette
  { label: "Yeşil", color: "#22c55e" },   // OK: user-facing palette
  { label: "Kırmızı", color: "#ef4444" }, // OK: user-facing palette
  { label: "Siyah", color: "#1e293b" },   // OK: user-facing palette
];
/* eslint-enable no-restricted-syntax */

// ── Measurement Points Visual ──
const MeasurementPoints = ({ points, distance }: { points: THREE.Vector3[]; distance: number | null }) => {
  if (points.length === 0) return null;

  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.3, 16, 16]} />
          {/* eslint-disable-next-line no-restricted-syntax */}
          <meshBasicMaterial color="#ef4444" /* OK: R3F runtime — measurement marker */ />
        </mesh>
      ))}
      {points.length === 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([points[0].x, points[0].y, points[0].z, points[1].x, points[1].y, points[1].z])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <lineBasicMaterial color="#ef4444" /* OK: R3F runtime — measurement line */ linewidth={2} />
        </line>
      )}
    </group>
  );
};

// ── Click Handler for Measurement ──
const MeasureClickHandler = ({
  measuring,
  onPoint,
}: {
  measuring: boolean;
  onPoint: (point: THREE.Vector3) => void;
}) => {
  const { raycaster, scene, camera, gl } = useThree();

  useEffect(() => {
    if (!measuring) return;
    const canvas = gl.domElement;
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) meshes.push(obj);
      });
      const hits = raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        onPoint(hits[0].point.clone());
      }
    };
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [measuring, raycaster, scene, camera, gl, onPoint]);

  return null;
};

// ── STL Model ──
const STLModel = ({
  url,
  clipping,
  clipValue,
  wireframe,
  modelColor,
  onDimensions,
}: {
  url: string;
  clipping: boolean;
  clipValue: number;
  wireframe: boolean;
  modelColor: string;
  onDimensions: (d: Dimensions) => void;
}) => {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);

  useEffect(() => {
    if (!geometry) return;
    geometry.center();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    onDimensions({ x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) });

    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2;
    camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = maxDim * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }, [geometry, camera, onDimensions]);

  useFrame(() => {
    if (clipping && geometry.boundingBox) {
      const box = geometry.boundingBox;
      const size = box.max.y - box.min.y;
      clippingPlane.constant = box.min.y + size * clipValue;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={modelColor}
        metalness={0.6}
        roughness={0.35}
        side={THREE.DoubleSide}
        wireframe={wireframe}
        clippingPlanes={clipping ? [clippingPlane] : []}
        clipShadows
      />
    </mesh>
  );
};

// ── OBJ Model ──
const OBJModel = ({
  url,
  clipping,
  clipValue,
  wireframe,
  modelColor,
  onDimensions,
}: {
  url: string;
  clipping: boolean;
  clipValue: number;
  wireframe: boolean;
  modelColor: string;
  onDimensions: (d: Dimensions) => void;
}) => {
  const obj = useLoader(OBJLoader, url);
  const { camera } = useThree();

  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);

  useEffect(() => {
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    obj.position.sub(center);
    onDimensions({ x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) });

    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2;
    camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
    camera.lookAt(0, 0, 0);
  }, [obj, camera, onDimensions]);

  useEffect(() => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: modelColor,
          metalness: 0.6,
          roughness: 0.35,
          side: THREE.DoubleSide,
          wireframe,
          clippingPlanes: clipping ? [clippingPlane] : [],
        });
      }
    });
  }, [obj, clipping, clippingPlane, wireframe, modelColor]);

  useFrame(() => {
    if (clipping) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.max.y - box.min.y;
      clippingPlane.constant = box.min.y + size * clipValue;
    }
  });

  return <primitive object={obj} />;
};

// ── Camera Reset Helper ──
const CameraReset = ({ trigger }: { trigger: number }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (trigger > 0) {
      camera.position.set(3, 2.5, 4);
      camera.lookAt(0, 0, 0);
    }
  }, [trigger, camera]);
  return null;
};

// ── Main Component ──
export const ModelViewer = ({ file, onDimensions }: ModelViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"stl" | "obj" | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [clipping, setClipping] = useState(false);
  const [clipValue, setClipValue] = useState(0.5);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  // eslint-disable-next-line no-restricted-syntax
  const [modelColor, setModelColor] = useState("#94a3b8"); // OK: user-facing palette default
  const [showColors, setShowColors] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);

  // Phase 11A-extended: grid renkleri runtime token'larından okunur, tema değişiminde yeniden hesaplanır
  const { theme } = useTheme();
  const gridConfig = useMemo(
    () => ({
      cellColor: getCSSVar("--material-chrome", "#64748b"),
      sectionColor: getCSSVar("--precision-steel", "#475569"),
    }),
    // getCSSVar değerleri DOM'dan okunuyor; linter theme bağımlılığını
    // "gereksiz" sanıyor ama tema değişince renkler yeniden çözülmeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      setFileType(null);
      setDimensions(null);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "stl") setFileType("stl");
    else if (ext === "obj") setFileType("obj");
    else {
      setFileType(null);
      return;
    }

    setLoading(true);
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDimensions = (d: Dimensions) => {
    setDimensions(d);
    setLoading(false);
    onDimensions?.(d);
  };

  const handleMeasurePoint = useCallback((point: THREE.Vector3) => {
    setMeasurePoints((prev) => {
      if (prev.length >= 2) {
        const newPoints = [point];
        setMeasureDistance(null);
        return newPoints;
      }
      const newPoints = [...prev, point];
      if (newPoints.length === 2) {
        const dist = newPoints[0].distanceTo(newPoints[1]);
        setMeasureDistance(+dist.toFixed(2));
      }
      return newPoints;
    });
  }, []);

  const toggleMeasure = () => {
    if (measuring) {
      setMeasuring(false);
      setMeasurePoints([]);
      setMeasureDistance(null);
    } else {
      setMeasuring(true);
      setMeasurePoints([]);
      setMeasureDistance(null);
    }
  };

  if (!file) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 border border-dashed border-border">
        <Box size={48} className="text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground font-medium">3D Önizleme</p>
        <p className="text-xs text-muted-foreground/60 mt-1">STL veya OBJ dosyası yükleyin</p>
      </div>
    );
  }

  if (!fileType) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">Bu dosya formatı 3D önizlemeyi desteklemiyor.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">STL veya OBJ formatında dosya yükleyin.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-card border-b border-border shrink-0 flex-wrap">
        <button
          onClick={() => setResetTrigger((t) => t + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Kamerayı Sıfırla"
        >
          <RotateCcw size={14} /> Sıfırla
        </button>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => setShowGrid((g) => !g)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            showGrid ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Grid Aç/Kapa"
        >
          <Grid3x3 size={14} /> Grid
        </button>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => setClipping((c) => !c)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            clipping ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Kesit Görünümü"
        >
          <Scissors size={14} /> Kesit
        </button>

        {clipping && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={clipValue}
            onChange={(e) => setClipValue(parseFloat(e.target.value))}
            className="w-24 h-1 accent-primary ml-1"
          />
        )}

        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => setWireframe((w) => !w)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            wireframe ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Wireframe Modu"
        >
          <TriangleRight size={14} /> Wire
        </button>

        <div className="w-px h-5 bg-border" />

        <div className="relative">
          <button
            onClick={() => setShowColors((c) => !c)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              showColors ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Renk Değiştir"
          >
            <Palette size={14} />
            <span className="w-3 h-3 border border-border" style={{ backgroundColor: modelColor }} />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border p-2 flex gap-1.5 shadow-lg">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    setModelColor(c.color);
                    setShowColors(false);
                  }}
                  className={`w-6 h-6 border-2 transition-all ${
                    modelColor === c.color ? "border-primary scale-110" : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={toggleMeasure}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            measuring
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Ölçüm Aracı"
        >
          <Ruler size={14} /> Ölçüm
        </button>

        {measureDistance !== null && (
          <span className="text-xs font-mono text-destructive font-bold ml-1">{measureDistance} mm</span>
        )}

        {dimensions && (
          <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="text-primary font-semibold">X</span>
            {dimensions.x}
            <span className="text-primary font-semibold">Y</span>
            {dimensions.y}
            <span className="text-primary font-semibold">Z</span>
            {dimensions.z}mm
          </div>
        )}
      </div>

      {measuring && (
        <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive font-medium text-center">
          Ölçüm modu aktif — Model üzerinde 2 noktaya tıklayarak mesafe ölçün
        </div>
      )}

      <div className="flex-1 relative bg-muted/20">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        <Canvas
          camera={{ position: [3, 2.5, 4], fov: 45 }}
          gl={{ antialias: true, alpha: true, localClippingEnabled: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1} />
            <directionalLight position={[-3, 2, -3]} intensity={0.3} />

            <Center>
              {fileUrl && fileType === "stl" && (
                <STLModel
                  url={fileUrl}
                  clipping={clipping}
                  clipValue={clipValue}
                  wireframe={wireframe}
                  modelColor={modelColor}
                  onDimensions={handleDimensions}
                />
              )}
              {fileUrl && fileType === "obj" && (
                <OBJModel
                  url={fileUrl}
                  clipping={clipping}
                  clipValue={clipValue}
                  wireframe={wireframe}
                  modelColor={modelColor}
                  onDimensions={handleDimensions}
                />
              )}
            </Center>

            <MeasurementPoints points={measurePoints} distance={measureDistance} />
            <MeasureClickHandler measuring={measuring} onPoint={handleMeasurePoint} />

            {showGrid && (
              <Grid
                args={[100, 100]}
                cellSize={1}
                cellThickness={0.5}
                cellColor={gridConfig.cellColor}
                sectionSize={5}
                sectionThickness={1}
                sectionColor={gridConfig.sectionColor}
                fadeDistance={50}
                fadeStrength={1}
                followCamera={false}
                position={[0, -0.01, 0]}
              />
            )}

            <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={0.5} maxDistance={500} />

            <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
              {/* eslint-disable-next-line no-restricted-syntax */}
              <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} /* OK: XYZ convention */ labelColor="white" />
            </GizmoHelper>

            <CameraReset trigger={resetTrigger} />
          </Suspense>
        </Canvas>
      </div>

      {dimensions && (
        <div className="p-3 bg-card border-t border-border shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis} className="text-center p-2 bg-muted/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{axis} Ekseni</p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {dimensions[axis]} <span className="text-muted-foreground font-normal text-[10px]">mm</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
