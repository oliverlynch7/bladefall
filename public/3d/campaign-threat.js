/* Fixed world levels: returning with better gear remains rewarding. No player-level rubber banding. */
(function(root){'use strict';
const zone=z=>Math.max(0,Math.min(7,Math.floor(Number(z)||0)));
function level(z,area,boss=false){return 1+zone(z)*6+Math.max(0,Math.min(1,Number(area)||0))*2+(boss?3:0);}
function hp(z,area,boss){const lv=level(z,area,!!boss);return boss?2.85*Math.pow(1.002,lv-4):3.6*Math.pow(1.018,lv-1);}
function damage(z,area){return 1.35+.095*(level(z,area)-1);}
function bossDamage(z,area){return 1.18+.0035*(level(z,area,true)-4);}
function pacing(z){return {speed:1.08+zone(z)*.014,recovery:.90-zone(z)*.012,shoot:.90-zone(z)*.012};}
// Light impacts must not cancel every attack. A substantial hit can stagger a wind-up.
function stagger(e,dealt,kb,now){
 if(!e||e.boss||!e.ceKind||e.briarRole==='hex'||e.campaignRole==='caster'||e.ceState!=='wind'||(e.poiseReadyAt||0)>now||!(dealt>0))return false;
 if(dealt<e.maxHp*.18&&!(kb>=450))return false;e.poiseReadyAt=now+3;return true;
}
function knockback(e,kb){return kb*(e.ceKind&&['wind','strike'].includes(e.ceState)?.25:1);}
const api={level,hp,damage,bossDamage,pacing,stagger,knockback};root.BFCampaignThreat=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
