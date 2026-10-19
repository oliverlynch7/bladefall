/* One close affordance; each screen keeps its own exit/cleanup authority. */
(function(root){'use strict';
const safeIds=['classChoiceBack','tutSkip','resBtn','delNo','skipNo','descBack','journalClose','stashBtn','hubBtn','backC','npcLeave','wsBack','statBack','prback'];
function target(host){
 const buttons=[...host.querySelectorAll('button:not([data-menu-close])')].filter(b=>!b.disabled&&b.getClientRects().length&&!b.closest('[hidden],[inert]'));
 return buttons.find(b=>safeIds.includes(b.id))||root.BFMenuKeys?.backButton({querySelectorAll:()=>buttons})||buttons.find(b=>/^(?:back|cancel|close|leave (?:conversation|table|chess))\b/i.test(b.textContent.trim())&&!/^cancel pre-move/i.test(b.textContent.trim()));
}
function mount(host,resolve){
 if(!host)return;
 let corner=[...host.children].find(e=>e.classList.contains('menu-close-corner'));
 if(!corner){corner=document.createElement('div');corner.className='menu-close-corner';const button=document.createElement('button');button.type='button';button.dataset.menuClose='';button.className='menu-close-x';button.textContent='\u00d7';button.setAttribute('aria-label','Close menu');corner.append(button);host.prepend(corner);host.classList.add('menu-close-host');}
 const button=corner.firstElementChild;
 const get=resolve||(()=>target(host));
 const action=get();const disabled=!action;
 if(button.disabled!==disabled)button.disabled=disabled;
 button.title=disabled?'Choose an option to continue':'Close \u00b7 Q / Esc';
 button.onclick=e=>{e.preventDefault();e.stopPropagation();const next=get();if(typeof next==='function')next();else if(next&&next.isConnected&&!next.disabled)next.click();};
 return button;
}
function overlay(){const host=document.querySelector('#ovcard > .card');if(!host||root.__BF3?.mode==='title')return;mount(host);root.BFMenuExperience?.refresh(host);}
root.BFMenuClose={mount,target,refresh:overlay};
function init(){const ov=document.getElementById('ovcard');if(!ov)return;let queued=false;new MutationObserver(records=>{if(!records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))return;if(queued)return;queued=true;queueMicrotask(()=>{queued=false;overlay();});}).observe(ov,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']});overlay();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
if(typeof module!=='undefined')module.exports={target,mount};
})(typeof window!=='undefined'?window:globalThis);
