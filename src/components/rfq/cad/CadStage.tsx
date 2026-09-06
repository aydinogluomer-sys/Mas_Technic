import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Center, Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { getCSSVar } from "@/utils/cssVar";
import { useTheme } from "@/hooks/use-theme";
import { ShellLoading } from "@/components/shell";
import type { CadPreviewKind, Dimensions } from "../rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   THE CAD STAGE — the ONLY module on the public route that imports `three`

   THE MEASUREMENT THIS FILE EXISTS FOR. `/teklif-al` is already a lazy route
   (`App.tsx:66`), but its chunk carried a STATIC edge to the 858 kB chunk
   holding `three`, `@react-three/fiber`, `@react-three/drei`, `STLLoader` and
   `OBJLoader` — so every reader who opened the quote form downloaded a WebGL
   renderer whether or not they ever asked to look at a model. `occt-import-js`
   was the one thing already behind a dynamic `import()`; this file applies
   that same treatment to the rest, and `CadStageHost.tsx` is the boundary.

   NOTHING outside this folder may import `three` at value position. A single
   `import * as THREE` in a module the route reaches statically puts the whole
   858 kB back, silently, and the only way to notice is to re-run the chunk
   graph.

   ── WHAT WAS REMOVED, AND WHY IT IS NOT SILENT ───────────────────────────
   1. FULL SCREEN. `toggleFullscreen` set an `isFullscreen` flag that nothing
      ever read — the button said "Tam Ekran" in both states — and it listened
      for no `fullscreenchange`, so pressing Escape desynchronised it
      permanently. Inside a form step, on a phone, it also had no visible way
      out. A half-built control is worse than none; the plate frame and orbit
      controls carry the inspection job.
   2. THE SIX-COLOUR PICKER. `#94a3b8 / #d4a574 / #3b82f6 / #22c55e / #ef4444 /
      #1e293b` in a toolbar popover, duplicated again in a side panel. The
      model's colour has no bearing on a quote, and a row of colour chips is
      the "colour-coded pill" `mas-design-language` names. The part is drawn in
      the system's own chrome, read from tokens at runtime so a theme change
      moves it.
   3. THE PLACEHOLDER PART. A procedural flanged cylinder shown before upload.
      The stage now only mounts for a real file, so a decorative stand-in that
      cost a WebGL context is exactly the payload this phase is removing.

   ── AND ONE THING THAT WAS MISSING ───────────────────────────────────────
   `useLoader` throws on a corrupt or truncated model. There was no boundary
   between it and `ShellRouteBoundary`, so one unreadable STL replaced the
   ENTIRE quote form with the route-error page and took the reader's typed
   contact details with it. `StageErrorBoundary` catches it here and reports a
   parse failure beside the control, which is the "handle … parse failures"
   half of §7.
   ══════════════════════════════════════════════════════════════════════════ */

export type CadStageProps = {
  file: File;
  kind: CadPreviewKind;
  /** Bounding-box reading, published to the page for the review summary. */
  onDimensions: (dimensions: Dimensions | null) => void;
  onParseError: (message: string | null) => void;
  onClose: () => void;
};

type StageColors = { model: string; cell: string; section: string };

const measure = (box: THREE.Box3): Dimensions => {
  const size = new THREE.Vector3();
  box.getSize(size);
  return { x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) };
};

/** Frame the part: distance from its own longest edge, never a fixed number. */
function useFramedCamera(size: THREE.Vector3 | null) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    if (!size) return;
    const longest = Math.max(size.x, size.y, size.z) || 1;
    const distance = longest * 2;
    camera.position.set(distance * 0.6, distance * 0.5, distance * 0.8);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.near = longest / 100;
    perspective.far = longest * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [size, camera, invalidate]);
}

function PartSurface({ colors, wireframe }: { colors: StageColors; wireframe: boolean }) {
  return (
    <meshStandardMaterial
      color={colors.model}
      metalness={0.6}
      roughness={0.35}
      side={THREE.DoubleSide}
      wireframe={wireframe}
    />
  );
}

function StlPart({
  url,
  colors,
  wireframe,
  onDimensions,
}: {
  url: string;
  colors: StageColors;
  wireframe: boolean;
  onDimensions: (dimensions: Dimensions) => void;
}) {
  const geometry = useLoader(STLLoader, url);
  const size = useMemo(() => {
    geometry.center();
    geometry.computeBoundingBox();
    const vector = new THREE.Vector3();
    geometry.boundingBox?.getSize(vector);
    return vector;
  }, [geometry]);
  useFramedCamera(size);
  useEffect(() => {
    if (geometry.boundingBox) onDimensions(measure(geometry.boundingBox));
  }, [geometry, onDimensions]);

  return (
    <mesh geometry={geometry}>
      <PartSurface colors={colors} wireframe={wireframe} />
    </mesh>
  );
}

