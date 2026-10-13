/** Warpi — an open modular apparatus as a metaphor for BYOK software integration. */
import { scope, svgRoot, label } from '../svg-kit.js';
import { materials, studio, screw, signature } from './machine-materials.js';

export default function warpiPlate(proj) {
  const id = scope('pl-warpi');
  const defs = materials(id, true) + `<clipPath id="${id('screen-cut')}"><rect x="140" y="161" width="244" height="185" rx="9"/></clipPath>`;
  const cable = (d, color) => `<path d="${d}" fill="none" stroke="#010a0f" stroke-width="14" opacity=".7" transform="translate(2 7)" filter="${id.url('contact')}"/><path d="${d}" fill="none" stroke="#07131a" stroke-width="12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="9"/><path d="${d}" fill="none" stroke="#e2e7d4" stroke-width="1.3" opacity=".5" transform="translate(-1 -2)"/>`;
  const socket = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cy="2" rx="12" ry="8" fill="#071219"/><ellipse rx="12" ry="8" fill="${id.url('brass')}" stroke="#d3c6a1" stroke-width=".6"/><ellipse rx="7" ry="4.5" fill="#08151d" stroke="#5a6c70"/><ellipse cx="-1" cy="-1" rx="3" ry="2" fill="#21363d"/></g>`;
  const body = `${studio(id, false)}
    <path d="M91 405L464 329 738 431 372 532Z" fill="#030b10" opacity=".75" filter="${id.url('shadow')}"/>
    <path d="M115 404V419Q127 429 145 425V415M346 500V516Q365 527 383 518V501M668 425V438Q681 446 696 437V418" fill="${id.url('edge')}" stroke="#15222a"/>
    <path d="M91 375L470 294 718 389V414L365 511 91 401Z" fill="${id.url('dark')}" stroke="#1b282e"/>
    <path d="M91 375L470 294 718 389 365 485Z" fill="${id.url('silver')}" stroke="#cad1c5"/>
    <path d="M106 377L470 305 703 389 365 472Z" fill="#303c3f" stroke="#69787a"/>
    <path d="M365 485V511L718 414M91 401L365 511" fill="none" stroke="#adbbb5" stroke-opacity=".4"/>
    <g transform="rotate(-5 260 260)">
      <path d="M112 126L153 105 422 105V357L398 383 112 383Z" fill="${id.url('dark')}" stroke="#677578"/>
      <path d="M112 126L153 105H422L400 126Z" fill="${id.url('silver')}" stroke="#d8e0d4" stroke-width=".8"/>
      <path d="M400 126L422 105V357L400 383Z" fill="${id.url('edge')}"/>
      ${Array.from({ length: 17 }, (_, i) => `<path d="M406 ${160 + i * 8}l10-10" stroke="#0a1820" stroke-width="2"/><path d="M406 ${162 + i * 8}l10-10" stroke="#a9b8b4" stroke-width=".5"/>`).join('')}
      <rect x="112" y="126" width="288" height="257" rx="12" fill="${id.url('silver')}" stroke="#d2d9cd" stroke-width="1.1"/>
      <rect x="124" y="139" width="263" height="218" rx="15" fill="${id.url('dark')}" stroke="#101d24" stroke-width="3"/>
      <rect x="134" y="153" width="249" height="193" rx="10" fill="#081820" stroke="#6b8388" stroke-width=".8"/>
      <g clip-path="${id.url('screen-cut')}">
        <path d="M141 163H380V345H141Z" fill="${id.url('glass')}" opacity=".2"/>
        ${label(157, 185, 'WARP', { size: 15, fill: '#c1d9d7', ls: .18 })}
        ${label(157, 204, 'UPSTREAM INTERFACE', { size: 7, fill: '#87a9b0', ls: .12 })}
        <rect x="155" y="221" width="206" height="45" rx="4" fill="#41606a" fill-opacity=".2" stroke="#718e93" stroke-opacity=".4"/>
        <path d="M166 234L172 238 166 242M181 241H231M166 253H311" fill="none" stroke="#a8d0c5" stroke-width="1.5"/>
        <rect x="155" y="278" width="206" height="49" rx="4" fill="#41606a" fill-opacity=".2" stroke="#718e93" stroke-opacity=".4"/>
        <path d="M166 290H288M166 299H330M166 308H258" stroke="#849da4" stroke-width="1.5" opacity=".65"/>
        <path d="M136 154H210L334 347H276Z" fill="#e0ffff" opacity=".075"/>
        <path d="M144 155H155L280 348H272Z" fill="#f5ffff" opacity=".16"/>
      </g>
      ${screw(id, 121, 134, 2.7)}${screw(id, 391, 135, 2.7)}${screw(id, 122, 374, 2.7)}${screw(id, 390, 374, 2.7)}
      ${label(257, 372, 'INHERITED TERMINAL / NATIVE UI', { size: 7, fill: '#283b3e', anchor: 'middle', ls: .1 })}
    </g>
    <ellipse cx="274" cy="385" rx="157" ry="18" fill="#061016" opacity=".55" filter="${id.url('contact')}"/>
    <path d="M433 329L569 292 662 326V398L529 439 433 402Z" fill="${id.url('dark')}" stroke="#6c7b7a"/>
    <path d="M433 329L569 292 662 326 529 366Z" fill="${id.url('brass')}" stroke="#e4d6b7"/>
    <path d="M446 330L569 304 646 328 530 354Z" fill="#18282e" stroke="#3c4b49"/>
    <g transform="matrix(.92 -.24 .84 .31 454 330)">
      <rect width="112" height="52" rx="4" fill="#344646" stroke="#86988b"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${9 + i * 11} 3V17L${14 + i * 9} 25V49" fill="none" stroke="#b8a774" stroke-width="1"/>`).join('')}
      <rect x="28" y="13" width="53" height="29" rx="3" fill="${id.url('silver')}" stroke="#c8cfc4"/>
      ${label(55, 32, 'Pi SDK', { size: 10, fill: '#15272b', anchor: 'middle', ls: 0 })}
    </g>
    <g stroke="#bed0c8" stroke-width=".7" fill="${id.url('silver')}"><path d="M453 328V315H459V331M563 303V290H569V306M631 328V315H637V331M529 350V337H535V353"/></g>
    <path d="M450 312L566 286 641 312 532 342Z" fill="${id.url('glass')}" stroke="#d2ece0" stroke-opacity=".65" stroke-width=".8"/>
    <path d="M476 306L485 304 561 333 552 337Z" fill="#f0fff8" opacity=".25"/>
    <path d="M433 335L529 373 662 334M529 373V431" fill="none" stroke="#d4ceb3" stroke-width=".8"/>
    <g transform="matrix(1 .38 0 1 447 363)">${label(0, 0, 'LOCAL Pi', { size: 10, fill: '#dce2ca', ls: .05 })}${label(0, 14, 'SOFTWARE HELPER', { size: 5.7, fill: '#96a9a5', ls: 0 })}</g>
    <g transform="matrix(.95 -.29 0 1 545 383)">${label(0, 0, 'AGENT BRIDGE', { size: 9, fill: '#c8d4c8', ls: .05 })}${label(0, 15, 'SOFTWARE STUDY', { size: 6.5, fill: '#859a99', ls: .04 })}</g>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${551 + i * 7} ${410 - i * 2.1}v7" stroke="#0a151b" stroke-width="2.7"/><path d="M${553 + i * 7} ${410 - i * 2.1}v7" stroke="#8da19f" stroke-width=".6"/>`).join('')}
    ${screw(id, 444, 344, 3)}${screw(id, 519, 374, 3)}${screw(id, 650, 344, 3)}
    ${socket(460, 386)}${socket(493, 400)}
    ${cable('M383 358C416 357 404 433 436 441S496 446 493 400', '#ad8e62')}
    ${cable('M460 386C439 411 470 477 542 465S680 445 680 354', '#708c8e')}
    <g transform="translate(677 304) rotate(12)">
      <path d="M-31-17L-15-26H27V29L12 42H-31Z" fill="${id.url('edge')}" stroke="#9aaead"/>
      <rect x="-31" y="-17" width="45" height="59" rx="5" fill="${id.url('silver')}" stroke="#c7d1c5"/>
      <rect x="-24" y="-9" width="31" height="23" rx="3" fill="#101f26" stroke="#96a69b"/>
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${-19 + i * 5} 0V9" stroke="#ceba88" stroke-width="2"/>`).join('')}
      ${label(-9, 28, 'API', { size: 10, fill: '#243637', anchor: 'middle', ls: .1 })}
    </g>
    ${label(641, 279, 'YOUR ENDPOINT', { size: 8, fill: '#c4d2c6', anchor: 'middle', ls: .06 })}
    <g transform="matrix(.94 .36 -.89 .24 235 380)"><rect y="3" width="135" height="61" rx="5" fill="#172127"/><rect width="135" height="61" rx="5" fill="${id.url('brass')}" stroke="#e5d9b7"/>${label(67, 26, 'BYOK', { size: 22, fill: '#283637', anchor: 'middle', ls: .12 })}${label(67, 44, 'AGENT INTEGRATION', { size: 7, fill: '#3e4943', anchor: 'middle', ls: .08 })}${screw(id, 9, 9, 2)}${screw(id, 126, 52, 2)}</g>
    ${signature('THE PROVIDER BRIDGE / YOUR MODEL, WARP’S INTERFACE')}`;
  return { title: 'The Provider Bridge', svg: svgRoot({ title: 'Conceptual editorial still life for Warpi: an upstream Warp interface connected to an exposed modular bridge representing the local Pi software helper and a configured API endpoint. A metaphor for BYOK agent integration, not a hardware product or performance measurement.', defs, body }) };
}
