/** JamMate: a guitar pickup, a musical clock and a warm valve on the listening bench. */
import { scope, svgRoot } from '../svg-kit.js';
import { materials, studio, repeat, screw, knob, type } from './instrument-materials.js';

export default function jammatePlate(proj) {
  const id = scope('si-jammate-still');
  const title = 'The listening bench';
  const defs = materials(id) + `
    <linearGradient id="${id('wood')}" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#24130e"/><stop offset=".2" stop-color="#69391c"/><stop offset=".45" stop-color="#b17b39"/><stop offset=".64" stop-color="#74451f"/><stop offset="1" stop-color="#291d15"/></linearGradient>
    <linearGradient id="${id('ivory')}" x2=".2" y2="1"><stop stop-color="#fff2c8"/><stop offset=".5" stop-color="#bdba9f"/><stop offset="1" stop-color="#727e73"/></linearGradient>
    <radialGradient id="${id('clock')}" cx=".35" cy=".3" r=".7"><stop stop-color="#234d49"/><stop offset=".7" stop-color="#102e2d"/><stop offset="1" stop-color="#041414"/></radialGradient>
    <radialGradient id="${id('ember')}"><stop stop-color="#fffac7"/><stop offset=".12" stop-color="#ffb742"/><stop offset=".4" stop-color="#c84915" stop-opacity=".6"/><stop offset="1" stop-color="#cb5315" stop-opacity="0"/></radialGradient>
    <clipPath id="${id('woodclip')}"><rect x="-126" y="-190" width="252" height="340" rx="66"/></clipPath>`;

  const clock = `<g transform="translate(503 220) rotate(13)">
    <ellipse cx="14" cy="59" rx="156" ry="135" fill="#000" opacity=".55" filter="${id.url('shadow')}"/>
    <circle cy="13" r="140" fill="#071216"/><circle cy="6" r="140" fill="${id.url('steel')}"/>
    <circle r="140" fill="${id.url('brass')}"/>
    ${repeat(100, i => `<path d="M0 -139v5" transform="rotate(${i * 3.6})" stroke="#162523" stroke-width="1" opacity=".6"/>`)}
    <circle r="132" fill="${id.url('silver')}"/><circle r="126" fill="#07191c"/><circle r="121" fill="${id.url('clock')}"/>
    ${repeat(48, i => `<path d="M0 -${i % 12 === 0 ? 103 : 112}V-117" transform="rotate(${i * 7.5})" stroke="${i % 12 === 0 ? '#e6c88a' : '#799992'}" stroke-width="${i % 12 === 0 ? 2 : .65}"/>`)}
    <circle r="84" fill="none" stroke="#597a69" stroke-width=".45"/><circle r="81" fill="none" stroke="#638676" stroke-width=".35"/>
    ${repeat(4, i => `<circle cx="${Math.cos(i * Math.PI / 2) * 94}" cy="${Math.sin(i * Math.PI / 2) * 94}" r="3" fill="#efd59b"/>`)}
    ${type(0, -49, 'MUSICAL', 11, '#a2c0ad', 'text-anchor="middle"')}${type(0, -33, 'CLOCK', 11, '#a2c0ad', 'text-anchor="middle"')}
    <path d="M-5 14L-3 -83Q0 -95 3 -83L5 14Z" transform="rotate(38)" fill="${id.url('ivory')}"/>
    <path d="M-3 9L-2 -65L2 -65L3 9Z" transform="rotate(130)" fill="${id.url('brass')}"/>
    <circle r="10" fill="${id.url('brass')}"/><circle r="4" fill="#182b2c"/>
    <path d="M-105 -56A118 118 0 0 1 71 -94Q-12 -57 -105 -56Z" fill="${id.url('reflection')}"/>
    <path d="M-119 -15A120 120 0 0 1 -68 -99" fill="none" stroke="#dffff1" stroke-opacity=".48" stroke-width="1.3"/>
    <path d="M66 101A120 120 0 0 0 115 35" fill="none" stroke="#72b7b7" stroke-opacity=".35" stroke-width="2"/>
    ${type(0, 67, 'NEXT BAR', 8, '#8fae98', 'text-anchor="middle"')}
  </g>`;

  const pickup = `<g transform="translate(267 302) rotate(-24)">
    <rect x="-127" y="-173" width="266" height="354" rx="66" fill="#000" opacity=".6" filter="${id.url('shadow')}"/>
    <rect x="-130" y="-180" width="260" height="344" rx="65" fill="#1d1811"/>
    <rect x="-128" y="-188" width="256" height="342" rx="66" fill="${id.url('brass')}"/>
    <rect x="-126" y="-190" width="252" height="340" rx="66" fill="${id.url('wood')}"/>
    <g clip-path="url(#${id('woodclip')})" fill="none">${repeat(60, i => `<path d="M${-139 + i * 4.8} -210Q${-155 + i * 4.8} -62 ${-130 + i * 4.8} 40T${-147 + i * 4.8} 172" stroke="${i % 3 ? '#e9af62' : '#25160f'}" stroke-width="${i % 3 ? .55 : 1.2}" opacity=".17"/>`)}</g>
    <path d="M-112 -104V71Q-111 129 -70 139" fill="none" stroke="#edc992" stroke-opacity=".4" stroke-width="1.4"/>
    <rect x="-99" y="-142" width="198" height="235" rx="26" fill="#0b1110" opacity=".75"/>
    <rect x="-102" y="-150" width="204" height="232" rx="25" fill="${id.url('ivory')}"/>
    <rect x="-87" y="-130" width="174" height="192" rx="21" fill="#17201d"/>
    <rect x="-82" y="-126" width="164" height="181" rx="19" fill="${id.url('steel')}"/>
    <rect x="-78" y="-123" width="156" height="174" rx="16" fill="${id.url('silver')}"/>
    <rect x="-78" y="-123" width="156" height="174" rx="16" fill="${id.url('brush')}"/>
    <path d="M-72 -100Q-71 -118 -54 -118H58" stroke="#fff5d9" stroke-width="1.4" fill="none" opacity=".8"/>
    <path d="M76 -108V32Q76 45 59 46H-55" stroke="#9ab3af" stroke-width="1.4" fill="none"/>
    <rect x="-57" y="-106" width="114" height="140" rx="11" fill="#101d1d"/>
    <rect x="-54" y="-103" width="108" height="61" rx="9" fill="${id.url('black')}"/>
    <rect x="-54" y="-36" width="108" height="65" rx="9" fill="${id.url('black')}"/>
    ${repeat(6, i => screw(id, -43 + i * 17.2, -75, 5.4, 10 + i * 21))}
    ${repeat(6, i => `<circle cx="${-43 + i * 17.2}" cy="-4" r="5.3" fill="${id.url('steel')}"/><circle cx="${-43 + i * 17.2}" cy="-5" r="3.8" fill="${id.url('dial')}"/>`)}
    ${[[-91,-34],[91,-34],[-72,-139],[72,-139],[-72,72],[72,72]].map(([x,y]) => screw(id,x,y,4)).join('')}
    <rect x="-68" y="104" width="136" height="19" rx="4" fill="${id.url('steel')}"/>
    ${repeat(6, i => `<rect x="${-51 + i * 18}" y="101" width="13" height="24" rx="3" fill="${id.url('silver')}"/>${screw(id,-44.5+i*18,115,2.4)}`)}
    ${repeat(6, i => `<path d="M${-44 + i * 18} -181V143" stroke="#030b0c" stroke-width="${1.7 - i * .18}" opacity=".8" transform="translate(2 2)"/><path d="M${-44 + i * 18} -183V140" stroke="${i < 3 ? '#ddcba0' : '#dae7df'}" stroke-width="${1.45 - i * .19}"/>`)}
    <path d="M-34 45l13 1m39 2l9 -2m-92 -165l7 1" stroke="#fff6d6" stroke-width=".6" opacity=".48"/>
  </g>`;

  const valve = `<g transform="translate(589 348) rotate(8)">
    <ellipse cx="6" cy="108" rx="65" ry="18" fill="#000" opacity=".7" filter="${id.url('soft')}"/>
    <path d="M-61 68V99Q0 128 61 99V68Z" fill="${id.url('black')}"/><ellipse cy="68" rx="61" ry="22" fill="${id.url('steel')}"/>
    <ellipse cy="67" rx="51" ry="16" fill="#1a2521"/>
    ${repeat(9, i => `<path d="M${-35 + i * 8.8} 60v20" stroke="${id.url('brass')}" stroke-width="3"/>`)}
    <path d="M-43 61V-60Q-43 -99 0 -106Q43 -99 43 -60V61Q0 83 -43 61Z" fill="#152b2a" opacity=".7"/>
    <ellipse cy="-27" rx="76" ry="106" fill="${id.url('ember')}"/>
    <path d="M-24 55V-71M24 55V-71" stroke="${id.url('steel')}" stroke-width="5"/>
    <path d="M-28 -61H28L25 28H-25Z" fill="${id.url('silver')}"/>
    ${repeat(11, i => `<path d="M-25 ${-54+i*7}H25" stroke="#102427" stroke-width="2.2"/><path d="M-22 ${-53+i*7}H22" stroke="#a5b0a0" stroke-width=".5"/>`)}
    <path d="M-6 54V-47Q0 -57 6 -47V54" stroke="#ff892f" fill="none" stroke-width="6" filter="${id.url('bloom')}"/>
    <path d="M-5 54V-45Q0 -54 5 -45V54" stroke="#ffd277" fill="none" stroke-width="1.5"/>
    <ellipse cy="-66" rx="28" ry="7" fill="${id.url('steel')}"/><ellipse cy="36" rx="30" ry="8" fill="${id.url('steel')}"/>
    <path d="M-43 61V-60Q-43 -99 0 -106Q43 -99 43 -60V61Q0 83 -43 61Z" fill="${id.url('glass')}" stroke="#b5ded7" stroke-opacity=".3" stroke-width=".8"/>
    <path d="M-34 29V-59Q-34 -83 -16 -90" stroke="#e9fff3" stroke-width="4" stroke-linecap="round" fill="none" opacity=".46"/>
    <path d="M33 -44V49" stroke="#b3f3ef" stroke-width="1.6" stroke-linecap="round" opacity=".68"/>
    <ellipse cy="61" rx="42" ry="13" fill="none" stroke="#d8f7dc" stroke-width="1" opacity=".4"/>
  </g>`;

  const cablePath = 'M176 447C70 476 119 556 252 548C398 541 458 490 417 456C381 425 323 484 388 519C471 564 612 540 695 484';
  const cable = `<path d="${cablePath}" fill="none" stroke="#02080a" stroke-width="17" transform="translate(5 10)" filter="${id.url('soft')}"/>
    <path d="${cablePath}" fill="none" stroke="#111c1d" stroke-width="14"/><path d="${cablePath}" fill="none" stroke="#6e7765" stroke-width="10"/>
    <path d="${cablePath}" fill="none" stroke="#b6ae85" stroke-width="8" stroke-dasharray="1 3"/><path d="${cablePath}" fill="none" stroke="#293b38" stroke-width="4" opacity=".7"/>
    <g transform="translate(695 484) rotate(-38)"><rect x="-8" y="-10" width="31" height="20" rx="5" fill="${id.url('black')}"/><rect x="17" y="-12" width="44" height="24" rx="5" fill="${id.url('steel')}"/>${repeat(14,i=>`<path d="M${22+i*2.4} -10v20" stroke="#172a2c" stroke-width=".65"/>`)}<rect x="61" y="-5" width="34" height="10" rx="3" fill="${id.url('steel')}"/><path d="M78 -5v10" stroke="#0a1416" stroke-width="2"/></g>`;

  return { title, svg: svgRoot({ title, desc: 'Conceptual guitar pickup and woven cable beside a glass valve and musical clock. Warm filament light meets cool polished metal; no measured performance is depicted.', defs,
    body: studio(id) + clock + pickup + valve + cable + knob(id, 465, 427, 25) + type(52, 55, 'JAMMATE / THE LISTENING BENCH', 11) + type(52, 574, 'GUITAR → MUSICAL CLOCK → DRUMS', 9, '#91a99d') }) };
}
