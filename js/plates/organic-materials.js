/** Small native-vector material tiles; no raster textures or frame-sized noise filters. */
import { rng, r2, linGrad, radGrad } from '../svg-kit.js';

export function materialDefs(id, seed) {
  const random = rng(seed);
  return `
    <filter id="${id('shadow')}" x="-35%" y="-60%" width="170%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="${id('contact')}" x="-25%" y="-40%" width="150%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="${id('bloom')}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    ${linGrad(id('brass'), [[0,'#392b1b'],[.15,'#ac8246'],[.3,'#f7dfaa'],[.42,'#937044'],[.6,'#3e3021'],[.79,'#c6a46a'],[1,'#675135']], {x2:1,y2:.35})}
    ${radGrad(id('vignette'), [[0,'#030507',0],[.6,'#030507',0],[1,'#030507',.7]], {r:.8})}
    <pattern id="${id('grain')}" width="71" height="67" patternUnits="userSpaceOnUse">
      ${Array.from({length:90},(_,i)=>`<path d="M${r2(random()*71)} ${r2(random()*67)}l${r2(.3+random()*1.9)} ${r2(random()*.9)}" stroke="${i%3?'#fff4d8':'#070606'}" opacity="${r2(.08+random()*.18)}" stroke-width="${r2(.3+random()*.6)}"/>`).join('')}
    </pattern>
    <pattern id="${id('fibres')}" width="93" height="89" patternUnits="userSpaceOnUse">
      ${Array.from({length:48},()=>`<path d="M${r2(random()*93)} ${r2(random()*89)}q${r2(random()*3)} -1 ${r2(2+random()*5)} ${r2(random()*2-1)}" fill="none" stroke="#67543a" opacity=".16" stroke-width=".35"/>`).join('')}
    </pattern>`;
}

export const shadow = (id,x,y,rx,ry,opacity=.6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#030304" opacity="${opacity}" filter="${id.url('shadow')}"/>`;
