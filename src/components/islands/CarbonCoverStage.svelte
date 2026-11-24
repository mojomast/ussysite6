<script lang="ts">
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
  let rendererMode = $state<'STATIC SVG' | 'WEBGPU' | 'WEBGL2'>('STATIC SVG');
  let paused = $state(false);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let viewportEl = $state<HTMLDivElement | null>(null);
  let pointer = { x: 0, y: 0 };

  const activeItem = $derived(items[selectedIdx] || items[0]);

  function selectCell(idx: number) {
    selectedIdx = idx;
    carbonSynth.click(620 + idx * 24);
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

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 100);
      camera.position.set(0, 0.15, 7.5);

      // Lights — Sculptural Pyrolytic Graphite + Vermilion & Phosphor Rim
      const ambient = new THREE.AmbientLight(0xd8dde8, 0.85);
      const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
      keyLight.position.set(4, 6, 7);
      const rimVermilion = new THREE.PointLight(0xff4422, 5.5, 16);
      rimVermilion.position.set(-4.5, 2.5, 4);
      const rimMint = new THREE.PointLight(0x3ddc97, 4.5, 16);
      rimMint.position.set(4.5, -2.5, 4);
      scene.add(ambient, keyLight, rimVermilion, rimMint);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // Central Carbon Allotrope Torus/Hex Core
      const coreGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.34, 6, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x161922,
        metalness: 0.78,
        roughness: 0.26
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI * 0.5;
      rootGroup.add(coreMesh);

      const ringGeo = new THREE.TorusGeometry(1.52, 0.032, 12, 6);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xff4422,
        emissive: 0xff4422,
        emissiveIntensity: 0.45,
        metalness: 0.5,
        roughness: 0.3
      });
      const coreRing = new THREE.Mesh(ringGeo, ringMat);
      rootGroup.add(coreRing);

      const outerRingGeo = new THREE.TorusGeometry(2.95, 0.022, 8, 60);
      const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x3d465a });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      rootGroup.add(outerRing);

      const cageGeo = new THREE.IcosahedronGeometry(1.95, 1);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0x262d3d,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      rootGroup.add(cageMesh);

      // 11 Hexagonal Repository Cells Orbiting the Carbon Core
      const cellMeshes: Array<InstanceType<typeof THREE.Mesh>> = [];
      const hexGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.22, 6);

      items.forEach((item, idx) => {
        const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI * 0.5;
        const radius = idx % 2 === 0 ? 2.75 : 3.25;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.78;
        const z = (idx % 3 - 1) * 0.28;

        const mat = new THREE.MeshStandardMaterial({
          color: 0x1c202b,
          emissive: new THREE.Color(item.spotInkHex || '#ff4422'),
          emissiveIntensity: idx === selectedIdx ? 0.8 : 0.22,
          metalness: 0.7,
          roughness: 0.28
        });

        const mesh = new THREE.Mesh(hexGeo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.x = Math.PI * 0.5;
        rootGroup.add(mesh);
        cellMeshes.push(mesh);

        // Radial Filament Spoke
        const linePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x2f3646 });
        rootGroup.add(new THREE.Line(lineGeo, lineMat));
      });

      // Try WebGPU first, fall back cleanly to WebGL2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let activeRenderer: any = null;
      let mode: 'WEBGPU' | 'WEBGL2' | 'STATIC SVG' = 'STATIC SVG';

      try {
        const navGpu = (navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu;
        if (navGpu && typeof navGpu.requestAdapter === 'function') {
          const adapter = await navGpu.requestAdapter();
          if (adapter && !disposed) {
            const webgpuMod = await import('three/webgpu');
            if (webgpuMod?.WebGPURenderer) {
              const gpuRenderer = new webgpuMod.WebGPURenderer({
                canvas: canvasEl,
                antialias: true,
                alpha: true
              });
              await gpuRenderer.init();
              activeRenderer = gpuRenderer;
              mode = 'WEBGPU';
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
          mode = 'WEBGL2';
        } catch {
          activeRenderer = null;
        }
      }

      if (!activeRenderer || disposed) {
        rendererMode = 'STATIC SVG';
        return;
      }

      rendererMode = mode;

      const syncSize = () => {
        if (!viewportEl || !activeRenderer) return;
        const rect = viewportEl.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (typeof activeRenderer.setPixelRatio === 'function') {
          activeRenderer.setPixelRatio(dpr);
        }
        // Pass updateStyle = false so canvas.style is never mutated (strict CSP safe)
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
      const tick = (now: number) => {
        if (disposed) return;
        rafId = requestAnimationFrame(tick);
        if (paused || !inView || document.hidden) return;

        const t = (now - startClock) * 0.001;
        coreRing.rotation.z = t * 0.28;
        outerRing.rotation.z = -t * 0.12;
        cageMesh.rotation.y = t * 0.14;
        cageMesh.rotation.x = t * 0.09;
        rootGroup.rotation.y += (pointer.x * 0.32 - rootGroup.rotation.y) * 0.06;
        rootGroup.rotation.x += (-pointer.y * 0.24 - rootGroup.rotation.x) * 0.06;

        cellMeshes.forEach((mesh, idx) => {
          const isHot = idx === selectedIdx;
          const targetScale = isHot ? 1.28 : 1.0;
          mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
          mesh.rotation.z = t * 0.2 + idx * 0.5;
          const m = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          m.emissiveIntensity = isHot ? 0.92 : 0.22;
        });

        activeRenderer.render(scene, camera);
      };

      rafId = requestAnimationFrame(tick);

      cleanupRenderer = () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
        io.disconnect();
        hexGeo.dispose();
        coreGeo.dispose();
        ringGeo.dispose();
        outerRingGeo.dispose();
        cageGeo.dispose();
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

<div class="cover-stage-frame" aria-label="Interactive Carbon Lattice Cover Index">
  <div class="cover-stage-topbar">
    <span>PLATE I // CARBON ALLOTROPE · 11 CELLS</span>
    <div class="press-controls-bar">
      <span class="renderer-pill">RENDERER: {rendererMode}</span>
      {#if rendererMode !== 'STATIC SVG'}
        <button type="button" class="ctrl-btn" aria-pressed={paused} onclick={() => (paused = !paused)}>
          {paused ? 'Resume 3D' : 'Pause 3D'}
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
    <!-- Progressive Enhancement Static SVG Underlay / Fallback -->
    {#if rendererMode === 'STATIC SVG'}
      <svg
        class="cover-fallback-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        role="img"
        aria-label="Pyrolytic Carbon Lattice with eleven repository cells"
      >
        <rect width="800" height="600" fill="#090b0f" />
        <circle cx="400" cy="300" r="215" fill="none" stroke="#252a36" stroke-width="1.5" stroke-dasharray="6 4" />
        <polygon points="400,210 478,255 478,345 400,390 322,345 322,255" fill="#131722" stroke="#ff4422" stroke-width="2.2" />
        <text x="400" y="296" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="13" text-anchor="middle">
          C·06 HIVE
        </text>
        <text x="400" y="316" fill="#3ddc97" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          ISSUE {issueNumber}
        </text>
        {#each items as item, idx}
          {@const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI * 0.5}
          {@const cx = Math.round(400 + Math.cos(angle) * 215)}
          {@const cy = Math.round(300 + Math.sin(angle) * 185)}
          <line x1="400" y1="300" x2={cx} y2={cy} stroke="#232834" stroke-width="1.2" />
          <circle
            cx={cx}
            cy={cy}
            r={idx === selectedIdx ? '24' : '18'}
            fill="#141822"
            stroke={idx === selectedIdx ? '#ff4422' : item.spotInkHex}
            stroke-width={idx === selectedIdx ? '2.6' : '1.6'}
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

  <div class="cover-node-strip" role="listbox" aria-label="Select featured repository cell">
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
      <a class="btn-secondary" href={`/issues/${activeItem.issueNumber}/${activeItem.articleSlug}`}>
        Open Monograph ↗
      </a>
    </div>
  {/if}
</div>
