import { loadOcct } from "@/lib/occt";
import { useState, useCallback, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Grid, Center, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { getCSSVar } from "@/utils/cssVar";
import {
  Box, Camera, Ruler, Search, Lightbulb, Download, Share2,
  ChevronDown, ChevronUp, Pencil, Maximize, RotateCcw,
  Grid3x3, Scissors, TriangleRight, Palette, Loader2,
  List, PenTool, Upload, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, Filter, X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";

// ── Part Table Data ──
const partData = [
  { id: "SB 2310-63-001", length: "0.6300", headDia: "2.358", bodyDia: "1.000", headThk: "0.179", insideDia: "0.118", step: "0.451", holeDist: "0.865", cboreDia: "0.318", drill: "0.159", insideOD: "0.000", depth: "0.000", checked: false },
  { id: "SB 3525-90-001", length: "0.9000", headDia: "3.538", bodyDia: "2.500", headThk: "0.436", insideDia: "0.118", step: "0.464", holeDist: "1.510", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 2025-88", length: "0.8800", headDia: "4.330", bodyDia: "2.500", headThk: "0.187", insideDia: "0.500", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 4325-88-001", length: "0.8800", headDia: "4.330", bodyDia: "2.500", headThk: "0.467", insideDia: "0.118", step: "0.413", holeDist: "1.656", cboreDia: "0.514", drill: "0.257", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 4335-60", length: "0.6000", headDia: "4.330", bodyDia: "2.500", headThk: "0.187", insideDia: "1.000", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: true },
  { id: "SB 4335-80", length: "0.8000", headDia: "4.330", bodyDia: "2.500", headThk: "0.250", insideDia: "1.000", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.350", checked: false },
  { id: "SB 2025-100", length: "1.0000", headDia: "4.330", bodyDia: "2.500", headThk: "0.187", insideDia: "0.500", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 3525-120", length: "1.2000", headDia: "3.538", bodyDia: "2.500", headThk: "0.436", insideDia: "0.118", step: "0.464", holeDist: "1.510", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 4335-100", length: "1.0000", headDia: "4.330", bodyDia: "2.500", headThk: "0.187", insideDia: "1.000", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 2310-80", length: "0.8000", headDia: "2.358", bodyDia: "1.000", headThk: "0.179", insideDia: "0.118", step: "0.451", holeDist: "0.865", cboreDia: "0.318", drill: "0.159", insideOD: "0.000", depth: "0.000", checked: false },
  { id: "SB 4325-120", length: "1.2000", headDia: "4.330", bodyDia: "2.500", headThk: "0.467", insideDia: "0.118", step: "0.413", holeDist: "1.656", cboreDia: "0.514", drill: "0.257", insideOD: "2.000", depth: "0.280", checked: false },
  { id: "SB 2025-63", length: "0.6300", headDia: "4.330", bodyDia: "2.500", headThk: "0.187", insideDia: "0.500", step: "0.413", holeDist: "1.656", cboreDia: "0.375", drill: "0.250", insideOD: "2.000", depth: "0.280", checked: false },
];

const columns = [
  { key: "id", label: "Ident Number", sublabel: "IDNR" },
  { key: "length", label: "Length", sublabel: "L [Gümrük]" },
  { key: "headDia", label: "Head Dia.", sublabel: "D [Gümrük]" },
  { key: "bodyDia", label: "Body Dia.", sublabel: "D1 [Gümrük]" },
  { key: "headThk", label: "Head Thickness", sublabel: "HTK [Gümrük]" },
  { key: "insideDia", label: "Inside Dia.", sublabel: "ID [Gümrük]" },
  { key: "step", label: "Step", sublabel: "STEP [Gümrük]" },
  { key: "holeDist", label: "Hole Distance", sublabel: "DIS [Gümrük]" },
  { key: "cboreDia", label: "Cbore Dia.", sublabel: "CBORE [Gümrük]" },
  { key: "drill", label: "Drill", sublabel: "DRILL [Gümrük]" },
  { key: "insideOD", label: "Inside OD", sublabel: "IOD [Gümrük]" },
  { key: "depth", label: "Depth", sublabel: "DP [Gümrük]" },
];

// ── 3D Placeholder Model (Flanş/Silindir) ──
const PlaceholderModel = () => (
  <group>
    {/* Base cylinder */}
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[1.5, 1.5, 0.4, 64]} />
      <meshStandardMaterial color="#475569" /* OK: R3F runtime */ metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Shaft */}
    <mesh position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 2.6, 32]} />
      <meshStandardMaterial color="#64748b" /* OK: R3F runtime */ metalness={0.6} roughness={0.35} />
    </mesh>
    {/* Top cap */}
    <mesh position={[0, 3, 0]}>
      <cylinderGeometry args={[0.7, 0.7, 0.3, 32]} />
      <meshStandardMaterial color="#475569" /* OK: R3F runtime */ metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Bolt holes on base */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      return (
        <mesh key={i} position={[Math.cos(rad) * 1.1, 0.21, Math.sin(rad) * 1.1]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#334155" /* OK: R3F runtime */ metalness={0.8} roughness={0.2} />
        </mesh>
      );
    })}
  </group>
);