function ObjPart({
  url,
  colors,
  wireframe,
  onDimensions,
}: {
  url: string;
  colors: StageColors;
  wireframe: boolean;
  onDimensions: (dimensions: Dimensions) => void;
}) {
  const object = useLoader(OBJLoader, url);
  const size = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    object.position.sub(center);
    const vector = new THREE.Vector3();
    box.getSize(vector);
    return vector;
  }, [object]);
  useFramedCamera(size);

  useEffect(() => {
    onDimensions({ x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) });
  }, [size, onDimensions]);

  useEffect(() => {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = new THREE.MeshStandardMaterial({
        color: colors.model,
        metalness: 0.6,
        roughness: 0.35,
        side: THREE.DoubleSide,
        wireframe,
      });
    });
  }, [object, colors.model, wireframe]);

  return <primitive object={object} />;
}

function StepPart({
  geometry,
  colors,
  wireframe,
  onDimensions,
}: {
  geometry: THREE.BufferGeometry;
  colors: StageColors;
  wireframe: boolean;
  onDimensions: (dimensions: Dimensions) => void;
}) {
  const size = useMemo(() => {
    geometry.center();
    geometry.computeBoundingBox();
    const vector = new THREE.Vector3();
    geometry.boundingBox?.getSize(vector);
    return vector;
  }, [geometry]);
  useFramedCamera(size);
  useEffect(() => {
    if (geometry.boundingBox) onDimensions(measure(geometry.boundingBox));
  }, [geometry, onDimensions]);

  return (
    <mesh geometry={geometry}>
      <PartSurface colors={colors} wireframe={wireframe} />
    </mesh>
  );
}

/* ── STEP tessellation ────────────────────────────────────────────────────
   `occt-import-js` was already dynamically imported by the page; the call
   moves here so the WASM module is a sibling of the renderer that needs it
   rather than a dependency of the form. */
