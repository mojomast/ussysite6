/** MOTHBAKE — an imagined asset specimen, photographed in native vector light. */
import { rng, r2, scope, linGrad, radGrad, svgRoot, bleedRect } from '../svg-kit.js';
import { materialDefs, shadow } from './organic-materials.js';

export default function mothbakePlate(proj) {
  const id=scope('pl-moth'), random=rng(108);
  const fore='M-8-18C-65-68-172-148-231-155C-261-160-278-132-267-107C-258-86-235-80-242-57C-260-27-232-9-212-3C-139 30-62 29-10 17Z';
  const hind='M-13 9C-78 10-155 24-187 64C-208 97-178 148-146 163C-105 183-70 143-47 113C-30 81-23 43-13 9Z';
  const defs=`${materialDefs(id,108)}
    ${radGrad(id('table'),[[0,'#77796d'],[.5,'#414a44'],[1,'#151d1e']],{cx:.3,cy:.2,r:.9})}
    ${linGrad(id('wood'),[[0,'#1e1512'],[.16,'#845231'],[.28,'#ad7850'],[.42,'#4c2f20'],[.72,'#301e17'],[.9,'#784c32'],[1,'#211613']],{x2:.15,y2:1})}
    ${linGrad(id('rim'),[[0,'#d1a06a'],[.15,'#6c462b'],[.4,'#31241d'],[.75,'#b28454'],[1,'#4f3623']],{x2:1,y2:.4})}
    ${radGrad(id('lining'),[[0,'#ebdec0'],[.65,'#c2b49a'],[1,'#7a7664']],{cx:.38,cy:.3,r:.8})}
    ${radGrad(id('fore-color'),[[0,'#e6b781'],[.22,'#c58354'],[.5,'#995432'],[.78,'#67392d'],[1,'#312b29']],{cx:.42,cy:.32,r:.78})}
    ${radGrad(id('hind-color'),[[0,'#d89852'],[.4,'#a97543'],[.7,'#754734'],[1,'#3b302a']],{cx:.55,cy:.25,r:.8})}
    ${linGrad(id('fur'),[[0,'#362b22'],[.25,'#aa8a54'],[.45,'#e8cc8c'],[.65,'#b19765'],[1,'#3e3426']],{x2:1,y2:.1})}
    ${radGrad(id('eyespot'),[[0,'#1d2527'],[.32,'#34494a'],[.47,'#a4b9a8'],[.6,'#687f70'],[.68,'#252421'],[.82,'#d6b47f'],[1,'#704638']],{cx:.4,cy:.4,r:.65})}
    ${radGrad(id('wing-shade'),[[0,'#201b18',.68],[.38,'#33201b',.25],[1,'#2a1c18',0]],{cx:1,cy:.9,r:.82})}
    ${linGrad(id('window'),[[0,'#fff5d2',.8],[.3,'#a6b9b0',.65],[.65,'#dce5d2',.9],[1,'#aaa993',.5]],{x2:1,y2:1})}
    ${linGrad(id('glass'),[[0,'#e4f4f2',.17],[.21,'#e3f6f0',.025],[.48,'#fff',0],[.69,'#dcebea',.015],[1,'#d9e7e6',.1]],{x2:1,y2:1})}
    ${linGrad(id('reflection'),[[0,'#fffde4',.18],[.5,'#fffde4',.06],[1,'#fffde4',0]],{x2:.8,y2:1})}
    <path id="${id('fore')}" d="${fore}"/><path id="${id('hind')}" d="${hind}"/>
    <clipPath id="${id('fore-clip')}"><use href="#${id('fore')}"/></clipPath>
    <clipPath id="${id('hind-clip')}"><use href="#${id('hind')}"/></clipPath>
    <clipPath id="${id('glass-clip')}"><rect x="86" y="75" width="628" height="439" rx="1"/></clipPath>
    <pattern id="${id('scales')}" width="23" height="21" patternUnits="userSpaceOnUse">
      ${Array.from({length:52},(_,i)=>{const x=random()*23,y=random()*21;return `<path d="M${r2(x)} ${r2(y)}q1.5 1.4 .6 3" stroke="${i%3?'#f8d19a':'#251e1a'}" stroke-width="${r2(.3+random()*.4)}" opacity="${r2(.18+random()*.32)}" fill="none"/>`;}).join('')}
    </pattern>
    <pattern id="${id('wood-grain')}" width="240" height="23" patternUnits="userSpaceOnUse">
      ${Array.from({length:28},(_,i)=>`<path d="M-20 ${i*.86}Q48 ${i*.86-4} 112 ${i*.86}T260 ${i*.86}" stroke="${i%3?'#dba374':'#160e0b'}" opacity="${i%3?.1:.19}" stroke-width="${i%3?.3:.45}" fill="none"/>`).join('')}
    </pattern>`;

  const cabinet=`${shadow(id,416,501,345,67,.65)}
    <rect x="54" y="58" width="701" height="499" rx="5" fill="#211813"/>
    <rect x="48" y="44" width="704" height="500" rx="5" fill="${id.url('wood')}"/>
    <rect x="48" y="44" width="704" height="500" rx="5" fill="${id.url('wood-grain')}"/>
    <path d="M51 47H749V540H51Z" stroke="#bb8d60" stroke-width="1" fill="none"/>
    <path d="M58 55H742V533H58Z" stroke="#221b15" stroke-width="2" fill="none"/>
    <path d="M73 65H727V526H73Z" fill="${id.url('rim')}"/>
    <path d="M82 72H719V518H82Z" fill="#242923"/>
    <rect x="87" y="76" width="626" height="438" fill="${id.url('lining')}"/>
    <rect x="87" y="76" width="626" height="438" fill="${id.url('fibres')}"/>
    <path d="M87 514V76H713" fill="none" stroke="#151c1a" stroke-width="9" opacity=".45" filter="${id.url('contact')}"/>
    <path d="M48 44L86 75M752 44L714 75M48 544L86 514M752 544L714 514" stroke="#281e15" stroke-width="1"/>
    ${[177,596].map(x=>`<g transform="translate(${x} 536)"><rect x="-20" y="-3" width="40" height="14" rx="2" fill="${id.url('brass')}"/><path d="M-18 3H18" stroke="#f2d5a0" opacity=".55" stroke-width=".7"/><circle cx="-13" cy="4" r="2" fill="#4b3925"/><circle cx="13" cy="4" r="2" fill="#4b3925"/></g>`).join('')}`;

  const wing=(mirror)=>`<g transform="translate(402 281) scale(${mirror} 1)">
    <g transform="translate(5 10)" fill="#252018" opacity=".4" filter="${id.url('contact')}"><use href="#${id('hind')}"/><use href="#${id('fore')}"/></g>
    <use href="#${id('hind')}" fill="${id.url('hind-color')}"/>
    <g clip-path="${id.url('hind-clip')}">
      <path d="M-192 60Q-183 139-142 153Q-99 175-41 73" fill="none" stroke="#e7c995" stroke-width="17"/>
      <path d="M-192 60Q-183 139-142 153Q-99 175-41 73" fill="none" stroke="#554037" stroke-width="7"/>
      <path d="M-176 54Q-172 120-138 136Q-91 153-36 67" fill="none" stroke="#d6aa70" stroke-width="3"/>
      <ellipse cx="-113" cy="82" rx="29" ry="23" transform="rotate(-37 -113 82)" fill="${id.url('eyespot')}"/>
      ${Array.from({length:14},(_,i)=>`<path d="M-17 20Q${-37-i*6} ${46+i*3} ${-58-i*10} ${132+Math.sin(i*.26)*30}" fill="none" stroke="${i%3?'#442c23':'#e4bc7e'}" stroke-width="${i%3?.6:.8}" opacity=".32"/>`).join('')}
      <use href="#${id('hind')}" fill="${id.url('scales')}"/>
    </g>
    <use href="#${id('fore')}" fill="${id.url('fore-color')}"/>
    <g clip-path="${id.url('fore-clip')}">
      <path d="M-272-145Q-238-87-224-31Q-141 17-18 2" stroke="#e9d4b0" stroke-width="22" fill="none"/>
      <path d="M-272-145Q-238-87-224-31Q-141 17-18 2" stroke="#493530" stroke-width="8" fill="none"/>
      <path d="M-250-166Q-214-96-208-48Q-133-4-20-8" stroke="#d6a486" stroke-width="8" fill="none"/>
      <path d="M-250-166Q-214-96-208-48Q-133-4-20-8" stroke="#eee0c0" stroke-width="1" fill="none" opacity=".65"/>
      <path d="M-267-121Q-248-143-229-123Q-245-106-267-121Z" fill="#343537"/>
      <path d="M-260-123Q-247-134-238-123" fill="none" stroke="#b8c6bc" stroke-width="2"/>
      ${Array.from({length:72},(_,i)=>{
        const x=-244+random()*218,y=-142+random()*162,w=2+random()*7;
        return `<path d="M${r2(x)} ${r2(y)}q${r2(w)} -4 ${r2(w+3)} 1q-3 4 ${r2(-w-3)} -1Z" fill="${i%3?'#ebc18d':'#2e2824'}" opacity="${r2(.09+random()*.18)}"/>`;
      }).join('')}
      ${Array.from({length:12},(_,i)=>`<path d="M-14-4Q${-90-i*3} ${-4-i*3.7} ${-226-i*2.6} ${-140+i*11.3}" fill="none" stroke="${i%4?'#442c28':'#f8d79e'}" stroke-width="${i%4?.65:.9}" opacity=".27"/>`).join('')}
      <path d="M-180-74Q-173-94-159-84L-114-48Q-109-38-124-37L-167-44Q-186-47-180-74Z" fill="#422d2a"/>
      <path d="M-176-73Q-171-87-160-79L-120-48Q-116-42-126-42L-166-48Q-180-51-176-73Z" fill="${id.url('window')}" stroke="#edd2a2" stroke-width="2"/>
      <path d="M-169-75L-131-47L-166-51Z" fill="#f4edd5" opacity=".36"/>
      <path d="M-171-78L-163-50M-168-71L-139-50" stroke="#746f5e" stroke-width=".5" opacity=".5"/>
      <use href="#${id('fore')}" fill="${id.url('scales')}"/>
      <use href="#${id('fore')}" fill="${id.url('wing-shade')}"/>
      <path d="M-12-19Q-112-79-230-148" stroke="#f4cd8c" stroke-width="2" opacity=".48" fill="none"/>
      <path d="M-234-145Q-151-117-23-24" stroke="#fff0c5" stroke-width="10" opacity=".09" fill="none" filter="${id.url('contact')}"/>
    </g>
    <use href="#${id('fore')}" fill="none" stroke="#d0b58e" stroke-width=".65" opacity=".8"/>
    <use href="#${id('hind')}" fill="none" stroke="#c2a27a" stroke-width=".6"/>
    ${Array.from({length:64},(_,i)=>{
      const t=i/63,x=-213+t*199,y=-3+Math.sin(t*Math.PI)*17;
      return `<path d="M${r2(x)} ${r2(y)}l${r2(-1+random()*2)} ${r2(2+random()*3)}" stroke="#d6bb88" stroke-width=".5" opacity=".6"/>`;
    }).join('')}
  </g>`;

  const moth=`${wing(1)}${wing(-1)}<g transform="translate(402 281)">
    <g stroke="#5c5038" fill="none" stroke-width="1.5"><path d="M-8 6L-31 24L-39 39M8 6L31 24L39 39M-8 30L-21 62L-35 71M8 30L21 62L35 71"/>
      <path d="M-6-29Q-28-71-68-85M6-29Q28-71 68-85"/>
      ${Array.from({length:31},(_,i)=>{
        const t=i/31,x=8+59*t,y=-34-65*t+14*t*t,l=3+11*Math.sin(t*Math.PI);
        return [-1,1].map(s=>`<path d="M${r2(s*x)} ${r2(y)}q${r2(s*l)} -5 ${r2(s*l)} ${r2(-l)}M${r2(s*x)} ${r2(y)}q${r2(s*l*.3)} 6 ${r2(s*l*.6)} ${r2(l*.6)}" stroke-width=".55"/>`).join('');
      }).join('')}
    </g>
    <path d="M-12 17Q-21 63-3 115Q0 123 4 112Q22 63 12 17Z" fill="${id.url('fur')}"/>
    ${Array.from({length:9},(_,i)=>`<path d="M${-13+i*.9} ${30+i*9}Q0 ${38+i*9} ${13-i*.9} ${30+i*9}" stroke="#51432f" stroke-width="1.1" opacity=".65" fill="none"/>`).join('')}
    ${Array.from({length:74},()=>{const y=26+random()*82,x=(random()-.5)*(28-y*.16);return `<path d="M${r2(x)} ${r2(y)}l${r2(x*.16)} ${r2(2+random()*3)}" stroke="${random()>.3?'#ecd19b':'#625139'}" stroke-width=".45" opacity=".6"/>`;}).join('')}
    <ellipse cy="-5" rx="17" ry="30" fill="${id.url('fur')}"/>
    ${Array.from({length:170},()=>{
      const a=random()*Math.PI*2,r=Math.sqrt(random()),x=Math.cos(a)*17*r,y=-5+Math.sin(a)*28*r;
      return `<path d="M${r2(x)} ${r2(y)}q${r2(x*.2)} 4 ${r2(x*.28)} ${r2(5+random()*4)}" stroke="${random()>.4?'#edd3a0':'#695335'}" stroke-width=".6" fill="none" opacity=".85"/>`;
    }).join('')}
    <ellipse cy="-35" rx="10" ry="9" fill="${id.url('fur')}"/><ellipse cx="-8" cy="-35" rx="3" ry="4" fill="#222724"/><ellipse cx="8" cy="-35" rx="3" ry="4" fill="#222724"/>
    <circle cx="-8.5" cy="-36" r=".8" fill="#b9c2a8"/><circle cx="7.5" cy="-36" r=".6" fill="#b9c2a8"/>
    <path d="M0-9L8 4" stroke="#161f1e" stroke-width="2" opacity=".5"/>
    <circle cy="-9" r="3.1" fill="${id.url('brass')}"/><circle cx="-.7" cy="-10" r=".9" fill="#fdf0bc"/>
  </g>`;

  const tag=`<g transform="translate(120 451) rotate(-2)">
    <path d="M4 4H203V53H4Z" fill="#333229" opacity=".25" filter="${id.url('contact')}"/>
    <path d="M0 0H204L203 49H0Z" fill="#e9dec1"/>
    <path d="M0 0H204V49H0Z" fill="${id.url('fibres')}"/>
    <text x="13" y="20" font-family="Georgia,serif" font-style="italic" font-size="15" fill="#544e3a">MothBake</text>
    <text x="13" y="34" font-family="Georgia,serif" font-size="8" fill="#7c6f51">Materials / layered content identities</text>
    <text x="191" y="20" text-anchor="end" font-family="Georgia,serif" font-size="12" fill="#8e7e5d">Si.</text>
  </g>`;
  const glass=`<rect x="86" y="75" width="628" height="439" fill="${id.url('glass')}"/>
    <g clip-path="${id.url('glass-clip')}"><path d="M99 68H254L493 514H336Z" fill="${id.url('reflection')}"/><path d="M266 68H281L519 514H504Z" fill="#fff9e0" opacity=".035"/>
      <path d="M93 93H353M93 94V278" stroke="#ffffed" stroke-width="1.2" opacity=".26" fill="none"/>
      <path d="M477 506H705V385" stroke="#e4f4ed" stroke-width=".8" opacity=".28" fill="none"/>
    </g><rect x="85" y="74" width="630" height="441" fill="none" stroke="#ccdbcd" stroke-width=".6" opacity=".5"/>`;
  const overscan='transform="translate(0 -300) scale(1 2)"';
  return {title:'The Material Imago',svg:svgRoot({title:'The Material Imago — an intricately scaled copper and parchment moth specimen beneath reflective glass in a polished walnut collector’s case',desc:'A conceptual still life for MothBake. Natural wing bands, translucent windows and layered scale patterns evoke generated materials and layered content identities. The museum specimen is editorial imagery.',defs,body:`${bleedRect(id.url('table'),overscan)}${bleedRect(id.url('grain'),`${overscan} opacity=".24"`)}<g transform="rotate(-3 400 300)">${cabinet}${moth}${tag}${glass}</g>${bleedRect(id.url('vignette'),overscan)}`})};
}
