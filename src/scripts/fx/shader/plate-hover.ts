/**
 * Wave 9 · Stretch: WebGL2 liquid ripple + RGB-shift hover displacement on raster article plates.
 *
 * Full tier, fine pointer only. Zero WebGL contexts or canvases exist until a reader actually
 * hovers a raster plate (.plate-art-box > img, .issue-card-art > img). One shared WebGL2 canvas
 * is lazily created on first hover, overlaid only while active, and detached once the ripple
 * settles. If WebGL2 or texture upload fails, the plain <img> remains untouched.
 */
import { maxRizz, onVisible, pageVisible } from '../capability';

const PLATE_IMG_SELECTOR = '.plate-art-box > img, .issue-card-art > img';

const PLATE_VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = 0.5 * (p + 1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const PLATE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;
uniform vec2 uUvScale;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uAspect;
uniform float uTime;
uniform float uEnergy;
uniform float uRizz;

void main() {
  vec2 d = (vUv - uMouse) * vec2(uAspect, 1.0);
  float dist = length(d);
  vec2 dir = dist > 0.0005 ? d / dist : vec2(0.0);

  // Concentric liquid ripple + velocity-driven fluid wake
  float ring = sin(dist * 34.0 - uTime * 9.5) * exp(-dist * 4.8);
  float bell = exp(-dist * dist * 13.0);
  float amp = uEnergy * mix(0.013, 0.024, uRizz);

  vec2 disp = dir * (ring * amp) - uVel * (bell * amp * 2.2);

  // Chromatic RGB split centered on the cursor wake
  float ca = uEnergy * mix(0.0045, 0.011, uRizz) * (0.35 + bell * 1.45 + abs(ring) * 0.9);
  vec2 caDir = normalize(dir + uVel * 2.5 + vec2(0.0001));

  vec2 baseUv = (vUv - 0.5) * uUvScale + 0.5;
  vec2 uvR = baseUv + disp + caDir * ca;
  vec2 uvG = baseUv + disp;
  vec2 uvB = baseUv + disp - caDir * ca;

  // Clip cleanly outside contained image bounds
  if (baseUv.x < 0.0 || baseUv.x > 1.0 || baseUv.y < 0.0 || baseUv.y > 1.0) {
    fragColor = vec4(0.0);
    return;
  }

  float r = texture(uTex, clamp(uvR, 0.001, 0.999)).r;
  float g = texture(uTex, clamp(uvG, 0.001, 0.999)).g;
  float b = texture(uTex, clamp(uvB, 0.001, 0.999)).b;

  // Subtle specular wet-ink sheen along the ripple crest
  float sheen = max(0.0, ring) * uEnergy * mix(0.08, 0.16, uRizz);
  vec3 col = vec3(r, g, b) + vec3(0.16, 0.95, 0.90) * sheen;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

interface PlateGL {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject | null;
  tex: WebGLTexture;
  loc: {
    tex: WebGLUniformLocation | null;
    uvScale: WebGLUniformLocation | null;
    mouse: WebGLUniformLocation | null;
    vel: WebGLUniformLocation | null;
    aspect: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    energy: WebGLUniformLocation | null;
    rizz: WebGLUniformLocation | null;
  };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function createPlateGL(): PlateGL | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-plate-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power'
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, PLATE_VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, PLATE_FRAG);
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

  const tex = gl.createTexture();
  if (!tex) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    canvas,
    gl,
    program,
    vao: gl.createVertexArray(),
    tex,
    loc: {
      tex: gl.getUniformLocation(program, 'uTex'),
      uvScale: gl.getUniformLocation(program, 'uUvScale'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      vel: gl.getUniformLocation(program, 'uVel'),
      aspect: gl.getUniformLocation(program, 'uAspect'),
      time: gl.getUniformLocation(program, 'uTime'),
      energy: gl.getUniformLocation(program, 'uEnergy'),
      rizz: gl.getUniformLocation(program, 'uRizz')
    }
  };
}

export function mountPlateHover(): () => void {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(PLATE_IMG_SELECTOR));
  if (imgs.length === 0) return () => {};

  let disposed = false;
  let glFailed = false;
  let ctx: PlateGL | null = null;
  let activeImg: HTMLImageElement | null = null;
  let activeHost: HTMLElement | null = null;
  let hovering = false;
  let rafId = 0;

  let mx = 0.5;
  let my = 0.5;
  let targetMx = 0.5;
  let targetMy = 0.5;
  let vx = 0;
  let vy = 0;
  let energy = 0;
  let aspect = 4 / 3;
  let uvScaleX = 1;
  let uvScaleY = 1;
  let t0 = performance.now();
  let lastAt = t0;

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const detachCanvas = () => {
    stopLoop();
    if (ctx) {
      ctx.canvas.classList.remove('is-active');
      ctx.canvas.remove();
    }
    activeImg = null;
    activeHost = null;
    hovering = false;
    energy = 0;
  };

  const ensureGL = (): PlateGL | null => {
    if (glFailed || disposed) return null;
    if (ctx && !ctx.gl.isContextLost()) return ctx;
    ctx = createPlateGL();
    if (!ctx) {
      glFailed = true;
      return null;
    }
    ctx.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      detachCanvas();
      glFailed = true;
    });
    return ctx;
  };

  const uploadPlate = (img: HTMLImageElement, host: HTMLElement): boolean => {
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return false;
    const pgl = ensureGL();
    if (!pgl) return false;

    const rect = host.getBoundingClientRect();
    if (rect.width < 32 || rect.height < 32) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(64, Math.min(960, Math.round(rect.width * dpr * 0.75)));
    const h = Math.max(48, Math.min(720, Math.round(rect.height * dpr * 0.75)));
    if (pgl.canvas.width !== w) pgl.canvas.width = w;
    if (pgl.canvas.height !== h) pgl.canvas.height = h;

    aspect = rect.width / Math.max(1, rect.height);
    const imgAspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const isCover = host.classList.contains('issue-card-art');

    if (isCover) {
      if (imgAspect > aspect) {
        uvScaleX = aspect / imgAspect;
        uvScaleY = 1;
      } else {
        uvScaleX = 1;
        uvScaleY = imgAspect / aspect;
      }
    } else {
      if (imgAspect > aspect) {
        uvScaleX = 1;
        uvScaleY = imgAspect / aspect;
      } else {
        uvScaleX = aspect / imgAspect;
        uvScaleY = 1;
      }
    }

    const { gl } = pgl;
    try {
      gl.bindTexture(gl.TEXTURE_2D, pgl.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    } catch {
      return false;
    }

    if (pgl.canvas.parentElement !== host) {
      host.appendChild(pgl.canvas);
    }
    pgl.canvas.classList.add('is-active');
    activeImg = img;
    activeHost = host;
    return true;
  };

  const renderFrame = (now: number) => {
    if (disposed || !ctx || !activeHost || !pageVisible()) {
      rafId = 0;
      return;
    }

    const dt = Math.min(0.06, Math.max(0.001, (now - lastAt) * 0.001));
    lastAt = now;

    const follow = 1 - Math.exp(-dt * 16);
    mx += (targetMx - mx) * follow;
    my += (targetMy - my) * follow;

    const decay = Math.exp(-dt * 5.2);
    vx *= decay;
    vy *= decay;

    if (hovering) {
      energy = Math.max(0.28, energy * Math.exp(-dt * 2.1));
    } else {
      energy *= Math.exp(-dt * 6.5);
    }

    const { gl, program, vao, loc, canvas } = ctx;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ctx.tex);
    gl.uniform1i(loc.tex, 0);
    gl.uniform2f(loc.uvScale, uvScaleX, uvScaleY);
    gl.uniform2f(loc.mouse, mx, my);
    gl.uniform2f(loc.vel, vx, vy);
    gl.uniform1f(loc.aspect, aspect);
    gl.uniform1f(loc.time, (now - t0) * 0.001);
    gl.uniform1f(loc.energy, energy);
    gl.uniform1f(loc.rizz, maxRizz() ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!hovering && energy < 0.015) {
      detachCanvas();
      return;
    }

    rafId = requestAnimationFrame(renderFrame);
  };

  const startLoop = () => {
    if (rafId || disposed || !pageVisible()) return;
    lastAt = performance.now();
    rafId = requestAnimationFrame(renderFrame);
  };

  const cleanups: Array<() => void> = [];

  for (const img of imgs) {
    const host = img.parentElement;
    if (!host) continue;

    const updatePointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
      const ny = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
      const dx = nx - targetMx;
      const dy = ny - targetMy;
      targetMx = nx;
      targetMy = ny;
      vx = Math.max(-1.2, Math.min(1.2, vx + dx * 6.0));
      vy = Math.max(-1.2, Math.min(1.2, vy + dy * 6.0));
      energy = Math.min(1.35, energy + Math.min(0.45, Math.hypot(dx, dy) * 7.5 + 0.06));
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || disposed || glFailed) return;
      const rect = host.getBoundingClientRect();
      targetMx = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
      targetMy = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
      mx = targetMx;
      my = targetMy;
      vx = 0;
      vy = 0;
      energy = 0.72;
      if (activeImg !== img) {
        if (!uploadPlate(img, host)) return;
      } else if (ctx) {
        ctx.canvas.classList.add('is-active');
      }
      hovering = true;
      startLoop();
    };

    const onMove = (e: PointerEvent) => {
      if (!hovering || activeImg !== img || e.pointerType === 'touch') return;
      updatePointer(e);
    };

    const onLeave = () => {
      if (activeImg !== img) return;
      hovering = false;
      ctx?.canvas.classList.remove('is-active');
    };

    host.addEventListener('pointerenter', onEnter, { passive: true });
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    cleanups.push(() => {
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    });
  }

  const unsubVis = onVisible((vis) => {
    if (!vis) detachCanvas();
  });

  return () => {
    disposed = true;
    unsubVis();
    for (const fn of cleanups) fn();
    detachCanvas();
    if (ctx) {
      ctx.gl.deleteTexture(ctx.tex);
      ctx.gl.deleteVertexArray(ctx.vao);
      ctx.gl.deleteProgram(ctx.program);
      ctx = null;
    }
  };
}
