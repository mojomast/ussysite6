const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/three.webgpu.Cc8j_XQP.js","_astro/three.core.DFHh0sxs.js","_astro/three.tsl.jxdvpX3c.js"])))=>i.map(i=>d[i]);
import{a as e,n as t,o as n}from"./BaseLayout.astro_astro_type_script_index_0_lang.B8WUE8ZC.js";import{t as r}from"./preload-helper.DtxhVGr_.js";var i={bg:[11/255,12/255,14/255],ink:[1,90/255,60/255],cyan:[34/255,243/255,230/255],gilt:[232/255,195/255,106/255],isLight:!1,stock:`graphite`};function a(e,t=i.bg){let n=(e||``).trim();if(!n)return[...t];if(n.startsWith(`#`)){let e=n.slice(1);if(e.length===3){let t=parseInt(e[0]+e[0],16),n=parseInt(e[1]+e[1],16),r=parseInt(e[2]+e[2],16);if(!Number.isNaN(t)&&!Number.isNaN(n)&&!Number.isNaN(r))return[t/255,n/255,r/255]}else if(e.length===6||e.length===8){let t=parseInt(e.slice(0,2),16),n=parseInt(e.slice(2,4),16),r=parseInt(e.slice(4,6),16);if(!Number.isNaN(t)&&!Number.isNaN(n)&&!Number.isNaN(r))return[t/255,n/255,r/255]}return[...t]}let r=n.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);if(r){let e=Math.min(255,Math.max(0,Number(r[1]))),t=Math.min(255,Math.max(0,Number(r[2]))),n=Math.min(255,Math.max(0,Number(r[3])));if(!Number.isNaN(e)&&!Number.isNaN(t)&&!Number.isNaN(n))return[e/255,t/255,n/255]}return[...t]}function o([e,t,n]){let r=e=>e<=.03928?e/12.92:((e+.055)/1.055)**2.4;return .2126*r(e)+.7152*r(t)+.0722*r(n)}function s(e,t,n,r){e[0]=t[0]+(n[0]-t[0])*r,e[1]=t[1]+(n[1]-t[1])*r,e[2]=t[2]+(n[2]-t[2])*r}function c(e=typeof document<`u`?document.documentElement:null){if(!e||typeof window>`u`||typeof window.getComputedStyle!=`function`)return{bg:[...i.bg],ink:[...i.ink],cyan:[...i.cyan],gilt:[...i.gilt],isLight:i.isLight,stock:i.stock};let t=window.getComputedStyle(e),n=a(t.getPropertyValue(`--bg-canvas`),i.bg),r=a(t.getPropertyValue(`--proof-ink`),i.ink),s=a(t.getPropertyValue(`--neon-cyan`),i.cyan),c=a(t.getPropertyValue(`--gilt`),i.gilt),l=e.getAttribute(`data-stock`)||`graphite`;return{bg:n,ink:r,cyan:s,gilt:c,isLight:o(n)>.45,stock:l}}var l=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = 0.5 * (p + 1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`,u=`#version 300 es
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
`;function d(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function f(e,t){let n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:`low-power`});if(!n)return null;let r=d(n,n.VERTEX_SHADER,l),i=d(n,n.FRAGMENT_SHADER,u);if(!r||!i)return r&&n.deleteShader(r),i&&n.deleteShader(i),null;let a=n.createProgram();if(!a)return n.deleteShader(r),n.deleteShader(i),null;if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),n.deleteShader(r),n.deleteShader(i),!n.getProgramParameter(a,n.LINK_STATUS))return n.deleteProgram(a),null;let o=n.createVertexArray(),s={time:n.getUniformLocation(a,`uTime`),aspect:n.getUniformLocation(a,`uAspect`),mouse:n.getUniformLocation(a,`uMouse`),wake:n.getUniformLocation(a,`uWake`),vel:n.getUniformLocation(a,`uVel`),stir:n.getUniformLocation(a,`uStir`),scrollPos:n.getUniformLocation(a,`uScrollPos`),scrollVel:n.getUniformLocation(a,`uScrollVel`),rizz:n.getUniformLocation(a,`uRizz`),isLight:n.getUniformLocation(a,`uIsLight`),bg:n.getUniformLocation(a,`uBg`),ink:n.getUniformLocation(a,`uInk`),cyan:n.getUniformLocation(a,`uCyan`),gilt:n.getUniformLocation(a,`uGilt`)},c=e=>{e.preventDefault(),t()};return e.addEventListener(`webglcontextlost`,c),{mode:`webgl2`,resize(t,r){e.width!==t&&(e.width=t),e.height!==r&&(e.height=r),n.viewport(0,0,t,r)},render(e){n.isContextLost()||(n.useProgram(a),n.bindVertexArray(o),n.uniform1f(s.time,e.time),n.uniform1f(s.aspect,e.aspect),n.uniform2f(s.mouse,e.mouseX,e.mouseY),n.uniform2f(s.wake,e.wakeX,e.wakeY),n.uniform2f(s.vel,e.velX,e.velY),n.uniform1f(s.stir,e.stir),n.uniform1f(s.scrollPos,e.scrollPos),n.uniform1f(s.scrollVel,e.scrollVel),n.uniform1f(s.rizz,e.rizz),n.uniform1f(s.isLight,e.isLight),n.uniform3f(s.bg,e.bg[0],e.bg[1],e.bg[2]),n.uniform3f(s.ink,e.ink[0],e.ink[1],e.ink[2]),n.uniform3f(s.cyan,e.cyan[0],e.cyan[1],e.cyan[2]),n.uniform3f(s.gilt,e.gilt[0],e.gilt[1],e.gilt[2]),n.drawArrays(n.TRIANGLES,0,3))},dispose(){e.removeEventListener(`webglcontextlost`,c),n.deleteVertexArray(o),n.deleteProgram(a)}}}async function p(e,t){try{let n=navigator.gpu;if(!n||typeof n.requestAdapter!=`function`||!await n.requestAdapter()||t())return null;let[i,a]=await Promise.all([r(()=>import(`./three.webgpu.Cc8j_XQP.js`),__vite__mapDeps([0,1,2])),r(()=>import(`./three.tsl.jxdvpX3c.js`),__vite__mapDeps([2,1]))]);if(t()||!i?.WebGPURenderer||!i?.MeshBasicNodeMaterial||!a?.Fn)return null;let o=new i.WebGPURenderer({canvas:e,antialias:!1,alpha:!1});if(await o.init(),t())return o.dispose(),null;let{Fn:s,uv:c,vec2:l,vec4:u,float:d,uniform:f,sin:p,cos:m,dot:h,fract:g,floor:_,mix:v,smoothstep:y,clamp:b,length:x,exp:S,abs:C,min:w,sRGBTransferEOTF:T}=a,E=f(0),D=f(1.5),O=f(new i.Vector2(.5,.5)),k=f(new i.Vector2(.5,.5)),A=f(new i.Vector2(0,0)),j=f(0),M=f(0),N=f(0),P=f(0),F=f(0),I=f(new i.Vector3(.043,.047,.055)),L=f(new i.Vector3(1,.35,.235)),R=f(new i.Vector3(.133,.953,.902)),z=f(new i.Vector3(.91,.765,.416)),B=s(([e])=>{let t=g(e.mul(l(123.34,456.21))),n=t.add(h(t,t.add(45.32)));return g(n.x.mul(n.y))}),V=s(([e])=>{let t=_(e),n=g(e),r=n.mul(n).mul(d(3).sub(n.mul(2))),i=B(t),a=B(t.add(l(1,0))),o=B(t.add(l(0,1))),s=B(t.add(l(1,1)));return v(v(i,a,r.x),v(o,s,r.x),r.y)}),H=e=>l(e.x.mul(.8).sub(e.y.mul(.6)),e.x.mul(.6).add(e.y.mul(.8))).mul(2.04).add(l(1.7,9.2)),U=s(([e])=>{let t=H(e),n=H(t);return V(e).mul(.52).add(V(t).mul(.26)).add(V(n).mul(.13))}),W=s(()=>{let e=c(),t=e.sub(.5).mul(l(D,1)),n=t.x.add(N.mul(.06).mul(m(t.y.mul(2.8)))),r=t.y.add(M.mul(.16)).sub(N.mul(d(.26).add(p(t.x.mul(3.1).add(E.mul(.4))).mul(.14)))),i=l(n,r),a=O.sub(.5).mul(l(D,1)),o=i.sub(a),s=S(h(o,o).mul(-6.8)).mul(j),f=l(o.y.negate(),o.x).mul(s.mul(v(.62,1.05,P))),g=A.negate().mul(s.mul(v(.55,.95,P))),_=k.sub(.5).mul(l(D,1)),B=i.sub(_),V=S(h(B,B).mul(-4.6)).mul(j).mul(.6),H=l(B.y,B.x.negate()).mul(V.mul(.48)),W=i.add(f).add(g).add(H),G=E.mul(v(.24,.42,P)),K=l(U(W.mul(1.55).add(l(G.mul(.34),G.mul(-.22)))),U(W.mul(1.55).add(l(5.2,1.3)).add(l(G.mul(-.26),G.mul(.31))))),q=l(U(W.mul(1.95).add(K.mul(1.55)).add(l(1.7,9.2)).add(l(G.mul(.28),G.mul(.14)))),U(W.mul(1.95).add(K.mul(1.55)).add(l(8.3,2.8)).add(l(G.mul(-.18),G.mul(-.25))))),J=U(W.mul(1.85).add(q.mul(1.65)).add(l(0,G.mul(.16)))),Y=y(.32,.84,C(q.x.sub(q.y)).mul(1.55).add(J.mul(.38))),ee=y(.28,.84,J.mul(.72).add(q.x.mul(.46))).mul(.85),te=y(.34,.86,K.y.mul(.62).add(d(1).sub(q.y).mul(.48))).mul(.78),ne=y(.62,.94,Y.mul(J).mul(1.38).add(s.add(V).mul(.34))).mul(.58),X=v(.76,1.08,y(.14,.54,x(e.sub(.5)))),Z=s.add(V.mul(.65)).mul(v(.16,.28,P)),Q=w(C(N).mul(.08),.08),re=v(.165,.285,P).mul(X).add(Z).add(Q),ie=v(.082,.145,P).mul(X).add(Z.mul(.48)).add(Q.mul(.4)),$=v(re,ie,F),ae=v(I,L,b(ee.mul($).mul(1.05),0,.42)),oe=v(ae,R,b(te.mul($).mul(.92),0,.36)),se=v(oe,z,b(ne.mul($).mul(.72),0,.28)),ce=y(.55,.18,J).mul(d(1).sub(F)).mul(.22),le=se.mul(d(1).sub(ce)),ue=v(R,L,b(q.x,0,1)),de=b(s.mul(v(.14,.24,P)).mul(v(1,.55,F)),0,.26),fe=b(v(le,ue,de),0,1);return u(T(fe),1)}),G=new i.Scene,K=new i.OrthographicCamera(-1,1,1,-1,0,1),q=new i.PlaneGeometry(2,2),J=new i.MeshBasicNodeMaterial;J.colorNode=W();let Y=new i.Mesh(q,J);return G.add(Y),o.setPixelRatio(1),{mode:`webgpu`,resize(e,t){o.setSize(e,t,!1)},render(e){E.value=e.time,D.value=e.aspect,O.value.set(e.mouseX,e.mouseY),k.value.set(e.wakeX,e.wakeY),A.value.set(e.velX,e.velY),j.value=e.stir,M.value=e.scrollPos,N.value=e.scrollVel,P.value=e.rizz,F.value=e.isLight,I.value.set(e.bg[0],e.bg[1],e.bg[2]),L.value.set(e.ink[0],e.ink[1],e.ink[2]),R.value.set(e.cyan[0],e.cyan[1],e.cyan[2]),z.value.set(e.gilt[0],e.gilt[1],e.gilt[2]),o.render(G,K)},dispose(){q.dispose(),J.dispose(),o.dispose()}}}catch{return null}}function m(r){let i=document.documentElement,a=!1,o=0,l=null,u=document.createElement(`canvas`);u.className=`fx-backdrop-canvas`,u.setAttribute(`aria-hidden`,`true`),r.appendChild(u);let d=c(i),m=+!!t(),h={time:0,aspect:Math.max(.5,window.innerWidth/Math.max(1,window.innerHeight)),mouseX:.5,mouseY:.5,wakeX:.5,wakeY:.5,velX:0,velY:0,stir:0,scrollPos:window.scrollY/Math.max(1,window.innerHeight),scrollVel:0,rizz:m,isLight:+!!d.isLight,bg:[...d.bg],ink:[...d.ink],cyan:[...d.cyan],gilt:[...d.gilt]},g=.5,_=.5,v=window.scrollY,y=performance.now(),b=0,x=performance.now(),S=!0,C=()=>{let e=Math.max(320,window.innerWidth),t=Math.max(240,window.innerHeight),n=Math.min(.45,720/e,480/t);return{w:Math.max(160,Math.round(e*n)),h:Math.max(120,Math.round(t*n)),aspect:e/t}},w=()=>{let{w:e,h:t,aspect:n}=C();h.aspect=n,l?.resize(e,t),S=!0},T=e=>{if(e.pointerType===`touch`)return;let t=Math.min(1,Math.max(0,e.clientX/Math.max(1,window.innerWidth))),n=Math.min(1,Math.max(0,1-e.clientY/Math.max(1,window.innerHeight))),r=t-g,i=n-_,a=Math.hypot(r,i);g=t,_=n,h.velX=Math.max(-1.6,Math.min(1.6,h.velX+r*6.5)),h.velY=Math.max(-1.6,Math.min(1.6,h.velY+i*6.5)),h.stir=Math.min(1.35,h.stir+Math.min(.55,a*9.5+.04)),y=performance.now()},E=()=>{let e=window.scrollY,t=e-v;v=e;let n=Math.max(1,window.innerHeight);h.scrollPos=e/n,h.scrollVel=Math.max(-1.8,Math.min(1.8,h.scrollVel+t/n*3.8)),y=performance.now()},D=new MutationObserver(()=>{d=c(i),m=+!!t(),y=performance.now(),S=!0});D.observe(i,{attributes:!0,attributeFilter:[`data-stock`,`data-rizz`]}),window.addEventListener(`pointermove`,T,{passive:!0}),window.addEventListener(`scroll`,E,{passive:!0}),window.addEventListener(`resize`,w,{passive:!0});let O=()=>{o&&=(cancelAnimationFrame(o),0)},k=e=>{if(a||!l)return;if(!n()){o=0;return}o=requestAnimationFrame(k);let t=e-y>4e3?100:33.3;if(!S&&e-b<t)return;let r=Math.min(.12,Math.max(.001,(e-x)*.001));x=e,b=e,S=!1,h.time+=r;let i=1-Math.exp(-r*10.5),c=1-Math.exp(-r*3.2);h.mouseX+=(g-h.mouseX)*i,h.mouseY+=(_-h.mouseY)*i,h.wakeX+=(h.mouseX-h.wakeX)*c,h.wakeY+=(h.mouseY-h.wakeY)*c;let u=Math.exp(-r*3.6);h.velX*=u,h.velY*=u,h.stir*=Math.exp(-r*1.45),h.scrollVel*=Math.exp(-r*4.2);let f=1-Math.exp(-r*7.5);s(h.bg,h.bg,d.bg,f),s(h.ink,h.ink,d.ink,f),s(h.cyan,h.cyan,d.cyan,f),s(h.gilt,h.gilt,d.gilt,f),h.isLight+=(+!!d.isLight-h.isLight)*f,h.rizz+=(m-h.rizz)*f,l.render(h)},A=()=>{!a&&l&&!o&&n()&&(x=performance.now(),S=!0,o=requestAnimationFrame(k))},j=e(e=>{e?A():O()}),M=()=>{O(),i.classList.remove(`fx-backdrop-live`),delete i.dataset.fxBackdropMode,l&&=(l.dispose(),null),u.remove()};return(async()=>{let e=await p(u,()=>a);if(a)e?.dispose();else{if(!e){let t=document.createElement(`canvas`);if(t.className=`fx-backdrop-canvas`,t.setAttribute(`aria-hidden`,`true`),u.replaceWith(t),e=f(t,()=>{a||(O(),i.classList.remove(`fx-backdrop-live`),delete i.dataset.fxBackdropMode)}),!e){t.remove();return}let n=e.dispose;e.dispose=()=>{n(),t.remove()}}a?e.dispose():(l=e,w(),l.render(h),i.dataset.fxBackdropMode=l.mode,i.classList.add(`fx-backdrop-live`),A())}})(),()=>{a=!0,j(),D.disconnect(),window.removeEventListener(`pointermove`,T),window.removeEventListener(`scroll`,E),window.removeEventListener(`resize`,w),M()}}export{m as mountInkBackdrop};