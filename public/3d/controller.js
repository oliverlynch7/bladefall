/* Standard Gamepad API setup. Configuration is global, never part of a character. */
window.BFController=(()=>{
 const defaults={jump:0,dodge:1,attack:2,interact:3,skill1:4,skill2:5,skill3:6,skill4:7,bag:8,pause:9,journal:10,partyTeleport:11};
 const names={jump:'Jump (hold for height)',dodge:'Dodge',attack:'Attack / hold to charge',interact:'Interact',skill1:'Skill 1',skill2:'Skill 2',skill3:'Skill 3',skill4:'Skill 4',bag:'Bag',pause:'Pause',journal:'Journal',partyTeleport:'Hold: teleport to friend'};
 const xbox=['A','B','X','Y','LB','RB','LT','RT','View','Menu','LS click','RS click','D-pad up','D-pad down','D-pad left','D-pad right'];
 const ps=['Cross ✕','Circle ○','Square □','Triangle △','L1','R1','L2','R2','Share / Create','Options','L3','R3','D-pad up','D-pad down','D-pad left','D-pad right'];
 let config,save,gp=null,prev=[],capture=null,dialog=null,navAt=0,blocked=true,lastContext='',device='';
 function setup(meta,persist){config=meta.controller||(meta.controller={});save=persist;config.bindings={...defaults,...config.bindings};}
 function label(i){const sony=config?.labels==='ps'||config?.labels!=='xbox'&&/sony|playstation|dualshock|dualsense|054c/i.test(gp?.id||'');return (sony?ps:xbox)[i]||`Button ${i+1}`;}
 function dead(v){const d=Number(config.deadzone??.2);return Math.abs(v)<=d?0:Math.sign(v)*(Math.abs(v)-d)/(1-d);}
 function read(context){
  const pads=Array.from(navigator.getGamepads?.()||[]).filter(p=>p?.connected);
  gp=pads.find(p=>p.index===Number(config.device??-1))||pads[0]||null;
  if(!gp||document.hidden||!document.hasFocus()){if(dialog)dialog.querySelector('#padStatus').textContent='No active controller. Focus this window and press a button.';prev=[];blocked=true;return null;}
  const id=gp.index+':'+gp.id;if(device!==id||lastContext!==context){blocked=true;device=id;lastContext=context;}
  const buttons=gp.buttons.map(b=>b.pressed||b.value>.55),edges=buttons.map((b,i)=>b&&!prev[i]);prev=buttons;
  if(blocked){if(!buttons.some(Boolean))blocked=false;edges.fill(false);}
  if(dialog){
   const status=dialog.querySelector('#padStatus');status.textContent=`${gp.id} · ${gp.mapping==='standard'?'Standard layout':'Unrecognized layout — test and rebind below'}\n${buttons.map((v,i)=>v?label(i):'').filter(Boolean).join(' · ')||'No buttons held'} · Sticks: ${gp.axes.map(v=>v.toFixed(2)).join(', ')}`;
   if(capture){const i=edges.findIndex((v,i)=>v&&i<12);if(i>=0){const old=config.bindings[capture];for(const a in config.bindings)if(a!==capture&&config.bindings[a]===i)config.bindings[a]=old;config.bindings[capture]=i;capture=null;save();refresh();}return null;}
  }
  const on=a=>!blocked&&!!buttons[config.bindings[a]],edge=a=>!!edges[config.bindings[a]];
  return {gp,on,edge,buttons,edges,x:dead(gp.axes[config.moveX??(config.swap?2:0)]||0),z:dead(gp.axes[config.moveY??(config.swap?3:1)]||0),rx:dead(gp.axes[config.lookX??(config.swap?0:2)]||0),ry:dead(gp.axes[config.lookY??(config.swap?1:3)]||0)};
 }
 function menu(p){
  if(!p)return;const root=dialog||document;const els=[...root.querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
  const focused=document.activeElement;if(focused?.type==='range'&&(p.edges[14]||p.edges[15])){focused.value=+focused.value+(p.edges[15]?1:-1)*Number(focused.step||1);focused.dispatchEvent(new Event('change'));return;}
  const t=performance.now(),dir=p.buttons[13]||p.buttons[15]||p.z>.55||p.x>.55?1:p.buttons[12]||p.buttons[14]||p.z<-.55||p.x<-.55?-1:0;
  if(dir&&t>navAt){navAt=t+220;const i=els.indexOf(document.activeElement);els[(i+dir+els.length)%els.length]?.focus();document.activeElement?.scrollIntoView({block:'nearest'});}
  if(p.edges[0]){const e=document.activeElement;if(els.includes(e)){if(e.tagName==='SELECT'){e.selectedIndex=(e.selectedIndex+1)%e.options.length;e.dispatchEvent(new Event('change'));}else e.click();}else els[0]?.focus();}
  if(p.edges[1]){if(dialog){dialog.close();return;}window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true}));}
 }
 function refresh(){if(!dialog)return;dialog.querySelectorAll('[data-bind]').forEach(b=>b.textContent=capture===b.dataset.bind?'Press a controller button…':label(config.bindings[b.dataset.bind]));}
 function open(meta,persist){setup(meta,persist);if(dialog)return;dialog=document.createElement('dialog');dialog.style.cssText='width:min(680px,92vw);max-height:85vh;overflow:auto;background:#172030;color:#fff;border:2px solid #bca36c;border-radius:14px;padding:24px;font:16px system-ui;z-index:99999';
 dialog.innerHTML=`<style>dialog button{min-height:36px;background:#283a51;color:white;border:1px solid #74859a;border-radius:6px;padding:5px 12px}dialog :focus-visible{outline:3px solid #ffd275;outline-offset:2px}dialog::backdrop{background:#0009}</style><h2>Controller setup</h2><p>Connect by USB or Bluetooth, then press a button here. Xbox and PlayStation controllers use the same layout.</p><p>Menus: left stick / D-pad to move · bottom face button to select · right face button to go back. Keyboard and mouse remain available.</p><pre id="padStatus" style="white-space:pre-wrap">No controller detected. Focus this window and press a button.</pre><label><input id="padEnabled" type="checkbox" ${meta.padOff?'':'checked'}> Enable controller</label><p><label>Button labels <select id="padLabels"><option value="auto">Automatic</option><option value="xbox">Xbox</option><option value="ps">PlayStation</option></select></label></p><p><label>Stick drift deadzone <input id="padDead" type="range" min="0.05" max="0.5" step="0.05" value="${config.deadzone??.2}"></label></p><p><label>Camera speed <input id="padSens" type="range" min="0.5" max="2" step="0.1" value="${config.sensitivity??1}"></label></p><p><label><input id="padInvert" type="checkbox" ${config.invert?'checked':''}> Invert camera up/down</label> <label><input id="padSwap" type="checkbox" ${config.swap?'checked':''}> Swap sticks</label></p><details><summary>Advanced: nonstandard controller axes</summary><p>Use the live stick numbers above to identify each axis.</p>${["moveX","moveY","lookX","lookY"].map((a,i)=>`<label>${["Move sideways","Move forward","Look sideways","Look up/down"][i]} <input data-axis="${a}" type="number" min="0" max="15" value="${config[a]??i}"></label><br>`).join("")}</details><p>Select an action, then press its new button. Used buttons swap assignments. D-pad remains movement/menu navigation.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${Object.keys(defaults).map(a=>`<span>${names[a]}</span><button data-bind="${a}"></button>`).join('')}</div><p id="padHint"></p><button id="padCancel">Cancel rebinding</button> <button id="padReset">Restore defaults</button> <button id="padClose">Done</button>`;
 document.body.append(dialog);dialog.showModal();dialog.querySelector('#padLabels').value=config.labels||'auto';
 const bind=(id,fn)=>dialog.querySelector('#'+id).onchange=e=>{fn(e.target);save();refresh();};
 bind('padEnabled',e=>meta.padOff=!e.checked);bind('padLabels',e=>config.labels=e.value);bind('padDead',e=>config.deadzone=+e.value);bind('padSens',e=>config.sensitivity=+e.value);bind('padInvert',e=>config.invert=e.checked);bind('padSwap',e=>config.swap=e.checked);
 dialog.querySelectorAll('[data-axis]').forEach(e=>e.onchange=()=>{config[e.dataset.axis]=Math.max(0,Math.min(15,+e.value||0));save();});
 dialog.querySelectorAll('[data-bind]').forEach(b=>b.onclick=()=>{capture=b.dataset.bind;blocked=true;refresh();});
 dialog.querySelector('#padCancel').onclick=()=>{capture=null;refresh();};dialog.querySelector('#padReset').onclick=()=>{config.bindings={...defaults};capture=null;save();refresh();};dialog.querySelector('#padClose').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{dialog.remove();dialog=null;capture=null;blocked=true;});refresh();
 }
 return {setup,read,menu,open,label,get active(){return !!dialog;},get config(){return config;},defaults};
})();
