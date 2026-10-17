/* Fixed encounter progression: better gear still makes earlier areas easier. */
(function(root){'use strict';
const health=[3,3.2,3.5,3.8,4.1,4.4,4.7,5];
const bosses=[1.65,1.3,1.15,1.1,1.05,1,1,1];
function hp(zone,area,boss){
 const z=Math.max(0,Math.min(7,Math.floor(Number(zone)||0)));
 return boss?bosses[z]:health[z]*(area===1?1.08:1);
}
function damage(zone,area){return 1.10+Math.max(0,Math.min(7,Math.floor(Number(zone)||0)))*.12+(area===1?.04:0);}
const api={hp,damage};root.BFCampaignThreat=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
