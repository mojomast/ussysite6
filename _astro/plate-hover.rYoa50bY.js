import{a as e,n as t,o as n}from"./BaseLayout.astro_astro_type_script_index_0_lang.B8WUE8ZC.js";var r=`.plate-art-box > img, .issue-card-art > img`,i=`#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = 0.5 * (p + 1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`,a=`#version 300 es
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
`;function o(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function s(){let e=document.createElement(`canvas`);e.className=`fx-plate-canvas`,e.setAttribute(`aria-hidden`,`true`);let t=e.getContext(`webgl2`,{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,powerPreference:`low-power`});if(!t)return null;let n=o(t,t.VERTEX_SHADER,i),r=o(t,t.FRAGMENT_SHADER,a);if(!n||!r)return n&&t.deleteShader(n),r&&t.deleteShader(r),null;let s=t.createProgram();if(!s)return t.deleteShader(n),t.deleteShader(r),null;if(t.attachShader(s,n),t.attachShader(s,r),t.linkProgram(s),t.deleteShader(n),t.deleteShader(r),!t.getProgramParameter(s,t.LINK_STATUS))return t.deleteProgram(s),null;let c=t.createTexture();return c?(t.bindTexture(t.TEXTURE_2D,c),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),{canvas:e,gl:t,program:s,vao:t.createVertexArray(),tex:c,loc:{tex:t.getUniformLocation(s,`uTex`),uvScale:t.getUniformLocation(s,`uUvScale`),mouse:t.getUniformLocation(s,`uMouse`),vel:t.getUniformLocation(s,`uVel`),aspect:t.getUniformLocation(s,`uAspect`),time:t.getUniformLocation(s,`uTime`),energy:t.getUniformLocation(s,`uEnergy`),rizz:t.getUniformLocation(s,`uRizz`)}}):(t.deleteProgram(s),null)}function c(){let i=Array.from(document.querySelectorAll(r));if(i.length===0)return()=>{};let a=!1,o=!1,c=null,l=null,u=null,d=!1,f=0,p=.5,m=.5,h=.5,g=.5,_=0,v=0,y=0,b=4/3,x=1,S=1,C=performance.now(),w=C,T=()=>{f&&=(cancelAnimationFrame(f),0)},E=()=>{T(),c&&(c.canvas.classList.remove(`is-active`),c.canvas.remove()),l=null,u=null,d=!1,y=0},D=()=>o||a?null:c&&!c.gl.isContextLost()?c:(c=s(),c?(c.canvas.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),E(),o=!0}),c):(o=!0,null)),O=(e,t)=>{if(!e.complete||e.naturalWidth===0||e.naturalHeight===0)return!1;let n=D();if(!n)return!1;let r=t.getBoundingClientRect();if(r.width<32||r.height<32)return!1;let i=Math.min(window.devicePixelRatio||1,1.5),a=Math.max(64,Math.min(960,Math.round(r.width*i*.75))),o=Math.max(48,Math.min(720,Math.round(r.height*i*.75)));n.canvas.width!==a&&(n.canvas.width=a),n.canvas.height!==o&&(n.canvas.height=o),b=r.width/Math.max(1,r.height);let s=e.naturalWidth/Math.max(1,e.naturalHeight);t.classList.contains(`issue-card-art`)?s>b?(x=b/s,S=1):(x=1,S=s/b):s>b?(x=1,S=s/b):(x=b/s,S=1);let{gl:c}=n;try{c.bindTexture(c.TEXTURE_2D,n.tex),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,1),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,e)}catch{return!1}return n.canvas.parentElement!==t&&t.appendChild(n.canvas),n.canvas.classList.add(`is-active`),l=e,u=t,!0},k=e=>{if(a||!c||!u||!n()){f=0;return}let r=Math.min(.06,Math.max(.001,(e-w)*.001));w=e;let i=1-Math.exp(-r*16);p+=(h-p)*i,m+=(g-m)*i;let o=Math.exp(-r*5.2);_*=o,v*=o,d?y=Math.max(.28,y*Math.exp(-r*2.1)):y*=Math.exp(-r*6.5);let{gl:s,program:l,vao:T,loc:D,canvas:O}=c;s.viewport(0,0,O.width,O.height),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.useProgram(l),s.bindVertexArray(T),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,c.tex),s.uniform1i(D.tex,0),s.uniform2f(D.uvScale,x,S),s.uniform2f(D.mouse,p,m),s.uniform2f(D.vel,_,v),s.uniform1f(D.aspect,b),s.uniform1f(D.time,(e-C)*.001),s.uniform1f(D.energy,y),s.uniform1f(D.rizz,+!!t()),s.drawArrays(s.TRIANGLES,0,3),!d&&y<.015?E():f=requestAnimationFrame(k)},A=()=>{f||a||!n()||(w=performance.now(),f=requestAnimationFrame(k))},j=[];for(let e of i){let t=e.parentElement;if(!t)continue;let n=e=>{let n=t.getBoundingClientRect(),r=Math.min(1,Math.max(0,(e.clientX-n.left)/Math.max(1,n.width))),i=Math.min(1,Math.max(0,1-(e.clientY-n.top)/Math.max(1,n.height))),a=r-h,o=i-g;h=r,g=i,_=Math.max(-1.2,Math.min(1.2,_+a*6)),v=Math.max(-1.2,Math.min(1.2,v+o*6)),y=Math.min(1.35,y+Math.min(.45,Math.hypot(a,o)*7.5+.06))},r=n=>{if(n.pointerType===`touch`||a||o)return;let r=t.getBoundingClientRect();if(h=Math.min(1,Math.max(0,(n.clientX-r.left)/Math.max(1,r.width))),g=Math.min(1,Math.max(0,1-(n.clientY-r.top)/Math.max(1,r.height))),p=h,m=g,_=0,v=0,y=.72,l!==e){if(!O(e,t))return}else c&&c.canvas.classList.add(`is-active`);d=!0,A()},i=t=>{d&&l===e&&t.pointerType!==`touch`&&n(t)},s=()=>{l===e&&(d=!1,c?.canvas.classList.remove(`is-active`))};t.addEventListener(`pointerenter`,r,{passive:!0}),t.addEventListener(`pointermove`,i,{passive:!0}),t.addEventListener(`pointerleave`,s,{passive:!0}),j.push(()=>{t.removeEventListener(`pointerenter`,r),t.removeEventListener(`pointermove`,i),t.removeEventListener(`pointerleave`,s)})}let M=e(e=>{e||E()});return()=>{a=!0,M();for(let e of j)e();E(),c&&=(c.gl.deleteTexture(c.tex),c.gl.deleteVertexArray(c.vao),c.gl.deleteProgram(c.program),null)}}export{c as mountPlateHover};