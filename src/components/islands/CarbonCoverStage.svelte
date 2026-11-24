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
  let burstLevel = 0;

  const activeItem = $derived(items[selectedIdx] || items[0]);

  function selectCell(idx: number) {
    selectedIdx = idx;
    burstLevel = 1;
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

      // Core Material: Native WebGPU TSL Fresnel + Travelling Neon Discharge Pulse when available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tslPulseUniform: any = null;
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
          const ndotv = abs(dot(normalView, positionViewDirection));
          const fresnel = pow(sub(float(1.0), ndotv), float(2.6));
          const wave = add(mul(sin(add(mul(positionLocal.y, float(4.2)), mul(tslPulseUniform, float(2.4)))), float(0.5)), float(0.5));

          const nodeMat = new webgpuMod.MeshStandardNodeMaterial({
            color: 0x141822,
            metalness: 0.82,
            roughness: 0.22
          });
          nodeMat.emissiveNode = add(
            mul(color(0x22f3e6), mul(fresnel, add(float(0.65), mul(wave, float(0.85))))),
            mul(color(0xff4422), mul(wave, float(0.18)))
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
      // seed (angle, radius, speed, size), so the CPU only updates four uniforms per frame.
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
          swarmMat.scaleNode = s4.w.mul(0.03);
          const falloff = float(1).sub(smoothstep(0.0, 0.5, uv().sub(0.5).length()));
          swarmMat.colorNode = mix(color(0x22f3e6), color(0xe8c36a), fract(s4.x.mul(3.7)));
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
            void main() {
              float ang = aSeed.x + uTime * aSeed.z;
              float r = aSeed.y * (1.0 + uScatter * 0.9 + uBurst * 0.45);
              vec3 p = vec3(cos(ang) * r, sin(ang) * r * 0.78, sin(ang * 2.0 + aSeed.x) * 0.5);
              p.xy += vec2(uPointer.x, -uPointer.y) * aSeed.y * 0.14;
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_PointSize = aSeed.w * uPixelRatio * (21.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
              vTone = fract(aSeed.x * 3.7);
            }
          `,
          fragmentShader: `
            varying float vTone;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              float a = 1.0 - smoothstep(0.0, 0.5, d);
              vec3 c = mix(vec3(0.133, 0.953, 0.902), vec3(0.91, 0.765, 0.416), vTone);
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

      // Scroll: as the reader leaves the cover, the hive tilts away and the swarm loosens.
      let scrollMix = 0;
      const onScroll = () => {
        scrollMix = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      rendererMode = mode;

      let dprCap = small ? 1.5 : 2;
      const syncSize = () => {
        if (!viewportEl || !activeRenderer) return;
        const rect = viewportEl.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (typeof activeRenderer.setPixelRatio === 'function') {
          activeRenderer.setPixelRatio(dpr);
        }
        // updateStyle = false keeps canvas.style untouched for strict CSP
        activeRenderer.setSize(w, h, false);
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
      const targetVec = new THREE.Vector3();
      const scaleVec = new THREE.Vector3();

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

        const t = (now - startClock) * 0.001;
        if (tslPulseUniform) {
          tslPulseUniform.value = t;
        } else if (typeof coreMat.emissiveIntensity === 'number') {
          coreMat.emissiveIntensity = 0.2 + Math.sin(t * 2.1) * 0.1;
        }

        coreRing.rotation.z = t * 0.28;
        neonRing.rotation.z = -t * 0.42;
        neonRing.rotation.y = Math.sin(t * 0.65) * 0.35;
        neonRingMat.emissiveIntensity = 0.62 + Math.sin(t * 2.8) * 0.26;
        outerRing.rotation.z = -t * 0.12;
        cageMesh.rotation.y = t * 0.14;
        cageMesh.rotation.x = t * 0.09;

        rootGroup.rotation.y += (pointer.x * 0.32 - rootGroup.rotation.y) * 0.06;
        rootGroup.rotation.x += (-pointer.y * 0.24 + scrollMix * 0.55 - rootGroup.rotation.x) * 0.06;
        rootGroup.rotation.z += (scrollMix * 0.35 - rootGroup.rotation.z) * 0.06;
        camera.position.z += (7.5 + scrollMix * 1.8 - camera.position.z) * 0.08;
        burstLevel *= 0.94;
        updateSwarm(t, scrollMix, pointer.x, pointer.y, burstLevel);

        cellMeshes.forEach((mesh, idx) => {
          const isHot = idx === selectedIdx;
          const targetScale = isHot ? 1.28 : 1.0;
          scaleVec.set(targetScale, targetScale, targetScale);
          mesh.scale.lerp(scaleVec, 0.14);
          mesh.rotation.z = t * 0.2 + idx * 0.5;
          const m = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          m.emissiveIntensity = isHot ? 0.96 : 0.24;

          if (isHot) {
            targetVec.copy(mesh.position);
            activeHalo.position.lerp(targetVec, 0.18);
            activeHalo.rotation.z = -t * 0.9;
          }
        });

        activeRenderer.render(scene, camera);
      };

      rafId = requestAnimationFrame(tick);

      cleanupRenderer = () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('scroll', onScroll);
        swarmDispose();
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
    pointer.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointer.y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
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
