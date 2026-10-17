/* Small, model-relative face offsets. All saves normalize through this module. */
window.BFFaceOptions=(()=>{
 const keys=['eyeX','eyeY','eyeTilt','mouthX','mouthY','mouthTilt'];
 const normalize=v=>Object.fromEntries(keys.map(k=>[k,Number.isFinite(v?.[k])?Math.max(-100,Math.min(100,Math.round(v[k]))):0]));
 const signature=v=>JSON.stringify(normalize(v));
 const colors=['#8fd0ff','#5affc8','#ffd24a','#ff7a3a','#c47bff','#e8e8e8','#ff4a8a','#4be08a'];
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const random=()=>({eyeColor:pick(colors),mouthStyle:pick(['line','smile','frown','o','open']),browStyle:pick(['natural','straight','raised','focused','none']),faceAdjust:Object.fromEntries(keys.map(k=>[k,Math.round(Math.random()*20-10)*5]))});
 function markup(value){const v=normalize(value);return `<details class="face-adjust"><summary>Position &amp; tilt</summary>${[['Eyes','eye'],['Mouth','mouth']].map(([label,p])=>`<fieldset><legend>${label}</legend>${[['X','Left / right'],['Y','Lower / higher'],['Tilt','Tilt']].map(([k,text])=>`<label style="display:grid;grid-template-columns:120px 1fr 38px;align-items:center;gap:8px;font-size:14px">${text}<input style="width:100%;padding:0" type="range" min="-100" max="100" step="5" value="${v[p+k]}" data-face-adjust="${p+k}" aria-label="${label}: ${text}"><output>${v[p+k]}</output></label>`).join('')}</fieldset>`).join('')}<button type="button" class="ccpick" data-face-reset>Reset position &amp; tilt</button></details>`;}
 function wire(root,value,onChange){root.querySelectorAll('[data-face-adjust]').forEach(el=>el.oninput=()=>{value[el.dataset.faceAdjust]=Number(el.value);el.nextElementSibling.textContent=el.value;onChange();});root.querySelector('[data-face-reset]')?.addEventListener('click',()=>{Object.assign(value,normalize());root.querySelectorAll('[data-face-adjust]').forEach(el=>{el.value=0;el.nextElementSibling.textContent='0';});onChange();});}
 // Network appearances are independent of the viewer's own saved face.
 const appearance=v=>({
  eyeColor:typeof v?.eyeColor==='string'&&/^#[0-9a-f]{6}$/i.test(v.eyeColor)?v.eyeColor:'#8fd0ff',
  mouthStyle:['line','smile','frown','o','open'].includes(v?.mouthStyle)?v.mouthStyle:'line',
  browStyle:['natural','straight','raised','focused','none'].includes(v?.browStyle)?v.browStyle:'natural',
  faceAdjust:normalize(v?.faceAdjust)
 });
 return {normalize,signature,random,markup,wire,appearance};
})();