async function tessellateStep(file: File): Promise<THREE.BufferGeometry> {
  const occtimportjs = (await import("occt-import-js")).default;
  const occt = await occtimportjs();
  const buffer = new Uint8Array(await file.arrayBuffer());
  const result = occt.ReadStepFile(buffer, null);

  const vertices: number[] = [];
  const indices: number[] = [];
  for (const mesh of result.meshes) {
    const offset = vertices.length / 3;
    for (const value of mesh.attributes.position.array) vertices.push(value);
    if (mesh.index) for (const value of mesh.index.array) indices.push(value + offset);
  }
  if (vertices.length === 0) {
    throw new Error("STEP dosyasında çizilebilir yüzey bulunamadı.");
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  if (indices.length > 0) geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/* ── The local boundary ───────────────────────────────────────────────────*/
class StageErrorBoundary extends Component<
  { onError: (message: string) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* The exception itself goes to the console, never to the page. */
    console.error("[rfq] CAD stage failed", error, info.componentStack);
    this.props.onError("Model çizilirken dosya okunamadı. Dosya bozuk veya eksik olabilir.");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CadStage({ file, kind, onDimensions, onParseError, onClose }: CadStageProps) {
  const { theme } = useTheme();
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [stepGeometry, setStepGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [parsing, setParsing] = useState(kind === "step");
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  /* The object URL belongs to the stage, so it is created and revoked in the
     same place and cannot outlive the renderer that reads it. STEP is parsed
     from the `File` directly and needs none. */
  const objectUrl = useMemo(
    () => (kind === "step" ? null : URL.createObjectURL(file)),
    [file, kind],
  );
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  /* Runtime tokens, re-read on theme change: the part is drawn in the shell's
     own chrome and bronze rather than in literal hex. */
  const colors = useMemo<StageColors>(
    () => ({
      model: getCSSVar("--material-chrome", "#b8bcc2"),
      cell: getCSSVar("--tl-bronze-ink", "#6f5b45"),
      section: getCSSVar("--tl-bronze", "#8a7359"),
    }),
    // Values are read from the document, so the linter cannot see that the
    // theme is what makes them change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  /* Reported UP rather than drawn here: `RfqUploadStep` owns the one
     `ShellNotice tone="error"` for this step, so a parse failure is announced
     exactly once instead of by two `role="alert"` nodes carrying the same
     sentence. */
  const report = onParseError;

  const publishDimensions = useCallback(
    (next: Dimensions) => {
      setDimensions(next);
      onDimensions(next);
    },
    [onDimensions],
  );

  useEffect(() => {
    if (kind !== "step") return;
    let cancelled = false;
    setParsing(true);
    tessellateStep(file)
      .then((geometry) => {
        if (cancelled) {
          geometry.dispose();
          return;
        }
        setStepGeometry(geometry);
        report(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("[rfq] STEP parse failed", error);
        report(
          "STEP dosyası çözümlenemedi. Dosya bozuk olabilir; yine de teklif talebine ekleyebilirsiniz — " +
            "mühendislerimiz dosyayı kendi CAD yazılımlarında açar.",
        );
      })
      .finally(() => {
        if (!cancelled) setParsing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, kind, report]);

  useEffect(
    () => () => {
      stepGeometry?.dispose();
    },
    [stepGeometry],
  );

  return (
    <div className="shell-stack" data-gap="sm">
      <ul className="shell-segments" aria-label="Görünüm denetimleri">
        <li>
          <button
            type="button"
            className="shell-segment"
            aria-pressed={showGrid}
            onClick={() => setShowGrid((value) => !value)}
          >
            <span className="shell-segment-code">IZGARA</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="shell-segment"
            aria-pressed={wireframe}
            onClick={() => setWireframe((value) => !value)}
          >
            <span className="shell-segment-code">TEL KAFES</span>
          </button>
        </li>
        <li>
          <button type="button" className="shell-segment" onClick={onClose}>
            <span className="shell-segment-code">ÖNİZLEMEYİ KAPAT</span>
          </button>
        </li>
      </ul>

      <figure className="shell-plate">
        <div className="shell-plate-frame">
          {parsing ? (
            <ShellLoading
              label="STEP ÇÖZÜMLENİYOR"
              detail="Dosya tarayıcıda tesselasyona çevriliyor."
              fullHeight={false}
            />
          ) : (
            <Canvas
              /* `demand` rather than `always`: the scene is static between
                 interactions, and a permanent rAF loop on a form page costs
                 battery for nothing. Orbit changes and camera framing call
                 `invalidate()` themselves. */
              frameloop="demand"
              camera={{ position: [4, 3, 5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <StageErrorBoundary onError={report}>
                  <ambientLight intensity={0.55} />
                  <directionalLight position={[5, 8, 5]} intensity={1} />
                  <directionalLight position={[-3, 2, -3]} intensity={0.3} />
                  <Center>
                    {kind === "stl" && objectUrl && (
                      <StlPart
                        url={objectUrl}
                        colors={colors}
                        wireframe={wireframe}
                        onDimensions={publishDimensions}
                      />
                    )}
                    {kind === "obj" && objectUrl && (
                      <ObjPart
                        url={objectUrl}
                        colors={colors}
                        wireframe={wireframe}
                        onDimensions={publishDimensions}
                      />
                    )}
                    {kind === "step" && stepGeometry && (
                      <StepPart
                        geometry={stepGeometry}
                        colors={colors}
                        wireframe={wireframe}
                        onDimensions={publishDimensions}
                      />
                    )}
                  </Center>
                  {showGrid && (
                    <Grid
                      args={[100, 100]}
                      cellSize={1}
                      cellThickness={0.5}
                      cellColor={colors.cell}
                      sectionSize={5}
                      sectionThickness={1}
                      sectionColor={colors.section}
                      fadeDistance={30}
                      fadeStrength={1}
                      followCamera={false}
                      position={[0, -0.01, 0]}
                    />
                  )}
                  <OrbitControls
                    makeDefault
                    /* Damping needs a frame every tick to settle, which
                       contradicts `frameloop="demand"` and is inertia the
                       reader did not ask for under `prefers-reduced-motion`.
                       Rotation itself stays available at every setting: it is
                       direct manipulation, not an animation. */
                    enableDamping={false}
                    minDistance={0.5}
                    maxDistance={100}
                  />
                </StageErrorBoundary>
              </Suspense>
            </Canvas>
          )}
        </div>
        <figcaption>
          <span className="shell-plate-no">PLAKA 3B</span>
          <span className="shell-plate-caption">
            {dimensions
              ? `X ${dimensions.x} · Y ${dimensions.y} · Z ${dimensions.z} mm (sınırlayıcı kutu)`
              : `${file.name} — sürükleyerek döndürün`}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
