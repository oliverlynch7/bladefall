async page=>{
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4331/3d/?mute=1');
await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;b.meta.camMode='far';b.openHub();b.enterZone(4);b.nextArea();b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;});
await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.deepArt==='ember');
const result=await page.evaluate(()=>{
 const b=__BF3,G=b.G,p=G.p,trace=[],checks=[],ok=(name,v)=>{if(!v)throw Error(name+' '+JSON.stringify({p:[p.x,p.z,p.y],trace:trace.slice(-8)}));checks.push(name)},step=()=>b.update(.016),clear=()=>{b.input.jx=0;b.input.jz=0;b.input.jump=false;b.input.jumpEdge=false;};
 G.storyState.flags['gf.cool.open']=true;b.briarSync();p.maxJumps=1;Object.assign(p,{x:520,z:-5480,y:120,vx:0,vz:0,vy:0,onGround:true});
 const pistons=G.movers.filter(m=>m.furnaceCache);ok('four counterweights start when cooled',pistons.length===4&&G.furnace.cachePistonsLive);
 const walk=(target,y,name,limit=260)=>{for(let i=0;i<limit;i++){const q=typeof target==='function'?target():target,dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<12&&p.onGround&&Math.abs(p.y-y)<4){clear();trace.push({name,at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],frames:i});return;}b.input.jx=d>9?dx/d:0;b.input.jz=d>9?dz/d:0;b.input.jump=false;step();}throw Error('cannot walk '+name+' '+JSON.stringify({p:[p.x,p.z,p.y],target:typeof target==='function'?target():target,trace}));};
 walk([860,-5400],35,'catch after a missed jump',350);walk([850,-5580],35,'under the box');b.briarRequest('world',{key:'gf.cache.release'});ok('lower grate cannot open the high box',!G.storyState.flags['gf.cache.open']);walk([740,-5490],65,'first return step');walk([690,-5490],100,'second return step');walk([600,-5480],120,'back at entry');ok('missed jump has a physical return',p.onGround&&p.y===120);
 const start={x:520,z:-5470,w:260,d:260,h:120},final={x:760,z:-5580,w:260,d:190,h:305};
 const edge=(src,dst)=>{const dx=dst.x-src.x,dz=dst.z-src.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d,reach=Math.min(Math.abs(ux)>1e-3?(src.w/2-22)/Math.abs(ux):999,Math.abs(uz)>1e-3?(src.d/2-22)/Math.abs(uz):999);return [src.x+ux*reach,src.z+uz*reach];};
 const waitNear=(dest,name)=>{clear();for(let i=0;i<650;i++){if(Math.hypot(dest.x-p.x,dest.z-p.z)<150){trace.push({name,wait:i});return;}step();}throw Error('no safe timing '+name+' '+JSON.stringify({p:[p.x,p.z,p.y],dest:[dest.x,dest.z,dest.h],trace}));};
 const jump=(dest,name)=>{b.input.jump=true;b.input.jumpEdge=true;for(let i=0;i<170;i++){const dx=dest.x-p.x,dz=dest.z-p.z,d=Math.hypot(dx,dz);b.input.jx=d>10?dx/d:0;b.input.jz=d>10?dz/d:0;step();if(i>8&&p.onGround&&Math.abs(p.y-dest.h)<5&&Math.abs(p.x-dest.x)<dest.w/2&&Math.abs(p.z-dest.z)<dest.d/2){clear();trace.push({name,at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],frames:i});return;}if(i>14&&p.onGround&&p.y<dest.h-25)break;}throw Error('missed '+name+' '+JSON.stringify({p:[p.x,p.z,p.y],dest:[dest.x,dest.z,dest.h],trace}));};
 let source=start;for(let i=0;i<pistons.length;i++){const dest=pistons[i];walk(()=>edge(source,dest),source.h,'takeoff '+(i+1),180);waitNear(dest,'timing '+(i+1));jump(dest,'piston '+(i+1));source=dest;}
 walk(()=>edge(source,final),source.h,'final takeoff',180);waitNear(final,'final timing');jump(final,'box landing');walk([815,-5580],305,'box lane');for(let i=0;i<45;i++){b.input.jx=-1;b.input.jz=0;step();}clear();ok('chest collision keeps the player outside the box',p.x>765&&p.y===305);walk([815,-5580],305,'return to box lane');
 const o=G.storyObjects.find(x=>x.key==='gf.cache.release');b.briarRequest('world',{key:o.key});ok('opening the high box reveals ED-04',!!G.storyState.flags['gf.cache.open']&&b.worldRiftShards().some(x=>x.id==='ED-04'&&x.y===305));walk([790,-5580],305,'shard');b.takeWorldRiftShard('ED-04');ok('shard is personal and provisional',G.pendingRiftShards.found.includes('ED-04')&&!b.meta.riftShards.includes('ED-04'));
 clear();return {checks,trace,counts:__world3d().counts};
});
if(errors.length)throw Error(JSON.stringify(errors));return {...result,errors};
}