// ── STL Model for Dashboard ──
const DashSTLModel = ({ url, color, wireframe }: { url: string; color: string; wireframe: boolean }) => {
  const geometry = useLoader(STLLoader, url);
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry) return;
    geometry.center();
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2;
    camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = maxDim * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }, [geometry, camera]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
};

// ── STEP Model for Dashboard ──
const DashSTEPModel = ({ geometry, color, wireframe }: { geometry: THREE.BufferGeometry; color: string; wireframe: boolean }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry) return;
    geometry.center();
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * 2;
    camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = maxDim * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  }, [geometry, camera]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} side={THREE.DoubleSide} wireframe={wireframe} />
    </mesh>
  );
};

const CameraReset = ({ trigger }: { trigger: number }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (trigger > 0) {
      camera.position.set(4, 3, 5);
      camera.lookAt(0, 0, 0);
    }
  }, [trigger, camera]);
  return null;
};

// ── COLOR PRESETS — kullanıcıya gösterilen statik palet ──
const COLORS = [
  { label: "Çelik", color: "#64748b" },   // OK: user-facing palette
  { label: "Altın", color: "#d4a574" },   // OK: user-facing palette
  { label: "Mavi", color: "#3b82f6" },    // OK: user-facing palette
  { label: "Kırmızı", color: "#ef4444" }, // OK: user-facing palette
  { label: "Siyah", color: "#1e293b" },   // OK: user-facing palette
];

