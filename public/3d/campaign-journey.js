/* Authored junctions for the final five campaign regions. No reward locations. */
(function(root){'use strict';
const areas={
 '3:0':{api:'BFSnowbound',theme:'frost',roads:['climb','liftHouse','summit','camp','cave'],signs:[
  [-180,110,0,'MOUNTAIN TRAIL','Shelter ahead'],[-905,-785,130,'TRAIL FORK','Lift house west'],[145,-1920,380,'HEATH’S SHELTER','Crossing north'],[30,-4550,740,'CAVE APPROACH','Cornice ledges east']]},
 '3:1':{api:'BFIceCaves',theme:'frost',roads:['entry','laboratory','west','descent','channels','exit'],signs:[
  [-155,-1280,240,'RESEARCH STATION','Laboratory west'],[-1450,-2130,300,'LABORATORY','Spring chamber ahead'],[140,-3425,180,'SPRING CHAMBER','Lower channel west'],[140,-4790,180,'CAVE EXIT','Keep to the upper path']]},
 '4:0':{api:'BFIronHalls',theme:'ember',roads:['entry','floor','stores','machine','mold','exit'],signs:[
  [-280,250,100,'IRON HALLS','Worker station ahead'],[-405,-1370,100,'WORKER STATION','Stores west · gantry east'],[-1670,-2520,160,'WESTERN STORES','Service cart ahead'],[320,-3640,100,'MACHINE FLOOR','Follow the scrap track'],[-1030,-4500,100,'CASTING BAY','Cart crossing east']]},
 '4:1':{api:'BFGreatFurnace',theme:'ember',roads:['entry','main','transport','east','office','cooling','exit'],signs:[
  [-250,-620,120,'INSPECTION GATE','Maintenance bay west'],[-320,-2170,120,'BREAK ROOM','Worker floor · west route'],[-1165,-3320,120,'WORKER FLOOR','Return to the break room'],[1465,-4050,260,'EAST GALLERY','Command office east'],[275,-4860,120,'COOLING ROOM','Pedal ahead · mind gaps']]},
 '5:0':{api:'BFShipwreckShore',theme:'coast',roads:['beach','wreck','lookout','cave','rose'],signs:[
  [240,180,30,'OTTO’S LANDING','Boat left · repair bench ahead'],[165,-770,30,'SALVAGE ROUTES','Wreck west · lookout east'],[1890,-550,30,'STORAGE CAVE','Drain outside the doorway'],[-255,-2580,30,'SOUTHERN SHORE','Captain’s camp ahead']]},
 '5:1':{api:'BFThunderCliffs',theme:'coast',roads:['ascent','upper','arch','cave','tide'],signs:[
  [-180,100,40,'EASTERN STEPS','Climb to the high trail'],[-190,-880,340,'CARGO LIFT','Optional return to shore'],[-415,-1805,340,'HIGH TRAIL','Climb west · arch beyond'],[-1050,-2375,430,'UPPER CLIFFS','High trail east · tide below'],[125,-4650,850,'HYDRA LEDGES','Barrier ahead']]},
 '6:0':{api:'BFPalaceCourtyard',theme:'palace',roads:['entry','water','westGarden','eastGarden','eastBalcony','westBalcony','mirror'],signs:[
  [175,-1250,200,'FOUNTAIN COURT','Waterworks west'],[-1130,-850,80,'WATERWORKS','Wheel beside the channel'],[-1125,-2050,190,'WEST GARDENS','Lower lock ahead'],[855,-1160,160,'EAST GARDENS','Balcony via the court'],[100,-3330,380,'LIBRARY APPROACH','Sun mirrors ahead']]},
 '6:1':{api:'BFSkyLibrary',theme:'palace',roads:['main','maintenance','records','shelves','display','archive'],signs:[
  [140,-505,120,'SKY LIBRARY','Service passage west'],[150,-1280,200,'READING HALLS','Records gallery east'],[-290,-3070,300,'CENTRAL ARCHIVE','Reading hall north'],[440,-3270,300,'EAST TERRACES','Folding shelves beyond'],[-240,-4580,400,'GUARDIAN HALL','Seal at the far doors']]},
 '7:0':{api:'BFCastleGates',theme:'castle',roads:['landing','yard','supply','court','store'],signs:[
  [-150,-105,80,'CASTLE LANDING','Repair yard west'],[-660,-1080,120,'REPAIR YARD','Supply stores east'],[1190,-1750,120,'SUPPLY YARD','Gate approach west'],[190,-2910,200,'GATE CROSSING','Bridge brake down the drain'],[-320,-4540,280,'INNER COURT','Gatehouse ahead']]},
 '7:1':{api:'BFLongAscent',theme:'castle',roads:[],signs:[
  [-130,930,0,'THE LONG ASCENT','Follow the rising stair'],[1040,95,250,'FIRST LANDING','Service rooms east'],[-145,-1100,500,'LOWER CATCH','Release the next flight'],[-1040,95,750,'WORKER CELLS','Cell entrance west'],[145,-1100,1500,'UPPER CATCH','Throne above · broken steps'],[-140,1020,2000,'THRONE DOORS','Clear the final guards']]}
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
 if(g.zone===3&&g.area===0&&t.clueId==='ff.reflect'&&!f['ff.reflect.open']&&f['event.ff.reflect.clue']&&p.y<925){const route=[[0,-4720,740],...(g.peaks?.corniceRidge||[]).map(q=>[q.x,q.z,q.y])],n=nearestStep(g,route,route.length-1),q=route[Math.min(route.length-1,n.index+1)];return {...t,x:q[0],z:q[1],y:q[2],navLabel:'Climb the cornice ledges',journeyVia:true};}
 // The library's upper reading hall cannot be reached through its locked
 // doorway. The original Hugh/service-passage choice stays available.
 if(g.zone===6&&g.area===1&&!f['sl.access']&&p.y<140&&p.x<-500){const o=g.storyObjects.find(o=>o.key==='sl.maintenance');if(o)return {...o,navLabel:'Service latch'};}
 return t;
}
root.BFCampaignJourney={areas,entry,install,guide};
if(typeof module!=='undefined')module.exports=root.BFCampaignJourney;
})(typeof window!=='undefined'?window:globalThis);
