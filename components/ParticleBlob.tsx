"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { usePerformanceMode } from "@/context/PerformanceModeContext";

// Organic, morphing blob of GPU particles you can gently stir with the
// cursor. Layered simplex noise displaces each particle's radius so the form
// is lumpy and alive; the pointer defines an axis and nearby particles rotate
// softly around it. All displacement, swirl, depth fade and colour run on the
// GPU in one ShaderMaterial.
//
// Never mounts in performance mode — a continuous WebGL raycast + shader
// loop is much heavier than anything else this app renders decoratively;
// see AmbientBackground for the same skip-entirely convention.
//
// Dark and light mode need genuinely different rendering, not just a
// different palette: additive blending (dark) only reads as a glow against a
// near-black backdrop — on white the added colour just washes out — so light
// mode switches to normal alpha blending with darker, more saturated colours
// and a higher minimum depth-fade floor (so the back hemisphere doesn't fade
// to near-invisible against a light page instead of into a dark one).
interface Palette {
  fogColor: number;
  colorLow: number;
  colorHigh: number;
  colorAccent: number;
  blending: THREE.Blending;
  minFade: number;
  alphaScale: number;
  backgroundGradient: string;
}

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    fogColor: 0x05060f,
    colorLow: 0x3320a8,
    colorHigh: 0x22d3ee,
    colorAccent: 0xf5d0fe,
    blending: THREE.AdditiveBlending,
    minFade: 0.2,
    alphaScale: 1,
    backgroundGradient: "radial-gradient(90% 90% at 50% 45%, rgba(51,32,168,0.30) 0%, rgba(5,6,15,0) 60%)",
  },
  light: {
    fogColor: 0xffffff,
    colorLow: 0x0ea5e9,
    colorHigh: 0x7dd3fc,
    colorAccent: 0x22d3ee,
    blending: THREE.NormalBlending,
    minFade: 0.3,
    alphaScale: 0.3,
    backgroundGradient: "radial-gradient(90% 90% at 50% 45%, rgba(14,165,233,0.08) 0%, rgba(255,255,255,0) 60%)",
  },
};

