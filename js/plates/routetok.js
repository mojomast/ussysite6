/** RouteTok: an open relay exchange, drawn as a physical pre-output routing metaphor. */
import { scope, svgRoot } from '../svg-kit.js';
import { materials, studio, repeat, screw, type } from './instrument-materials.js';

export default function routetokPlate(proj) {
  const id = scope('si-routetok-still');
  const title = 'Before the first word';
  const defs = materials(id) + `
    <linearGradient id="${id('enamel')}" x2=".5" y2="1"><stop stop-color="#77877a"/><stop offset=".18" stop-color="#465c51"/><stop offset=".7" stop-color="#243e38"/><stop offset="1" stop-color="#152e2c"/></linearGradient>
    <linearGradient id="${id('ceramic')}" x2=".3" y2="1"><stop stop-color="#f3ead0"/><stop offset=".45" stop-color="#c3c4ae"/><stop offset="1" stop-color="#778b84"/></linearGradient>
    <linearGradient id="${id('coil')}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#462719"/><stop offset=".12" stop-color="#ad5e31"/><stop offset=".3" stop-color="#f8c38d"/><stop offset=".43" stop-color="#c7864e"/><stop offset=".64" stop-color="#783b23"/><stop offset=".88" stop-color="#301d18"/><stop offset="1" stop-color="#72432c"/></linearGradient>
    <radialGradient id="${id('lamp')}"><stop stop-color="#f7ffe0"/><stop offset=".2" stop-color="#b4edbe"/><stop offset=".6" stop-color="#5b9d86"/><stop offset="1" stop-color="#163c37"/></radialGradient>`;

  const relay = (x, y, state, opened, index) => `<g transform="translate(${x} ${y})">
    <rect x="8" y="17" width="166" height="252" rx="15" fill="#000" opacity=".65" filter="${id.url('soft')}"/>
    <path d="M0 5H165V244Q165 255 152 255H12Q0 255 0 242Z" fill="#57675b"/>
    <rect width="165" height="242" rx="13" fill="${id.url('ceramic')}"/>
    <path d="M7 230V16Q7 7 19 7H148" fill="none" stroke="#fff6d8" stroke-opacity=".7" stroke-width="1.2"/>
    ${screw(id,14,16,4)}${screw(id,150,225,4)}
    <rect x="19" y="54" width="130" height="114" rx="13" fill="#061315" opacity=".55"/>
    <path d="M22 44H140V155H22Z" fill="${id.url('steel')}"/>
    <rect x="26" y="39" width="18" height="128" rx="5" fill="${id.url('black')}"/>
    <rect x="128" y="39" width="18" height="128" rx="5" fill="${id.url('black')}"/>
    <rect x="40" y="46" width="92" height="115" rx="16" fill="${id.url('coil')}"/>
    ${repeat(47, i => `<path d="M${44+i*1.83} 47C${37+i*1.83} 65 ${38+i*1.83} 143 ${44+i*1.83} 160" fill="none" stroke="#2e190f" stroke-width="1.65"/><path d="M${44+i*1.83} 47C${37+i*1.83} 65 ${38+i*1.83} 143 ${44+i*1.83} 160" fill="none" stroke="${id.url('copper')}" stroke-width="1.05"/>`)}
    <path d="M46 57Q74 50 120 56" fill="none" stroke="#ffe5bb" stroke-width=".6" opacity=".75"/>
    <path d="M26 44V154M143 43V155" stroke="#d6e0c7" stroke-width=".8" opacity=".5"/>
    <path d="M44 157Q30 185 29 199M129 149Q146 165 140 201" fill="none" stroke="#3e2119" stroke-width="3"/>
    <path d="M44 157Q30 185 29 199M129 149Q146 165 140 201" fill="none" stroke="#c18754" stroke-width="1.3"/>
    <rect x="54" y="29" width="58" height="10" rx="3" fill="${id.url('steel')}"/>
    <path d="M68 38V-15H77V39Z" fill="${id.url('silver')}"/>
    <path d="M94 38V-15H104V39Z" fill="${id.url('steel')}"/>
    ${repeat(9,i=>`<path d="M77 ${-4+i*3.8}q9 -4 17 0q-8 4 -17 0" fill="none" stroke="${id.url('brass')}" stroke-width="1.2"/>`)}
    <path d="M56 -11H117V-4H56Z" fill="${id.url('brass')}"/>
    <circle cx="86" cy="-7" r="4" fill="${id.url('steel')}"/>
    <path d="M34 -34L${opened ? 102 : 112} ${opened ? -59 : -26}L${opened ? 107 : 113} ${opened ? -53 : -20}L34 -27Z" fill="${id.url('silver')}"/>
    <path d="M35 -34L${opened ? 101 : 111} ${opened ? -59 : -26}" stroke="#f4f3d9" stroke-width="1"/>
    <path d="M111 -19H126V14H115V-12H111Z" fill="${id.url('brass')}"/>
    <ellipse cx="111" cy="-20" rx="6" ry="3" fill="${id.url('silver')}"/>
    <path d="M29 -30V28H39V-30Z" fill="${id.url('brass')}"/>
    ${screw(id,34,-30,6)}${screw(id,120,21,5)}
    <rect x="20" y="188" width="126" height="28" rx="5" fill="${id.url('black')}"/>
    ${[30,58,108,137].map((cx,i)=>screw(id,cx,202,6,22+i*21)).join('')}
    <rect x="44" y="223" width="81" height="15" rx="2" fill="#142b2b"/>
    ${type(84,234,state,8,'#dbe3c8','text-anchor="middle"')}
    ${index === 0 ? `<circle cx="146" cy="178" r="5" fill="${id.url('lamp')}"/><circle cx="146" cy="178" r="8" fill="#92edb9" opacity=".35" filter="${id.url('bloom')}"/>` : ''}
  </g>`;

  const board = `<g transform="translate(120 163) matrix(.96 .12 -.10 .87 0 0)">
    <rect x="2" y="28" width="610" height="354" rx="24" fill="#000" opacity=".7" filter="${id.url('shadow')}"/>
    <path d="M-5 4H614V354Q614 372 592 372H15Q-5 372 -5 352Z" fill="#102629"/>
    <rect x="-5" y="-7" width="619" height="365" rx="20" fill="${id.url('steel')}"/>
    <rect x="0" y="-12" width="608" height="365" rx="18" fill="${id.url('enamel')}"/>
    <path d="M5 326V9Q5 -6 22 -6H585" fill="none" stroke="#d4d9b7" stroke-width="1.2" opacity=".7"/>
    <path d="M9 347H584Q600 347 600 333" fill="none" stroke="#8daca0" stroke-width="1" opacity=".5"/>
    ${repeat(29,i=>`<path d="M${22+i*19} 321l${4+(i%4)*2} -1" stroke="#d6cfaa" stroke-width=".5" opacity=".22"/>`)}
    ${[[15,5],[591,5],[15,335],[591,335]].map(([x,y])=>screw(id,x,y,6)).join('')}
    <path d="M70 292C64 334 227 338 244 293S424 320 461 291" stroke="#0a1c1d" stroke-width="13" fill="none"/>
    <path d="M70 289C64 331 227 335 244 290S424 317 461 288" stroke="#a09468" stroke-width="8" fill="none"/>
    <path d="M70 287C64 329 227 333 244 288S424 315 461 286" stroke="#eee0b0" stroke-width="1.1" opacity=".6" fill="none"/>
    <path d="M104 293C125 350 334 355 336 293S519 344 535 285" stroke="#112222" stroke-width="9" fill="none"/>
    <path d="M104 291C125 348 334 353 336 291S519 342 535 283" stroke="#7b9591" stroke-width="5" fill="none"/>
    ${relay(26,38,'CLOSED',false,0)}${relay(222,38,'OPEN',true,1)}${relay(418,38,'PROBE',true,2)}
    <rect x="194" y="323" width="221" height="22" rx="3" fill="#102725" stroke="#8d9d83" stroke-width=".5"/>
    ${type(305,338,'PRE-OUTPUT FALLBACK',9,'#c7cdb4','text-anchor="middle"')}
  </g>`;

  const hood = `<g transform="translate(129 93) rotate(-8)">
    <path d="M8 47L334 30L383 61L55 81Z" fill="#040d10" opacity=".35" filter="${id.url('soft')}"/>
    <path d="M0 0L332 -9L382 17V57L53 71L0 40Z" fill="${id.url('glass')}" stroke="#a7c9bc" stroke-opacity=".3" stroke-width=".8"/>
    <path d="M0 0L52 26L382 17M52 26V71" fill="none" stroke="#e5eee0" stroke-opacity=".52" stroke-width="1"/>
    <path d="M10 1L329 -6L350 5L32 14Z" fill="${id.url('reflection')}"/>
    <path d="M60 30L374 21" stroke="#c4ece5" opacity=".4"/>
  </g>`;
  const connector = `<g transform="translate(555 516) rotate(8)"><ellipse cx="43" cy="10" rx="102" ry="13" fill="#000" opacity=".4" filter="${id.url('soft')}"/><path d="M-75 0H-13" stroke="#182925" stroke-width="9"/><rect x="-18" y="-15" width="90" height="30" rx="6" fill="${id.url('black')}"/><rect x="60" y="-13" width="34" height="26" rx="4" fill="${id.url('steel')}"/>${repeat(9,i=>`<path d="M${-8+i*7} -12v24" stroke="#86958a" opacity=".4" stroke-width=".6"/>`)}<path d="M94 -7h27M94 0h27M94 7h27" stroke="${id.url('brass')}" stroke-width="3"/></g>`;

  return { title, svg: svgRoot({ title, desc: 'Conceptual electromechanical exchange: finely wound copper relays with closed, open and probe contacts on a ceramic and enamel base. The removable glass hood rests behind the assembly.', defs,
    body: studio(id, false) + hood + board + connector + type(52,55,'ROUTETOK / BEFORE THE FIRST WORD',11) + type(52,574,'CLOSED · OPEN · PROBE',9,'#9baea0') }) };
}
