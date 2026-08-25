import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Center, Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { supabase } from "@/integrations/supabase/client";
import { getCSSVar } from "@/utils/cssVar";
import { useTheme } from "@/hooks/use-theme";
import {
  Loader2, Download, Box, FileText, Calendar, HardDrive,
  RotateCcw, Grid3x3, Scissors, TriangleRight, Palette, Ruler,
} from "lucide-react";

// ── Types ──
interface RFQCadPreviewProps {
  filePath: string;
  rfqId: string;
  userId: string | null;
  onDownload: () => void;
}

interface FileMetadata {
  name: string;
  size: number;
  extension: string;
  uploadDate: string;
  signedUrl: string | null;
}

interface Dimensions { x: number; y: number; z: number }

// ── Constants ──
const COLOR_PRESETS = [
  { label: "Çelik", color: "#94a3b8" },
  { label: "Altın", color: "#d4a574" },
  { label: "Mavi", color: "#3b82f6" },
  { label: "Yeşil", color: "#22c55e" },
  { label: "Kırmızı", color: "#ef4444" },
  { label: "Siyah", color: "#1e293b" },
];

const PREVIEWABLE_EXTS = ["stl", "obj", "step", "stp", "iges", "igs"];

// ── Helpers ──
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resolveStorageUrl = async (filePath: string, rfqId: string, userId: string | null) => {
  const rawPath = filePath.replace(/^\/+/, "").replace(/^cad-uploads\//, "").split("?")[0];
  const baseName = rawPath.split("/").pop() || rawPath;
  const cleanBaseName = baseName.replace(/^\d+_/, "");

  const trySign = async (path: string) => {
    const { data } = await supabase.storage.from("cad-uploads").createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  let url = await trySign(rawPath);
  if (url) return { url, path: rawPath };

  const dirs = [
    userId ? `${userId}/${rfqId}` : null,
    `anonymous/${rfqId}`,
  ].filter(Boolean) as string[];

  for (const dir of dirs) {
    const { data: files } = await supabase.storage.from("cad-uploads").list(dir, { limit: 200 });
    const match = files?.find((f) => f.name === baseName || f.name.includes(cleanBaseName));
    if (match) {
      const fullPath = `${dir}/${match.name}`;
      url = await trySign(fullPath);
      if (url) return { url, path: fullPath };
    }
  }

  const { data: rootFiles } = await supabase.storage.from("cad-uploads").list("", { limit: 200 });
  const rootMatch = rootFiles?.find((f) => f.name === baseName || f.name.includes(cleanBaseName));
  if (rootMatch) {
    url = await trySign(rootMatch.name);
    if (url) return { url, path: rootMatch.name };
  }

  return { url: null, path: rawPath };
};

const getFileMetadata = async (storagePath: string) => {
  const dir = storagePath.includes("/") ? storagePath.substring(0, storagePath.lastIndexOf("/")) : "";
  const fileName = storagePath.split("/").pop() || storagePath;
  const { data } = await supabase.storage.from("cad-uploads").list(dir || "", { limit: 200 });
  const fileObj = data?.find((f) => f.name === fileName);
  return fileObj ? {
    size: (fileObj.metadata as any)?.size || (fileObj.metadata as any)?.contentLength || 0,
    created: fileObj.created_at || "",
  } : { size: 0, created: "" };
};

/** Parse STEP/IGES file from a URL using occt-import-js */
const parseStepFromUrl = async (url: string, ext: string): Promise<THREE.BufferGeometry | null> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const occtimportjs = (await import("occt-import-js")).default;
    const occt = await occtimportjs();

    const isStep = ext === "step" || ext === "stp";
    const result = isStep
      ? occt.ReadStepFile(fileBuffer, null)
      : occt.ReadIgesFile
        ? occt.ReadIgesFile(fileBuffer, null)
        : occt.ReadStepFile(fileBuffer, null); // fallback

    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    for (const mesh of result.meshes) {
      const offset = vertices.length / 3;
      for (let i = 0; i < mesh.attributes.position.array.length; i++) {
        vertices.push(mesh.attributes.position.array[i]);
      }
      if (mesh.index) {
        for (let i = 0; i < mesh.index.array.length; i++) {
          indices.push(mesh.index.array[i] + offset);
        }
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    if (indices.length > 0) geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  } catch (err) {
    console.error("STEP/IGES parse error:", err);
    return null;
  }
};

// ── 3D Model Components ──

const MeasurementPoints = ({ points, distance }: { points: THREE.Vector3[]; distance: number | null }) => {
  if (points.length === 0) return null;
  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
      {points.length === 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([points[0].x, points[0].y, points[0].z, points[1].x, points[1].y, points[1].z]), 3]}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ef4444" linewidth={2} />
        </line>
      )}
    </group>
  );
};

