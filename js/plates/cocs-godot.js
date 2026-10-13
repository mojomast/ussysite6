/** CoCS-Godot — glass, chrome and a physical spring as presentation metaphors. */
import { scope, rng, r2, svgRoot, label } from '../svg-kit.js';
import { materials, studio, screw, signature } from './machine-materials.js';

export default function cocsGodotPlate(proj) {
  const id = scope('pl-godot');
  const rand = rng(105);
  const defs = materials(id) + `<clipPath id="${id('optic-cut')}"><ellipse cx="513" cy="234" rx="83" ry="108"/></clipPath>`;
  const foot = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cy="8" rx="30" ry="11" fill="#060c11" filter="${id.url('contact')}"/><path d="M-26-5V6A26 9 0 0 0 26 6V-5" fill="${id.url('silver')}"/><ellipse cy="-5" rx="26" ry="9" fill="${id.url('edge')}"/><rect x="-7" y="-89" width="14" height="84" fill="${id.url('silver')}"/><ellipse cy="-88" rx="7" ry="3" fill="#d4dfdc"/></g>`;
  const coil = Array.from({ length: 13 }, (_, i) => {
    const x = 300 + i * 13;
    const y = 405 - i * 3.5;
    return `<path d="M${x} ${y}C${x - 17} ${y - 52} ${x + 13} ${y - 69} ${x + 22} ${y - 33}C${x + 30} ${y - 4} ${x + 7} ${y + 7} ${x + 13} ${y - 3.5}" fill="none" stroke="#0a141c" stroke-width="8"/><path d="M${x} ${y}C${x - 17} ${y - 52} ${x + 13} ${y - 69} ${x + 22} ${y - 33}C${x + 30} ${y - 4} ${x + 7} ${y + 7} ${x + 13} ${y - 3.5}" fill="none" stroke="${id.url('silver')}" stroke-width="5.6"/><path d="M${x - 3} ${y - 15}C${x - 9} ${y - 51} ${x + 10} ${y - 60} ${x + 17} ${y - 43}" fill="none" stroke="#f2f6eb" stroke-width="1.1"/>`;
  }).join('');
  const particles = Array.from({ length: 90 }, () => {
    const t = rand();
    const x = 525 + t * 151;
    const y = 232 - t * 89 + (rand() - .5) * (18 + t * 99);
    return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(.6 + rand() * 1.5)}" fill="${rand() > .5 ? '#e6d4a3' : '#a9e7f2'}" opacity="${r2(.2 + rand() * .65)}"/>`;
  }).join('');
  const body = `${studio(id, false)}
    <path d="M88 402L460 308 728 428 354 527Z" fill="#030b10" opacity=".7" filter="${id.url('shadow')}"/>
    <path d="M117 393V413Q130 425 148 419V403M332 487V504Q349 515 368 507V487M661 411V424Q674 434 690 427V408" fill="${id.url('edge')}" stroke="#15222a"/>
    <path d="M93 360L459 267 714 379V403L351 497 93 383Z" fill="${id.url('dark')}" stroke="#1c2b35"/>
    <path d="M93 360L459 267 714 379 351 473Z" fill="${id.url('edge')}" stroke="#becdca" stroke-width="1.2"/>
    <path d="M105 359L458 279 699 379 351 461Z" fill="#24333b" stroke="#849290" stroke-width=".6"/>
    <path d="M93 383L351 497 714 403M351 473V497" fill="none" stroke="#99a6a4" stroke-opacity=".4"/>
    ${Array.from({ length: 8 }, (_, j) => Array.from({ length: 12 }, (_, i) => {
      const x = 129 + i * 26 + j * 25;
      const y = 361 - i * 6.4 + j * 10.8;
      return `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.2" fill="#08151d"/><path d="M${x - 1} ${y + 1}h2" stroke="#809291" stroke-width=".5"/>`;
    }).join('')).join('')}
    ${foot(513, 379)}
    <path d="M494 339L491 312 533 306 535 338Z" fill="${id.url('silver')}" stroke="#d0ddda"/>
    <ellipse cx="519" cy="236" rx="91" ry="116" fill="none" stroke="#09141a" stroke-width="16"/>
    <ellipse cx="513" cy="232" rx="91" ry="116" fill="none" stroke="${id.url('silver')}" stroke-width="13"/>
    ${Array.from({ length: 44 }, (_, i) => {
      const a = i * Math.PI / 22;
      return `<path d="M${r2(513 + Math.cos(a) * 93)} ${r2(232 + Math.sin(a) * 118)}L${r2(513 + Math.cos(a) * 96)} ${r2(232 + Math.sin(a) * 121)}" stroke="#091923" stroke-opacity=".55" stroke-width=".7"/>`;
    }).join('')}
    <ellipse cx="513" cy="232" rx="85" ry="110" fill="${id.url('lens')}" stroke="#e1fff4" stroke-width="1.1"/>
    <ellipse cx="513" cy="232" rx="80" ry="104" fill="${id.url('glass')}" stroke="#9ed9db" stroke-opacity=".4"/>
    <g clip-path="${id.url('optic-cut')}" fill="#edfff8"><path d="M429 129L449 120 556 345 540 352Z" opacity=".22"/><path d="M455 121L464 119 573 330 567 342Z" opacity=".55"/><path d="M511 122Q594 168 587 240Q568 153 511 122" opacity=".7"/></g>
    <path d="M432 242Q421 171 470 133" fill="none" stroke="#fffdf0" stroke-width="2.3"/>
    ${screw(id, 429, 273, 4)}${screw(id, 553, 127, 4)}${screw(id, 585, 286, 4)}
    <path d="M188 284L339 266 514 230" fill="none" stroke="#a5dfe8" stroke-width="9" opacity=".12" filter="${id.url('contact')}"/>
    <path d="M191 284L341 266 512 230" fill="none" stroke="#c3eef3" stroke-width="1.1" opacity=".55"/>
    <path d="M510 230L674 122 689 208Z" fill="${id.url('glass')}" opacity=".2"/>
    <g filter="${id.url('defocus')}">${particles}</g>
    ${foot(187, 368)}
    <path d="M146 231L199 219Q228 237 228 281L181 302Q144 288 146 231Z" fill="${id.url('silver')}" stroke="#778d95"/>
    <ellipse cx="165" cy="267" rx="31" ry="45" transform="rotate(-19 165 267)" fill="${id.url('dark')}" stroke="#dce6de" stroke-width="2"/>
    <ellipse cx="165" cy="267" rx="24" ry="36" transform="rotate(-19 165 267)" fill="${id.url('lens')}" stroke="#91b9c0"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${183 + i * 9} ${228 - i * 2}Q${204 + i * 8} 253 ${198 + i * 9} ${293 - i * 4}" fill="none" stroke="#182730" stroke-width="2"/>`).join('')}
    <ellipse cx="334" cy="327" rx="66" ry="20" fill="#05141a" opacity=".7" filter="${id.url('contact')}"/>
    <path d="M278 315L336 183 394 296 344 334Z" fill="${id.url('glass')}" stroke="#bedbda" stroke-width="1.2"/>
    <path d="M278 315L307 211 336 183 344 334Z" fill="#c3eeeb" fill-opacity=".17" stroke="#e2faf0" stroke-width=".8"/>
    <path d="M336 183L344 334 394 296Z" fill="#76afbd" fill-opacity=".25" stroke="#abcacf" stroke-width=".8"/>
    <path d="M307 211L355 301 344 334M287 307L337 201 381 294" fill="none" stroke="#dcfff7" stroke-opacity=".45" stroke-width="1"/>
    <path d="M280 317L345 339 397 298" fill="none" stroke="#83dad6" stroke-opacity=".65" stroke-width="2"/>
    <path d="M282 324L344 345 398 304" fill="none" stroke="#98e1d9" stroke-opacity=".3" stroke-width="3" filter="${id.url('contact')}"/>
    <path d="M265 424L489 364" stroke="#061017" stroke-width="19"/>
    <path d="M265 419L489 359" stroke="${id.url('silver')}" stroke-width="13"/>
    <path d="M265 415L489 355" stroke="#ecf0dd" stroke-width="1.1"/>
    ${coil}
    <path d="M267 395L283 390 297 417 279 424Z M468 341L484 337 499 366 480 374Z" fill="${id.url('brass')}" stroke="#e4d6b4"/>
    ${screw(id, 281, 408, 4)}${screw(id, 484, 355, 4)}
    <ellipse cx="596" cy="411" rx="32" ry="9" fill="#020b10" opacity=".85" filter="${id.url('contact')}"/>
    <circle cx="592" cy="378" r="34" fill="${id.url('ball')}" stroke="#b5c6c8" stroke-width=".5"/>
    <path d="M566 365Q572 348 589 350" fill="none" stroke="#fffceb" stroke-width="3" stroke-linecap="round"/>
    ${label(360, 471, 'MOTION / MATERIAL / LIGHT', { size: 7, fill: '#b9c8c6', extra: 'transform="rotate(-14 360 471)"' })}
    ${signature('THE OPTICAL BENCH / A NATIVE PRESENTATION STUDY')}`;
  return { title: 'The Optical Bench', svg: svgRoot({ title: 'Conceptual editorial still life for CoCS-Godot: a glass prism, mounted lens, chrome sphere, suspended particle study and precision coil spring evoke its material, particle and motion labs; not actual hardware or a renderer demonstration.', defs, body }) };
}
