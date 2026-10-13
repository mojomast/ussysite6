/** Native SVG studio materials for the three conceptual machine still lifes. */
import { linGrad, radGrad, bleedRect, label } from '../svg-kit.js';

export function materials(id, warm = false) {
  return `
    ${radGrad(id('studio'), [[0, warm ? '#8d8170' : '#59636a'], [.46, warm ? '#46433d' : '#303b42'], [1, '#10191f']], { cx: 310, cy: 170, r: 880, units: 'userSpaceOnUse' })}
    ${linGrad(id('silver'), [[0, '#27353c'], [.12, '#7a898e'], [.24, '#edf1ed'], [.29, '#fff9e6'], [.34, '#a1acae'], [.48, '#34434c'], [.55, '#17232a'], [.66, '#7a8d97'], [.78, '#e2e8e4'], [.85, '#8b999c'], [1, '#29373f']], { x2: 1, y2: .18 })}
    ${linGrad(id('brass'), [[0, '#39382f'], [.16, '#968367'], [.29, '#efe1b8'], [.35, '#fff0c7'], [.45, '#b8a17b'], [.58, '#514b3e'], [.72, '#b8a483'], [.84, '#e8d7ae'], [1, '#625745']], { x2: 1, y2: .12 })}
    ${linGrad(id('edge'), [[0, '#e2e8e5'], [.16, '#727e80'], [.43, '#18242b'], [.62, '#4e6068'], [.8, '#bac7c7'], [1, '#35414a']])}
    ${linGrad(id('dark'), [[0, '#526168'], [.15, '#2f3d44'], [.6, '#142028'], [1, '#080f15']])}
    ${linGrad(id('glass'), [[0, '#e2ffff', .48], [.17, '#a9e4ed', .08], [.44, '#183942', .14], [.49, '#d9ffff', .32], [.53, '#70c7db', .08], [1, '#91dbe0', .32]], { x2: 1, y2: .7 })}
    ${radGrad(id('lens'), [[0, '#dffbff', .03], [.62, '#517b88', .12], [.86, '#74bfce', .4], [.94, '#d5f7ef', .65], [1, '#132d3b', .9]], { cx: .42, cy: .4, r: .6 })}
    ${radGrad(id('ball'), [[0, '#ffffff'], [.22, '#e5edea'], [.39, '#8b9aa0'], [.46, '#24343f'], [.51, '#09141c'], [.61, '#6d838b'], [.8, '#bfcccb'], [1, '#15242e']], { cx: .35, cy: .25, r: .78 })}
    <filter id="${id('shadow')}" x="-25%" y="-80%" width="150%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="${id('contact')}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="${id('defocus')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
    <pattern id="${id('brush')}" width="5" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5H5M1 2H4" stroke="#edf6ef" stroke-opacity=".09" stroke-width=".35"/></pattern>`;
}

export function studio(id, withShadow = true) {
  return `${bleedRect(id.url('studio'))}${withShadow ? `<ellipse cx="420" cy="507" rx="308" ry="43" fill="#02080b" opacity=".8" filter="${id.url('shadow')}"/>` : ''}`;
}

export function screw(id, x, y, r = 3) {
  return `<g transform="translate(${x} ${y})"><circle cy="1" r="${r + 1}" fill="#070f14"/><circle r="${r}" fill="${id.url('ball')}" stroke="#95a4a5" stroke-width=".4"/><path d="M-${r * .6} ${r * .25}L${r * .6} -${r * .25}" stroke="#142129" stroke-width="1"/></g>`;
}

export function signature(text, color = '#bbc1bc') {
  return `${label(48, 557, 'Si.', { size: 21, fill: color, family: 'Georgia, serif', ls: -.06 })}${label(87, 556, text, { size: 8, fill: color, weight: 400, ls: .16 })}`;
}