// ── Main Dashboard ──
export const CADDashboard = () => {
  const [checkedRows, setCheckedRows] = useState<Record<string, boolean>>(
    Object.fromEntries(partData.map((p) => [p.id, p.checked]))
  );
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<"3d" | "2d">("3d");
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [modelColor, setModelColor] = useState("#64748b"); // OK: user-facing palette default
  const [showColors, setShowColors] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"stl" | "obj" | "step" | null>(null);
  const [stepGeometry, setStepGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let data = [...partData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((p) =>
        Object.values(p).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      data.sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey] as string;
        const bv = (b as Record<string, unknown>)[sortKey] as string;
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return sortDir === "asc" ? an - bn : bn - an;
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return data;
  }, [searchQuery, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;

  const toggleSelectAll = () => {
    const allSelected = paginatedData.every((p) => checkedRows[p.id]);
    const updates = Object.fromEntries(paginatedData.map((p) => [p.id, !allSelected]));
    setCheckedRows((prev) => ({ ...prev, ...updates }));
  };

  const deleteSelected = () => {
    // In a real app this would delete from DB; here we just uncheck
    const updates = Object.fromEntries(
      Object.entries(checkedRows).filter(([, v]) => v).map(([k]) => [k, false])
    );
    setCheckedRows((prev) => ({ ...prev, ...updates }));
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "stl" && ext !== "obj" && ext !== "step" && ext !== "stp") return;
    setUploadedFile(file);
    setStepGeometry(null);

    if (ext === "step" || ext === "stp") {
      setFileType("step");
      setFileUrl(null);
      setStepLoading(true);
      try {
        const occt = await loadOcct();
        const buffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(buffer);
        const result = occt.ReadStepFile(fileBuffer, null);

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
        if (indices.length > 0) {
          geo.setIndex(indices);
        }
        geo.computeVertexNormals();
        setStepGeometry(geo);
      } catch (err) {
        console.error("STEP file parsing error:", err);
      } finally {
        setStepLoading(false);
      }
    } else {
      setFileType(ext as "stl" | "obj");
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const toggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    if (!document.fullscreenElement) {
      canvasContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleRow = (id: string) => {
    setCheckedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedRow = partData.find((p) => checkedRows[p.id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container-industrial">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-industrial text-2xl">3D CAD Parça Görüntüleyici</h1>
              <p className="text-sm text-muted-foreground mt-1">Endüstriyel parça analizi ve teklif yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="btn-industrial-primary text-xs flex items-center gap-2 py-2.5 px-5 cursor-pointer">
                <Upload size={14} /> STL/OBJ/STEP Yükle
                <input type="file" accept=".stl,.obj,.step,.stp" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* ── Search Bar ── */}
          <div className="bg-card border border-border border-b-0 p-3 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Parça ara... (ID, boyut, vb.)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">{selectedCount}</span>/{filteredAndSorted.length} seçili
              </span>
              {selectedCount > 0 && (
                <button
                  onClick={deleteSelected}
                  className="text-xs font-medium text-destructive border border-destructive/30 px-3 py-1.5 hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
                >
                  <X size={12} /> Seçimi Kaldır ({selectedCount})
                </button>
              )}
            </div>
          </div>

          {/* ── Part Table ── */}
          <div className="bg-card border border-border mb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-10 p-3">
                      <Checkbox
                        checked={paginatedData.length > 0 && paginatedData.every((p) => checkedRows[p.id])}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="w-8 p-3 text-center text-[10px] font-semibold text-muted-foreground">#</th>
                    <th className="w-8 p-3"></th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {sortKey === col.key ? (
                              sortDir === "asc" ? <ArrowUp size={10} className="text-primary" /> : <ArrowDown size={10} className="text-primary" />
                            ) : (
                              <ArrowUpDown size={10} className="text-muted-foreground/30" />
                            )}
                            <Pencil size={10} className="text-muted-foreground/50" />
                          </div>
                          <span className="text-[9px] font-normal normal-case tracking-normal text-muted-foreground/60">{col.sublabel}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((part, idx) => {
                    const isSelected = checkedRows[part.id];
                    return (
                      <tr
                        key={part.id}
                        className={`border-b border-border transition-colors ${
                          isSelected ? "bg-destructive/5 border-l-2 border-l-destructive" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="p-3">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(part.id)} />
                        </td>
                        <td className="p-3 text-center text-xs text-muted-foreground font-semibold">{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td className="p-3">
                          {isSelected && <Download size={14} className="text-destructive" />}
                        </td>
                        <td className="p-3 font-mono font-semibold text-foreground">{part.id}</td>
                        {columns.slice(1).map((col) => (
                          <td key={col.key} className="p-3 font-mono text-muted-foreground">
                            {(part as Record<string, unknown>)[col.key] as string}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-t border-border"
            >
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              {collapsed ? "Tabloyu genişlet" : `Sıkıştırılmış görünümü göster (${partData.length} ürün)`}
            </button>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">
                  Sayfa {currentPage} / {totalPages} ({filteredAndSorted.length} parça)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    İlk
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    ‹ Önceki
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-xs font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    Sonraki ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    Son
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Split Panel: 3D Viewer + Info Tabs ── */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-0 border border-t-0 border-border">
            {/* Left: 3D Viewer */}
            <div className="border-r border-border flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-card border-b border-border flex-wrap">
                {/* View toggles */}
                <button
                  onClick={() => setActiveView("3d")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeView === "3d" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Box size={14} /> 3D
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  <Camera size={14} />
                </button>
                <button
                  onClick={() => setActiveView("2d")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeView === "2d" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  2D
                </button>

                <div className="w-px h-5 bg-border" />

                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  <Ruler size={14} /> Ölçüm
                </button>

                <div className="w-px h-5 bg-border" />

                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  <Search size={14} /> 3D Ara
                  <ChevronDown size={12} />
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  <Lightbulb size={14} /> Tavsiyeler
                </button>

                <div className="w-px h-5 bg-border" />

                <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Download size={14} /> CAD (1) İndir
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Sub-toolbar */}
              <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/30 border-b border-border">
                <button
                  onClick={() => setResetTrigger((t) => t + 1)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Sıfırla"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setShowGrid((g) => !g)}
                  className={`p-1.5 transition-colors ${showGrid ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                  title="Grid"
                >
                  <Grid3x3 size={13} />
                </button>
                <button
                  onClick={() => setWireframe((w) => !w)}
                  className={`p-1.5 transition-colors ${wireframe ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                  title="Wireframe"
                >
                  <TriangleRight size={13} />
                </button>

                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColors((c) => !c)}
                    className="p-1.5 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
                    title="Renk"
                  >
                    <Palette size={13} />
                    <span className="w-3 h-3 border border-border" style={{ backgroundColor: modelColor }} />
                  </button>
                  {showColors && (
                    <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border p-2 flex gap-1.5 shadow-lg">
                      {COLORS.map((c) => (
                        <button
                          key={c.color}
                          onClick={() => { setModelColor(c.color); setShowColors(false); }}
                          className={`w-5 h-5 border-2 transition-all ${
                            modelColor === c.color ? "border-primary scale-110" : "border-border"
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3D Canvas */}
              <div ref={canvasContainerRef} className="flex-1 relative min-h-[400px] lg:min-h-[480px] bg-muted/10">
                {/* Loading overlay for STEP */}
                {stepLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80">
                    <Loader2 size={24} className="animate-spin text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">STEP dosyası işleniyor...</p>
                  </div>
                )}

                {/* Left vertical toolbar */}
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                  <button className="w-8 h-8 flex items-center justify-center bg-card/90 border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
                    <List size={14} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-card/90 border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
                    <PenTool size={14} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-card/90 border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
                    <Scissors size={14} />
                  </button>
                </div>

                {/* Bottom-right controls */}
                <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1">
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 flex items-center justify-center bg-card/90 border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                    title="Tam Ekran"
                  >
                    <Maximize size={14} />
                  </button>
                </div>

                <Canvas
                  camera={{ position: [4, 3, 5], fov: 45 }}
                  gl={{ antialias: true, alpha: true, localClippingEnabled: true }}
                  style={{ background: "transparent" }}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
                    <directionalLight position={[-3, 2, -3]} intensity={0.3} />

                    <Center>
                      {fileUrl && fileType === "stl" && (
                        <DashSTLModel url={fileUrl} color={modelColor} wireframe={wireframe} />
                      )}
                      {stepGeometry && fileType === "step" && (
                        <DashSTEPModel geometry={stepGeometry} color={modelColor} wireframe={wireframe} />
                      )}
                      {!fileUrl && !stepGeometry && (
                        <PlaceholderModel />
                      )}
                    </Center>

                    {/* Axis Helper */}
                    <axesHelper args={[3]} />

                    {showGrid && (
                      <Grid
                        args={[100, 100]}
                        cellSize={1}
                        cellThickness={0.5}
                        cellColor={getCSSVar("--material-chrome", "#94a3b8")}
                        sectionSize={5}
                        sectionThickness={1}
                        sectionColor={getCSSVar("--precision-steel", "#64748b")}
                        fadeDistance={30}
                        fadeStrength={1}
                        followCamera={false}
                        position={[0, -0.01, 0]}
                      />
                    )}

                    <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={0.5} maxDistance={100} />

                    <GizmoHelper alignment="top-right" margin={[70, 70]}>
                      <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} /* OK: XYZ convention */ labelColor="white" />
                    </GizmoHelper>

                    <CameraReset trigger={resetTrigger} />
                  </Suspense>
                </Canvas>
              </div>
            </div>

            {/* Right: Info Tabs */}
            <div className="bg-card flex flex-col">
              <Tabs defaultValue="info" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 px-2 h-auto py-0">
                  <TabsTrigger value="info" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-none py-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Parça bilgileri
                  </TabsTrigger>
                  <TabsTrigger value="similar" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-none py-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Benzer parçalar
                  </TabsTrigger>
                  <TabsTrigger value="rfq" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-none py-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    RFQ
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Part Info */}
                <TabsContent value="info" className="flex-1 p-5 m-0 space-y-5">
                  <div>
                    <h2 className="heading-industrial text-lg mb-1">DME - Sprue Bushings</h2>
                    <p className="text-xs text-muted-foreground">Standart enjeksiyon kalıp bileşeni</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground">Shorttext</span>
                      <span className="text-xs font-semibold text-foreground">Sprue Bushings</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground">Son değişiklik</span>
                      <span className="text-xs font-mono text-foreground">08.08.2017 12:11:15</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground">Parça</span>
                      <span className="text-xs font-semibold text-foreground">Gümrük</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground">Malzeme</span>
                      <span className="text-xs font-semibold text-foreground">H13 Tool Steel</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-xs text-muted-foreground">Ident Number</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{selectedRow?.id || "SB 4335-60"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">CAD</Badge>
                    <Badge className="text-[10px] bg-industrial-accent-light text-industrial-accent-dark border-industrial-accent/30 hover:bg-industrial-accent-light">Components</Badge>
                    <Badge variant="secondary" className="text-[10px]">LIBRARY</Badge>
                    <Badge variant="outline" className="text-[10px]">system</Badge>
                  </div>

                  {/* Additional specs if row selected */}
                  {selectedRow && (
                    <div className="mt-4 p-4 bg-muted/50 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Seçili Parça Boyutları</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Length</span>
                          <p className="font-mono font-bold">{selectedRow.length}"</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Head Dia</span>
                          <p className="font-mono font-bold">{selectedRow.headDia}"</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Body Dia</span>
                          <p className="font-mono font-bold">{selectedRow.bodyDia}"</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Head Thk</span>
                          <p className="font-mono font-bold">{selectedRow.headThk}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Similar Parts */}
                <TabsContent value="similar" className="flex-1 p-5 m-0">
                  <h3 className="heading-industrial text-sm mb-4">Benzer Parçalar</h3>
                  <div className="space-y-3">
                    {partData.filter((p) => !checkedRows[p.id]).slice(0, 4).map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-3 border border-border hover:border-primary/40 transition-colors">
                        <div>
                          <p className="text-xs font-mono font-semibold">{part.id}</p>
                          <p className="text-[10px] text-muted-foreground">{part.bodyDia}" body • {part.length}" length</p>
                        </div>
                        <button className="text-[10px] text-primary font-semibold border border-primary px-2 py-1 hover:bg-primary/10 transition-colors">
                          Görüntüle
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab: RFQ */}
                <TabsContent value="rfq" className="flex-1 p-5 m-0">
                  <h3 className="heading-industrial text-sm mb-2">Request for Quote</h3>
                  <p className="text-xs text-muted-foreground mb-5">Bu parça için fiyat teklifi talep edin.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Firma Adı</label>
                      <input className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Firma adınız" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">E-posta</label>
                      <input type="email" className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="ornek@firma.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Adet</label>
                      <input type="number" min={1} defaultValue={25} className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Notlar</label>
                      <textarea rows={3} className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Tolerans, malzeme, teslimat tercihi..." />
                    </div>
                    <button className="btn-industrial-primary w-full text-xs flex items-center justify-center gap-2 py-3">
                      <MessageSquare size={14} /> Teklif Talep Et
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};
