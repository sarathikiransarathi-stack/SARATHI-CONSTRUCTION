import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';

const FLOORS = 10;
const FLOOR_H = 3.2;
const BW = 14;
const BD = 11;
const COL = 0.55;

export default function ConstructionScene({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvasContainer = canvasRef.current;
    if (!canvasContainer) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasContainer.appendChild(renderer.domElement);

    // Sky dome with gradient shader
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a0a1e) },
        bottomColor: { value: new THREE.Color(0x1a1a2e) },
        offset: { value: 10 },
        exponent: { value: 0.7 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }`,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), skyMat));

    scene.fog = new THREE.Fog(0x1a1a2e, 60, 250);

    // Lights
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(30, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = isMobile ? 1024 : 2048;
    sunLight.shadow.mapSize.height = isMobile ? 1024 : 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a4438, 0.5);
    scene.add(hemiLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x3d3830, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Concrete pad under building
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(BW + 8, 0.3, BD + 8),
      new THREE.MeshStandardMaterial({ color: 0x7a7670, roughness: 0.9 })
    );
    pad.position.y = 0.15;
    pad.receiveShadow = true;
    scene.add(pad);

    // Materials
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xb8b5ad, roughness: 0.9, metalness: 0.05 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x5a7a9a, metalness: 0.85, roughness: 0.12,
      transparent: true, opacity: 0.6, emissive: 0x1a2a3a, emissiveIntensity: 0.3,
    });
    const spandrelMat = new THREE.MeshStandardMaterial({ color: 0x8a8780, roughness: 0.85 });
    const craneMat = new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.5, metalness: 0.4 });
    const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.4, metalness: 0.6 });

    // Building floors
    const building = new THREE.Group();
    scene.add(building);

    const floors: THREE.Group[] = [];
    for (let i = 0; i < FLOORS; i++) {
      const floor = new THREE.Group();
      floor.position.y = i * FLOOR_H;
      floor.scale.y = 0.001;

      const slab = new THREE.Mesh(new THREE.BoxGeometry(BW, 0.25, BD), concreteMat);
      slab.castShadow = true; slab.receiveShadow = true;
      floor.add(slab);

      const colPositions = [
        [BW / 2 - COL / 2, BD / 2 - COL / 2],
        [-BW / 2 + COL / 2, BD / 2 - COL / 2],
        [BW / 2 - COL / 2, -BD / 2 + COL / 2],
        [-BW / 2 + COL / 2, -BD / 2 + COL / 2],
      ];
      colPositions.forEach(([x, z]) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(COL, FLOOR_H - 0.25, COL), concreteMat);
        col.position.set(x, FLOOR_H / 2, z);
        col.castShadow = true;
        floor.add(col);
      });

      const glass = new THREE.Mesh(new THREE.BoxGeometry(BW - 1, FLOOR_H * 0.68, BD - 1), glassMat);
      glass.position.y = FLOOR_H * 0.5;
      floor.add(glass);

      const spandrel = new THREE.Mesh(new THREE.BoxGeometry(BW - 0.2, 0.4, BD - 0.2), spandrelMat);
      spandrel.position.y = FLOOR_H * 0.22;
      floor.add(spandrel);

      building.add(floor);
      floors.push(floor);
    }

    // Roof slab
    const roof = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.5, 0.4, BD + 0.5), concreteMat);
    roof.position.y = FLOORS * FLOOR_H;
    roof.castShadow = true; roof.receiveShadow = true;
    roof.scale.y = 0.001;
    scene.add(roof);

    // Foundation
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(BW + 2, 1.5, BD + 2),
      new THREE.MeshStandardMaterial({ color: 0x5a564e, roughness: 0.95 })
    );
    foundation.position.y = -0.75;
    foundation.scale.y = 0.001;
    foundation.castShadow = true; foundation.receiveShadow = true;
    scene.add(foundation);

    // Tower crane
    const craneGroup = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.4), craneMat);
    mast.position.y = 0.5; mast.castShadow = true;
    craneGroup.add(mast);

    const jibGroup = new THREE.Group();
    jibGroup.position.y = 1;
    const jib = new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 0.12), craneMat);
    jib.position.x = 3; jib.castShadow = true;
    jibGroup.add(jib);
    const counterJib = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 0.12), craneMat);
    counterJib.position.x = -2;
    jibGroup.add(counterJib);
    const counterweight = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7 })
    );
    counterweight.position.set(-3.5, -0.2, 0);
    jibGroup.add(counterweight);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 })
    );
    cabin.position.set(0, -0.3, 0);
    jibGroup.add(cabin);
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    cable.position.set(7, -2, 0);
    jibGroup.add(cable);
    const hook = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.35, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.4 })
    );
    hook.position.set(7, -4, 0);
    jibGroup.add(hook);
    craneGroup.add(jibGroup);
    craneGroup.position.set(BW / 2 + 1.5, 0, -BD / 2 + 1);
    scene.add(craneGroup);

    // Scaffolding on active floor
    const scaffolding = new THREE.Group();
    const pt = 0.06;
    for (let i = 0; i <= 6; i++) {
      const x = -BW / 2 - 0.4 + (i / 6) * (BW + 0.8);
      const pipe = new THREE.Mesh(new THREE.BoxGeometry(pt, FLOOR_H, pt), scaffoldMat);
      pipe.position.set(x, FLOOR_H / 2, BD / 2 + 0.4);
      pipe.castShadow = true;
      scaffolding.add(pipe);
    }
    [0.3, FLOOR_H - 0.3].forEach(h => {
      const horiz = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.8, pt, pt), scaffoldMat);
      horiz.position.set(0, h, BD / 2 + 0.4);
      scaffolding.add(horiz);
    });
    scaffolding.visible = false;
    scene.add(scaffolding);

    // Surrounding buildings for context
    const surroundingData = [
      { x: 28, z: -12, w: 8, h: 20, d: 8, color: 0x4a4a52 },
      { x: -25, z: 16, w: 7, h: 15, d: 7, color: 0x3e3e46 },
      { x: 22, z: 22, w: 6, h: 11, d: 6, color: 0x444450 },
      { x: -30, z: -8, w: 9, h: 24, d: 7, color: 0x3a3a42 },
      { x: 16, z: -28, w: 5, h: 9, d: 5, color: 0x48484e },
      { x: -18, z: -22, w: 7, h: 13, d: 6, color: 0x404048 },
    ];
    surroundingData.forEach(b => {
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.85 })
      );
      bldg.position.set(b.x, b.h / 2, b.z);
      bldg.castShadow = true; bldg.receiveShadow = true;
      scene.add(bldg);
    });

    // Construction materials on ground
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.7, roughness: 0.4 });
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 0.3), beamMat);
      beam.position.set(BW / 2 + 5, 0.15 + i * 0.35, BD / 2 - 3);
      beam.castShadow = true;
      scene.add(beam);
    }
    const gravel = new THREE.Mesh(
      new THREE.ConeGeometry(2, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 1 })
    );
    gravel.position.set(-BW / 2 - 5, 0.6, BD / 2 - 2);
    gravel.castShadow = true;
    scene.add(gravel);

    // Shipping containers as site offices
    [0x4a6a8a, 0x8a4a3a, 0x4a8a4a].forEach((color, i) => {
      const container = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2.5, 2.5),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      container.position.set(-BW / 2 - 9 + i * 3, 1.25, -BD / 2 - 6);
      container.castShadow = true; container.receiveShadow = true;
      scene.add(container);
    });

    // Stars (visible at night)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.48;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0, sizeAttenuation: false });
    scene.add(new THREE.Points(starGeo, starMat));

    // Dust particles
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 25;
      dustPos[i * 3 + 1] = Math.random() * 25;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
      dustVel[i] = 0.005 + Math.random() * 0.015;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xb8a890, size: 0.12, transparent: true, opacity: 0.35 });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Rebar on top of current floor
    const rebarGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const rebar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4),
        new THREE.MeshStandardMaterial({ color: 0x7a6a4a, metalness: 0.7, roughness: 0.4 })
      );
      rebar.position.set(
        -BW / 2 + 1 + (i % 4) * (BW - 2) / 3,
        0.4,
        -BD / 2 + 1 + Math.floor(i / 4) * (BD - 2) / 3
      );
      rebarGroup.add(rebar);
    }
    rebarGroup.visible = false;
    scene.add(rebarGroup);

    // Workers
    const workers: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const w = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.5, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 })
      );
      body.position.y = 0.4; body.castShadow = true;
      w.add(body);
      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.5 })
      );
      helmet.position.y = 0.78;
      w.add(helmet);
      w.scale.setScalar(0.7);
      w.visible = false;
      scene.add(w);
      workers.push(w);
    }

    // Sky color keyframes (dawn -> day -> dusk -> night)
    const skyKeyframes = [
      { t: 0.00, top: new THREE.Color(0x0a0a1e), bottom: new THREE.Color(0x1a1a2e) },
      { t: 0.06, top: new THREE.Color(0x2a2a4e), bottom: new THREE.Color(0x6a4a3a) },
      { t: 0.12, top: new THREE.Color(0x4a6a9e), bottom: new THREE.Color(0xff8c42) },
      { t: 0.25, top: new THREE.Color(0x6ba3d6), bottom: new THREE.Color(0xffd0a0) },
      { t: 0.45, top: new THREE.Color(0x4a90d9), bottom: new THREE.Color(0xa8c8e8) },
      { t: 0.65, top: new THREE.Color(0x5a9fd9), bottom: new THREE.Color(0xc8d8e8) },
      { t: 0.78, top: new THREE.Color(0x3a5a8a), bottom: new THREE.Color(0xff8c42) },
      { t: 0.88, top: new THREE.Color(0x2a2a4e), bottom: new THREE.Color(0xff4500) },
      { t: 0.95, top: new THREE.Color(0x1a1a2e), bottom: new THREE.Color(0x4a2a3e) },
      { t: 1.00, top: new THREE.Color(0x0a0a1e), bottom: new THREE.Color(0x1a1a2e) },
    ];

    function interpolateSky(p: number) {
      for (let i = 0; i < skyKeyframes.length - 1; i++) {
        if (p >= skyKeyframes[i].t && p <= skyKeyframes[i + 1].t) {
          const t = (p - skyKeyframes[i].t) / (skyKeyframes[i + 1].t - skyKeyframes[i].t);
          return {
            top: skyKeyframes[i].top.clone().lerp(skyKeyframes[i + 1].top, t),
            bottom: skyKeyframes[i].bottom.clone().lerp(skyKeyframes[i + 1].bottom, t),
          };
        }
      }
      const last = skyKeyframes[skyKeyframes.length - 1];
      return { top: last.top.clone(), bottom: last.bottom.clone() };
    }

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0;
      progressRef.current = p;
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // Sky
      const { top: skyTop, bottom: skyBottom } = interpolateSky(p);
      (skyMat.uniforms.topColor.value as THREE.Color).copy(skyTop);
      (skyMat.uniforms.bottomColor.value as THREE.Color).copy(skyBottom);
      scene.fog!.color.copy(skyBottom);

      // Sun position arcs across sky
      const sunAngle = p * Math.PI * 0.85 + Math.PI * 0.075;
      const sunY = Math.sin(sunAngle) * 60;
      const sunX = Math.cos(sunAngle) * 50 - 15;
      sunLight.position.set(sunX, Math.max(sunY, 3), 35);

      if (p < 0.10 || p > 0.90) {
        sunLight.color.setHex(0xff6633);
        sunLight.intensity = 0.4 + Math.sin(sunAngle) * 0.3;
      } else if (p < 0.22 || p > 0.78) {
        sunLight.color.setHex(0xffaa66);
        sunLight.intensity = 0.9;
      } else {
        sunLight.color.setHex(0xffffee);
        sunLight.intensity = 1.4;
      }

      ambientLight.color.copy(skyTop).lerp(new THREE.Color(0x404060), 0.5);
      ambientLight.intensity = 0.2 + (1 - Math.abs(p - 0.5) * 2) * 0.3;
      hemiLight.color.copy(skyTop);
      hemiLight.intensity = 0.3 + (1 - Math.abs(p - 0.5) * 2) * 0.3;

      // Stars visible at night
      const darkness = p < 0.12 ? 1 - p / 0.12 : p > 0.88 ? (p - 0.88) / 0.12 : 0;
      starMat.opacity = darkness * 0.8;

      // Glass reflects sky color
      glassMat.color.copy(skyBottom).multiplyScalar(0.6).lerp(new THREE.Color(0x5a7a9a), 0.5);
      const litFactor = p > 0.85 ? (p - 0.85) / 0.15 : 0;
      glassMat.emissiveIntensity = 0.3 + litFactor * 0.5;

      // Foundation appears first
      const foundationProgress = Math.max(0, Math.min(1, (p - 0.02) / 0.06));
      foundation.scale.y = Math.max(0.001, foundationProgress);

      // Building floors rise one by one
      const buildingProgress = Math.max(0, Math.min(1, (p - 0.06) / 0.88));
      const floorFloat = buildingProgress * FLOORS;
      for (let i = 0; i < FLOORS; i++) {
        floors[i].scale.y = Math.max(0.001, Math.min(1, floorFloat - i));
      }

      // Roof
      roof.scale.y = Math.max(0.001, Math.min(1, floorFloat - FLOORS + 1));

      // Rebar on current floor
      const currentFloor = Math.floor(floorFloat);
      const floorFraction = floorFloat - currentFloor;
      if (buildingProgress > 0.02 && buildingProgress < 0.96 && currentFloor < FLOORS) {
        rebarGroup.visible = true;
        rebarGroup.position.y = currentFloor * FLOOR_H + 0.25;
        rebarGroup.scale.y = 1 - floorFraction * 0.8;
      } else {
        rebarGroup.visible = false;
      }

      // Scaffolding on active floor
      if (buildingProgress > 0.02 && buildingProgress < 0.96 && currentFloor < FLOORS) {
        scaffolding.visible = true;
        scaffolding.position.y = currentFloor * FLOOR_H;
      } else {
        scaffolding.visible = false;
      }

      // Workers move around building
      workers.forEach((w, i) => {
        if (buildingProgress > 0.03 && buildingProgress < 0.95) {
          w.visible = true;
          const wFloor = Math.min(FLOORS - 1, Math.max(0, currentFloor - i));
          const angle = t * 0.3 + i * Math.PI / 2;
          w.position.set(
            Math.cos(angle) * (BW / 2 - 1),
            wFloor * FLOOR_H + 0.5,
            Math.sin(angle) * (BD / 2 - 1)
          );
          w.rotation.y = angle + Math.PI;
        } else {
          w.visible = false;
        }
      });

      // Crane grows with building and slowly rotates
      const craneHeight = Math.max(10, buildingProgress * FLOORS * FLOOR_H + FLOOR_H * 2.5);
      mast.scale.y = craneHeight;
      mast.position.y = craneHeight / 2;
      jibGroup.position.y = craneHeight;
      jibGroup.rotation.y += 0.0025;
      const hookOffset = Math.sin(t * 0.4) * 0.5;
      cable.scale.y = 1 + hookOffset * 0.12;
      hook.position.y = -4 - hookOffset;

      // Camera rises and pulls back as building grows
      const camHeight = 8 + buildingProgress * FLOORS * FLOOR_H * 0.35;
      const camDist = 28 + buildingProgress * 18;
      const targetX = camDist * 0.68 + mouse.x * 3;
      const targetY = camHeight + 3 - mouse.y * 2;
      const targetZ = camDist * 0.68;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.04;
      camera.lookAt(0, camHeight * 0.45, 0);

      // Dust particles drift upward
      const dPos = dust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        dPos[i * 3 + 1] += dustVel[i];
        if (dPos[i * 3 + 1] > 25) dPos[i * 3 + 1] = 0;
      }
      dust.geometry.attributes.position.needsUpdate = true;
      dustMat.opacity = buildingProgress > 0.02 && buildingProgress < 0.96 ? 0.35 : 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  const phaseLabel = (p: number): string => {
    if (p < 0.06) return 'Preparing the site';
    if (p < 0.12) return 'Laying the foundation';
    if (p >= 0.99) return 'Building complete';
    if (p >= 0.96) return 'Finishing touches';
    const floor = Math.min(FLOORS, Math.floor((p - 0.06) / 0.088) + 1);
    return `Building floor ${floor} of ${FLOORS}`;
  };

  return (
    <section className="hero-construction" ref={sectionRef}>
      <div className="construction-sticky">
        <div ref={canvasRef} className="construction-canvas" />
        <div className="construction-overlay" style={{ opacity: Math.max(0, 1 - progress * 2.5) }} />
        <div className="container hero-content" style={{ opacity: Math.max(0, 1 - progress * 3) }}>
          {children}
        </div>
        <div className="construction-hud" style={{ opacity: progress > 0.02 && progress < 0.99 ? 1 : 0 }}>
          <div className="construction-phase">{phaseLabel(progress)}</div>
          <div className="construction-bar">
            <div className="construction-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <div className="scroll-cue" style={{ opacity: progress < 0.05 ? 1 : 0 }}>
          <span>Scroll to build</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
