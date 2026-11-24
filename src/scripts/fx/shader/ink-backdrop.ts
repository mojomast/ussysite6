/**
 * Wave 9 · "Ink in Water" living backdrop.
 *
 * Full-viewport domain-warped fBM + curl-swirl ink field rendered at <=0.5x resolution behind
 * the magazine sheet (z-index: var(--fx-z-backdrop)). Stock-aware colors are read from <html>
 * and re-read whenever data-stock or data-rizz changes.
 *
 * Renderer chain (full tier, fine pointer only):
 *   1. WebGPU: lazy-imported three/webgpu WebGPURenderer + TSL fullscreen plane
 *   2. WebGL2: raw GLSL ES 3.00 fragment shader on a fullscreen triangle (zero Three.js)
 *   3. Fallback: static CSS radial gradients (handled in shader.css; never blank)
 */
import { maxRizz, onVisible, pageVisible } from '../capability';
import { lerpRgb, readStockPalette, type RGB, type StockPalette } from './palette';

interface UniformState {
  time: number;
  aspect: number;
  mouseX: number;
  mouseY: number;
  wakeX: number;
  wakeY: number;
  velX: number;
  velY: number;
  stir: number;
  scrollPos: number;
  scrollVel: number;
  rizz: number;
  isLight: number;
  bg: RGB;
  ink: RGB;
  cyan: RGB;
  gilt: RGB;
}

interface BackdropEngine {
  mode: 'webgpu' | 'webgl2';
  resize(w: number, h: number): void;
  render(u: UniformState): void;
  dispose(): void;
}

