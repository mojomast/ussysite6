<script lang="ts">
  import { withBase } from '../../lib/paths';
  import { onMount } from 'svelte';
  import { carbonSynth } from '../../lib/carbon-synth';

  export interface CoverCellItem {
    articleSlug: string;
    issueNumber: string;
    folioCode: string;
    readerServiceNo: number;
    title: string;
    kicker: string;
    spotInkHex: string;
  }

  let {
    items = [],
    issueNumber = '02'
  }: {
    items: CoverCellItem[];
    issueNumber?: string;
  } = $props();

  let selectedIdx = $state(0);
  let rendererMode = $state<'STATIC SVG' | 'WEBGPU · TSL' | 'WEBGL2 · NEON'>('STATIC SVG');
  let paused = $state(false);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let viewportEl = $state<HTMLDivElement | null>(null);

  let pointer = { x: 0, y: 0 };
  let lastPointer = { x: 0, y: 0, t: 0 };
  let pointerVel = { x: 0, y: 0 };
  let spikeDir = { x: 1, y: 0 };
  let burstLevel = 0;
  let velocitySpike = 0;
  let selectionSpike = 0;
  let shockwaveTriggerIdx = -1;

  const activeItem = $derived(items[selectedIdx] || items[0]);

  function selectCell(idx: number) {
    selectedIdx = idx;
    burstLevel = 1;
    selectionSpike = 1;
    shockwaveTriggerIdx = idx;
    carbonSynth.tick(1100 + idx * 40);
  }

  onMount(() => {
    const reduceQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduceQuery?.matches) {
      rendererMode = 'STATIC SVG';
      return;
    }

    let disposed = false;
    let rafId = 0;
    let inView = true;
    let cleanupRenderer: (() => void) | null = null;

    async function bootThreeStage() {
      if (!canvasEl || !viewportEl) return;

      const THREE = await import('three');
      if (disposed || !canvasEl || !viewportEl) return;

      // Probe WebGPU first so we know whether TSL NodeMaterials can run natively
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let activeRenderer: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let webgpuMod: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tslMod: any = null;
      let mode: 'WEBGPU · TSL' | 'WEBGL2 · NEON' | 'STATIC SVG' = 'STATIC SVG';

      try {
        const navGpu = (navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu;
        if (navGpu && typeof navGpu.requestAdapter === 'function') {
          const adapter = await navGpu.requestAdapter();
          if (adapter && !disposed) {
            const [wgpu, tsl] = await Promise.all([import('three/webgpu'), import('three/tsl')]);
            if (wgpu?.WebGPURenderer) {
              const gpuRenderer = new wgpu.WebGPURenderer({
                canvas: canvasEl,
                antialias: true,
                alpha: true
              });
              await gpuRenderer.init();
              activeRenderer = gpuRenderer;
              webgpuMod = wgpu;
              tslMod = tsl;
              mode = 'WEBGPU · TSL';
            }
          }
        }
      } catch {
        activeRenderer = null;
      }

      if (!activeRenderer && !disposed) {
        try {
          const glRenderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            antialias: true,
            alpha: true,
            powerPreference: 'low-power'
          });
          activeRenderer = glRenderer;
          mode = 'WEBGL2 · NEON';
        } catch {
          activeRenderer = null;
        }
      }

      if (!activeRenderer || disposed) {
        rendererMode = 'STATIC SVG';
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 100);
      camera.position.set(0, 0.15, 7.5);

      // Carbon × Neon Three-Point Studio + Gas-Discharge Rim Lights
      const ambient = new THREE.AmbientLight(0xd8dde8, 0.85);
      const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.1);
      keyLight.position.set(4, 6, 7);
      const rimVermilion = new THREE.PointLight(0xff4422, 6.0, 18);
      rimVermilion.position.set(-4.5, 2.5, 4);
      const rimNeonCyan = new THREE.PointLight(0x22f3e6, 6.2, 18);
      rimNeonCyan.position.set(4.5, -2.2, 4.4);
      scene.add(ambient, keyLight, rimVermilion, rimNeonCyan);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Core Material: Native WebGPU TSL Fresnel + Travelling Neon Discharge Pulse + Spike Corona
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tslPulseUniform: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tslSpikeUniform: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let coreMat: any;

      if (mode === 'WEBGPU · TSL' && webgpuMod?.MeshStandardNodeMaterial && tslMod) {
        try {
          const {
            color,
            uniform,
            sin,
            mul,
            add,
            sub,
            pow,
            dot,
            abs,
            float,
            positionLocal,
            normalView,
            positionViewDirection
          } = tslMod;

          tslPulseUniform = uniform(0);
          tslSpikeUniform = uniform(0);
          const ndotv = abs(dot(normalView, positionViewDirection));
          const fresnel = pow(sub(float(1.0), ndotv), float(2.5));
          const wave = add(mul(sin(add(mul(positionLocal.y, float(4.2)), mul(tslPulseUniform, float(2.4)))), float(0.5)), float(0.5));
          const spikeBoost = add(float(1.0), mul(tslSpikeUniform, float(1.85)));

          const nodeMat = new webgpuMod.MeshStandardNodeMaterial({
            color: 0x141822,
            metalness: 0.82,
            roughness: 0.22
          });
          nodeMat.emissiveNode = add(
            add(
              mul(color(0x22f3e6), mul(fresnel, mul(add(float(0.68), mul(wave, float(0.9))), spikeBoost))),
              mul(color(0xff4422), mul(add(wave, mul(tslSpikeUniform, float(0.9))), float(0.24)))
            ),
            mul(color(0xe8c36a), mul(fresnel, mul(tslSpikeUniform, float(0.85))))
          );
          coreMat = nodeMat;
        } catch {
          coreMat = new THREE.MeshStandardMaterial({
            color: 0x161922,
            emissive: 0x22f3e6,
            emissiveIntensity: 0.24,
            metalness: 0.78,
            roughness: 0.24
          });
        }
      } else {
        coreMat = new THREE.MeshStandardMaterial({
          color: 0x161922,
          emissive: 0x22f3e6,
          emissiveIntensity: 0.22,
          metalness: 0.8,
          roughness: 0.24
        });
      }

      // Central Carbon Allotrope Hex Core
      const coreGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.34, 6, 1);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI * 0.5;
      rootGroup.add(coreMesh);

      // Signal Vermilion Inner Hex Frame (Carbon Signature)
      const ringGeo = new THREE.TorusGeometry(1.52, 0.032, 12, 6);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xff4422,
        emissive: 0xff4422,
        emissiveIntensity: 0.55,
        metalness: 0.5,
        roughness: 0.28
      });
      const coreRing = new THREE.Mesh(ringGeo, ringMat);
      rootGroup.add(coreRing);

      // Chromatic Ghost Twin Rings (subtle vermilion/cyan split in 3D space during spikes)
      const ghostRedMat = new THREE.MeshBasicMaterial({
        color: 0xff4422,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ghostCyanMat = new THREE.MeshBasicMaterial({
        color: 0x22f3e6,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ghostRedRing = new THREE.Mesh(ringGeo, ghostRedMat);
      const ghostCyanRing = new THREE.Mesh(ringGeo, ghostCyanMat);
      rootGroup.add(ghostRedRing, ghostCyanRing);

      // Neon Cyan Orbital Discharge Ring (Gemini 4 Neon Signature)
      const neonRingGeo = new THREE.TorusGeometry(2.18, 0.02, 12, 48);
      const neonRingMat = new THREE.MeshStandardMaterial({
        color: 0x22f3e6,
        emissive: 0x22f3e6,
        emissiveIntensity: 0.72,
        metalness: 0.35,
        roughness: 0.2
      });
      const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
      neonRing.rotation.x = 0.42;
      rootGroup.add(neonRing);

      const outerRingGeo = new THREE.TorusGeometry(2.95, 0.02, 8, 60);
      const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x3d465a });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      rootGroup.add(outerRing);

      const cageGeo = new THREE.IcosahedronGeometry(1.92, 1);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0x243447,
        wireframe: true,
        transparent: true,
        opacity: 0.42
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      rootGroup.add(cageMesh);

      // 3D Shockwave Ring emitted from the picked cell in world space
      const shockGeo = new THREE.RingGeometry(0.46, 0.74, 48);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let shockMat: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let shockProgressUniform: any = null;

      if (mode === 'WEBGPU · TSL' && webgpuMod?.MeshBasicNodeMaterial && tslMod) {
        try {
          const { uv, vec2, float, uniform, smoothstep, mix, color, length, clamp } = tslMod;
          shockProgressUniform = uniform(1);
          const d = length(uv().sub(vec2(0.5, 0.5))).mul(2.0);
          const edge = smoothstep(0.62, 0.84, d).mul(float(1.0).sub(smoothstep(0.84, 1.0, d)));
          const fade = clamp(float(1.0).sub(shockProgressUniform), 0.0, 1.0);
          const spectral = mix(color(0x22f3e6), color(0xff4422), smoothstep(0.68, 0.96, d));
          const ringColor = mix(spectral, color(0xe8c36a), fade.mul(0.45));
          const sm = new webgpuMod.MeshBasicNodeMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: webgpuMod.AdditiveBlending
          });
          sm.colorNode = ringColor.mul(1.6);
          sm.opacityNode = edge.mul(fade).mul(0.95);
          shockMat = sm;
        } catch {
          shockMat = null;
        }
      }

      if (!shockMat) {
        shockMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uProgress: { value: 1.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uProgress;
            varying vec2 vUv;
            void main() {
              float d = length(vUv - vec2(0.5)) * 2.0;
              float ring = smoothstep(0.62, 0.84, d) * (1.0 - smoothstep(0.84, 1.0, d));
              float fade = clamp(1.0 - uProgress, 0.0, 1.0);
              vec3 c = mix(vec3(0.133, 0.953, 0.902), vec3(1.0, 0.267, 0.133), smoothstep(0.68, 0.96, d));
              c = mix(c, vec3(0.91, 0.765, 0.416), fade * 0.45);
              gl_FragColor = vec4(c * 1.5, ring * fade * 0.95);
            }
          `
        });
      }
      const shockMesh = new THREE.Mesh(shockGeo, shockMat);
      shockMesh.visible = false;
      rootGroup.add(shockMesh);

      // 11 Hexagonal Repository Cells Orbiting the Carbon × Neon Core
      const cellMeshes: Array<InstanceType<typeof THREE.Mesh>> = [];
      const hexGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 6);

      // Active Selection Neon Halo Ring that snaps onto the selected cell
      const haloGeo = new THREE.TorusGeometry(0.56, 0.024, 10, 6);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0x22f3e6,
        emissive: 0x22f3e6,
        emissiveIntensity: 0.95,
        metalness: 0.3,
        roughness: 0.2
      });
      const activeHalo = new THREE.Mesh(haloGeo, haloMat);
      rootGroup.add(activeHalo);

      items.forEach((item, idx) => {
        const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI * 0.5;
        const radius = idx % 2 === 0 ? 2.75 : 3.25;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.78;
        const z = ((idx % 3) - 1) * 0.28;

        const mat = new THREE.MeshStandardMaterial({
          color: 0x1c202b,
          emissive: new THREE.Color(item.spotInkHex || '#ff4422'),
          emissiveIntensity: idx === selectedIdx ? 0.88 : 0.24,
          metalness: 0.72,
          roughness: 0.26
        });

        const mesh = new THREE.Mesh(hexGeo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.x = Math.PI * 0.5;
        rootGroup.add(mesh);
        cellMeshes.push(mesh);

        const linePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x2c3648 });
        rootGroup.add(new THREE.Line(lineGeo, lineMat));
      });

      // The swarm: bees around the hive. Positions are computed on the GPU from a per-particle
      // seed (angle, radius, speed, size), so the CPU only updates five uniforms per frame.
      const small = window.innerWidth < 760;
      const COUNT = small ? 700 : 1600;
      const seeds = new Float32Array(COUNT * 4);
      for (let i = 0; i < COUNT; i++) {
        const r = Math.random();
        seeds[i * 4] = Math.random() * Math.PI * 2;
        seeds[i * 4 + 1] = 1.25 + Math.pow(Math.random(), 0.7) * 2.6;
        seeds[i * 4 + 2] = (0.04 + Math.random() * 0.16) * (r < 0.5 ? -1 : 1);
        seeds[i * 4 + 3] = 0.6 + Math.random() * 1.6;
      }

      let updateSwarm: (t: number, scatter: number, px: number, py: number, burst: number) => void = () => {};
      let setSwarmCount: (n: number) => void = () => {};
      let swarmDispose: () => void = () => {};

      if (mode === 'WEBGPU · TSL' && webgpuMod?.SpriteNodeMaterial && tslMod) {
        try {
          const { instancedBufferAttribute, uniform, vec3, float, sin, cos, uv, smoothstep, mix, color, fract } = tslMod;
          const seedAttr = new webgpuMod.InstancedBufferAttribute(seeds, 4);
          const s4 = instancedBufferAttribute(seedAttr);
          const uT = uniform(0);
          const uScatter = uniform(0);
          const uPx = uniform(0);
          const uPy = uniform(0);
          const uBurst = uniform(0);
          const ang = s4.x.add(uT.mul(s4.z));
          const radius = s4.y.mul(float(1).add(uScatter.mul(0.9)).add(uBurst.mul(0.45)));
          const swarmMat = new webgpuMod.SpriteNodeMaterial({
            transparent: true,
            depthWrite: false,
            blending: webgpuMod.AdditiveBlending
          });
          swarmMat.positionNode = vec3(
            cos(ang).mul(radius).add(uPx.mul(s4.y).mul(0.14)),
            sin(ang).mul(radius).mul(0.78).sub(uPy.mul(s4.y).mul(0.14)),
            sin(ang.mul(2).add(s4.x)).mul(0.5)
          );
          swarmMat.scaleNode = s4.w.mul(float(0.03).add(uBurst.mul(0.012)));
          const falloff = float(1).sub(smoothstep(0.0, 0.5, uv().sub(0.5).length()));
          const baseTone = mix(color(0x22f3e6), color(0xe8c36a), fract(s4.x.mul(3.7)));
          swarmMat.colorNode = mix(baseTone, color(0xff5a3c), uBurst.mul(0.35));
          swarmMat.opacityNode = falloff.mul(0.85);
          const swarm = new webgpuMod.Sprite(swarmMat);
          swarm.count = COUNT;
          swarm.frustumCulled = false;
          rootGroup.add(swarm);
          setSwarmCount = (n) => (swarm.count = n);
          updateSwarm = (t, scatter, px, py, burst) => {
            uT.value = t;
            uScatter.value = scatter;
            uPx.value = px;
            uPy.value = py;
            uBurst.value = burst;
          };
          swarmDispose = () => swarmMat.dispose();
        } catch {
          updateSwarm = () => {};
        }
      } else {
        const swarmGeo = new THREE.BufferGeometry();
        swarmGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
        swarmGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
        const swarmMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uScatter: { value: 0 },
            uPointer: { value: new THREE.Vector2() },
            uBurst: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2) }
          },
          vertexShader: `
            uniform float uTime;
            uniform float uScatter;
            uniform vec2 uPointer;
            uniform float uBurst;
            uniform float uPixelRatio;
            attribute vec4 aSeed;
            varying float vTone;
            varying float vBurst;
            void main() {
              float ang = aSeed.x + uTime * aSeed.z;
              float r = aSeed.y * (1.0 + uScatter * 0.9 + uBurst * 0.45);
              vec3 p = vec3(cos(ang) * r, sin(ang) * r * 0.78, sin(ang * 2.0 + aSeed.x) * 0.5);
              p.xy += vec2(uPointer.x, -uPointer.y) * aSeed.y * 0.14;
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_PointSize = aSeed.w * (1.0 + uBurst * 0.35) * uPixelRatio * (21.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
              vTone = fract(aSeed.x * 3.7);
              vBurst = uBurst;
            }
          `,
          fragmentShader: `
            varying float vTone;
            varying float vBurst;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              float a = 1.0 - smoothstep(0.0, 0.5, d);
              vec3 c = mix(vec3(0.133, 0.953, 0.902), vec3(0.91, 0.765, 0.416), vTone);
              c = mix(c, vec3(1.0, 0.35, 0.235), vBurst * 0.35);
              gl_FragColor = vec4(c, a * 0.85);
            }
          `
        });
        const swarm = new THREE.Points(swarmGeo, swarmMat);
        swarm.frustumCulled = false;
        rootGroup.add(swarm);
        setSwarmCount = (n) => swarmGeo.setDrawRange(0, n);
        updateSwarm = (t, scatter, px, py, burst) => {
          swarmMat.uniforms.uTime.value = t;
          swarmMat.uniforms.uScatter.value = scatter;
          (swarmMat.uniforms.uPointer.value as InstanceType<typeof THREE.Vector2>).set(px, py);
          swarmMat.uniforms.uBurst.value = burst;
        };
        swarmDispose = () => {
          swarmGeo.dispose();
          swarmMat.dispose();
        };
      }

      // Single cheap screen-space post-pass:
      // Combines radial + pointer-velocity chromatic-aberration RGB-split, 4-tap bright-pass
      // bloom-like glow, and expanding cell-selection shockwave ripple in ONE pass.
      interface PostUniformValues {
        aberration: number;
        bloom: number;
        dirX: number;
        dirY: number;
        shockX: number;
        shockY: number;
        shockProgress: number;
        shockAmp: number;
        aspect: number;
      }

      let renderWithPost: ((u: PostUniformValues) => void) | null = null;
      let resizePost: (w: number, h: number, dpr: number) => void = () => {};
      let disposePost: () => void = () => {};

      if (mode === 'WEBGPU · TSL' && webgpuMod?.RenderPipeline && tslMod?.pass && tslMod?.Fn) {
        try {
          const {
            Fn,
            pass,
            uv,
            vec2,
            vec3,
            vec4,
            float,
            uniform,
            sin,
            exp,
            length,
            clamp,
            max,
            dot
          } = tslMod;

          const scenePass = pass(scene, camera);
          const sceneTex = scenePass.getTextureNode();

          const uAberration = uniform(0.08);
          const uBloom = uniform(0.32);
          const uDir = uniform(new webgpuMod.Vector2(1, 0));
          const uShockOrigin = uniform(new webgpuMod.Vector2(0.5, 0.5));
          const uShockProgress = uniform(1);
          const uShockAmp = uniform(0);
          const uAspect = uniform(4 / 3);
          const uTexel = uniform(new webgpuMod.Vector2(1 / 640, 1 / 480));

          const coverPostNode = Fn(() => {
            const baseUv = uv();

            // Shockwave ripple emanating from picked cell's projected screen UV
            const toOrigin = baseUv.sub(uShockOrigin);
            const scaled = toOrigin.mul(vec2(uAspect, 1.0));
            const dist = length(scaled);
            const waveRadius = uShockProgress.mul(1.18);
            const waveDelta = dist.sub(waveRadius);
            const waveBand = exp(waveDelta.mul(waveDelta).mul(-310.0)).mul(uShockAmp);
            const safeDir = toOrigin.div(max(dist, float(0.001)));
            const rippleOffset = safeDir.mul(waveBand).mul(sin(waveDelta.mul(46.0))).mul(0.026);
            const warpedUv = clamp(baseUv.add(rippleOffset), vec2(0.002, 0.002), vec2(0.998, 0.998));

            // Radial + directional pointer-velocity + shockwave RGB split
            const fromCenter = warpedUv.sub(0.5);
            const caOffset = fromCenter
              .mul(uAberration.mul(0.032))
              .add(uDir.mul(uAberration.mul(0.018)))
              .add(safeDir.mul(waveBand.mul(0.024)));

            const uvR = clamp(warpedUv.add(caOffset), vec2(0.002, 0.002), vec2(0.998, 0.998));
            const uvB = clamp(warpedUv.sub(caOffset), vec2(0.002, 0.002), vec2(0.998, 0.998));

            const sR = sceneTex.sample(uvR);
            const sG = sceneTex.sample(warpedUv);
            const sB = sceneTex.sample(uvB);
            const splitCol = vec3(sR.r, sG.g, sB.b);

            // Cheap 4-tap diamond bright-pass bloom-like glow
            const stepUv = uTexel.mul(float(3.0).add(uBloom.mul(4.5)));
            const t1 = sceneTex.sample(clamp(warpedUv.add(vec2(stepUv.x, stepUv.y)), vec2(0.002, 0.002), vec2(0.998, 0.998))).rgb;
            const t2 = sceneTex.sample(clamp(warpedUv.add(vec2(stepUv.x.negate(), stepUv.y)), vec2(0.002, 0.002), vec2(0.998, 0.998))).rgb;
            const t3 = sceneTex.sample(clamp(warpedUv.add(vec2(stepUv.x, stepUv.y.negate())), vec2(0.002, 0.002), vec2(0.998, 0.998))).rgb;
            const t4 = sceneTex.sample(clamp(warpedUv.add(vec2(stepUv.x.negate(), stepUv.y.negate())), vec2(0.002, 0.002), vec2(0.998, 0.998))).rgb;

            const avg = t1.add(t2).add(t3).add(t4).mul(0.25);
            const bright = max(avg.sub(vec3(0.28, 0.28, 0.28)), vec3(0.0, 0.0, 0.0));
            const bloomGlow = bright.mul(uBloom.mul(1.25));

            // Spectral cyan/vermilion highlight along the expanding shockwave crest
            const ringTint = vec3(0.133, 0.953, 0.902).mul(waveBand.mul(0.52))
              .add(vec3(1.0, 0.267, 0.133).mul(waveBand.mul(0.26)));

            const finalRgb = splitCol.add(bloomGlow).add(ringTint);
            const baseA = max(max(sR.a, sG.a), sB.a);
            const glowA = clamp(dot(bloomGlow.add(ringTint), vec3(0.35, 0.45, 0.2)), 0.0, 1.0);
            const finalA = clamp(baseA.add(glowA), 0.0, 1.0);

            return vec4(finalRgb, finalA);
          });

          const pipeline = new webgpuMod.RenderPipeline(activeRenderer, coverPostNode());
          resizePost = (w, h) => {
            uTexel.value.set(1 / Math.max(1, w), 1 / Math.max(1, h));
          };
          renderWithPost = (u) => {
            uAberration.value = u.aberration;
            uBloom.value = u.bloom;
            uDir.value.set(u.dirX, u.dirY);
            uShockOrigin.value.set(u.shockX, u.shockY);
            uShockProgress.value = u.shockProgress;
            uShockAmp.value = u.shockAmp;
            uAspect.value = u.aspect;
            pipeline.render();
          };
          disposePost = () => {
            if (typeof pipeline.dispose === 'function') pipeline.dispose();
          };
        } catch {
          renderWithPost = null;
        }
      } else if (mode === 'WEBGL2 · NEON') {
        const postRT = new THREE.WebGLRenderTarget(640, 480, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat
        });
        const postScene = new THREE.Scene();
        const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const postGeo = new THREE.PlaneGeometry(2, 2);
        const postMat = new THREE.ShaderMaterial({
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            tDiffuse: { value: postRT.texture },
            uAberration: { value: 0.08 },
            uBloom: { value: 0.32 },
            uDir: { value: new THREE.Vector2(1, 0) },
            uShockOrigin: { value: new THREE.Vector2(0.5, 0.5) },
            uShockProgress: { value: 1.0 },
            uShockAmp: { value: 0.0 },
            uAspect: { value: 4 / 3 },
            uTexel: { value: new THREE.Vector2(1 / 640, 1 / 480) }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position.xy, 0.0, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float uAberration;
            uniform float uBloom;
            uniform vec2 uDir;
            uniform vec2 uShockOrigin;
            uniform float uShockProgress;
            uniform float uShockAmp;
            uniform float uAspect;
            uniform vec2 uTexel;
            varying vec2 vUv;

            void main() {
              vec2 toOrigin = vUv - uShockOrigin;
              vec2 scaled = toOrigin * vec2(uAspect, 1.0);
              float dist = length(scaled);
              float waveRadius = uShockProgress * 1.18;
              float waveDelta = dist - waveRadius;
              float waveBand = exp(-waveDelta * waveDelta * 310.0) * uShockAmp;
              vec2 safeDir = toOrigin / max(dist, 0.001);

              vec2 rippleOffset = safeDir * waveBand * sin(waveDelta * 46.0) * 0.026;
              vec2 warpedUv = clamp(vUv + rippleOffset, vec2(0.002), vec2(0.998));

              vec2 fromCenter = warpedUv - 0.5;
              vec2 caOffset = fromCenter * (uAberration * 0.032)
                + uDir * (uAberration * 0.018)
                + safeDir * (waveBand * 0.024);

              vec2 uvR = clamp(warpedUv + caOffset, vec2(0.002), vec2(0.998));
              vec2 uvB = clamp(warpedUv - caOffset, vec2(0.002), vec2(0.998));

              vec4 sR = texture2D(tDiffuse, uvR);
              vec4 sG = texture2D(tDiffuse, warpedUv);
              vec4 sB = texture2D(tDiffuse, uvB);
              vec3 splitCol = vec3(sR.r, sG.g, sB.b);

              vec2 stepUv = uTexel * (3.0 + uBloom * 4.5);
              vec3 t1 = texture2D(tDiffuse, clamp(warpedUv + vec2(stepUv.x, stepUv.y), vec2(0.002), vec2(0.998))).rgb;
              vec3 t2 = texture2D(tDiffuse, clamp(warpedUv + vec2(-stepUv.x, stepUv.y), vec2(0.002), vec2(0.998))).rgb;
              vec3 t3 = texture2D(tDiffuse, clamp(warpedUv + vec2(stepUv.x, -stepUv.y), vec2(0.002), vec2(0.998))).rgb;
              vec3 t4 = texture2D(tDiffuse, clamp(warpedUv + vec2(-stepUv.x, -stepUv.y), vec2(0.002), vec2(0.998))).rgb;

              vec3 avg = (t1 + t2 + t3 + t4) * 0.25;
              vec3 bright = max(avg - vec3(0.28), vec3(0.0));
              vec3 bloomGlow = bright * (uBloom * 1.25);

              vec3 ringTint = vec3(0.133, 0.953, 0.902) * (waveBand * 0.52)
                + vec3(1.0, 0.267, 0.133) * (waveBand * 0.26);

              vec3 finalRgb = splitCol + bloomGlow + ringTint;
              float baseA = max(max(sR.a, sG.a), sB.a);
              float glowA = clamp(dot(bloomGlow + ringTint, vec3(0.35, 0.45, 0.2)), 0.0, 1.0);
              gl_FragColor = vec4(finalRgb, clamp(baseA + glowA, 0.0, 1.0));
            }
          `
        });
        postScene.add(new THREE.Mesh(postGeo, postMat));

        resizePost = (w, h, dpr) => {
          const rw = Math.max(1, Math.floor(w * dpr));
          const rh = Math.max(1, Math.floor(h * dpr));
          postRT.setSize(rw, rh);
          (postMat.uniforms.uTexel.value as InstanceType<typeof THREE.Vector2>).set(1 / Math.max(1, w), 1 / Math.max(1, h));
        };
        renderWithPost = (u) => {
          postMat.uniforms.uAberration.value = u.aberration;
          postMat.uniforms.uBloom.value = u.bloom;
          (postMat.uniforms.uDir.value as InstanceType<typeof THREE.Vector2>).set(u.dirX, u.dirY);
          (postMat.uniforms.uShockOrigin.value as InstanceType<typeof THREE.Vector2>).set(u.shockX, u.shockY);
          postMat.uniforms.uShockProgress.value = u.shockProgress;
          postMat.uniforms.uShockAmp.value = u.shockAmp;
          postMat.uniforms.uAspect.value = u.aspect;
          activeRenderer.setRenderTarget(postRT);
          activeRenderer.clear();
          activeRenderer.render(scene, camera);
          activeRenderer.setRenderTarget(null);
          activeRenderer.render(postScene, postCam);
        };
        disposePost = () => {
          postRT.dispose();
          postGeo.dispose();
          postMat.dispose();
        };
      }

      // Scroll: as the reader leaves the cover, the hive tilts away and the swarm loosens.
      let scrollMix = 0;
      const onScroll = () => {
        scrollMix = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      // Watch html[data-rizz="max"] so the hive hums hotter in maximum-rizz mode
      let rizzBoost = document.documentElement.dataset.rizz === 'max' ? 1 : 0;
      const rizzObserver = new MutationObserver(() => {
        rizzBoost = document.documentElement.dataset.rizz === 'max' ? 1 : 0;
      });
      rizzObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-rizz'] });

      rendererMode = mode;

      let dprCap = small ? 1.5 : 2;
      let currentAspect = 4 / 3;
      const syncSize = () => {
        if (!viewportEl || !activeRenderer) return;
        const rect = viewportEl.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        currentAspect = w / h;
        camera.aspect = currentAspect;
        camera.updateProjectionMatrix();
        if (typeof activeRenderer.setPixelRatio === 'function') {
          activeRenderer.setPixelRatio(dpr);
        }
        // updateStyle = false keeps canvas.style untouched for strict CSP
        activeRenderer.setSize(w, h, false);
        resizePost(w, h, dpr);
      };

      syncSize();
      const ro = new ResizeObserver(syncSize);
      ro.observe(viewportEl);

      const io = new IntersectionObserver(
        (entries) => {
          inView = Boolean(entries[0]?.isIntersecting);
        },
        { threshold: 0.05 }
      );
      io.observe(viewportEl);

      const startClock = performance.now();
      let prevFrameNow = startClock;
      const targetVec = new THREE.Vector3();
      const scaleVec = new THREE.Vector3();
      const shockWorld = new THREE.Vector3();
      const shockNdc = new THREE.Vector3();

      // Shockwave state
      let shockAge = 99;
      let shockOriginX = 0.5;
      let shockOriginY = 0.5;
      const SHOCK_DURATION = 0.85;

      // One-shot quality governor: if the live cover can't hold ~45fps on this device, halve
      // the swarm and drop to 1x pixels. Only the canvas degrades; the page keeps its motion.
      const frameSamples: number[] = [];
      let lastLive = 0;
      let degraded = false;

      const tick = (now: number) => {
        if (disposed) return;
        rafId = requestAnimationFrame(tick);
        if (paused || !inView || document.hidden) {
          lastLive = 0;
          prevFrameNow = now;
          return;
        }
        if (!degraded) {
          if (lastLive) frameSamples.push(now - lastLive);
          lastLive = now;
          if (frameSamples.length >= 40) {
            const median = [...frameSamples].sort((a, b) => a - b)[20];
            frameSamples.length = 0;
            if (median > 22) {
              degraded = true;
              setSwarmCount(Math.floor(COUNT * 0.5));
              dprCap = 1;
              syncSize();
            }
          }
        }

        const dt = Math.min(0.06, Math.max(0.001, (now - prevFrameNow) * 0.001));
        prevFrameNow = now;
        const t = (now - startClock) * 0.001;

        // Trigger shockwave from the newly selected cell's world + projected screen position
        if (shockwaveTriggerIdx >= 0) {
          const picked = cellMeshes[shockwaveTriggerIdx];
          shockwaveTriggerIdx = -1;
          if (picked) {
            shockAge = 0;
            shockMesh.position.copy(picked.position);
            shockMesh.visible = true;
            picked.getWorldPosition(shockWorld);
            shockNdc.copy(shockWorld).project(camera);
            shockOriginX = Math.min(0.95, Math.max(0.05, shockNdc.x * 0.5 + 0.5));
            shockOriginY = Math.min(0.95, Math.max(0.05, shockNdc.y * 0.5 + 0.5));
          }
        }

        // Decay velocity & selection spikes smoothly
        velocitySpike *= Math.exp(-dt * 4.4);
        selectionSpike *= Math.exp(-dt * 2.9);
        pointerVel.x *= Math.exp(-dt * 6.0);
        pointerVel.y *= Math.exp(-dt * 6.0);

        const totalSpike = Math.min(1.6, velocitySpike + selectionSpike * 1.15);
        const aberrationLevel = 0.09 + rizzBoost * 0.14 + totalSpike * 0.85;
        const bloomLevel = 0.34 + rizzBoost * 0.22 + totalSpike * 0.92;

        // Update 3D shockwave ring + screen-space ripple wave
        let shockProgress = 1;
        let shockAmp = 0;
        if (shockAge < SHOCK_DURATION) {
          shockAge += dt;
          shockProgress = Math.min(1, shockAge / SHOCK_DURATION);
          const easeOut = 1 - Math.pow(1 - shockProgress, 3);
          shockAmp = Math.pow(1 - shockProgress, 1.35);
          const ringScale = 0.55 + easeOut * 6.2;
          shockMesh.scale.set(ringScale, ringScale, 1);
          if (shockProgressUniform) {
            shockProgressUniform.value = shockProgress;
          } else if (shockMat?.uniforms?.uProgress) {
            shockMat.uniforms.uProgress.value = shockProgress;
          }
        } else if (shockMesh.visible) {
          shockMesh.visible = false;
        }

        if (tslPulseUniform) {
          tslPulseUniform.value = t;
        } else if (typeof coreMat.emissiveIntensity === 'number') {
          coreMat.emissiveIntensity = 0.22 + Math.sin(t * 2.1) * 0.1 + totalSpike * 0.72;
        }
        if (tslSpikeUniform) {
          tslSpikeUniform.value = totalSpike + rizzBoost * 0.25;
        }

        // Surge studio rim lights & orbital rings on spike
        rimVermilion.intensity = 6.0 + totalSpike * 5.8 + rizzBoost * 1.5;
        rimNeonCyan.intensity = 6.2 + totalSpike * 6.4 + rizzBoost * 1.5;

        coreRing.rotation.z = t * 0.28;
        ringMat.emissiveIntensity = 0.55 + totalSpike * 0.85;

        // Subtle 3D chromatic ghost offset on the inner hex frame
        const ghostShift = Math.min(0.18, totalSpike * 0.11 + rizzBoost * 0.025);
        ghostRedRing.rotation.z = coreRing.rotation.z;
        ghostCyanRing.rotation.z = coreRing.rotation.z;
        ghostRedRing.position.set(spikeDir.x * ghostShift, spikeDir.y * ghostShift, 0.02);
        ghostCyanRing.position.set(-spikeDir.x * ghostShift, -spikeDir.y * ghostShift, -0.02);
        ghostRedMat.opacity = Math.min(0.65, totalSpike * 0.52 + rizzBoost * 0.12);
        ghostCyanMat.opacity = Math.min(0.65, totalSpike * 0.52 + rizzBoost * 0.12);

        neonRing.rotation.z = -t * 0.42;
        neonRing.rotation.y = Math.sin(t * 0.65) * 0.35;
        neonRingMat.emissiveIntensity = 0.62 + Math.sin(t * 2.8) * 0.26 + totalSpike * 0.95;
        haloMat.emissiveIntensity = 0.95 + totalSpike * 0.9;
        outerRing.rotation.z = -t * 0.12;
        cageMesh.rotation.y = t * 0.14;
        cageMesh.rotation.x = t * 0.09;

        rootGroup.rotation.y += (pointer.x * 0.32 - rootGroup.rotation.y) * 0.06;
        rootGroup.rotation.x += (-pointer.y * 0.24 + scrollMix * 0.55 - rootGroup.rotation.x) * 0.06;
        rootGroup.rotation.z += (scrollMix * 0.35 - rootGroup.rotation.z) * 0.06;
        camera.position.z += (7.5 + scrollMix * 1.8 - camera.position.z) * 0.08;
        burstLevel *= 0.94;
        updateSwarm(t, scrollMix, pointer.x, pointer.y, Math.min(1.3, burstLevel + velocitySpike * 0.35));

        cellMeshes.forEach((mesh, idx) => {
          const isHot = idx === selectedIdx;
          const targetScale = isHot ? 1.28 + selectionSpike * 0.18 : 1.0;
          scaleVec.set(targetScale, targetScale, targetScale);
          mesh.scale.lerp(scaleVec, 0.14);
          mesh.rotation.z = t * 0.2 + idx * 0.5;
          const m = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          m.emissiveIntensity = isHot ? 0.96 + selectionSpike * 0.85 : 0.24 + velocitySpike * 0.22;

          if (isHot) {
            targetVec.copy(mesh.position);
            activeHalo.position.lerp(targetVec, 0.18);
            activeHalo.rotation.z = -t * 0.9;
          }
        });

        if (renderWithPost) {
          try {
            renderWithPost({
              aberration: aberrationLevel,
              bloom: bloomLevel,
              dirX: spikeDir.x,
              dirY: spikeDir.y,
              shockX: shockOriginX,
              shockY: shockOriginY,
              shockProgress,
              shockAmp,
              aspect: currentAspect
            });
          } catch {
            renderWithPost = null;
            activeRenderer.render(scene, camera);
          }
        } else {
          activeRenderer.render(scene, camera);
        }
      };

      rafId = requestAnimationFrame(tick);

      cleanupRenderer = () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        io.disconnect();
        rizzObserver.disconnect();
        window.removeEventListener('scroll', onScroll);
        disposePost();
        swarmDispose();
        shockGeo.dispose();
        if (typeof shockMat?.dispose === 'function') shockMat.dispose();
        ghostRedMat.dispose();
        ghostCyanMat.dispose();
        hexGeo.dispose();
        coreGeo.dispose();
        ringGeo.dispose();
        neonRingGeo.dispose();
        outerRingGeo.dispose();
        cageGeo.dispose();
        haloGeo.dispose();
        if (typeof activeRenderer.dispose === 'function') {
          activeRenderer.dispose();
        }
      };
    }

    void bootThreeStage();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanupRenderer?.();
    };
  });

  function onPointerMove(e: PointerEvent) {
    if (!viewportEl) return;
    const rect = viewportEl.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    const now = performance.now();

    if (lastPointer.t > 0) {
      const dt = Math.max(0.012, (now - lastPointer.t) * 0.001);
      const dx = nx - lastPointer.x;
      const dy = ny - lastPointer.y;
      const speed = Math.hypot(dx, dy) / dt;
      if (speed > 0.15) {
        const inv = 1 / Math.max(0.0001, Math.hypot(dx, dy));
        spikeDir.x = spikeDir.x * 0.6 + dx * inv * 0.4;
        spikeDir.y = spikeDir.y * 0.6 - dy * inv * 0.4;
        pointerVel.x = Math.max(-1.5, Math.min(1.5, dx / dt * 0.15));
        pointerVel.y = Math.max(-1.5, Math.min(1.5, -dy / dt * 0.15));
        velocitySpike = Math.min(1.25, velocitySpike + Math.min(0.45, speed * 0.085));
      }
    }

    lastPointer.x = nx;
    lastPointer.y = ny;
    lastPointer.t = now;
    pointer.x = nx;
    pointer.y = ny;
  }
