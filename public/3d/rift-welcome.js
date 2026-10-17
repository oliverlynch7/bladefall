/* One short, local introduction. It never owns a party conversation or a shared reward. */
(()=>{'use strict';let active=null;
function close(){if(active)BFHubDialogue.close(false,true);}
function tick(g,mode,api){
 if(active&&active.g!==g){close();return false;}
 const info=g?.riftWelcomePending;if(!info||mode!=='play'||BFHubDialogue.active||g.p?.dead||g.p?.downed)return false;
 delete g.riftWelcomePending;if(api.meta.riftWelcomeSeen)return false;
 const spot=api.spot(g.p),n={id:'riftkeeper',name:'Rift Keeper’s Spirit',x:spot.x,y:spot.y,z:spot.z};g.riftSpirit=n;
 const pages=[`I am the Rift Keeper. These shards rebuild forgotten training rifts. Find all five across both parts of ${info.region}. Some are hidden; others are gifts for helping people.`,`Return to the Waystation’s Rift Hall. Win the trial to unlock ${info.className} and a new set of combat skills. Finish this area to save the shards you carry.`];
 const source={nodes:Object.fromEntries(pages.map((text,i)=>['rift.welcome.'+i,{text,choices:i===0?[{id:'next',text:'What can I unlock? · '+api.hint('interact')}]:[]}]))};
 let page=0;const a={meta:api.meta,localRiftIntro:true,location:'A RIFT SHARD’S PROMISE',leaveLabel:'Keep exploring · '+api.hint('interact'),player:()=>g.p,eye:()=>g.eye?{...g.eye}:null,enter:api.enter,save(){},requestClose:close,
  leave(){if(g.riftSpirit===n)delete g.riftSpirit;const same=active?.g===g;active=null;if(same&&api.current()===g){api.meta.riftWelcomeSeen=true;api.save();api.resume();}},choose(){page=1;present();}};
 function present(){BFHubDialogue.present(n,a,source,{lineId:'rift.welcome.'+page,text:pages[page],choices:source.nodes['rift.welcome.'+page].choices,lastChoice:''},true);}
 active={g};present();return true;
}
// Same rebound interact control throughout; no mandatory mouse target or timer.
document.addEventListener('keydown',e=>{if(!active||e.repeat)return;if(window.__BF3?.keyAction(e.code)!=='interact')return;e.preventDefault();e.stopImmediatePropagation();const reveal=document.getElementById('hubReveal');if(reveal&&!reveal.hidden){reveal.click();return;}const next=document.querySelector('#hubChoices button:not(:disabled)');next?.click();},true);
window.BFRiftWelcome={tick,close,get active(){return !!active;}};
})();
