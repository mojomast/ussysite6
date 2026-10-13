/** Native-vector studio materials shared only by the three instrument still lifes. */
import { BLEED } from '../svg-kit.js';

export const repeat = (n, draw) => Array.from({ length: n }, (_, i) => draw(i)).join('');
export function materials(id) {
  const linear = (name, stops, vertical = false) => `<linearGradient id="${id(name)}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([p, c, a = 1]) => `<stop offset="${p}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  return linear('steel', [[0,'#18292d'],[.12,'#647b7b'],[.28,'#eff3e7'],[.34,'#9da9a0'],[.52,'#394b4e'],[.72,'#718c8e'],[.86,'#d2e4df'],[1,'#263e45']]) +
    linear('silver', [[0,'#eef0d9'],[.18,'#abbab3'],[.46,'#526166'],[.68,'#263638'],[.92,'#66848b'],[1,'#adced0']], true) +
    linear('copper', [[0,'#38170f'],[.15,'#884124'],[.33,'#e59a55'],[.44,'#ffdeb0'],[.53,'#b56b36'],[.8,'#61351f'],[1,'#261a16']], true) +
    linear('brass', [[0,'#352a17'],[.2,'#ad8c48'],[.32,'#f2dfaa'],[.5,'#b99754'],[.7,'#5e4928'],[.88,'#c8b27a'],[1,'#3e3928']]) +
    linear('black', [[0,'#4b5450'],[.12,'#202a29'],[.55,'#101a1c'],[1,'#060d10']], true) +
    linear('glass', [[0,'#dcfff4',.28],[.08,'#d8fbff',.06],[.43,'#84bec7',.03],[.72,'#81b3ba',.12],[.92,'#e6fff5',.32],[1,'#86bfcc',.09]]) +
    linear('reflection', [[0,'#fff5d5',.48],[.35,'#f0ffff',.1],[1,'#fff',0]], true) +
    `<radialGradient id="${id('ground')}" cx=".32" cy=".24" r=".85"><stop stop-color="#465456"/><stop offset=".46" stop-color="#202f32"/><stop offset="1" stop-color="#071216"/></radialGradient>
    <radialGradient id="${id('warm')}"><stop stop-color="#eaa358" stop-opacity=".34"/><stop offset="1" stop-color="#b26737" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id('cool')}"><stop stop-color="#67cbd5" stop-opacity=".22"/><stop offset="1" stop-color="#398ca3" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id('dial')}" cx=".32" cy=".25" r=".75"><stop stop-color="#dfddd0"/><stop offset=".53" stop-color="#9baca9"/><stop offset=".91" stop-color="#425c62"/><stop offset="1" stop-color="#14272d"/></radialGradient>
    <filter id="${id('shadow')}" x="-30%" y="-40%" width="170%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="${id('soft')}" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="${id('bloom')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <pattern id="${id('brush')}" width="83" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5h53m8 0h22M14 2h49" stroke="#f1f0d9" stroke-width=".35" opacity=".15"/><path d="M0 3h83" stroke="#061014" stroke-width=".4" opacity=".2"/></pattern>`;
}

export function studio(id, warm = true) {
  return `<rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('ground')}"/>
    <ellipse cx="${warm ? 140 : 660}" cy="140" rx="610" ry="490" fill="${id.url('warm')}"/>
    <ellipse cx="${warm ? 690 : 140}" cy="410" rx="560" ry="570" fill="${id.url('cool')}"/>`;
}

export function screw(id, x, y, r = 5, turn = -30) {
  return `<g transform="translate(${x} ${y}) rotate(${turn})"><circle cy="1.5" r="${r + 1.5}" fill="#050c0e"/><circle r="${r}" fill="${id.url('dial')}" stroke="#d3ddcb" stroke-opacity=".35" stroke-width=".7"/><path d="M${-r * .7} 0H${r * .7}" stroke="#14292c" stroke-width="1.7"/><path d="M${-r * .7} 1H${r * .7}" stroke="#d8e3d4" stroke-opacity=".6" stroke-width=".5"/></g>`;
}

export function knob(id, x, y, r = 30) {
  return `<g transform="translate(${x} ${y})"><ellipse cy="11" rx="${r + 6}" ry="${r + 1}" fill="#02080a" opacity=".7" filter="${id.url('soft')}"/><circle cy="5" r="${r}" fill="#081215"/><circle r="${r}" fill="${id.url('steel')}"/>
    ${repeat(64, i => `<path d="M0 ${-r}v5" transform="rotate(${i * 5.625})" stroke="${i < 32 ? '#091a20' : '#d0d7c7'}" opacity=".6" stroke-width=".85"/>`)}
    <circle r="${r - 5}" fill="${id.url('dial')}" stroke="#e6eddc" stroke-opacity=".5" stroke-width=".7"/><circle r="${r - 8}" fill="none" stroke="#354a4c" stroke-opacity=".6" stroke-width=".55"/>
    <path d="M0 ${-r + 9}v9" transform="rotate(33)" stroke="#eff2d7" stroke-width="2" stroke-linecap="round"/></g>`;
}

export const type = (x, y, text, size = 10, color = '#c6cebc', extra = '') => `<text x="${x}" y="${y}" font-family="'IBM Plex Mono',monospace" font-size="${size}" letter-spacing="1.5" fill="${color}" ${extra}>${text}</text>`;