const MeasureClickHandler = ({ measuring, onPoint }: { measuring: boolean; onPoint: (p: THREE.Vector3) => void }) => {
  const { raycaster, scene, camera, gl } = useThree();
  useEffect(() => {
    if (!measuring) return;
    const canvas = gl.domElement;
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      scene.traverse((obj) => { if ((obj as THREE.Mesh).isMesh) meshes.push(obj); });
      const hits = raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) onPoint(hits[0].point.clone());
    };
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [measuring, raycaster, scene, camera, gl, onPoint]);
  return null;
};

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

const STLModel = ({ url, clipping, clipValue, wireframe, modelColor, onDimensions }: {
  url: string; clipping: boolean; clipValue: number; wireframe: boolean; modelColor: string; onDimensions: (d: Dimensions) => void;
}) => {
  const geometry = useLoader(STLLoader, url);
  const { camera } = useThree();
  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);

  useEffect(() => {
    if (!geometry) return;
    geometry.center();
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
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
    <mesh geometry={geometry}>
      <meshStandardMaterial color={modelColor} metalness={0.6} roughness={0.35} side={THREE.DoubleSide} wireframe={wireframe} clippingPlanes={clipping ? [clippingPlane] : []} clipShadows />
    </mesh>
  );
};

const OBJModel = ({ url, clipping, clipValue, wireframe, modelColor, onDimensions }: {
  url: string; clipping: boolean; clipValue: number; wireframe: boolean; modelColor: string; onDimensions: (d: Dimensions) => void;
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
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: modelColor, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide, wireframe,
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

/** STEP/IGES model rendered from pre-parsed BufferGeometry */
const STEPModelRenderer = ({ geometry, clipping, clipValue, wireframe, modelColor, onDimensions }: {
  geometry: THREE.BufferGeometry; clipping: boolean; clipValue: number; wireframe: boolean; modelColor: string; onDimensions: (d: Dimensions) => void;
}) => {
  const { camera } = useThree();
  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);

  useEffect(() => {
    if (!geometry) return;
    geometry.center();
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
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
    <mesh geometry={geometry}>
      <meshStandardMaterial color={modelColor} metalness={0.6} roughness={0.35} side={THREE.DoubleSide} wireframe={wireframe} clippingPlanes={clipping ? [clippingPlane] : []} clipShadows />
    </mesh>
  );
};

// ── Viewer Toolbar + Canvas ──
const CadViewer = ({ signedUrl, extension, stepGeometry }: { signedUrl: string; extension: string; stepGeometry?: THREE.BufferGeometry | null }) => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [clipping, setClipping] = useState(false);
  const [clipValue, setClipValue] = useState(0.5);
  const [wireframe, setWireframe] = useState(false);
  const [modelColor, setModelColor] = useState("#94a3b8");
  const [showColors, setShowColors] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const { theme } = useTheme();
  const gridConfig = useMemo(() => ({
    cellColor: getCSSVar("--material-chrome", "#64748b"),
    sectionColor: getCSSVar("--precision-steel", "#475569"),
    _t: theme,
  }), [theme]);

  const handleDimensions = useCallback((d: Dimensions) => setDimensions(d), []);

  const handleMeasurePoint = useCallback((point: THREE.Vector3) => {
    setMeasurePoints((prev) => {
      if (prev.length >= 2) {
        setMeasureDistance(null);
        return [point];
      }
      const newPoints = [...prev, point];
      if (newPoints.length === 2) setMeasureDistance(+newPoints[0].distanceTo(newPoints[1]).toFixed(2));
      return newPoints;
    });
  }, []);

  const toggleMeasure = () => {
    setMeasuring((m) => !m);
    setMeasurePoints([]);
    setMeasureDistance(null);
  };

  const isStepType = ["step", "stp", "iges", "igs"].includes(extension);

  const ToolBtn = ({ active, onClick, icon, label }: { active?: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded transition-colors ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      title={label}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="rounded-lg overflow-hidden border dark:border-[#334155] border-slate-200">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 bg-card border-b border-border flex-wrap">
        <ToolBtn onClick={() => setResetTrigger((t) => t + 1)} icon={<RotateCcw size={12} />} label="Sıfırla" />
        <div className="w-px h-4 bg-border" />
        <ToolBtn active={showGrid} onClick={() => setShowGrid((g) => !g)} icon={<Grid3x3 size={12} />} label="Grid" />
        <div className="w-px h-4 bg-border" />
        <ToolBtn active={clipping} onClick={() => setClipping((c) => !c)} icon={<Scissors size={12} />} label="Kesit" />
        {clipping && (
          <input type="range" min={0} max={1} step={0.01} value={clipValue}
            onChange={(e) => setClipValue(parseFloat(e.target.value))}
            className="w-16 h-1 accent-primary" />
        )}
        <div className="w-px h-4 bg-border" />
        <ToolBtn active={wireframe} onClick={() => setWireframe((w) => !w)} icon={<TriangleRight size={12} />} label="Wire" />
        <div className="w-px h-4 bg-border" />
        <div className="relative">
          <button
            onClick={() => setShowColors((c) => !c)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded transition-colors ${
              showColors ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Palette size={12} />
            <span className="w-2.5 h-2.5 rounded-sm border border-border" style={{ backgroundColor: modelColor }} />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border p-1.5 flex gap-1 shadow-lg rounded">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => { setModelColor(c.color); setShowColors(false); }}
                  className={`w-5 h-5 rounded-sm border-2 transition-all ${modelColor === c.color ? "border-primary scale-110" : "border-border hover:border-primary/50"}`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-border" />
        <ToolBtn active={measuring} onClick={toggleMeasure} icon={<Ruler size={12} />} label="Ölçüm" />
        {measureDistance !== null && (
          <span className="text-[10px] font-mono text-destructive font-bold ml-1">{measureDistance} mm</span>
        )}

        {dimensions && (
          <div className="ml-auto flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
            <span className="text-primary font-bold">X</span>{dimensions.x}
            <span className="text-primary font-bold">Y</span>{dimensions.y}
            <span className="text-primary font-bold">Z</span>{dimensions.z}mm
          </div>
        )}
      </div>

      {measuring && (
        <div className="px-2 py-1 bg-destructive/10 border-b border-destructive/20 text-[10px] text-destructive font-bold text-center">
          Ölçüm modu — Model üzerinde 2 noktaya tıklayın
        </div>
      )}

      {/* Canvas */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800" style={{ height: 300 }}>
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
              {extension === "stl" && (
                <STLModel url={signedUrl} clipping={clipping} clipValue={clipValue} wireframe={wireframe} modelColor={modelColor} onDimensions={handleDimensions} />
              )}
              {extension === "obj" && (
                <OBJModel url={signedUrl} clipping={clipping} clipValue={clipValue} wireframe={wireframe} modelColor={modelColor} onDimensions={handleDimensions} />
              )}
              {isStepType && stepGeometry && (
                <STEPModelRenderer geometry={stepGeometry} clipping={clipping} clipValue={clipValue} wireframe={wireframe} modelColor={modelColor} onDimensions={handleDimensions} />
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

            <GizmoHelper alignment="bottom-right" margin={[50, 50]}>
              <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} /* OK: XYZ convention */ labelColor="white" />
            </GizmoHelper>

            <CameraReset trigger={resetTrigger} />
          </Suspense>
        </Canvas>
      </div>

      {/* Dimensions Card */}
      {dimensions && (
        <div className="p-2 bg-card border-t border-border">
          <div className="grid grid-cols-3 gap-1.5">
            {(["x", "y", "z"] as const).map((axis) => (
              <div key={axis} className="text-center p-1.5 bg-muted/50 rounded">
                <p className="text-[9px] font-bold uppercase tracking-wider text-primary">{axis} Ekseni</p>
                <p className="text-xs font-bold font-mono text-foreground">{dimensions[axis]} <span className="text-muted-foreground font-normal text-[9px]">mm</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ──
export const RFQCadPreview = ({ filePath, rfqId, userId, onDownload }: RFQCadPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<FileMetadata | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stepGeometry, setStepGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [stepLoading, setStepLoading] = useState(false);

  const baseName = filePath.split("/").pop() || filePath;
  const extension = baseName.split(".").pop()?.toLowerCase() || "";
  const canPreview = PREVIEWABLE_EXTS.includes(extension);
  const isStepType = ["step", "stp", "iges", "igs"].includes(extension);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { url, path } = await resolveStorageUrl(filePath, rfqId, userId);
      const fileMeta = await getFileMetadata(path);
      if (!cancelled) {
        setMeta({
          name: baseName,
          size: fileMeta.size,
          extension: extension.toUpperCase(),
          uploadDate: fileMeta.created ? new Date(fileMeta.created).toLocaleDateString("tr-TR") : "-",
          signedUrl: url,
        });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filePath, rfqId, userId, baseName, extension]);

  const handleOpenPreview = async () => {
    setShowPreview(true);

    // For STEP/IGES, parse the file on demand
    if (isStepType && meta?.signedUrl && !stepGeometry) {
      setStepLoading(true);
      const geo = await parseStepFromUrl(meta.signedUrl, extension);
      setStepGeometry(geo);
      setStepLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!meta) return null;

  return (
    <div className="space-y-2">
      {/* Metadata Card */}
      <div className="rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Box size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold dark:text-white text-slate-800 truncate">{meta.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] dark:text-slate-400 text-slate-500">
                  <FileText size={10} /> {meta.extension}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] dark:text-slate-400 text-slate-500">
                  <HardDrive size={10} /> {meta.size > 0 ? formatFileSize(meta.size) : "—"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] dark:text-slate-400 text-slate-500">
                  <Calendar size={10} /> {meta.uploadDate}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onDownload} className="shrink-0 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="İndir">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 3D Preview */}
      {canPreview && meta.signedUrl && (
        <div>
          {!showPreview ? (
            <button
              onClick={handleOpenPreview}
              className="w-full py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Box size={14} /> 3D Önizleme — Boyut Analizi, Kesit, Ölçüm
            </button>
          ) : (
            <div className="relative">
              {stepLoading ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-lg border dark:border-[#334155] border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                  <p className="text-xs text-slate-400 font-bold">STEP/IGES dosyası işleniyor…</p>
                </div>
              ) : (
                <>
                  <CadViewer signedUrl={meta.signedUrl} extension={extension} stepGeometry={stepGeometry} />
                  <button
                    onClick={() => setShowPreview(false)}
                    className="absolute top-1.5 right-1.5 z-10 text-[10px] px-2 py-0.5 rounded bg-black/50 text-white/70 hover:text-white"
                  >
                    Kapat
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!canPreview && (
        <p className="text-[10px] dark:text-slate-500 text-slate-400">
          Bu dosya formatı için önizleme desteklenmiyor, dosyayı indirip yerel CAD yazılımında açabilirsiniz.
        </p>
      )}
    </div>
  );
};
