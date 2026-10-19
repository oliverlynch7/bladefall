/* Chest identity is independent of difficulty, gear gates, and gold-find. */
(function(){
const order=['common','uncommon','rare','epic','legendary'];
const contents=[[92,8,0,0,0],[2,90,8,0,0],[0,2,90,8,0],[0,0,2,90,8],[0,0,0,0,100]];
const depths=[[70,25,5,0,0],[45,40,14,1,0],[20,45,30,5,0],[10,30,49,10,1],[0,15,63,20,2]];
function pick(weights,r){let n=Math.max(0,Math.min(.999999999,r))*100;for(let i=0;i<weights.length;i++){n-=weights[i];if(n<0)return order[i];}return 'legendary';}
function cap(rarity,zone){return order[Math.min(Math.max(0,order.indexOf(rarity)),1+Math.floor(Math.max(0,zone)/2),4)];}
function reward(grade,challenge,r,zone=null){const i=Math.max(0,order.indexOf(grade)),w=contents[i].slice();if(challenge&&i>0&&i<4){w[i]+=w[i-1];w[i-1]=0;}const result=pick(w,r);return zone===null?result:cap(result,zone);}
function depth(f,r){return pick(depths[f<=5?0:f<=10?1:f<=20?2:f<=30?3:4],r);}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
// Existing authored climb endpoints. Their minimum is explicit, not guessed from height.
const challenges=new Set(['1100,-55','-2210,-1840','-600,-2530','650,-1200','210,-3900','600,-4140','700,-3660','-650,-2500','700,-3340']);
function campaign(ch,zone,area){const key=Math.round(ch.x)+','+Math.round(ch.z);const challenge=!!(ch.challenge||ch.bonus||challenges.has(key));
 const roll=hash(zone+':'+area+':'+key);
 const rarity=cap(ch.rarity||(challenge?order[Math.min(4,1+Math.floor(zone/2))]:zone<2?(roll<.65?'common':'uncommon'):zone<4?(roll<.5?'uncommon':'rare'):zone<6?(roll<.55?'rare':'epic'):(roll<.75?'epic':'legendary')),zone);
 return {rarity,challenge};}
window.BFChestRules={order,contents,depths,pick,reward,depth,hash,campaign,cap};
})();
