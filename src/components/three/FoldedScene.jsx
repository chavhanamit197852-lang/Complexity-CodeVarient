'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FoldedSceneFallback from './FoldedSceneFallback';

/* ------------------------------------------------------------------
   VERTEX SHADER  (same look, cheaper math)
------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uFoldAngle;
  uniform float uSphereRadius;
  uniform float uSegments;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  vec3 projectOntoSphere(vec3 pos) {
    float R = uSphereRadius;
    float u = pos.x / (uSegments * 0.5);
    float v = pos.y / (uSegments * 0.5);
    float lon = u * 0.9;
    float lat = v * 0.6;
    float cosA = cos(uFoldAngle);
    float sinA = sin(uFoldAngle);
    vec3 spherePos = vec3(
      R * cos(lat) * sin(lon),
      R * sin(lat),
      R * cos(lat) * cos(lon) - R
    );
    return vec3(
      spherePos.x * cosA + spherePos.z * sinA,
      spherePos.y,
      -spherePos.x * sinA + spherePos.z * cosA
    );
  }

  void main() {
    vUv = uv;
    vec3 flatPos = position;
    float foldMask = smoothstep(0.0, 0.35, uProgress);
    float localProgress = clamp(uProgress * 1.4 - 0.2, 0.0, 1.0);
    vec3 spherePos = projectOntoSphere(flatPos);
    vec3 finalPos = mix(flatPos, spherePos, localProgress * foldMask);

    vNormal = normalize(mix(normal, normalize(spherePos), localProgress * foldMask));

    vec4 worldPos = modelMatrix * vec4(finalPos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/* ------------------------------------------------------------------
   FRAGMENT SHADER — discard transparent pixels early (huge perf win)
------------------------------------------------------------------ */
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform vec3 uRimColor;
  uniform vec3 uAccentColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
    float rim = fresnel * 0.85;
    float dispersion = fresnel * 0.15;
    vec3 rimColor = mix(uRimColor, uAccentColor, dispersion);
    vec3 color = mix(vec3(1.0), rimColor, rim);
    float alpha = mix(0.02, 0.55, rim) * smoothstep(0.0, 0.85, uProgress);

    // ⚡ Critical: kill fully-transparent fragments so the GPU never shades them
    if (alpha < 0.015) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function FoldedScene() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

  // Reduced-motion + WebGL check on mount (SSR safe)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setUseFallback(true);
      return;
    }
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) setUseFallback(true);
  }, []);

  useEffect(() => {
    if (useFallback) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Detect low-power device → gentler settings
    const lowPower =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
      (navigator.deviceMemory && navigator.deviceMemory < 4);

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !lowPower,                    // antialias off on mobile = big win
      powerPreference: lowPower ? 'low-power' : 'high-performance',
      stencil: false,
      depth: false,                            // no depth buffer needed
    });
    // ⚡ Cap pixel ratio — retina 2× → 4× pixel work
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.info.autoReset = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    // ⚡ Segments: 48 desktop / 32 mobile (was 128)
    const segments = lowPower ? 32 : 48;
    const size = 4;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    const uniforms = {
      uProgress: { value: 0 },
      uFoldAngle: { value: THREE.MathUtils.degToRad(30) },
      uSphereRadius: { value: 2.2 },
      uSegments: { value: segments },
      uRimColor: { value: new THREE.Color('#22d3ee') },
      uAccentColor: { value: new THREE.Color('#8b5cf6') },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      side: THREE.FrontSide,                   // was DoubleSide — halves fragment work
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,          // was Additive — cheaper, no overdraw artifact
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -0.15;
    mesh.rotation.y = 0.2;
    scene.add(mesh);

    /* ---------- Visibility gate: stop rendering when off-screen ---------- */
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { rootMargin: '100px' }
    );
    io.observe(container);

    /* ---------- Dirty-flag render loop (no idle drift) ---------- */
    let rafId = 0;
    let dirty = true;
    const requestFrame = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const tick = () => {
      rafId = 0;
      if (!visible || !dirty) return;          // ⚡ skip draw when nothing changed
      dirty = false;
      renderer.render(scene, camera);
    };

    /* ---------- Scroll → uProgress (only mark dirty) ---------- */
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        uniforms.uProgress.value = self.progress;
        dirty = true;
        requestFrame();
      },
    });

    /* ---------- Resize ---------- */
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));
        dirty = true;
        requestFrame();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    // Paint first frame
    requestFrame();

    /* ---------- Cleanup ---------- */
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      st.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [useFallback]);

  if (useFallback) return <FoldedSceneFallback />;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}