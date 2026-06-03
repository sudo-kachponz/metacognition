'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ── Simple 3D noise (no deps) ──
function hash(n: number) { const s = Math.sin(n) * 43758.5453123; return s - Math.floor(s); }
function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix + iy * 57 + iz * 113), b = hash(ix + 1 + iy * 57 + iz * 113);
  const c = hash(ix + (iy + 1) * 57 + iz * 113), d = hash(ix + 1 + (iy + 1) * 57 + iz * 113);
  const e = hash(ix + iy * 57 + (iz + 1) * 113), f = hash(ix + 1 + iy * 57 + (iz + 1) * 113);
  const g = hash(ix + (iy + 1) * 57 + (iz + 1) * 113), h2 = hash(ix + 1 + (iy + 1) * 57 + (iz + 1) * 113);
  const k1 = a + (b - a) * ux, k2 = c + (d - c) * ux, k3 = e + (f - e) * ux, k4 = g + (h2 - g) * ux;
  return (k1 + (k2 - k1) * uy) + ((k3 + (k4 - k3) * uy) - (k1 + (k2 - k1) * uy)) * uz;
}
function fbm(x: number, y: number, z: number, oct = 5): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise3D(x * f, y * f, z * f); f *= 2.1; a *= 0.48; }
  return v;
}

// ── Brain regions for hover labels ──
interface BrainRegion { name: string; pos: [number, number, number]; color: string; desc: string; ba?: string; }

const REGIONS: BrainRegion[] = [
  { name: "Broca's Area", pos: [-1.8, 0.1, 0.8], color: '#ef4444', desc: 'Speech production — primary BCI decoding target', ba: 'BA 44–45' },
  { name: 'Frontal Lobe', pos: [-1.6, 0.8, 0.2], color: '#3b82f6', desc: 'Executive function, motor planning', ba: 'BA 4, 6, 44–46' },
  { name: 'Motor Cortex', pos: [-0.3, 1.3, 0.0], color: '#22c55e', desc: 'Voluntary motor control, orofacial commands', ba: 'BA 4' },
  { name: 'Parietal Lobe', pos: [0.6, 1.0, -0.2], color: '#8b5cf6', desc: 'Somatosensory integration', ba: 'BA 1–3, 5, 7' },
  { name: 'Temporal Lobe', pos: [-0.8, -0.7, 0.9], color: '#f59e0b', desc: 'Auditory processing, language comprehension', ba: 'BA 21–22' },
  { name: "Wernicke's Area", pos: [0.3, -0.2, 0.8], color: '#ec4899', desc: 'Language comprehension — afferent speech', ba: 'BA 22' },
  { name: 'Occipital Lobe', pos: [1.5, 0.4, -0.3], color: '#06b6d4', desc: 'Visual processing, feedback integration', ba: 'BA 17–19' },
  { name: 'Cerebellum', pos: [0.0, -1.1, -0.4], color: '#6ea8d4', desc: 'Motor coordination, speech fluency timing' },
  { name: 'Corpus Callosum', pos: [0.0, 0.5, 0.0], color: '#a78bfa', desc: 'Inter-hemispheric communication fiber bundle' },
  { name: 'Brainstem', pos: [0.0, -1.2, 0.2], color: '#d4a76e', desc: 'Vital functions relay, autonomic control' },
];

interface Tooltip { visible: boolean; x: number; y: number; region: BrainRegion | null; }

