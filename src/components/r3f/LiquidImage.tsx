/**
 * LiquidImage.tsx — R3F plane with custom GLSL shaders
 *
 * Features:
 *   • Liquid distortion on mouse hover (simplex noise displacement)
 *   • RGB shift / chromatic aberration on fast mouse movement
 *   • Scroll-driven parallax on Y axis
 */
import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useLocalTexture } from "@/utils/useLocalTexture";
import * as THREE from "three";

/* ── Vertex Shader ── */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScrollY;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec2 vUv;
  varying vec3 vPos;

  // simplex 3d noise
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x2_ = x_ * ns.x + ns.yyyy;
    vec4 y2_ = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x2_) - abs(y2_);
    vec4 b0 = vec4(x2_.xy, y2_.xy);
    vec4 b1 = vec4(x2_.zw, y2_.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Liquid distortion near mouse
    float dist = distance(uv, uMouse);
    float wave = snoise(vec3(uv * 3.0, uTime * 0.4)) * 0.06 * uHover;
    float mousePush = smoothstep(0.5, 0.0, dist) * 0.12 * uHover;
    pos.z += wave + mousePush;

    // Scroll parallax
    pos.y += uScrollY * 0.15;

    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/* ── Fragment Shader ── */
const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uRGBShift;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Subtle organic warp
    float warp = sin(uv.y * 8.0 + uTime * 0.3) * 0.003 * uHover;
    uv.x += warp;

    // RGB shift (chromatic aberration) based on mouse speed
    float shift = uRGBShift * 0.008;
    float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;

    vec4 color = vec4(r, g, b, 1.0);

    // Vignette
    float vig = 1.0 - smoothstep(0.4, 1.4, length(vUv - 0.5) * 1.6);
    color.rgb *= mix(0.7, 1.0, vig);

    // Brightness / contrast
    color.rgb = color.rgb * 0.85 + 0.02;

    color.a *= uOpacity;
    gl_FragColor = color;
  }
`;

interface LiquidImageProps {
  src: string;
  scale?: [number, number, number];
  opacity?: number;
}

export const LiquidImage = ({ src, scale, opacity = 1.0 }: LiquidImageProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  const texture = useLocalTexture(src);

  // Make texture cover viewport
  const imgAspect = texture.image ? texture.image.width / texture.image.height : 16 / 9;
  const vpAspect = viewport.width / viewport.height;

  const computedScale = useMemo<[number, number, number]>(() => {
    if (scale) return scale;
    if (vpAspect > imgAspect) {
      return [viewport.width, viewport.width / imgAspect, 1];
    }
    return [viewport.height * imgAspect, viewport.height, 1];
  }, [viewport.width, viewport.height, imgAspect, vpAspect, scale]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uRGBShift: { value: 0 },
      uScrollY: { value: 0 },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture],
  );

  // Track mouse for distortion
  const prevMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseSpeed = useRef(0);
  const isHovered = useRef(false);

  const onPointerMove = useCallback((e: THREE.Event & { uv?: THREE.Vector2 }) => {
    if (e.uv) {
      const dx = e.uv.x - prevMouse.current.x;
      const dy = e.uv.y - prevMouse.current.y;
      mouseSpeed.current = Math.sqrt(dx * dx + dy * dy);
      prevMouse.current.set(e.uv.x, e.uv.y);
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;

    mat.uniforms.uTime.value += delta;
    mat.uniforms.uMouse.value.lerp(prevMouse.current, 0.08);

    // Smooth hover
    const targetHover = isHovered.current ? 1.0 : 0.0;
    mat.uniforms.uHover.value += (targetHover - mat.uniforms.uHover.value) * 0.06;

    // RGB shift from mouse speed
    mat.uniforms.uRGBShift.value += (mouseSpeed.current * 12 - mat.uniforms.uRGBShift.value) * 0.1;
    mouseSpeed.current *= 0.92; // decay

    // Scroll parallax
    const scrollNorm = window.scrollY / window.innerHeight;
    mat.uniforms.uScrollY.value += (scrollNorm * 0.5 - mat.uniforms.uScrollY.value) * 0.05;
  });

  return (
    <mesh
      ref={meshRef}
      scale={computedScale}
      onPointerMove={onPointerMove}
      onPointerEnter={() => { isHovered.current = true; }}
      onPointerLeave={() => { isHovered.current = false; }}
    >
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};