</script>

<div class={`cover-stage-frame ${rendererMode !== 'STATIC SVG' ? 'is-neon-live' : ''}`} aria-label="Cover plate: eleven features as cells in a hive. Choose one below.">
  <div class="cover-stage-topbar">
    <span>PLATE I · THE HIVE · {items.length} CELLS</span>
    <div class="press-controls-bar">
      <span class="renderer-pill">RENDERER: {rendererMode}</span>
      {#if rendererMode !== 'STATIC SVG'}
        <button type="button" class="ctrl-btn neon-btn-accent" aria-pressed={paused} onclick={() => (paused = !paused)}>
          {paused ? 'Resume motion' : 'Hold still'}
        </button>
      {/if}
    </div>
  </div>

  <div
    class="cover-viewport"
    bind:this={viewportEl}
    onpointermove={onPointerMove}
    onpointerleave={() => {
      pointer.x = 0;
      pointer.y = 0;
      lastPointer.t = 0;
    }}
  >
    {#if rendererMode === 'STATIC SVG'}
      <svg
        class="cover-fallback-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        role="img"
        aria-label="A drawing of the hive: a dark hexagon at the centre and eleven numbered cells around it"
      >
        <rect width="800" height="600" fill="#070a0f" />
        <circle cx="400" cy="300" r="215" fill="none" stroke="#252a36" stroke-width="1.5" stroke-dasharray="6 4" />
        <ellipse cx="400" cy="300" rx="158" ry="122" fill="none" stroke="#22f3e6" stroke-width="1.5" opacity="0.6" />
        <polygon points="400,210 478,255 478,345 400,390 322,345 322,255" fill="#131722" stroke="#ff4422" stroke-width="2.2" />
        <text x="400" y="294" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="13" text-anchor="middle">
          C·06 × Ne·10
        </text>
        <text x="400" y="316" fill="#22f3e6" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          ISSUE {issueNumber}
        </text>
        {#each items as item, idx}
          {@const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI * 0.5}
          {@const cx = Math.round(400 + Math.cos(angle) * 215)}
          {@const cy = Math.round(300 + Math.sin(angle) * 185)}
          <line x1="400" y1="300" x2={cx} y2={cy} stroke={idx === selectedIdx ? '#22f3e6' : '#232834'} stroke-width={idx === selectedIdx ? '2' : '1.2'} />
          <circle
            cx={cx}
            cy={cy}
            r={idx === selectedIdx ? '24' : '18'}
            fill="#121822"
            stroke={idx === selectedIdx ? '#22f3e6' : item.spotInkHex}
            stroke-width={idx === selectedIdx ? '2.8' : '1.6'}
          />
          <text x={cx} y={cy + 4} fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
            {item.folioCode}
          </text>
        {/each}
      </svg>
    {/if}

    <canvas
      bind:this={canvasEl}
      class="carbon-cover-canvas"
      width="800"
      height="600"
      aria-hidden="true"
    ></canvas>
  </div>

  <div class="cover-node-strip" role="listbox" aria-label="Pick a feature">
    {#each items as item, idx (item.readerServiceNo)}
      <button
        type="button"
        role="option"
        aria-selected={idx === selectedIdx}
        class={`cover-node-btn ${idx === selectedIdx ? 'is-selected' : ''}`}
        onmouseenter={() => (selectedIdx = idx)}
        onclick={() => selectCell(idx)}
      >
        <span class="node-folio">FOLIO {item.folioCode} · #{item.readerServiceNo}</span>
        <span class="node-name">{item.title}</span>
      </button>
    {/each}
  </div>

  {#if activeItem}
    <div class="cover-stage-readout" aria-live="polite">
      <div class="readout-meta">
        <strong>FOLIO {activeItem.folioCode} // {activeItem.title}</strong>
        <span>{activeItem.kicker}</span>
      </div>
      <a class="btn-secondary" href={withBase(`/issues/${activeItem.issueNumber}/${activeItem.articleSlug}`)}>
        Read it ↗
      </a>
    </div>
  {/if}
</div>
