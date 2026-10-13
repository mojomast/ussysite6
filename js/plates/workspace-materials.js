/** Local vector materials for the workspace/editorial still lifes. */
import { linGrad, radGrad, rng, r2 } from '../svg-kit.js';
export function materials(id) {
  return `
    ${linGrad(id('metal'), [[0,'#f4e8cd'],[.13,'#8e9998'],[.28,'#e0e5df'],[.43,'#626f72'],[.56,'#253638'],[.72,'#abb6b1'],[.82,'#e6d5b5'],[1,'#465353']], {x2:1,y2:.65})}
    ${linGrad(id('brass'), [[0,'#f4dba7'],[.16,'#a5824c'],[.32,'#f1dfb4'],[.48,'#77603f'],[.65,'#352e25'],[.84,'#b8a077'],[1,'#594b35']], {x2:1,y2:.3})}
    ${linGrad(id('dark'), [[0,'#596564'],[.12,'#2a393c'],[.5,'#16282b'],[.9,'#0b171c'],[1,'#45585a']], {x2:.8,y2:1})}
    ${linGrad(id('edge'), [[0,'#ecdfbf'],[.2,'#788c91'],[.47,'#18272e'],[.74,'#7f969a'],[1,'#263b41']])}
    ${linGrad(id('paper'), [[0,'#fff4d8'],[.45,'#e8d8b9'],[.84,'#d4c09e'],[.96,'#f7e9ca'],[1,'#a9977d']], {x2:.6,y2:1})}
    ${linGrad(id('reflection'), [[0,'#e8f8ff',.38],[.33,'#bcdfe6',.08],[.48,'#d2f3f8',0],[.85,'#e4eeea',.02],[1,'#fff1cd',.16]], {x2:.75,y2:1})}
    ${radGrad(id('glass'), [[0,'#547575'],[.42,'#29464e'],[.8,'#102932'],[1,'#07151d']], {cx:.32,cy:.18,r:.95})}
    ${radGrad(id('stage'), [[0,'#5d6660'],[.38,'#303f40'],[1,'#09181e']], {cx:280,cy:180,r:820,units:'userSpaceOnUse'})}
    ${radGrad(id('pool'), [[0,'#e9bb77',.4],[.5,'#ca9b57',.1],[1,'#aa8050',0]])}
    <filter id="${id('shadow')}" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="${id('contact')}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="${id('bloom')}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
    <pattern id="${id('fiber')}" width="47" height="31" patternUnits="userSpaceOnUse"><path d="M3 5l3 .4M31 15l4-.6M14 26l2 .3M40 2l2-.4" stroke="#796d52" stroke-width=".35" opacity=".16"/><path d="M9 17l4-.3M24 4h2M36 26l4-.6" stroke="#fff8dd" stroke-width=".5" opacity=".4"/></pattern>
    <pattern id="${id('brush')}" width="83" height="3.7" patternUnits="userSpaceOnUse"><path d="M0 .4H65M17 2.4H83" stroke="#eef2dd" stroke-opacity=".1" stroke-width=".35"/><path d="M0 1.4H83" stroke="#041b20" stroke-opacity=".15" stroke-width=".4"/></pattern>`;
}
export function screw(id, x, y, r = 4) {
  return `<g transform="translate(${x} ${y})"><circle cy="1" r="${r+1}" fill="#061519"/><circle r="${r}" fill="${id.url('metal')}"/><path d="M${-r*.55} ${r*.25}L${r*.55} ${-r*.25}" stroke="#243437" stroke-width="1.2"/><path d="M${-r*.5} ${-r*.5}Q0 ${-r} ${r*.5} ${-r*.5}" fill="none" stroke="#fff0d4" stroke-width=".6" opacity=".7"/></g>`;
}
export function scratches(seed, x, y, w, h, count = 45) {
  const random = rng(seed);
  return `<g fill="none" stroke="#e7e5ce" stroke-width=".45" opacity=".12">${Array.from({length:count}, () => `<path d="M${r2(x+random()*w)} ${r2(y+random()*h)}l${r2(2+random()*16)} ${r2(-random()*1.6)}"/>`).join('')}</g>`;
}
export function knob(id, x, y, r = 24) {
  return `<g transform="translate(${x} ${y})"><ellipse cy="7" rx="${r+5}" ry="${r}" fill="#020b10" opacity=".65" filter="${id.url('contact')}"/><circle cy="3" r="${r+2}" fill="#06171b"/><circle r="${r}" fill="${id.url('metal')}"/>${Array.from({length:48},(_,i)=>`<path d="M0 ${-r}v3" transform="rotate(${i*7.5})" stroke="${i%2?'#d8d8c5':'#253c42'}" stroke-width=".8"/>`).join('')}<circle r="${r-5}" fill="${id.url('dark')}"/><circle r="${r-6}" fill="${id.url('brush')}"/><path d="M-5 ${-r+10}l-2 7" stroke="#f1deba" stroke-width="2" stroke-linecap="round"/></g>`;
}