const VERT_GLSL = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = 0.5 * (p + 1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FRAG_GLSL = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uWake;
uniform vec2 uVel;
uniform float uStir;
uniform float uScrollPos;
uniform float uScrollVel;
uniform float uRizz;
uniform float uIsLight;
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uCyan;
uniform vec3 uGilt;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.52;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += amp * vnoise(p);
    p = rot * p * 2.04 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

  // Scroll advection + gentle roller smear
  p.y += uScrollPos * 0.16;
  p.y -= uScrollVel * (0.26 + 0.14 * sin(p.x * 3.1 + uTime * 0.4));
  p.x += uScrollVel * 0.06 * cos(p.y * 2.8);

  // Cursor stir: curl vortex + velocity advection + lagging wake ribbon
  vec2 mp = (uMouse - 0.5) * vec2(uAspect, 1.0);
  vec2 dp = p - mp;
  float dist2 = dot(dp, dp);
  float stirInf = exp(-dist2 * 6.8) * uStir;
  vec2 swirl = vec2(-dp.y, dp.x) * (stirInf * mix(0.62, 1.05, uRizz));
  vec2 push = -uVel * (stirInf * mix(0.55, 0.95, uRizz));

  vec2 wp = (uWake - 0.5) * vec2(uAspect, 1.0);
  vec2 dwp = p - wp;
  float wakeInf = exp(-dot(dwp, dwp) * 4.6) * uStir * 0.6;
  vec2 wakeSwirl = vec2(dwp.y, -dwp.x) * (wakeInf * 0.48);

  p += swirl + push + wakeSwirl;

  float t = uTime * mix(0.24, 0.42, uRizz);

  // Two-stage domain-warped fBM (ink diffusing in water)
  vec2 q = vec2(
    fbm(p * 1.55 + vec2(t * 0.34, -t * 0.22)),
    fbm(p * 1.55 + vec2(5.2, 1.3) + vec2(-t * 0.26, t * 0.31))
  );

  vec2 r = vec2(
    fbm(p * 1.95 + 1.55 * q + vec2(1.7, 9.2) + vec2(t * 0.28, t * 0.14)),
    fbm(p * 1.95 + 1.55 * q + vec2(8.3, 2.8) + vec2(-t * 0.18, -t * 0.25))
  );

  float f = fbm(p * 1.85 + 1.65 * r + vec2(0.0, t * 0.16));
  float vein = smoothstep(0.32, 0.84, abs(r.x - r.y) * 1.55 + f * 0.38);

  // Separate pigment channels for proof-ink, neon-cyan, and gilt veins
  float wInk = smoothstep(0.28, 0.84, f * 0.72 + r.x * 0.46) * 0.85;
  float wCyan = smoothstep(0.34, 0.86, q.y * 0.62 + (1.0 - r.y) * 0.48) * 0.78;
  float wGilt = smoothstep(0.62, 0.94, vein * f * 1.38 + (stirInf + wakeInf) * 0.34) * 0.58;

  // Keep central body-copy column slightly calmer so WCAG AA contrast stays rock-solid
  float edgeBoost = mix(0.76, 1.08, smoothstep(0.14, 0.54, length(uv - 0.5)));
  float stirLift = (stirInf + wakeInf * 0.65) * mix(0.16, 0.28, uRizz);
  float scrollLift = min(abs(uScrollVel) * 0.08, 0.08);

  // Blend ink pigments onto the paper stock
  float darkStrength = (mix(0.165, 0.285, uRizz) * edgeBoost) + stirLift + scrollLift;
  float lightStrength = (mix(0.082, 0.145, uRizz) * edgeBoost) + stirLift * 0.48 + scrollLift * 0.4;
  float strength = mix(darkStrength, lightStrength, uIsLight);

  vec3 pigment = uBg;
  pigment = mix(pigment, uInk, clamp(wInk * strength * 1.05, 0.0, 0.42));
  pigment = mix(pigment, uCyan, clamp(wCyan * strength * 0.92, 0.0, 0.36));
  pigment = mix(pigment, uGilt, clamp(wGilt * strength * 0.72, 0.0, 0.28));

  // Subtle dark-water depth trough on dark stocks for richer marbling without brightening text bed
  float trough = smoothstep(0.55, 0.18, f) * (1.0 - uIsLight) * 0.22;
  pigment *= (1.0 - trough);

  // Cursor bloom accent (tight, decaying cyan/vermilion highlight inside the vortex core)
  vec3 stirColor = mix(uCyan, uInk, clamp(r.x, 0.0, 1.0));
  pigment = mix(pigment, stirColor, clamp(stirInf * mix(0.14, 0.24, uRizz) * mix(1.0, 0.55, uIsLight), 0.0, 0.26));

  fragColor = vec4(clamp(pigment, 0.0, 1.0), 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function bootWebGL2(canvas: HTMLCanvasElement, onLost: () => void): BackdropEngine | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power'
  });
  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_GLSL);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_GLSL);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const vao = gl.createVertexArray();
  const loc = {
    time: gl.getUniformLocation(program, 'uTime'),
    aspect: gl.getUniformLocation(program, 'uAspect'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    wake: gl.getUniformLocation(program, 'uWake'),
    vel: gl.getUniformLocation(program, 'uVel'),
    stir: gl.getUniformLocation(program, 'uStir'),
    scrollPos: gl.getUniformLocation(program, 'uScrollPos'),
    scrollVel: gl.getUniformLocation(program, 'uScrollVel'),
    rizz: gl.getUniformLocation(program, 'uRizz'),
    isLight: gl.getUniformLocation(program, 'uIsLight'),
    bg: gl.getUniformLocation(program, 'uBg'),
    ink: gl.getUniformLocation(program, 'uInk'),
    cyan: gl.getUniformLocation(program, 'uCyan'),
    gilt: gl.getUniformLocation(program, 'uGilt')
  };

  const handleLost = (e: Event) => {
    e.preventDefault();
    onLost();
  };
  canvas.addEventListener('webglcontextlost', handleLost);

  return {
    mode: 'webgl2',
    resize(w: number, h: number) {
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    render(u: UniformState) {
      if (gl.isContextLost()) return;
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform1f(loc.time, u.time);
      gl.uniform1f(loc.aspect, u.aspect);
      gl.uniform2f(loc.mouse, u.mouseX, u.mouseY);
      gl.uniform2f(loc.wake, u.wakeX, u.wakeY);
      gl.uniform2f(loc.vel, u.velX, u.velY);
      gl.uniform1f(loc.stir, u.stir);
      gl.uniform1f(loc.scrollPos, u.scrollPos);
      gl.uniform1f(loc.scrollVel, u.scrollVel);
      gl.uniform1f(loc.rizz, u.rizz);
      gl.uniform1f(loc.isLight, u.isLight);
      gl.uniform3f(loc.bg, u.bg[0], u.bg[1], u.bg[2]);
      gl.uniform3f(loc.ink, u.ink[0], u.ink[1], u.ink[2]);
      gl.uniform3f(loc.cyan, u.cyan[0], u.cyan[1], u.cyan[2]);
      gl.uniform3f(loc.gilt, u.gilt[0], u.gilt[1], u.gilt[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', handleLost);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    }
  };
}

async function tryBootWebGPU(canvas: HTMLCanvasElement, isCancelled: () => boolean): Promise<BackdropEngine | null> {
  try {
    const navGpu = (navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu;
    if (!navGpu || typeof navGpu.requestAdapter !== 'function') return null;
    const adapter = await navGpu.requestAdapter();
    if (!adapter || isCancelled()) return null;

    // Lazy dynamic import: Three.js WebGPU + TSL only load in full tier on WebGPU devices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wgpu, tsl]: [any, any] = await Promise.all([import('three/webgpu'), import('three/tsl')]);
    if (isCancelled() || !wgpu?.WebGPURenderer || !wgpu?.MeshBasicNodeMaterial || !tsl?.Fn) return null;

    const renderer = new wgpu.WebGPURenderer({
      canvas,
      antialias: false,
      alpha: false
    });
    await renderer.init();
    if (isCancelled()) {
      renderer.dispose();
      return null;
    }

    const {
      Fn,
      uv,
      vec2,
      vec4,
      float,
      uniform,
      sin,
      cos,
      dot,
      fract,
      floor,
      mix,
      smoothstep,
      clamp,
      length,
      exp,
      abs,
      min,
      sRGBTransferEOTF
    } = tsl;

    const uTime = uniform(0);
    const uAspect = uniform(1.5);
    const uMouse = uniform(new wgpu.Vector2(0.5, 0.5));
    const uWake = uniform(new wgpu.Vector2(0.5, 0.5));
    const uVel = uniform(new wgpu.Vector2(0, 0));
    const uStir = uniform(0);
    const uScrollPos = uniform(0);
    const uScrollVel = uniform(0);
    const uRizz = uniform(0);
    const uIsLight = uniform(0);
    const uBg = uniform(new wgpu.Vector3(0.043, 0.047, 0.055));
    const uInk = uniform(new wgpu.Vector3(1.0, 0.35, 0.235));
    const uCyan = uniform(new wgpu.Vector3(0.133, 0.953, 0.902));
    const uGilt = uniform(new wgpu.Vector3(0.91, 0.765, 0.416));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hash21 = Fn(([pIn]: [any]) => {
      const p = fract(pIn.mul(vec2(123.34, 456.21)));
      const q = p.add(dot(p, p.add(45.32)));
      return fract(q.x.mul(q.y));
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vnoise = Fn(([p]: [any]) => {
      const i = floor(p);
      const f = fract(p);
      const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
      const a = hash21(i);
      const b = hash21(i.add(vec2(1.0, 0.0)));
      const c = hash21(i.add(vec2(0.0, 1.0)));
      const d = hash21(i.add(vec2(1.0, 1.0)));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rotStep = (p: any) =>
      vec2(p.x.mul(0.8).sub(p.y.mul(0.6)), p.x.mul(0.6).add(p.y.mul(0.8)))
        .mul(2.04)
        .add(vec2(1.7, 9.2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbm = Fn(([p0]: [any]) => {
      const p1 = rotStep(p0);
      const p2 = rotStep(p1);
      return vnoise(p0).mul(0.52).add(vnoise(p1).mul(0.26)).add(vnoise(p2).mul(0.13));
    });

    const inkColorNode = Fn(() => {
      const coords = uv();
      const pBase = coords.sub(0.5).mul(vec2(uAspect, 1.0));

      const px0 = pBase.x.add(uScrollVel.mul(0.06).mul(cos(pBase.y.mul(2.8))));
      const py0 = pBase.y
        .add(uScrollPos.mul(0.16))
        .sub(uScrollVel.mul(float(0.26).add(sin(pBase.x.mul(3.1).add(uTime.mul(0.4))).mul(0.14))));
      const pScroll = vec2(px0, py0);

      const mp = uMouse.sub(0.5).mul(vec2(uAspect, 1.0));
      const dp = pScroll.sub(mp);
      const stirInf = exp(dot(dp, dp).mul(-6.8)).mul(uStir);
      const swirl = vec2(dp.y.negate(), dp.x).mul(stirInf.mul(mix(0.62, 1.05, uRizz)));
      const push = uVel.negate().mul(stirInf.mul(mix(0.55, 0.95, uRizz)));

      const wp = uWake.sub(0.5).mul(vec2(uAspect, 1.0));
      const dwp = pScroll.sub(wp);
      const wakeInf = exp(dot(dwp, dwp).mul(-4.6)).mul(uStir).mul(0.6);
      const wakeSwirl = vec2(dwp.y, dwp.x.negate()).mul(wakeInf.mul(0.48));

      const p = pScroll.add(swirl).add(push).add(wakeSwirl);
      const t = uTime.mul(mix(0.24, 0.42, uRizz));

      const q = vec2(
        fbm(p.mul(1.55).add(vec2(t.mul(0.34), t.mul(-0.22)))),
        fbm(p.mul(1.55).add(vec2(5.2, 1.3)).add(vec2(t.mul(-0.26), t.mul(0.31))))
      );

      const r = vec2(
        fbm(p.mul(1.95).add(q.mul(1.55)).add(vec2(1.7, 9.2)).add(vec2(t.mul(0.28), t.mul(0.14)))),
        fbm(p.mul(1.95).add(q.mul(1.55)).add(vec2(8.3, 2.8)).add(vec2(t.mul(-0.18), t.mul(-0.25))))
      );

      const f = fbm(p.mul(1.85).add(r.mul(1.65)).add(vec2(0.0, t.mul(0.16))));
      const vein = smoothstep(0.32, 0.84, abs(r.x.sub(r.y)).mul(1.55).add(f.mul(0.38)));

      const wInk = smoothstep(0.28, 0.84, f.mul(0.72).add(r.x.mul(0.46))).mul(0.85);
      const wCyan = smoothstep(0.34, 0.86, q.y.mul(0.62).add(float(1.0).sub(r.y).mul(0.48))).mul(0.78);
      const wGilt = smoothstep(0.62, 0.94, vein.mul(f).mul(1.38).add(stirInf.add(wakeInf).mul(0.34))).mul(0.58);

      const edgeBoost = mix(0.76, 1.08, smoothstep(0.14, 0.54, length(coords.sub(0.5))));
      const stirLift = stirInf.add(wakeInf.mul(0.65)).mul(mix(0.16, 0.28, uRizz));
      const scrollLift = min(abs(uScrollVel).mul(0.08), 0.08);

      const darkStrength = mix(0.165, 0.285, uRizz).mul(edgeBoost).add(stirLift).add(scrollLift);
      const lightStrength = mix(0.082, 0.145, uRizz).mul(edgeBoost).add(stirLift.mul(0.48)).add(scrollLift.mul(0.4));
      const strength = mix(darkStrength, lightStrength, uIsLight);

      const p1 = mix(uBg, uInk, clamp(wInk.mul(strength).mul(1.05), 0.0, 0.42));
      const p2 = mix(p1, uCyan, clamp(wCyan.mul(strength).mul(0.92), 0.0, 0.36));
      const p3 = mix(p2, uGilt, clamp(wGilt.mul(strength).mul(0.72), 0.0, 0.28));

      const trough = smoothstep(0.55, 0.18, f).mul(float(1.0).sub(uIsLight)).mul(0.22);
      const p4 = p3.mul(float(1.0).sub(trough));

      const stirColor = mix(uCyan, uInk, clamp(r.x, 0.0, 1.0));
      const stirMix = clamp(stirInf.mul(mix(0.14, 0.24, uRizz)).mul(mix(1.0, 0.55, uIsLight)), 0.0, 0.26);
      const srgbFinal = clamp(mix(p4, stirColor, stirMix), 0.0, 1.0);

      // Convert sRGB ink blend to linear so WebGPURenderer's sRGB output encoding matches --bg-canvas exactly
      return vec4(sRGBTransferEOTF(srgbFinal), 1.0);
    });

    const scene = new wgpu.Scene();
    const camera = new wgpu.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new wgpu.PlaneGeometry(2, 2);
    const mat = new wgpu.MeshBasicNodeMaterial();
    mat.colorNode = inkColorNode();
    const quad = new wgpu.Mesh(geo, mat);
    scene.add(quad);

    renderer.setPixelRatio(1);

    return {
      mode: 'webgpu',
      resize(w: number, h: number) {
        // updateStyle = false keeps canvas.style untouched (strict CSP)
        renderer.setSize(w, h, false);
      },
      render(u: UniformState) {
        uTime.value = u.time;
        uAspect.value = u.aspect;
        uMouse.value.set(u.mouseX, u.mouseY);
        uWake.value.set(u.wakeX, u.wakeY);
        uVel.value.set(u.velX, u.velY);
        uStir.value = u.stir;
        uScrollPos.value = u.scrollPos;
        uScrollVel.value = u.scrollVel;
        uRizz.value = u.rizz;
        uIsLight.value = u.isLight;
        uBg.value.set(u.bg[0], u.bg[1], u.bg[2]);
        uInk.value.set(u.ink[0], u.ink[1], u.ink[2]);
        uCyan.value.set(u.cyan[0], u.cyan[1], u.cyan[2]);
        uGilt.value.set(u.gilt[0], u.gilt[1], u.gilt[2]);
        renderer.render(scene, camera);
      },
      dispose() {
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      }
    };
  } catch {
    return null;
  }
}

/**
 * Mount the full-viewport "Ink in Water" backdrop into `host`.
 * Returns a full teardown function (removes canvas, listeners, observers, and html.fx-backdrop-live).
 */
export function mountInkBackdrop(host: HTMLElement): () => void {
  const root = document.documentElement;
  let disposed = false;
  let rafId = 0;
  let engine: BackdropEngine | null = null;

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-backdrop-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  let targetPalette: StockPalette = readStockPalette(root);
  let targetRizz = maxRizz() ? 1 : 0;

  const state: UniformState = {
    time: 0,
    aspect: Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight)),
    mouseX: 0.5,
    mouseY: 0.5,
    wakeX: 0.5,
    wakeY: 0.5,
    velX: 0,
    velY: 0,
    stir: 0,
    scrollPos: window.scrollY / Math.max(1, window.innerHeight),
    scrollVel: 0,
    rizz: targetRizz,
    isLight: targetPalette.isLight ? 1 : 0,
    bg: [...targetPalette.bg],
    ink: [...targetPalette.ink],
    cyan: [...targetPalette.cyan],
    gilt: [...targetPalette.gilt]
  };

  let targetMouseX = 0.5;
  let targetMouseY = 0.5;
  let lastScrollY = window.scrollY;
  let lastActivity = performance.now();
  let lastFrameAt = 0;
  let lastTickAt = performance.now();
  let needsImmediateFrame = true;

  const computeBufferSize = () => {
    const vw = Math.max(320, window.innerWidth);
    const vh = Math.max(240, window.innerHeight);
    // <=0.5x CSS viewport resolution, DPR effectively capped (buffer <= 720x480)
    const scale = Math.min(0.45, 720 / vw, 480 / vh);
    const w = Math.max(160, Math.round(vw * scale));
    const h = Math.max(120, Math.round(vh * scale));
    return { w, h, aspect: vw / vh };
  };

  const syncSize = () => {
    const { w, h, aspect } = computeBufferSize();
    state.aspect = aspect;
    engine?.resize(w, h);
    needsImmediateFrame = true;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const nx = Math.min(1, Math.max(0, e.clientX / Math.max(1, window.innerWidth)));
    const ny = Math.min(1, Math.max(0, 1 - e.clientY / Math.max(1, window.innerHeight)));
    const dx = nx - targetMouseX;
    const dy = ny - targetMouseY;
    const speed = Math.hypot(dx, dy);
    targetMouseX = nx;
    targetMouseY = ny;
    state.velX = Math.max(-1.6, Math.min(1.6, state.velX + dx * 6.5));
    state.velY = Math.max(-1.6, Math.min(1.6, state.velY + dy * 6.5));
    state.stir = Math.min(1.35, state.stir + Math.min(0.55, speed * 9.5 + 0.04));
    lastActivity = performance.now();
  };

  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastScrollY;
    lastScrollY = y;
    const vh = Math.max(1, window.innerHeight);
    state.scrollPos = y / vh;
    state.scrollVel = Math.max(-1.8, Math.min(1.8, state.scrollVel + (dy / vh) * 3.8));
    lastActivity = performance.now();
  };

  const refreshTheme = () => {
    targetPalette = readStockPalette(root);
    targetRizz = maxRizz() ? 1 : 0;
    lastActivity = performance.now();
    needsImmediateFrame = true;
  };

  const mo = new MutationObserver(refreshTheme);
  mo.observe(root, { attributes: true, attributeFilter: ['data-stock', 'data-rizz'] });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', syncSize, { passive: true });

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const tick = (now: number) => {
    if (disposed || !engine) return;
    if (!pageVisible()) {
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(tick);

    const idleMs = now - lastActivity;
    const minInterval = idleMs > 4000 ? 100 : 33.3; // ~10fps when reading, ~30fps when active
    if (!needsImmediateFrame && now - lastFrameAt < minInterval) return;

    const dt = Math.min(0.12, Math.max(0.001, (now - lastTickAt) * 0.001));
    lastTickAt = now;
    lastFrameAt = now;
    needsImmediateFrame = false;

    state.time += dt;

    // Smooth mouse, wake, velocity & stir decay
    const follow = 1 - Math.exp(-dt * 10.5);
    const wakeFollow = 1 - Math.exp(-dt * 3.2);
    state.mouseX += (targetMouseX - state.mouseX) * follow;
    state.mouseY += (targetMouseY - state.mouseY) * follow;
    state.wakeX += (state.mouseX - state.wakeX) * wakeFollow;
    state.wakeY += (state.mouseY - state.wakeY) * wakeFollow;

    const velDecay = Math.exp(-dt * 3.6);
    state.velX *= velDecay;
    state.velY *= velDecay;
    state.stir *= Math.exp(-dt * 1.45);
    state.scrollVel *= Math.exp(-dt * 4.2);

    // Smooth palette & rizz interpolation on stock changes
    const palLerp = 1 - Math.exp(-dt * 7.5);
    lerpRgb(state.bg, state.bg, targetPalette.bg, palLerp);
    lerpRgb(state.ink, state.ink, targetPalette.ink, palLerp);
    lerpRgb(state.cyan, state.cyan, targetPalette.cyan, palLerp);
    lerpRgb(state.gilt, state.gilt, targetPalette.gilt, palLerp);
    state.isLight += ((targetPalette.isLight ? 1 : 0) - state.isLight) * palLerp;
    state.rizz += (targetRizz - state.rizz) * palLerp;

    engine.render(state);
  };

  const startLoop = () => {
    if (disposed || !engine || rafId || !pageVisible()) return;
    lastTickAt = performance.now();
    needsImmediateFrame = true;
    rafId = requestAnimationFrame(tick);
  };

  const unsubVisible = onVisible((vis) => {
    if (vis) startLoop();
    else stopLoop();
  });

  const teardownCanvas = () => {
    stopLoop();
    root.classList.remove('fx-backdrop-live');
    delete root.dataset.fxBackdropMode;
    if (engine) {
      engine.dispose();
      engine = null;
    }
    canvas.remove();
  };

  void (async () => {
    let booted = await tryBootWebGPU(canvas, () => disposed);
    if (disposed) {
      booted?.dispose();
      return;
    }
    if (!booted) {
      // Fresh canvas if WebGPU touched the first one's context
      const glCanvas = document.createElement('canvas');
      glCanvas.className = 'fx-backdrop-canvas';
      glCanvas.setAttribute('aria-hidden', 'true');
      canvas.replaceWith(glCanvas);
      booted = bootWebGL2(glCanvas, () => {
        if (!disposed) {
          stopLoop();
          root.classList.remove('fx-backdrop-live');
          delete root.dataset.fxBackdropMode;
        }
      });
      if (!booted) {
        glCanvas.remove();
        return;
      }
      // Keep disposal removing the active canvas
      const origDispose = booted.dispose;
      booted.dispose = () => {
        origDispose();
        glCanvas.remove();
      };
    }

    if (disposed) {
      booted.dispose();
      return;
    }

    engine = booted;
    syncSize();
    engine.render(state);
    root.dataset.fxBackdropMode = engine.mode;
    root.classList.add('fx-backdrop-live');
    startLoop();
  })();

  return () => {
    disposed = true;
    unsubVisible();
    mo.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', syncSize);
    teardownCanvas();
  };
}
