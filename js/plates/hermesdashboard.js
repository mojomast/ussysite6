/** Hermes: a quiet physical observation console, rather than performance telemetry. */
import { scope, svgRoot, bleedRect, linGrad, label } from '../svg-kit.js';
import { materials, screw, scratches, knob } from './workspace-materials.js';

export default function hermesDashboardPlate(proj) {
  const id = scope('pl-herm');
  const defs = materials(id) + `
    ${linGrad(id('enamel'),[[0,'#8c9991'],[.12,'#657b79'],[.47,'#30494e'],[.88,'#1b3039'],[1,'#12232d']],{x2:.7,y2:1})}
    ${linGrad(id('screen'),[[0,'#091b28'],[.5,'#224654'],[1,'#0a1d29']],{x2:.8,y2:1})}
    <clipPath id="${id('screen-clip')}"><rect x="123" y="151" width="348" height="232" rx="28"/></clipPath>`;
  const body = `${bleedRect(id.url('stage'))}
    <ellipse cx="498" cy="411" rx="400" ry="235" fill="${id.url('pool')}" opacity=".6"/>
    <ellipse cx="420" cy="520" rx="309" ry="38" fill="#020a11" opacity=".8" filter="${id.url('shadow')}"/>
    <path d="M610 408C738 414 746 468 716 503S769 545 781 491" fill="none" stroke="#08131a" stroke-width="9"/>
    <path d="M611 407C738 413 746 467 716 502S769 544 781 490" fill="none" stroke="#536667" stroke-width="1"/>
    <g transform="matrix(1 .055 -.065 1 27 -16)">
      <path d="M93 127L148 89H674L703 113V431L668 472H92Z" fill="${id.url('dark')}"/>
      <path d="M95 122L148 89H674L659 123Z" fill="${id.url('metal')}"/>
      <path d="M659 123L703 113V431L659 472Z" fill="${id.url('dark')}"/>
      ${Array.from({length:20},(_,i)=>`<path d="M674 ${154+i*12}l17-9" stroke="#050f18" stroke-width="4"/><path d="M674 ${156+i*12}l17-9" stroke="#759292" stroke-width=".6" opacity=".4"/>`).join('')}
      <rect x="90" y="120" width="573" height="351" rx="18" fill="${id.url('edge')}"/>
      <rect x="93" y="123" width="566" height="344" rx="16" fill="${id.url('enamel')}"/>
      <rect x="93" y="123" width="566" height="344" rx="16" fill="${id.url('brush')}" opacity=".6"/>
      <rect x="111" y="139" width="372" height="258" rx="36" fill="${id.url('metal')}"/>
      <rect x="116" y="143" width="362" height="250" rx="33" fill="#06121a"/>
      <rect x="123" y="151" width="348" height="232" rx="28" fill="${id.url('screen')}"/>
      <g clip-path="${id.url('screen-clip')}">
        <ellipse cx="284" cy="311" rx="172" ry="108" fill="#74acb5" opacity=".07" filter="${id.url('shadow')}"/>
        ${label(148,181,'HERMES / SESSIONS',{size:10,fill:'#b5d2d0',ls:.16})}
        <g transform="translate(154 200) rotate(-3)">
          <rect x="5" y="8" width="190" height="123" rx="5" fill="#000e16" opacity=".7"/>
          <rect width="190" height="123" rx="5" fill="#5d7c81"/>
          <rect x="1" y="1" width="188" height="121" rx="4" fill="${id.url('glass')}"/>
          ${label(15,24,'CHAT STREAM',{size:8,fill:'#d1d8c0'})}
          ${Array.from({length:8},(_,i)=>`<path d="M15 ${41+i*8}h${[131,117,86,123,144,79,108,49][i]}" stroke="#a0bcb8" stroke-width="1.3" opacity=".5"/>`).join('')}
        </g>
        <g transform="translate(303 250) rotate(4)">
          <rect x="3" y="7" width="137" height="103" rx="4" fill="#001018" opacity=".7"/>
          <rect width="137" height="103" rx="4" fill="#8aafa9"/>
          <rect x="1" y="1" width="135" height="101" rx="3" fill="${id.url('glass')}"/>
          ${label(12,22,'LIVE VIEW',{size:8,fill:'#edd3a0'})}
          ${label(12,39,'child session',{size:7,fill:'#b7ccc5',ls:0})}
          <path d="M12 53H119M12 62H96M12 71H111M12 80H70" stroke="#8ea9a6" stroke-width="1.2" opacity=".6"/>
        </g>
        <path d="M123 151H317L216 383H123Z" fill="${id.url('reflection')}" opacity=".5"/>
        <path d="M137 173Q208 150 292 159L240 370Q170 384 135 352Z" fill="${id.url('reflection')}" opacity=".24"/>
        <path d="M141 168Q265 144 442 165" stroke="#dae9d9" stroke-width="11" fill="none" opacity=".07" filter="${id.url('bloom')}"/>
        <path d="M139 359Q266 391 445 364" stroke="#9abac1" stroke-width="5" fill="none" opacity=".12" filter="${id.url('bloom')}"/>
        <path d="M139 164Q270 141 448 162" stroke="#d9efdf" stroke-width="3" fill="none" opacity=".2"/>
        <path d="M456 201Q470 285 454 359" stroke="#9bbfc3" stroke-width="2" fill="none" opacity=".17"/>
      </g>
      <rect x="503" y="150" width="132" height="228" rx="9" fill="#0c2029"/>
      <rect x="507" y="154" width="124" height="220" rx="7" fill="${id.url('edge')}"/>
      <rect x="512" y="159" width="114" height="208" rx="5" fill="#152a32"/>
      <path d="M526 173H610V355Q570 341 526 356Z" fill="${id.url('paper')}"/>
      <path d="M526 173H610V355Q570 341 526 356Z" fill="${id.url('fiber')}"/>
      <path d="M526 173H610V188H526Z" fill="#695d4d" opacity=".35"/>
      ${label(536,209,'RESOURCES',{size:7,fill:'#4e5148',ls:.07})}
      ${['sessions','files','tools','models','skills'].map((s,i)=>`${label(536,234+i*22,s,{size:8,fill:'#5e6256',ls:0})}<path d="M536 ${240+i*22}H597" stroke="#7d7e6b" stroke-opacity=".3" stroke-width=".5"/>`).join('')}
      <rect x="522" y="166" width="92" height="14" rx="6" fill="${id.url('metal')}"/>
      <path d="M530 169H605" stroke="#e5e4ce" stroke-width="1" opacity=".6"/>
      ${knob(id,537,416,23)}${knob(id,608,416,18)}
      <rect x="126" y="418" width="132" height="25" rx="3" fill="${id.url('metal')}"/>
      ${label(139,435,'HERMES',{size:13,fill:'#233c40',family:'Georgia, serif',ls:.16})}
      <circle cx="287" cy="430" r="5" fill="#07181d"/><circle cx="287" cy="429" r="3" fill="#d8bb80"/>
      ${label(304,433,'SESSION OBSERVATORY',{size:7,fill:'#c4d1c2',ls:.12})}
      ${[[104,134],[647,136],[104,452],[647,451]].map(([x,y])=>screw(id,x,y)).join('')}
      ${scratches(110,123,401,363,47,35)}
      <path d="M129 471V487Q149 495 177 488V472M587 471V490H627V471" fill="#08151b"/>
    </g>
    <g transform="translate(218 510) rotate(-5)"><path d="M0 0H234L246 40H8Z" fill="${id.url('paper')}"/><path d="M10 5H228" stroke="#fff1d4" stroke-width="1"/>${label(23,25,'SSE / OBSERVATION NOTES',{size:9,fill:'#525e56',ls:.06})}</g>`;
  return {title:'The Session Observatory',svg:svgRoot({title:`${proj.title} — conceptual editorial still-life of a physical session-observation console`,desc:'A brushed-metal and blue enamel console with polished glass, overlapping chat and child-session study cards, and a paper resource index. Conceptual artwork for session observation, not a captured interface or measured telemetry.',defs,body})};
}
