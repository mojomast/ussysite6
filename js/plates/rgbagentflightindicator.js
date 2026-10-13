/** RGB: sculpted keycaps and an exposed switch, a static macro of four default states. */
import { scope, svgRoot } from '../svg-kit.js';
import { materials, studio, repeat, screw, type } from './instrument-materials.js';

export default function rgbagentflightindicatorPlate(proj) {
  const id = scope('si-rgb-still');
  const title = 'A light left on';
  const palette = [['work','#69ff8f','#193e2b','#bfd9b6'],['done','#f2ffed','#54645e','#f4f3d6'],['attention','#ff6554','#562620','#d7a18c'],['idle','#3f5458','#15252a','#82918c']];
  const defs = materials(id) + palette.map(([name,light,shade,top])=>`
    <linearGradient id="${id(name+'-side')}" x2=".1" y2="1"><stop stop-color="${top}"/><stop offset=".13" stop-color="${shade}"/><stop offset="1" stop-color="#071315"/></linearGradient>
    <radialGradient id="${id(name+'-top')}" cx=".48" cy=".1" r=".9"><stop stop-color="${shade}"/><stop offset=".47" stop-color="${top}"/><stop offset=".8" stop-color="${top}"/><stop offset="1" stop-color="${shade}"/></radialGradient>
    <radialGradient id="${id(name+'-light')}"><stop stop-color="${light}" stop-opacity=".8"/><stop offset=".4" stop-color="${light}" stop-opacity=".2"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>`).join('') + `
    <linearGradient id="${id('pcb')}" x2=".5" y2="1"><stop stop-color="#264a45"/><stop offset=".5" stop-color="#112e2d"/><stop offset="1" stop-color="#071b21"/></linearGradient>
    <linearGradient id="${id('stem')}" x2=".6" y2="1"><stop stop-color="#f1d0a4"/><stop offset=".25" stop-color="#ce8056"/><stop offset=".65" stop-color="#6c4032"/><stop offset="1" stop-color="#2b2727"/></linearGradient>`;

  const key = (x,y,name,legend,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="6" cy="49" rx="89" ry="38" fill="#000" opacity=".8" filter="${id.url('soft')}"/>
    <ellipse cy="36" rx="106" ry="58" fill="${id.url(name+'-light')}"/>
    <path d="M-69 7L29 -18L89 5L81 40L-17 69L-78 42Z" fill="#071416"/>
    <path d="M-68 23L-13 50L78 26" fill="none" stroke="${palette.find(p=>p[0]===name)[1]}" opacity="${name==='idle'?.1:.8}" stroke-width="3"/>
    <path d="M-60 -47Q-60 -53 -51 -55L26 -75Q32 -77 39 -74L80 -54Q84 -51 83 -44L76 28Q76 35 69 38L-11 62Q-17 64 -24 61L-76 35Q-82 31 -80 24Z" fill="${id.url(name+'-side')}"/>
    <path d="M-22 -26L-17 60L-76 31L-59 -46Z" fill="#0c1719" opacity=".22"/>
    <path d="M-60 -47Q-60 -53 -51 -55L26 -75Q32 -77 39 -74L80 -54Q89 -48 79 -43L-10 -17Q-17 -14 -24 -18Z" fill="${id.url(name+'-top')}"/>
    <path d="M-51 -48L27 -69Q32 -70 38 -68L70 -52Q45 -43 23 -44Q-13 -44 -34 -34Q-47 -40 -51 -48Z" fill="#102b2b" opacity=".16"/>
    <path d="M-46 -47Q-13 -27 10 -33T66 -51" fill="none" stroke="#eefce1" stroke-width="1" opacity=".24"/>
    <path d="M-58 -49L-21 -23Q-15 -19 -8 -22L77 -47" fill="none" stroke="#fbffe5" stroke-width="1.2" opacity=".65"/>
    <path d="M-16 -13L-13 52" stroke="#cbd8bf" stroke-width=".7" opacity=".27"/>
    <path d="M-75 29L-21 56Q-17 59 -11 56L70 33" fill="none" stroke="#85b0a4" stroke-width=".8" opacity=".35"/>
    ${name !== 'idle' ? `<path d="M-74 38L-21 65Q-17 67 -11 65L72 41" fill="none" stroke="${palette.find(p=>p[0]===name)[1]}" stroke-width="5" opacity=".55" filter="${id.url('bloom')}"/><path d="M-73 38L-21 65Q-17 67 -11 65L72 41" fill="none" stroke="${palette.find(p=>p[0]===name)[1]}" stroke-width="1.7" opacity=".88"/>` : ''}
    <g transform="translate(13 -41) rotate(-15) skewX(24)">${type(0,0,legend,10,name==='idle'?'#81958f':'#132e29','text-anchor="middle"')}</g>
    ${name==='attention'?'<path d="M9 -52v8m0 4v2" transform="rotate(-15 9 -45)" stroke="#fbd6c4" stroke-width="1.5"/>':''}
    ${repeat(9,i=>`<path d="M${-5+i*7} ${20-i*2}l3 -.7" stroke="#dce7d1" stroke-opacity=".09" stroke-width=".5"/>`)}
  </g>`;

  const pcb = `<g transform="translate(77 274) rotate(-11)">
    <path d="M0 0L519 -30L640 119V152L126 191L0 37Z" fill="#060f15"/>
    <path d="M0 0L519 -30L640 119L122 158Z" fill="${id.url('steel')}"/>
    <path d="M9 0L516 -24L628 115L126 152Z" fill="${id.url('pcb')}"/>
    <path d="M126 158V181L636 143V123" fill="none" stroke="#496468" stroke-width="1"/>
    ${repeat(17,i=>`<path d="M${36+i*27} ${6-i*1.45}l43 53l-3 13l45 55l${34+(i%3)*5} -2" stroke="${i%3===0?'#ae9460':'#46726a'}" stroke-width="${i%3===0?1.7:.8}" opacity=".63" fill="none"/>`)}
    ${repeat(32,i=>`<circle cx="${129+i*14.4}" cy="${139-i*1.05}" r="2.1" fill="#ad9a62"/><circle cx="${129+i*14.4}" cy="${139-i*1.05}" r=".8" fill="#091c1c"/>`)}
    ${[[18,9],[508,-12],[610,109],[131,140]].map(([x,y])=>screw(id,x,y,5)).join('')}
    ${repeat(11,i=>`<g transform="translate(${165+i*34} ${91-i*2}) rotate(-4)"><rect width="18" height="9" rx="1" fill="#071315"/><rect width="3" height="9" rx="1" fill="${id.url('silver')}"/><rect x="15" width="3" height="9" rx="1" fill="${id.url('silver')}"/></g>`)}
    <path d="M49 47L530 18L592 95L113 128Z" fill="#111e22" stroke="#68837e" stroke-width=".7"/>
    <path d="M55 48L525 21L530 27L60 54Z" fill="${id.url('silver')}" opacity=".8"/>
    ${repeat(12,i=>`<path d="M${148+i*32} ${119-i*2}l-6 -9l11 -1l-8 -12" stroke="#6b8a6e" stroke-width=".75" fill="none" opacity=".75"/><circle cx="${148+i*32}" cy="${119-i*2}" r="2" fill="#b5a76f"/><circle cx="${148+i*32}" cy="${119-i*2}" r=".8" fill="#132728"/>`)}
    ${repeat(6,i=>`<g transform="translate(${185+i*54} ${105-i*3.5})"><path d="M0 0h21v12H0Z" fill="#030c10"/><rect x="2" y="-1" width="17" height="9" rx="1" fill="${id.url('black')}"/>${repeat(4,j=>`<path d="M${4+j*4} -4v4m0 9v4" stroke="${id.url('silver')}" stroke-width="1.7"/>`)}<path d="M4 1h12" stroke="#718c80" stroke-width=".6"/></g>`)}
  </g>`;

  const switchAssembly = `<g transform="translate(464 436)">
    <ellipse cx="24" cy="29" rx="111" ry="46" fill="#000" opacity=".75" filter="${id.url('shadow')}"/>
    <path d="M-81 -1L7 -34L96 -1L8 38Z" fill="${id.url('steel')}"/>
    <path d="M-81 -1V23L8 61V38Z" fill="#2e4748"/><path d="M8 38L96 -1V22L8 61Z" fill="#112c33"/>
    <path d="M-66 -9L7 -38L80 -10V13L9 46L-66 16Z" fill="${id.url('black')}"/>
    <path d="M-48 -37L6 -58L62 -34V2L7 26L-48 4Z" fill="#223b3a"/>
    <path d="M-16 -9V-83M29 -9V-83" stroke="${id.url('brass')}" stroke-width="3"/>
    <path d="M-40 -2V-48Q-37 -59 -27 -57L-19 -42L-27 -18" fill="none" stroke="#302719" stroke-width="6"/><path d="M-41 -3V-48Q-38 -59 -28 -57L-20 -42L-28 -18" fill="none" stroke="${id.url('brass')}" stroke-width="3"/>
    ${repeat(11,i=>`<ellipse cx="7" cy="${-8-i*5.3}" rx="21" ry="7" fill="none" stroke="#081416" stroke-width="3.8"/><path d="M-14 ${-8-i*5.3}a21 7 0 1 0 42 0" fill="none" stroke="${id.url('brass')}" stroke-width="2.5"/>`)}
    <path d="M-66 -77L6 -103L80 -75V-12L9 19L-66 -10Z" fill="${id.url('glass')}" stroke="#b7d7cc" stroke-opacity=".5" stroke-width=".8"/>
    <path d="M-66 -77L9 -47L80 -75M9 -47V19" fill="none" stroke="#d1f9e3" stroke-width="1.2" opacity=".6"/>
    <path d="M-61 -70L-51 -66V-12L-61 -16Z" fill="#d7fff0" opacity=".28"/>
    <path d="M21 -46L66 -66V-53L21 -34Z" fill="#b4e4d8" opacity=".17"/>
    <path d="M-28 -82V-110L-13 -116V-132L9 -140L29 -132V-118L44 -112V-85L8 -70Z" fill="${id.url('stem')}"/>
    <path d="M-13 -132L9 -140L29 -132L9 -124Z" fill="#f3d4a9"/><path d="M9 -124V-98L-10 -91L-28 -99V-110L-13 -105V-117Z" fill="#b68060"/>
    <path d="M9 -124L29 -132V-118L44 -112L23 -104L9 -110Z" fill="#e9b991"/>
    <path d="M-26 -109L-13 -103L8 -111M11 -137L26 -131M11 -123V-113L23 -107L40 -113" fill="none" stroke="#ffe2b9" stroke-opacity=".55" stroke-width="1"/>
    <path d="M-26 -98L-9 -89L9 -96L27 -88L41 -94" fill="none" stroke="#392c28" stroke-width="1" opacity=".4"/>
    <path d="M-39 -70L-27 -65V-46L-39 -51Z" fill="#abc8b9" opacity=".5"/><path d="M49 -63L61 -68V-47L49 -42Z" fill="#b7d5c2" opacity=".5"/>
    <rect x="-7" y="18" width="24" height="11" rx="3" fill="#bdddc2"/>
    <ellipse cx="5" cy="24" rx="15" ry="8" fill="${id.url('work-light')}"/><path d="M-2 23h14" stroke="#a8ffc6" stroke-width="2"/>
    <path d="M-72 11L-69 18M86 7l-1 9" stroke="#d4e9cb" stroke-width="2"/>
    ${screw(id,-59,7,3)}${screw(id,75,5,3)}
  </g>`;

  return { title, svg: svgRoot({ title, desc: 'Conceptual macro still life of sculpted mechanical keys, a translucent exposed switch, spring, copper contacts and circuit assembly. Four default states: green working, white done, blinking red attention and dark idle. A static image represents the illuminated phase of attention.', defs,
    body: studio(id, false) + pcb + key(181,248,'work','WORK') + key(321,221,'done','DONE') + key(466,195,'attention','',.98) + key(608,168,'idle','IDLE',.94) + switchAssembly + type(52,554,'GREEN / WORK     WHITE / DONE',9,'#b0c4b2') + type(52,574,'BLINK RED / ATTENTION     DARK / IDLE',9,'#b0c4b2') + type(52,55,'RGB / A LIGHT LEFT ON',11) }) };
}
