/* Sparse in-world destination signs; never reveal puzzle solutions or secrets. */
(function(root){'use strict';
const areas={
 '3:0':{api:'BFSnowbound',theme:'frost',roads:['climb','liftHouse','summit','camp','cave'],signs:[]},
 '3:1':{api:'BFIceCaves',theme:'frost',roads:['entry','laboratory','west','descent','channels','exit'],signs:[]},
 '4:0':{api:'BFIronHalls',theme:'ember',roads:['entry','floor','stores','machine','mold','exit'],signs:[]},
 '4:1':{api:'BFGreatFurnace',theme:'ember',roads:['entry','main','transport','east','office','cooling','exit'],signs:[]},
 '5:0':{api:'BFShipwreckShore',theme:'coast',roads:['beach','wreck','lookout','cave','rose'],signs:[]},
 '5:1':{api:'BFThunderCliffs',theme:'coast',roads:['ascent','upper','arch','cave','tide'],signs:[]},
 '6:0':{api:'BFPalaceCourtyard',theme:'palace',roads:['entry','water','westGarden','eastGarden','eastBalcony','westBalcony','mirror'],signs:[]},
 '6:1':{api:'BFSkyLibrary',theme:'palace',roads:['main','maintenance','records','shelves','display','archive'],signs:[]},
 '7:0':{api:'BFCastleGates',theme:'castle',roads:['landing','yard','supply','court','store'],signs:[]},
 '7:1':{api:'BFLongAscent',theme:'castle',roads:[],signs:[]}
};
const entry=g=>g&&!g.hub&&!g.trial&&!g.side&&!g.endless&&!g.delve&&!g.voyage&&!g.bonusActive&&!g.arena&&!g.bossRush&&!g.sprintFun&&!g.devKeep&&!g.devBriar?areas[g.zone+':'+g.area]:null;
function install(g){const a=entry(g);if(!a)return;g.obstacles=g.obstacles.filter(o=>o.journeySign===undefined);g.journeySigns=a.signs.map((s,i)=>{
 const [x,z,y,title,detail]=s;const floors=g.obstacles.filter(o=>o.kind==='plat'&&Math.abs(x-o.x)<=o.w/2&&Math.abs(z-o.z)<=o.d/2&&Math.abs(o.h-y)<45);
 const height=floors.length?Math.max(...floors.map(o=>o.h)):y;
 g.obstacles.push({kind:'col',x,z,y0:height,w:14,d:14,h:height+130,invisible:true,journeySign:i});return {x,z,y:height,title,detail};
 });}
function nearestStep(g,points,goalIndex){let best=Infinity,index=0;for(let i=0;i<=goalIndex;i++){const q=points[i],d=Math.hypot(q[0]-g.p.x,q[1]-g.p.z)+Math.abs(q[2]-g.p.y)*4;if(d<best){best=d;index=i;}}return {index,d:best};}
function guide(g,t){if(!t||!entry(g))return t;const f=g.storyState?.flags||{},p=g.p;
 // Do not point straight through two revolutions of the tower. Each landing
 // shares X/Z with another floor, so height must select the correct flight.
 if(g.zone===7&&g.area===1&&(['la.lower','la.upper','la.summit'].includes(t.key)||t.navLabel==='Clear the guards')){
  const points=root.BFLongAscent.path,goal=t.key==='la.lower'?60:t.key==='la.upper'?180:240,n=nearestStep(g,points,goal);
  if(n.d<310&&n.index<goal-3){let i=Math.min(goal,n.index+3);while(root.BFLongAscent.gaps.includes(i)&&i<goal)i++;const q=points[i];return {...t,x:q[0],z:q[1],y:q[2],navLabel:'Follow the rising stair',journeyVia:true};}
 }
 if(g.zone===3&&g.area===0&&t.clueId==='ff.reflect'&&!f['ff.reflect.open']&&p.y<925){const route=[[0,-4720,740],...(g.peaks?.corniceRidge||[]).map(q=>[q.x,q.z,q.y])],n=nearestStep(g,route,route.length-1),q=route[Math.min(route.length-1,n.index+1)];return {...t,x:q[0],z:q[1],y:q[2],navLabel:'Climb the cornice ledges',journeyVia:true};}
 // The library's upper reading hall cannot be reached through its locked
 // doorway. The original Hugh/service-passage choice stays available.
 if(g.zone===6&&g.area===1&&!f['sl.access']&&p.y<140&&p.x<-500){const o=g.storyObjects.find(o=>o.key==='sl.maintenance');if(o)return {...o,navLabel:'Service latch'};}
 return t;
}
root.BFCampaignJourney={areas,entry,install,guide};
if(typeof module!=='undefined')module.exports=root.BFCampaignJourney;
})(typeof window!=='undefined'?window:globalThis);
