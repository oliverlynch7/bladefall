from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
s=(root/'public/3d/index.html').read_text(encoding='utf8')
isolation="""<base href='/3d/'><script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:s});Object.defineProperty(window,'sessionStorage',{value:s});})();</script>"""
s=s.replace('<head>','<head>'+isolation,1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
save=json.loads((root/'docs/art-validation/hollow-review-20261015/canyon-arrival-before.json').read_text(encoding='utf8'))['save']
payload="""<pre id='mapResult' style='position:fixed;bottom:10px;left:10px;background:#102331;color:white;z-index:200001;max-height:35vh;overflow:auto'>Loading</pre><script>
(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)),rows=[],out=document.getElementById('mapResult');while(!window.__BF3||!window.HERO3D?.ready)await wait(50);const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,SAVE);b.continueRun();b.G._tutorialSafe=true;await wait(1500);
try{const check=(v,label)=>{rows.push({label,pass:!!v});if(!v)throw Error(label);};check(b.G.p.level===4&&b.G.p.xp===52&&b.meta.classes.warrior.rank===4&&b.meta.gold===1145,'old save retains level and gold');const c=document.getElementById('localMap').getContext('2d'),rotate=c.rotate,turns=[];c.rotate=function(a){turns.push(a);return rotate.call(this,a);};
for(const mode of ['far','shoulder','fps']){b.meta.camMode=mode;for(const h of [0,Math.PI/2,Math.PI,-Math.PI+.001,Math.PI-.001]){b.G.p.yaw=h;b.G.camYaw=h+.2;turns.length=0;BFGuidedTutorial.map(b.G,'play');const expected=__BF_MAP_PARTY().heading;check(turns[0]===expected+Math.PI,mode+' immediate turn '+h.toFixed(3));check(turns[1]===expected-b.G.p.yaw,mode+' accurate player arrow');}}c.rotate=rotate;b.meta.camMode='far';out.textContent=JSON.stringify({done:true,rows,version:b.snap().version},null,2);
}catch(e){out.textContent=JSON.stringify({error:String(e.stack),rows},null,2);}})();</script>""".replace('SAVE',json.dumps(save))
(root/'public/3d/.qa-minimap.html').write_text(s.replace('</body>',payload+'</body>'),encoding='utf8')
print('Built isolated real-WebGL minimap test.')

