/* Encounter identity and personal chest rewards. Levels follow the existing world scaling;
   they never scale up with the player's own level or multiply enemy stats a second time. */
(function(root){'use strict';
 const order=['common','uncommon','rare','epic','legendary'];
 function level(g,e={}){
  if(g?.trial)return ['warrior','ranger','mage'].includes(g.trial)?1:8;
  let base=g?.bossRush?1+Math.max(0,g.brIdx||0)*6+(g.brTier==='brutal'?8:0):g?.escape?1+Math.max(0,(g.floor||1)-1)*7+Math.max(0,(g.escape.tier||1)-1)*8:
   g?.endless||g?.delve?1+Math.max(0,(g.floor||1)-1)*2:
   1+Math.max(0,g?.zone||0)*6+Math.max(0,g?.area||0)*2;
  return Math.round(base+(e.boss?3:e.elite||e.campaignElite?2:0));
 }
 // A usable trickle: ordinary foes12–18%, elites35–45%; bosses guarantee a chest.
 function dropChance(e,lv){if(e.dummy||e.practice||e.bot||e.duel)return 0;if(e.boss||e.mimicE||e.kind==='goblin')return 1;
  const t=Math.min(1,Math.max(0,(lv-1)/50));return (e.elite||e.campaignElite)?(.35+.10*t):(.12+.06*t);}
 function grade(e,lv,r){const strong=!!(e.boss||e.mimicE||e.kind==='goblin'),elite=!!(e.elite||e.campaignElite);
  const band=lv<13?0:lv<25?1:lv<37?2:3;
  const weights=strong?[[20,80,0,0,0],[0,42,55,3,0],[0,5,69,25,1],[0,0,49,47,4]][band]:elite?
   [[55,45,0,0,0],[25,65,10,0,0],[5,44,48,3,0],[0,24,65,10,1]][band]:
   [[72,28,0,0,0],[75,24,1,0,0],[45,48,7,0,0],[25,55,19,1,0]][band];
  let n=Math.max(0,Math.min(.999999999,Number(r)||0))*100;for(let i=0;i<5;i++){n-=weights[i];if(n<0)return order[i];}return order[4];
 }
 function gold(n){n=Math.max(0,Number(n)||0);return n<1000000?Math.floor(n).toLocaleString('en-US'):new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);}
 const api={level,chance:dropChance,grade,gold};root.BFEncounterRewards=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
