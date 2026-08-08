"use client";

import { useEffect, useState } from "react";
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
  // Additive blending (dark) never needs this turned down — overlapping glow
  // is the whole point. Normal blending (light) paints an opaque-ish disc per
  // particle, so at full strength a dense cluster reads as a solid dark inkblot
  // that wrecks contrast for anything sitting behind it (the hero's muted
  // subtext was nearly unreadable before this was added) — turned down well
  // below 1 so it stays a light sprinkle instead.
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

interface ColorPreset {
  colorLow: number;
  colorHigh: number;
  colorAccent: number;
}

const COLOR_PRESETS: Record<"dark" | "light", ColorPreset[]> = {
  dark: [
    { colorLow: 0x3320a8, colorHigh: 0x22d3ee, colorAccent: 0xf5d0fe }, // Indigo / Cyan / Pink
    { colorLow: 0x581c87, colorHigh: 0xf43f5e, colorAccent: 0xfef08a }, // Purple / Rose / Amber
    { colorLow: 0x064e3b, colorHigh: 0x10b981, colorAccent: 0x6ee7b7 }, // Emerald / Teal / Mint
    { colorLow: 0x701a75, colorHigh: 0xfb923c, colorAccent: 0xfde68a }, // Magenta / Warm Orange / Yellow
  ],
  light: [
    { colorLow: 0x0ea5e9, colorHigh: 0x7dd3fc, colorAccent: 0x22d3ee }, // Sky / Cyan / Light Cyan
    { colorLow: 0x7c3aed, colorHigh: 0xc084fc, colorAccent: 0xf472b6 }, // Purple / Lavender / Pink
    { colorLow: 0x0d9488, colorHigh: 0x34d399, colorAccent: 0x38bdf8 }, // Teal / Mint / Sky
  ],
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

    // colour follows the bulges + intense glowing pop at vortex center
    float hi = smoothstep(-0.3, 0.5, disp);
    vec3 col = mix(uColorLow, uColorHigh, hi);
    float coreGlow = clamp(infl * 1.3, 0.0, 1.0);
    col = mix(col, uColorAccent, coreGlow);
    col += uColorAccent * (infl * 0.35); // extra glow pop under cursor
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

function ParticleBlobScene({ mount, palette, theme }: { mount: HTMLDivElement; palette: Palette; theme: "dark" | "light" }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const R = 8;

    // ---- scene / camera / renderer ---------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fogColor, 0.012);

    // Widens the whole render horizontally to better fill the hero's width
    // on wide viewports, by under-reporting the camera's aspect ratio (a
    // deliberate anamorphic-style distortion at the projection level) rather
    // than non-uniformly scaling the sphere itself — scaling the object
    // would get rotated along with its own slow spin animation below,
    // periodically looking narrow instead of staying consistently wide.
    // Raycasting uses this same camera, so pointer interaction automatically
    // lines up with the stretched shape too.
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

    // ---- shader material --------------------------------------------------
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(9999, 9999, 9999) },
      uMouseStrength: { value: 0 },
      uSize: { value: 32.0 * Math.min(window.devicePixelRatio, 2) },
      uRadius: { value: R },
      uFalloff: { value: 6.5 }, // tighter -> smaller, subtler swirl
      uColorLow: { value: new THREE.Color(palette.colorLow) },
      uColorHigh: { value: new THREE.Color(palette.colorHigh) },
      uColorAccent: { value: new THREE.Color(palette.colorAccent) },
      uMinFade: { value: palette.minFade },
      uAlphaScale: { value: palette.alphaScale },
      // Fades particles within the central ~34% of the viewport width (in
      // NDC, so this scales with the container regardless of size) down to
      // 40% of their normal opacity, tapering back to full strength outside
      // that band — keeps the hero's centered text legible without a hard
      // "text-shaped hole" cut out of the blob.
      uCenterFadeWidth: { value: 0.34 },
      uCenterFadeStrength: { value: 0.6 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: palette.blending,
    });

    // Shifted down (in world space, not just visually) so the blob's centre
    // sits behind the "Sign in with Google" button instead of the headline —
    // the button sits well below the hero's vertical midpoint, which is
    // where the origin-centred sphere would otherwise land.
    const CENTER_Y_OFFSET = 0;

    const points = new THREE.Points(geometry, material);
    points.position.y = CENTER_Y_OFFSET;
    scene.add(points);

    // ---- pointer -> sphere raycast ---------------------------------------
    // Bound sphere's centre matches the points' offset above — raycasting
    // happens in world space, so this has to track wherever the mesh
    // actually is, not the origin.
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
      targetStrength = p ? 0.4 : 0; // gentle peak strength
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

    // Temporary THREE.Color instances reused per frame to avoid allocation
    const tmpLow = new THREE.Color();
    const tmpNextLow = new THREE.Color();
    const tmpHigh = new THREE.Color();
    const tmpNextHigh = new THREE.Color();
    const tmpAccent = new THREE.Color();
    const tmpNextAccent = new THREE.Color();

    function tick() {
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      uniforms.uTime.value = t;

      if (!reduceMotion) {
        points.rotation.y = t * 0.07;
        points.rotation.x = Math.sin(t * 0.05) * 0.2;

        // Smoothly fade between dynamic color gradient presets over time
        const presets = COLOR_PRESETS[theme] || COLOR_PRESETS.dark;
        const CYCLE_DURATION = 10; // seconds per gradient morph
        const totalDuration = presets.length * CYCLE_DURATION;
        const progress = (t % totalDuration) / CYCLE_DURATION;
        const idx = Math.floor(progress);
        const nextIdx = (idx + 1) % presets.length;
        const rawFactor = progress - idx;
        const factor = 0.5 - 0.5 * Math.cos(rawFactor * Math.PI); // Cosine ease

        const currentP = presets[idx];
        const nextP = presets[nextIdx];

        tmpLow.setHex(currentP.colorLow).lerp(tmpNextLow.setHex(nextP.colorLow), factor);
        tmpHigh.setHex(currentP.colorHigh).lerp(tmpNextHigh.setHex(nextP.colorHigh), factor);
        tmpAccent.setHex(currentP.colorAccent).lerp(tmpNextAccent.setHex(nextP.colorAccent), factor);

        uniforms.uColorLow.value.copy(tmpLow);
        uniforms.uColorHigh.value.copy(tmpHigh);
        uniforms.uColorAccent.value.copy(tmpAccent);
      }
      points.updateMatrixWorld();

      localHit.copy(worldHit);
      points.worldToLocal(localHit);
      // Fluid spring/inertia trail following mouse movement smoothly
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

export default function ParticleBlob() {
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { performanceMode } = usePerformanceMode();

  // Same "wait for client mount before reading the theme" gate as
  // Navbar's ThemeToggle — resolvedTheme is undefined on the server/first
  // render, so deciding whether to render off it any earlier would mismatch
  // during hydration.
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
      {/* Keyed by theme so toggling dark/light fully tears down and rebuilds
          the WebGL scene with the new palette/blending mode, rather than
          trying to hot-swap material state on a live renderer. */}
      {mountEl && <ParticleBlobScene key={isDark ? "dark" : "light"} mount={mountEl} palette={palette} theme={isDark ? "dark" : "light"} />}
    </div>
  );
}