// ── Create displaced brain hemisphere mesh ──
function createHemisphere(side: 'left' | 'right'): THREE.Mesh {
  const geo = new THREE.SphereGeometry(1.0, 120, 95);
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;

  // Add color attribute
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    // Scale to brain ellipsoid proportions (wider L-R, taller, elongated front-back)
    x *= 0.95; y *= 0.8; z *= 1.1;

    // Flatten medial face (inner hemisphere surface)
    const medialFactor = side === 'left' ? Math.max(0, x) : Math.max(0, -x);
    if (medialFactor > 0.05) {
      const flatAmount = Math.min(medialFactor * 2.5, 0.5);
      if (side === 'left') x = x * (1 - flatAmount) + 0.05 * flatAmount;
      else x = x * (1 - flatAmount) - 0.05 * flatAmount;
    }

    // Coordinate warping (domain warping) to create organic, winding folds like a real brain
    const seed = side === 'left' ? 0 : 150;
    const wx = x + noise3D(x * 1.6 + seed, y * 1.6, z * 1.6) * 0.4;
    const wy = y + noise3D(x * 1.6 + seed + 50, y * 1.6 + 50, z * 1.6) * 0.4;
    const wz = z + noise3D(x * 1.6, y * 1.6 + seed + 100, z * 1.6 + 100) * 0.4;

    // Low-frequency noise for beautifully structured thick, bulbous gyri
    const gfreq = 4.8;
    const noiseVal = noise3D(wx * gfreq, wy * gfreq, wz * gfreq) * 2.0 - 1.0;

    // Wide, rounded gyri ridges
    const gyri = Math.cos(noiseVal * Math.PI * 1.15) * 0.15;
    
    // Deep, distinct sulcal valleys
    const absVal = Math.abs(noiseVal);
    const sulci = absVal < 0.2 ? -0.06 * Math.pow(1.0 - absVal / 0.2, 2.0) : 0;

    // Smooth displacement along vertex normal
    const nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i);
    const disp = gyri + sulci;
    
    x += nx * disp; y += ny * disp; z += nz * disp;

    // Brain stem taper at bottom
    if (y < -0.4) { const t = Math.abs(y + 0.4) * 1.2; x *= Math.max(0.3, 1 - t); z *= Math.max(0.4, 1 - t * 0.7); }
    // Frontal lobe slight forward push
    if (z > 0.6) z += 0.08;
    // Temporal lobe slight outward bulge
    if (y < -0.1 && Math.abs(z) > 0.3) { y -= 0.06; }

    // Offset hemisphere slightly more for separated visual appearance
    const offset = side === 'left' ? -0.65 : 0.65;
    pos.setXYZ(i, x + offset, y, z);

    // Initial holographic iridescent colors (pastels)
    const baseColor = new THREE.Color();
    baseColor.setHSL(0.55 + 0.25 * Math.sin(y * 2), 0.9, 0.75);
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  // Glass physical material with iridescence for holographic look
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.92,
    thickness: 1.4,
    transparent: true,
    opacity: 0.32,
    iridescence: 1.0,
    iridescenceIOR: 1.65,
    iridescenceThicknessRange: [100, 400],
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
    vertexColors: true,
  });

  const mesh = new THREE.Mesh(geo, mat);

  // Add wireframe overlay for sharp glowing neural fibers
  const wireMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    wireframe: true,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const wireMesh = new THREE.Mesh(geo, wireMat);
  mesh.add(wireMesh);

  return mesh;
}

// ── Create cerebellum ──
function createCerebellum(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(0.45, 40, 30);
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    x *= 1.6; y *= 0.65; z *= 1.0;
    // Ridged texture (cerebellar folia)
    const nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i);
    const ridge = Math.sin(y * 25) * 0.015 + fbm(x * 8, y * 8, z * 8, 3) * 0.025;
    x += nx * ridge; y += ny * ridge; z += nz * ridge;
    pos.setXYZ(i, x, y - 1.05, z - 0.3);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#8fb8d4'),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
    thickness: 1.0,
    transparent: true,
    opacity: 0.7,
    iridescence: 1.0,
    iridescenceIOR: 1.45,
    side: THREE.DoubleSide,
  }));
}

// ── Create brainstem ──
function createBrainstem(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    x += noise3D(x * 5, y * 5, z * 5) * 0.03;
    z += noise3D(x * 4 + 50, y * 4, z * 4) * 0.03;
    pos.setXYZ(i, x, y - 1.0, z + 0.15);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d4b896'),
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.75,
    thickness: 0.8,
    transparent: true,
    opacity: 0.65,
    iridescence: 0.8,
    iridescenceIOR: 1.4,
    side: THREE.DoubleSide,
  }));
}

// ── Create corpus callosum (arch bridge) ──
function createCorpusCallosum(): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, 0.2, 0.2),
    new THREE.Vector3(-0.3, 0.55, 0.1),
    new THREE.Vector3(0.0, 0.65, 0.05),
    new THREE.Vector3(0.3, 0.55, 0.1),
    new THREE.Vector3(0.5, 0.2, 0.2),
  ]);
  const geo = new THREE.TubeGeometry(curve, 32, 0.1, 12, false);
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#b8a0d8'),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    thickness: 0.6,
    transparent: true,
    opacity: 0.75,
    iridescence: 1.0,
    iridescenceIOR: 1.5,
    side: THREE.DoubleSide,
  }));
}

