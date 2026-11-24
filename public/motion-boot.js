/* <2 KB boot: view-transition types & props */
(()=>{
const D=document,R=D.documentElement,W=window,L=location,N=navigator,C=R.classList,O=R.dataset,K='si.nav.dir',U='si.vt.u',Z='si.vt.r';
const on=(t,e,f,c)=>t.addEventListener(e,f,c);
let B='';
try{const x=D.currentScript?.src;if(x)B=new URL(x,L.href).pathname.replace(/\/motion-boot\.js$/,'');}catch{}
const st=(k,v)=>{try{const S=sessionStorage;return v==null?S.getItem(k)||'':v?S.setItem(k,v):S.removeItem(k);}catch{return '';}};
const rt=u=>{
let p=L.pathname;try{p=new URL(u||L.href,L.href).pathname;}catch{}
if(B&&(p===B||p.startsWith(B+'/')))p=p.slice(B.length);
p=p.replace(/^\/ussysite6(?=\/|$)/,'').replace(/\/+$/,'')||'/';
if(p==='/')return 'fold';
const m=p.match(/^\/issues\/[^/]+(?:\/([^/]+))?$/);
return !m?'':!m[1]?'ink-wipe':m[1]==='last-page'?'dusk':'press';
};
on(D,'click',e=>{
const a=e.target?.closest?.('a[href]');
if(!a||e.metaKey||e.ctrlKey||a.target==='_blank')return;
st(K,a.dataset.dir||'');st(U,a.href);
},true);
on(W,'pageswap',()=>st(Z,O.rizz==='max'?'max':''));
on(W,'pagereveal',e=>{
const vt=e.viewTransition;if(!vt)return;
const u=st(U),a=W.navigation?.activation;
let d=st(K);st(K,'');st(U,'');
if(st(Z)==='max')O.rizz='max';
d=d||(a?.from&&a.entry?.index<a.from.index?'backward':'forward');
const k=rt(a?.entry?.url||L.href||u);
const lt=O.fx==='lite'||!matchMedia('(pointer:fine)').matches||N.deviceMemory<4||N.hardwareConcurrency<4||!!N.connection?.saveData;
C.add('is-vt-arrival','is-vt-active');lt&&C.add('is-vt-lite');
vt.types.add(d);k&&vt.types.add(k);
const ls=[...({press:['pt','pb','sm'],'ink-wipe':['ik'],fold:['cr'],dusk:['ir']}[k]||[])],els=[];
if(!lt){ls.push('reg');O.rizz==='max'&&ls.push('sc');}
if(D.body)for(const c of ls){const el=D.createElement('div');el.className='fx-vt-'+c;el.setAttribute('aria-hidden','true');els.push(D.body.appendChild(el));}
const end=()=>{C.remove('is-vt-active','is-vt-lite');els.forEach(x=>x.remove());};
vt.finished?vt.finished.then(end,end):end();
});
})();
