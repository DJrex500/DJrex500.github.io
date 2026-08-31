import{S as E,B as y,t as c,f as S}from"./skins-DeQbMvcs.js";const v=[["body","Body"],["shirt","Shirt"],["pants","Pants"],["skin","Skin"],["hair","Hair"],["visor","Visor"],["boots","Boots"],["gloves","Gloves"]],o=E.map(e=>({...y,...e}));let r=0;const p=document.getElementById("gallery"),g=document.getElementById("fields"),u=document.getElementById("skin-name"),m=document.getElementById("code-out"),f=document.getElementById("mannequin");function a(){return o[r]}function i(e){const n=v.map(([t])=>`    ${t}: 0x${Number(e[t]).toString(16).padStart(6,"0")},`);return`{
    name: '${e.name.replace(/'/g,"\\'")}',
${n.join(`
`)}
  }`}function b(){return`export const SKINS = [
${o.map(e=>"  "+i(e).replace(/\n/g,`
  `)).join(`,
`)}
];`}function $(e){const n={hair:e.hair,head:e.skin,visor:e.visor,torso:e.shirt,stripe:e.body,"shoulder-l":e.body,"shoulder-r":e.body,"arm-l":e.body,"arm-r":e.body,"glove-l":e.gloves,"glove-r":e.gloves,pants:e.pants,"leg-l":e.pants,"leg-r":e.pants,"boot-l":e.boots,"boot-r":e.boots};Object.entries(n).forEach(([t,s])=>{const d=f.querySelector("."+t);d&&(d.style.background=c(s))})}function h(){p.innerHTML="",o.forEach((e,n)=>{const t=document.createElement("button");t.className="skin-btn"+(n===r?" active":""),t.type="button",t.innerHTML=`<div class="swatches">
      <span class="swatch" style="background:${c(e.body)}"></span>
      <span class="swatch" style="background:${c(e.shirt)}"></span>
      <span class="swatch" style="background:${c(e.pants)}"></span>
    </div><span>${e.name}</span>`,t.addEventListener("click",()=>{r=n,l()}),p.appendChild(t)})}function I(){const e=a();u.value=e.name,g.innerHTML="",v.forEach(([n,t])=>{const s=document.createElement("label");s.className="field",s.innerHTML=`<span>${t}</span>
      <input type="color" data-key="${n}" value="${c(e[n])}" />
      <span class="hex">0x${Number(e[n]).toString(16).padStart(6,"0")}</span>`,s.querySelector("input").addEventListener("input",d=>{e[n]=S(d.target.value),l()}),g.appendChild(s)})}function l(){h(),I(),$(a()),m.value=`// Paste this object into SKINS in src/game/skins.js
${i(a())}`}u.addEventListener("input",()=>{a().name=u.value||"Untitled",h(),m.value=`// Paste this object into SKINS in src/game/skins.js
${i(a())}`});document.getElementById("btn-new").addEventListener("click",()=>{o.push({...y,name:`Custom ${o.length+1}`}),r=o.length-1,l()});document.getElementById("btn-dupe").addEventListener("click",()=>{const e={...a(),name:`${a().name} Copy`};o.splice(r+1,0,e),r+=1,l()});document.getElementById("btn-copy-one").addEventListener("click",async()=>{await navigator.clipboard.writeText(i(a()))});document.getElementById("btn-copy-all").addEventListener("click",async()=>{await navigator.clipboard.writeText(b()),m.value=b()});l();
