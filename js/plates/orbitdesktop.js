/** OrbitDesktop: physical pane placement as an optical-bench editorial metaphor. */
import { scope, svgRoot, bleedRect, linGrad, label } from '../svg-kit.js';
import { materials, screw, scratches, knob } from './workspace-materials.js';

export default function orbitdesktopPlate(proj) {
  const id = scope('pl-orbit');
  const defs = materials(id) + `
    ${linGrad(id('pane'), [[0,'#b4d6d3',.8],[.2,'#507b83',.78],[.7,'#14333d',.94],[1,'#59929a',.85]], {x2:1,y2:1})}
    <clipPath id="${id('aperture')}"><circle cx="398" cy="259" r="170"/></clipPath>`;
  const pane = (transform, w, h, name, warm = false) => `<g transform="${transform}">
    <rect x="5" y="9" width="${w}" height="${h}" rx="7" fill="#020d14" opacity=".7" filter="${id.url('contact')}"/>
    <rect x="1" y="3" width="${w}" height="${h}" rx="5" fill="${id.url('metal')}"/>
    <rect width="${w}" height="${h}" rx="5" fill="${id.url('edge')}"/>
    <rect x="3" y="3" width="${w-6}" height="${h-6}" rx="3" fill="${id.url('pane')}"/>
    <rect x="5" y="5" width="${w-10}" height="${h-10}" rx="3" fill="${id.url('reflection')}"/>
    <path d="M5 22H${w-5}" stroke="#cae4dc" stroke-opacity=".3" stroke-width=".6"/>
    ${label(12,16,name,{size:7,fill:'#e2eadb',ls:.05})}
    ${Array.from({length:7},(_,i)=>`<path d="M13 ${37+i*9}h${(w-30)*[.76,.91,.57,.82,.67,.88,.39][i]}" stroke="${warm?'#e3ba87':'#adcfcc'}" stroke-width="${i===0?2:1}" opacity="${i===0?.8:.32}"/>`).join('')}
    <path d="M7 4H${w-8}" stroke="#ecfff4" stroke-width=".8" opacity=".7"/>
    <path d="M${w*.58} 5L${w*.33} ${h-5}H${w*.49}L${w*.74} 5Z" fill="#efffff" opacity=".055"/>
  </g>`;
  const body = `${bleedRect(id.url('stage'))}
    <ellipse cx="344" cy="418" rx="440" ry="260" fill="${id.url('pool')}"/>
    <ellipse cx="432" cy="515" rx="266" ry="40" fill="#030d13" opacity=".75" filter="${id.url('shadow')}"/>
    <path d="M196 480Q389 427 617 463L652 509Q420 553 176 523Z" fill="#08191f"/>
    <path d="M194 473Q391 422 617 456L651 502Q417 544 177 516Z" fill="${id.url('metal')}"/>
    <path d="M207 479Q395 435 606 463L627 497Q417 530 201 507Z" fill="${id.url('dark')}"/>
    <path d="M207 479Q395 435 606 463L627 497Q417 530 201 507Z" fill="${id.url('brush')}"/>
    <path d="M358 374L432 368L451 479Q411 495 341 482Z" fill="${id.url('metal')}"/>
    <path d="M371 393L415 390L423 471Q405 477 363 474Z" fill="${id.url('dark')}"/>
    <g transform="rotate(-13 398 259) translate(0 8)"><circle cx="398" cy="259" r="208" fill="#07161b"/></g>
    <g transform="rotate(-13 398 259)">
      <circle cx="398" cy="259" r="204" fill="${id.url('metal')}"/>
      <circle cx="398" cy="259" r="200" fill="${id.url('brush')}"/>
      ${[195,197,199,201,203].map(r=>`<circle cx="398" cy="259" r="${r}" fill="none" stroke="#c4d8cd" stroke-width=".35" opacity=".25"/>`).join('')}
      <circle cx="398" cy="259" r="190" fill="${id.url('dark')}"/>
      <circle cx="398" cy="259" r="181" fill="${id.url('brass')}"/>
      <circle cx="398" cy="259" r="173" fill="#06151b"/>
      <circle cx="398" cy="259" r="170" fill="${id.url('glass')}"/>
      <g clip-path="${id.url('aperture')}">
        <path d="M188 324Q399 221 610 322L610 445H188Z" fill="#071c25"/>
        <path d="M222 327Q400 235 573 328" fill="none" stroke="#8baeb2" stroke-width="3" opacity=".4"/>
        <path d="M268 129Q326 91 460 101L371 409L257 397Z" fill="${id.url('reflection')}"/>
        <path d="M278 137Q360 102 450 117" fill="none" stroke="#d9efdf" stroke-width="5" opacity=".3"/>
        <path d="M255 156Q315 99 432 106" fill="none" stroke="#effff1" stroke-width="13" opacity=".12" filter="${id.url('bloom')}"/>
        <path d="M514 164Q577 251 533 351" fill="none" stroke="#b6d9d7" stroke-width="2" opacity=".16"/>
        <path d="M270 381Q384 448 497 398" fill="none" stroke="#c9b58d" stroke-width="6" opacity=".16" filter="${id.url('bloom')}"/>
      </g>
      ${Array.from({length:72},(_,i)=>`<path d="M398 65v${i%6?4:9}" transform="rotate(${i*5} 398 259)" stroke="#d2d5bb" stroke-width="${i%6?.6:1}" opacity=".6"/>`).join('')}
      ${[35,125,215,305].map(a=>screw(id,398+197*Math.cos(a*Math.PI/180),259+197*Math.sin(a*Math.PI/180))).join('')}
    </g>
    <path d="M161 373Q383 431 665 344" fill="none" stroke="#05151c" stroke-width="16"/>
    <path d="M161 369Q383 427 665 340" fill="none" stroke="${id.url('metal')}" stroke-width="9"/>
    <path d="M161 367Q383 425 665 338" fill="none" stroke="#c8ddd4" stroke-width=".9" opacity=".65"/>
    <path d="M211 309V381M387 296V402M570 292V371" stroke="${id.url('metal')}" stroke-width="9"/>
    ${pane('matrix(.83 .19 -.04 .91 135 208)',153,132,'BROWSER')}
    ${pane('matrix(.98 -.055 0 1 302 180)',186,159,'orbit_workspace',true)}
    ${pane('matrix(.83 -.25 .035 .93 519 202)',148,131,'TERMINAL')}
    ${knob(id,581,465,27)}
    ${screw(id,217,496)}${screw(id,618,501)}
    ${scratches(101,235,454,290,37,30)}
    ${label(271,501,'ORBIT / SPATIAL WORKSPACE',{size:8,fill:'#bfcac2',ls:.14})}
    ${label(66,555,'Si.',{size:28,fill:'#c4c0a9',family:'Georgia, serif',ls:0})}`;
  return {title:'A Place for Every Pane',svg:svgRoot({title:`${proj.title} — conceptual editorial still-life of movable glass panes in a machined observatory instrument`,desc:'A single polished optical aperture, curved placement rail and three translucent pane studies on an anodized base. An editorial metaphor for native browser panes in a spatial workspace, not a product screenshot or ring architecture.',defs,body})};
}