// ── Create thalamus (two ovoids in center) ──
function createThalamus(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#e0a0a0'),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
    thickness: 0.5,
    transparent: true,
    opacity: 0.7,
    iridescence: 0.9,
    iridescenceIOR: 1.4,
    side: THREE.DoubleSide,
  });
  [-0.15, 0.15].forEach((xOff) => {
    const geo = new THREE.SphereGeometry(0.18, 20, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      x *= 1.3; y *= 0.8;
      pos.setXYZ(i, x + xOff, y + 0.05, z + 0.1);
    }
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, mat));
  });
  return group;
}

/* ═══════════════════════════════════════════════
   BrainCanvas — Anatomical 3D Brain Atlas
   ═══════════════════════════════════════════════ */
export default function BrainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHemiRef = useRef<THREE.Mesh | null>(null);
  const rightHemiRef = useRef<THREE.Mesh | null>(null);
  const cerebellumRef = useRef<THREE.Mesh | null>(null);
  const brainstemRef = useRef<THREE.Mesh | null>(null);
  const corpusRef = useRef<THREE.Mesh | null>(null);
  const hoveredRegionRef = useRef<BrainRegion | null>(null);

  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera;
    scene: THREE.Scene; brainGroup: THREE.Group;
    raycaster: THREE.Raycaster; mouse: THREE.Vector2;
    regionSpheres: { mesh: THREE.Mesh; region: BrainRegion }[];
    clock: THREE.Clock; animId: number;
    isDragging: boolean; prevMouse: { x: number; y: number };
    rotVel: { x: number; y: number };
  } | null>(null);

  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, x: 0, y: 0, region: null });

  const initScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth || 600, h = container.clientHeight || 600;

    // WebGL check
    try {
      const tc = document.createElement('canvas');
      if (!(tc.getContext('webgl') || tc.getContext('experimental-webgl'))) return;
    } catch { return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 5.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    
    // Explicit positioning to sit above the 2D background canvas (zIndex 0)
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '5';
    renderer.domElement.style.pointerEvents = 'none'; // allow click events to pass to the parent wrapper
    
    container.appendChild(renderer.domElement);

    // Lighting (medical studio setup)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xfff5ee, 1.3); key.position.set(-4, 5, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdbeafe, 0.5); fill.position.set(4, -2, 4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xbfdbfe, 0.7); rim.position.set(0, 3, -5); scene.add(rim);
    const bottom = new THREE.DirectionalLight(0xffe4e6, 0.3); bottom.position.set(0, -4, 2); scene.add(bottom);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Build anatomical structures
    const leftHemi = createHemisphere('left');
    const rightHemi = createHemisphere('right');
    const cerebellum = createCerebellum();
    const brainstem = createBrainstem();
    const corpus = createCorpusCallosum();
    const thalamus = createThalamus();

    leftHemiRef.current = leftHemi;
    rightHemiRef.current = rightHemi;
    cerebellumRef.current = cerebellum;
    brainstemRef.current = brainstem;
    corpusRef.current = corpus;

    brainGroup.add(leftHemi, rightHemi, cerebellum, brainstem, corpus, thalamus);

    // Region hotspots (invisible spheres for raycasting) - increased size for sensitivity
    const regionSpheres: { mesh: THREE.Mesh; region: BrainRegion }[] = [];
    REGIONS.forEach((r) => {
      const geo = new THREE.SphereGeometry(0.55, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
      brainGroup.add(mesh);
      regionSpheres.push({ mesh, region: r });
    });

    // Subtle glowing nodes at region centers
    const dotTex = (() => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(c);
    })();

    const regionDots: { mesh: THREE.Mesh; region: BrainRegion }[] = [];
    REGIONS.forEach((r) => {
      const geo = new THREE.SphereGeometry(0.04, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(r.color), transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(r.pos[0], r.pos[1], r.pos[2]);
      brainGroup.add(m);
      regionDots.push({ mesh: m, region: r });
    });

    // Neural signal pulse particles
    const pulseCount = 50;
    const pPos = new Float32Array(pulseCount * 3);
    const pVel: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < pulseCount; i++) {
      const angle = Math.random() * Math.PI * 2, r2 = Math.random() * 1.2;
      pPos[i * 3] = Math.cos(angle) * r2 * 0.8;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      pPos[i * 3 + 2] = Math.sin(angle) * r2 * 0.6;
      pVel.push({ x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.008 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x22c55e, size: 0.06, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, map: dotTex,
    });
    const pulses = new THREE.Points(pGeo, pMat);
    brainGroup.add(pulses);

    const clock = new THREE.Clock();
    const state = {
      renderer, camera, scene, brainGroup, raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(), regionSpheres, clock, animId: 0,
      isDragging: false, prevMouse: { x: 0, y: 0 }, rotVel: { x: 0, y: 0 },
    };
    sceneRef.current = state;

    // Animation
    const animate = () => {
      const t = clock.getElapsedTime();
      if (!state.isDragging) {
        brainGroup.rotation.y += 0.0025;
        brainGroup.rotation.x += Math.sin(t * 0.12) * 0.0008;
      } else {
        brainGroup.rotation.y += state.rotVel.y;
        brainGroup.rotation.x += state.rotVel.x;
        state.rotVel.x *= 0.92; state.rotVel.y *= 0.92;
      }

      // Smooth color interpolation for holographic glass + hover highlighting
      const activeRegion = hoveredRegionRef.current;
      [
        { mesh: leftHemiRef.current, offset: -0.65 },
        { mesh: rightHemiRef.current, offset: 0.65 }
      ].forEach(({ mesh, offset }) => {
        if (!mesh) return;
        const geo = mesh.geometry;
        const pos = geo.attributes.position;
        const colorAttr = geo.attributes.color as THREE.BufferAttribute;
        if (!colorAttr) return;

        const targetColor = new THREE.Color();
        const curColor = new THREE.Color();

        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);

          // Domain-warped moving electrical pulse wave
          const pulseNoise = noise3D(vx * 1.8 + t * 0.35, vy * 1.8, vz * 1.8 + t * 0.2);
          const pulseWave = Math.sin(pulseNoise * Math.PI * 4.5);
          
          let pulseIntensity = 0.0;
          if (pulseWave > 0.72) {
            pulseIntensity = Math.pow((pulseWave - 0.72) / 0.28, 2.5);
          }

          // Choose color palette based on position (Turquoise, Hot Magenta, Gold/Orange matching reference image)
          const colorRand = noise3D(vx * 0.7, vy * 0.7, vz * 0.7);
          const pulseColor = new THREE.Color();
          if (colorRand < 0.33) {
            pulseColor.setHSL(0.52, 0.95, 0.65); // Turquoise
          } else if (colorRand < 0.66) {
            pulseColor.setHSL(0.88, 0.95, 0.65); // Hot Magenta / Purple
          } else {
            pulseColor.setHSL(0.08, 0.95, 0.65); // Gold / Orange
          }

          // Glass shell default base color (faint iridescent glow)
          const defaultColor = new THREE.Color();
          defaultColor.setHSL(0.62 + 0.1 * Math.sin(vy * 1.5 + t * 0.1), 0.8, 0.35);

          const finalVal = defaultColor.clone();
          if (pulseIntensity > 0) {
            // Glow pulses extremely intensely
            finalVal.lerp(pulseColor.multiplyScalar(2.2), pulseIntensity * 0.95);
          }

          targetColor.copy(finalVal);

          // Apply active hovered region highlight override (makes target region glow intensely)
          if (activeRegion) {
            const rx = activeRegion.pos[0] - offset;
            const ry = activeRegion.pos[1];
            const rz = activeRegion.pos[2];
            const dist = Math.sqrt((vx - rx) ** 2 + (vy - ry) ** 2 + (vz - rz) ** 2);

            const highlightRadius = 1.25;
            if (dist < highlightRadius) {
              const blendFactor = Math.pow(1 - dist / highlightRadius, 1.4);
              const regionColor = new THREE.Color(activeRegion.color);
              regionColor.multiplyScalar(2.4);
              targetColor.lerp(regionColor, blendFactor * 0.98);
            }
          }

          curColor.setRGB(colorAttr.getX(i), colorAttr.getY(i), colorAttr.getZ(i));
          curColor.lerp(targetColor, 0.12); // smooth transition factor per frame

          colorAttr.setXYZ(i, curColor.r, curColor.g, curColor.b);
        }
        colorAttr.needsUpdate = true;
      });

      // Smooth color transitions for individual auxiliary structures
      if (cerebellumRef.current) {
        const mat = cerebellumRef.current.material as THREE.MeshPhysicalMaterial;
        const target = activeRegion?.name === 'Cerebellum' 
          ? new THREE.Color(activeRegion.color).multiplyScalar(1.4) 
          : new THREE.Color('#8fb8d4');
        mat.color.lerp(target, 0.12);
        mat.emissive = activeRegion?.name === 'Cerebellum' ? new THREE.Color(activeRegion.color).multiplyScalar(0.4) : new THREE.Color('#000000');
      }
      if (brainstemRef.current) {
        const mat = brainstemRef.current.material as THREE.MeshPhysicalMaterial;
        const target = activeRegion?.name === 'Brainstem'
          ? new THREE.Color(activeRegion.color).multiplyScalar(1.4)
          : new THREE.Color('#d4b896');
        mat.color.lerp(target, 0.12);
        mat.emissive = activeRegion?.name === 'Brainstem' ? new THREE.Color(activeRegion.color).multiplyScalar(0.4) : new THREE.Color('#000000');
      }
      if (corpusRef.current) {
        const mat = corpusRef.current.material as THREE.MeshPhysicalMaterial;
        const target = activeRegion?.name === 'Corpus Callosum'
          ? new THREE.Color(activeRegion.color).multiplyScalar(1.4)
          : new THREE.Color('#b8a0d8');
        mat.color.lerp(target, 0.12);
        mat.emissive = activeRegion?.name === 'Corpus Callosum' ? new THREE.Color(activeRegion.color).multiplyScalar(0.4) : new THREE.Color('#000000');
      }

      // Hover glow animation for region dot nodes
      regionDots.forEach(({ mesh, region }) => {
        const isHovered = activeRegion?.name === region.name;
        const targetScale = isHovered ? 2.5 : 1.0;
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.15));
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = isHovered ? 1.0 : 0.8;
      });

      // Pulse particles
      const pAttr = pulses.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pulseCount; i++) {
        pAttr.array[i * 3] += pVel[i].x;
        pAttr.array[i * 3 + 1] += pVel[i].y;
        pAttr.array[i * 3 + 2] += pVel[i].z;
        const d = Math.sqrt(pAttr.array[i * 3] ** 2 + pAttr.array[i * 3 + 1] ** 2 + pAttr.array[i * 3 + 2] ** 2);
        if (d > 2) {
          const a = Math.random() * Math.PI * 2;
          pAttr.array[i * 3] = Math.cos(a) * 0.5;
          pAttr.array[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
          pAttr.array[i * 3 + 2] = Math.sin(a) * 0.4;
          pVel[i] = { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.008 };
        }
      }
      pAttr.needsUpdate = true;

      renderer.render(scene, camera);
      state.animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth || 600, nh = container.clientHeight || 600;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(state.animId);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Mouse handlers
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (sceneRef.current?.isDragging) {
      const dx = e.clientX - sceneRef.current.prevMouse.x;
      const dy = e.clientY - sceneRef.current.prevMouse.y;
      sceneRef.current.rotVel.y = dx * 0.005;
      sceneRef.current.rotVel.x = dy * 0.003;
      sceneRef.current.brainGroup.rotation.y += dx * 0.005;
      sceneRef.current.brainGroup.rotation.x += dy * 0.003;
      sceneRef.current.prevMouse = { x: e.clientX, y: e.clientY };
      return;
    }
    if (!sceneRef.current) return;
    
    // Explicitly update matrix worlds of children before raycasting rotated groups
    sceneRef.current.brainGroup.updateMatrixWorld(true);

    const { raycaster, camera, regionSpheres, mouse } = sceneRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const meshes = regionSpheres.map(r => r.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length > 0) {
      const idx = meshes.indexOf(hits[0].object as THREE.Mesh);
      if (idx !== -1) {
        const region = regionSpheres[idx].region;
        hoveredRegionRef.current = region;
        setTooltip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, region });
        containerRef.current.style.cursor = 'pointer';
        return;
      }
    }
    hoveredRegionRef.current = null;
    setTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
    containerRef.current.style.cursor = 'grab';
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!sceneRef.current) return;
    sceneRef.current.isDragging = true;
    sceneRef.current.prevMouse = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseUp = useCallback(() => { if (sceneRef.current) sceneRef.current.isDragging = false; }, []);

  useEffect(() => { const cleanup = initScene(); return cleanup; }, [initScene]);

  /* ── Animated EEG Brainwave Traces (2D Canvas behind 3D brain) ── */
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // EEG frequency bands with clinical parameters
    const bands = [
      { name: 'δ', freq: 2.5, amp: 35, rgb: '239, 68, 68', alpha: 0.55, yOff: -0.32 },   // Delta
      { name: 'θ', freq: 6, amp: 25, rgb: '245, 158, 11', alpha: 0.5, yOff: -0.16 },      // Theta
      { name: 'α', freq: 10, amp: 20, rgb: '34, 197, 94', alpha: 0.5, yOff: 0.0 },        // Alpha
      { name: 'β', freq: 22, amp: 12, rgb: '6, 182, 212', alpha: 0.5, yOff: 0.16 },       // Beta
      { name: 'γ', freq: 45, amp: 7, rgb: '99, 102, 241', alpha: 0.45, yOff: 0.32 },      // Gamma
    ];

    let animId: number;
    const animate = () => {
      const w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      const h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      const t = performance.now() / 1000;
      const centerX = cw * 0.5, centerY = ch * 0.5;

      bands.forEach((band) => {
        const baseY = centerY + band.yOff * ch;
        ctx.beginPath();
        ctx.lineWidth = 1.5;

        // Linear gradient to fade lines gracefully at left and right boundaries
        const grad = ctx.createLinearGradient(0, 0, cw, 0);
        grad.addColorStop(0, `rgba(${band.rgb}, 0)`);
        grad.addColorStop(0.2, `rgba(${band.rgb}, ${band.alpha})`);
        grad.addColorStop(0.8, `rgba(${band.rgb}, ${band.alpha})`);
        grad.addColorStop(1, `rgba(${band.rgb}, 0)`);

        ctx.strokeStyle = grad;

        for (let x = 0; x < cw; x++) {
          // Attenuate amplitude near brain center
          const distFromCenter = Math.abs(x - centerX) / (cw * 0.5);
          const centerFade = Math.min(1, Math.max(0, (distFromCenter - 0.12) / 0.25));
          // Natural amplitude modulation
          const modulation = 0.6 + 0.4 * Math.sin(t * 0.3 + band.freq * 0.1);
          const noise = Math.sin(x * 0.02 + t * 1.5) * 3;
          const y = baseY + Math.sin((x / cw) * band.freq * 0.8 + t * band.freq * 0.15) * band.amp * centerFade * modulation + noise * centerFade;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  // Greek letter badge data
  interface WaveBadge {
    letter: string;
    label: string;
    hz: string;
    color: string;
    top: string;
    left?: string;
    right?: string;
  }

  const waveBadges: WaveBadge[] = [
    { letter: 'δ', label: 'Delta', hz: '1–4 Hz', color: '#ef4444', top: '12%', left: '5%' },
    { letter: 'θ', label: 'Theta', hz: '4–8 Hz', color: '#f59e0b', top: '72%', left: '12%' },
    { letter: 'α', label: 'Alpha', hz: '8–13 Hz', color: '#22c55e', top: '15%', right: '4%' },
    { letter: 'β', label: 'Beta', hz: '13–30 Hz', color: '#06b6d4', top: '8%', left: '42%' },
    { letter: 'γ', label: 'Gamma', hz: '30–100 Hz', color: '#6366f1', top: '78%', right: '10%' },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full cursor-grab select-none"
      onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
      onMouseLeave={() => {
        if (sceneRef.current) sceneRef.current.isDragging = false;
        hoveredRegionRef.current = null;
        setTooltip(p => ({ ...p, visible: false }));
      }}
    >
      {/* EEG Brainwave traces behind the 3D brain */}
      <canvas
        ref={waveCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Greek letter EEG band badges */}
      {waveBadges.map((badge) => (
        <div
          key={badge.letter}
          className="absolute pointer-events-none flex flex-col items-center gap-1 z-10"
          style={{ top: badge.top, left: badge.left, right: badge.right }}
        >
          <div
            className="flex items-center justify-center h-9 w-9 rounded-full text-white text-lg font-bold shadow-lg"
            style={{ backgroundColor: badge.color, boxShadow: `0 0 12px ${badge.color}44` }}
          >
            {badge.letter}
          </div>
          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            {badge.hz}
          </span>
        </div>
      ))}

      {/* Region hover tooltip */}
      {tooltip.visible && tooltip.region && (
        <div className="pointer-events-none absolute z-50" style={{ left: tooltip.x + 16, top: tooltip.y - 10 }}>
          <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/80 backdrop-blur-md px-4 py-3 shadow-xl min-w-[220px] max-w-[280px] transition-colors duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: tooltip.region.color }} />
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{tooltip.region.name}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">{tooltip.region.desc}</p>
            {tooltip.region.ba && (
              <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-100 dark:border-blue-900/50">
                {tooltip.region.ba}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