const noiseGLSL = /* glsl */ `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
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
`;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3  uMouse;
  uniform float uMouseStrength;
  uniform float uSize;
  uniform float uRadius;
  uniform float uFalloff;
  uniform vec3  uColorLow;
  uniform vec3  uColorHigh;
  uniform vec3  uColorAccent;
  uniform float uMinFade;
  uniform float uCenterFadeWidth;
  uniform float uCenterFadeStrength;
  uniform float uWarp; // 0.0 = Organic Blob, 1.0 = 3D Crystal Prism Pyramid

  attribute vec3 aPyramidPosition;

  varying vec3  vColor;
  varying float vFade;

  ${noiseGLSL}

  void main() {
    vec3 n = normalize(position);
    vec3 C = normalize(uMouse);

    // subtle cursor vortex: rotate nearby points around axis C (Rodrigues)
    float a    = acos(clamp(dot(n, C), -1.0, 1.0));
    float infl = exp(-a * a * uFalloff) * uMouseStrength;
    float ang  = uTime * 0.5 * infl;
    float cs = cos(ang), sn = sin(ang);
    vec3 nr = n * cs + cross(C, n) * sn + C * dot(C, n) * (1.0 - cs);

    // organic surface: layered simplex noise morphing over time
    float tN = uTime * 0.18;
    float disp =
        snoise(nr * 1.1 + vec3(0.0, 0.0, tN))      * 0.42
      + snoise(nr * 2.7 + vec3(tN * 1.3, tN, 0.0)) * 0.16
      + snoise(nr * 5.0 - vec3(tN * 0.7))          * 0.06;

    // magnetic ripple radiating from cursor
    float ripple = sin(a * 10.0 - uTime * 4.0) * exp(-a * 3.2) * uMouseStrength * 0.15;
    vec3 pos = nr * (uRadius * (1.0 + disp + infl * 0.12 + ripple));

    // Converge into 3D Crystal Prism Pyramid on sign in
    float morph = pow(clamp(uWarp, 0.0, 1.0), 2.2);
    pos = mix(pos, aPyramidPosition, morph);

    // Push top and bottom in vertically for a wider, sleek oblate profile when idle
    pos.y *= (1.0 - morph * 0.22) * 0.78 + morph * 0.22;

    // colour follows bulges + crystal prism illumination
    float hi = smoothstep(-0.3, 0.5, disp);
    vec3 col = mix(uColorLow, uColorHigh, hi);
    float coreGlow = clamp(infl * 1.3, 0.0, 1.0);
    col = mix(col, uColorAccent, coreGlow);
    col += uColorAccent * (infl * 0.35); // extra glow pop under cursor

    if (uWarp > 0.005) {
      vec3 prismCyan = vec3(0.15, 0.9, 1.0);
      vec3 prismGold = vec3(1.0, 0.85, 0.4);
      float heightGlow = sin(aPyramidPosition.y * 1.5 - uTime * 6.0) * 0.5 + 0.5;
      vec3 crystalCol = mix(prismCyan, prismGold, heightGlow);

      col = mix(col, crystalCol, morph * 0.9);
      col += vec3(1.0, 1.0, 1.0) * (morph * heightGlow * 0.45);
    }
    vColor = col;

    // depth fade so the front hemisphere reads over the back
    vec3 nrml = normalize(normalMatrix * normalize(pos + 1e-4));
    float depthFade = uMinFade + (1.0 - uMinFade) * smoothstep(-0.4, 0.55, nrml.z);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Extra dimming for whatever lands behind the centered hero text column
    float ndcX = gl_Position.x / gl_Position.w;
    float centerFade = 1.0 - uCenterFadeStrength * smoothstep(uCenterFadeWidth, 0.0, abs(ndcX));
    vFade = depthFade * centerFade;

    // Subtle micro-pulse sparkle per particle + size burst on hover
    float sparkle = sin(uTime * 2.5 + position.x * 15.0 + position.y * 9.0) * 0.08 + 0.92;
    gl_PointSize = uSize * sparkle * (1.0 + infl * 0.8 + hi * 0.25) * (12.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uAlphaScale;
  varying vec3  vColor;
  varying float vFade;
  void main() {
    float dc = length(gl_PointCoord - vec2(0.5));
    if (dc > 0.5) discard;
    float alpha = pow(smoothstep(0.5, 0.0, dc), 1.6) * vFade * uAlphaScale;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function ParticleBlobScene({ mount, palette, theme, isWarping = false }: { mount: HTMLDivElement; palette: Palette; theme: "dark" | "light"; isWarping?: boolean }) {
  const isWarpingRef = useRef(isWarping);
  useEffect(() => {
    isWarpingRef.current = isWarping;
  }, [isWarping]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const R = 9.8;

    // ---- scene / camera / renderer ---------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fogColor, 0.012);

    const WIDTH_STRETCH = 1.45;
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight / WIDTH_STRETCH, 0.1, 200);
    camera.position.set(0, 0, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ---- particles distributed on a sphere (Fibonacci) -------------------
    const count = 4200;
    const positions = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let k = 0; k < count; k++) {
      const uy = 1 - (k / (count - 1)) * 2;
      const rr = Math.sqrt(1 - uy * uy);
      const phi = k * golden;
      positions[k * 3] = Math.cos(phi) * rr * R;
      positions[k * 3 + 1] = uy * R;
      positions[k * 3 + 2] = Math.sin(phi) * rr * R;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // ---- 3D Prism / Pyramid Point Cloud Attribute -------------------------
    const pyramidPositions = new Float32Array(count * 3);
    const H = 13.0; // Pyramid height
    const B = 7.5;  // Base half-width
    const apex = new THREE.Vector3(0, H / 2, 0);
    const baseCorners = [
      new THREE.Vector3(-B, -H / 2, -B),
      new THREE.Vector3( B, -H / 2, -B),
      new THREE.Vector3( B, -H / 2,  B),
      new THREE.Vector3(-B, -H / 2,  B),
    ];

    for (let k = 0; k < count; k++) {
      const faceIndex = k % 4; // 4 triangular faces
      const v1 = baseCorners[faceIndex];
      const v2 = baseCorners[(faceIndex + 1) % 4];

      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1.0) {
        r1 = 1.0 - r1;
        r2 = 1.0 - r2;
      }

      const px = apex.x + r1 * (v1.x - apex.x) + r2 * (v2.x - apex.x);
      const py = apex.y + r1 * (v1.y - apex.y) + r2 * (v2.y - apex.y);
      const pz = apex.z + r1 * (v1.z - apex.z) + r2 * (v2.z - apex.z);

      pyramidPositions[k * 3] = px;
      pyramidPositions[k * 3 + 1] = py;
      pyramidPositions[k * 3 + 2] = pz;
    }

    geometry.setAttribute("aPyramidPosition", new THREE.BufferAttribute(pyramidPositions, 3));

    // ---- shader material --------------------------------------------------
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(9999, 9999, 9999) },
      uMouseStrength: { value: 0 },
      uSize: { value: 32.0 * Math.min(window.devicePixelRatio, 2) },
      uRadius: { value: R },
      uFalloff: { value: 6.5 },
      uColorLow: { value: new THREE.Color(palette.colorLow) },
      uColorHigh: { value: new THREE.Color(palette.colorHigh) },
      uColorAccent: { value: new THREE.Color(palette.colorAccent) },
      uMinFade: { value: palette.minFade },
      uAlphaScale: { value: palette.alphaScale },
      uCenterFadeWidth: { value: 0.34 },
      uCenterFadeStrength: { value: 0.6 },
      uWarp: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: palette.blending,
    });

    const CENTER_Y_OFFSET = 0;

    const points = new THREE.Points(geometry, material);
    points.position.y = CENTER_Y_OFFSET;
    scene.add(points);

    // ---- pointer -> sphere raycast ---------------------------------------
    const raycaster = new THREE.Raycaster();
    const bound = new THREE.Sphere(new THREE.Vector3(0, CENTER_Y_OFFSET, 0), R * 1.35);
    const ndc = new THREE.Vector2();
    const worldHit = new THREE.Vector3(9999, 9999, 9999);
    const localHit = new THREE.Vector3();
    let targetStrength = 0;

    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const p = raycaster.ray.intersectSphere(bound, worldHit);
      targetStrength = p ? 0.4 : 0;
    }
    function onPointerLeave() {
      targetStrength = 0;
    }
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);

    // ---- resize -----------------------------------------------------------
    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h / WIDTH_STRETCH;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ---- animation loop -----------------------------------------------------
    const clock = new THREE.Clock();
    let raf: number;

    function tick() {
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      uniforms.uTime.value = t;

      // Ramp uWarp: 0 (Organic Blob) -> 1 (3D Crystal Prism Pyramid)
      const targetWarp = isWarpingRef.current ? 1.0 : 0.0;
      uniforms.uWarp.value += (targetWarp - uniforms.uWarp.value) * 0.05;

      if (!reduceMotion) {
        const warp = uniforms.uWarp.value;
        const targetRotY = t * 0.07 + warp * 1.5;
        const targetRotX = THREE.MathUtils.lerp(Math.sin(t * 0.05) * 0.2, 0.28, warp);

        points.rotation.x = targetRotX;
        points.rotation.y = targetRotY;
      }
      points.updateMatrixWorld();

      localHit.copy(worldHit);
      points.worldToLocal(localHit);
      uniforms.uMouse.value.lerp(localHit, 0.08);

      uniforms.uMouseStrength.value += (targetStrength - uniforms.uMouseStrength.value) * 0.03;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // ---- cleanup ------------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mount, palette, theme]);

  return null;
}

export default function ParticleBlob({ isWarping = false }: { isWarping?: boolean }) {
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { performanceMode } = usePerformanceMode();

  useEffect(() => setMounted(true), []);

  if (!mounted || performanceMode) return null;

  const isDark = resolvedTheme === "dark";
  const palette = PALETTES[isDark ? "dark" : "light"];

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: palette.backgroundGradient }} />
      <div
        ref={setMountEl}
        className="pointer-events-auto absolute inset-0"
        style={{ filter: "blur(4px)" }}
      />
      {mountEl && <ParticleBlobScene key={isDark ? "dark" : "light"} mount={mountEl} palette={palette} theme={isDark ? "dark" : "light"} isWarping={isWarping} />}
    </div>
  );
}
