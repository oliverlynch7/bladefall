"""Local-only stage fixture and frame observer. Generated HTML never ships."""
from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'public/3d/index.html').read_text(encoding='utf-8')
isolation="""<base href="/3d/"><script>(()=>{function store(seed=[]){const d=new Map(seed);return {getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}}}Object.defineProperty(window,'localStorage',{value:store(new URLSearchParams(location.search).get('legacy')==='1'?LEGACY:[])});Object.defineProperty(window,'sessionStorage',{value:store()});})();</script>"""
isolation=isolation.replace('LEGACY',json.dumps(json.loads((r/'docs/art-validation/player-readiness-20261020/legacy-storage.json').read_text(encoding='utf-8'))))
s=s.replace('<head>','<head>'+isolation,1)
s=s.replace('function frame(ts){','let qaPrev=0;function frame(ts){const qaFrame={at:ts,gap:qaPrev?ts-qaPrev:0,start:performance.now()};qaPrev=ts;',1)
s=s.replace('   updateSparringHud();','   updateSparringHud();qaFrame.update=performance.now()-qaFrame.start;qaFrame.renderStart=performance.now();',1)
s=s.replace('  flushHero3D();                      //','  qaFrame.base=performance.now()-qaFrame.renderStart;qaFrame.heroStart=performance.now();flushHero3D();qaFrame.hero=performance.now()-qaFrame.heroStart; //',1)
s=s.replace('  requestAnimationFrame(frame);\n}', '  qaFrame.total=performance.now()-qaFrame.start;window.runtimeSample?.(qaFrame);requestAnimationFrame(frame);\n}',1)
s=s.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
hero=(r/'public/3d/hero3d.js').read_text(encoding='utf-8')
hero="function runtimeTime(key,fn){if(!window.runtimeProfileEnabled)return fn();const t=performance.now();try{return fn()}finally{const row=window.runtimeFunctions[key]||(window.runtimeFunctions[key]={calls:0,ms:0,max:0});const ms=performance.now()-t;row.calls++;row.ms+=ms;row.max=Math.max(row.max,ms)}}\n"+hero
for call in ['syncWorld(scene)','syncArenaArt(scene)','syncCombatArt(scene,cam)','syncMobs(scene, dt, cam)','syncNpcs(scene,dt)','syncRiftShards(scene)','syncCampaignRest(scene)','syncCampaignObjects(scene,dt)','syncProjectiles(scene)','syncProps(scene, dt)','renderer.render(scene, cam)']:
    hero=hero.replace(call+';',"runtimeTime('"+call.split('(')[0]+"',()=>"+call+');')
(r/'public/3d/.qa-runtime-hero.js').write_text(hero,encoding='utf-8')
s=s.replace('./hero3d.js?v=2344','./.qa-runtime-hero.js?v=profile')
s=s.replace('</body>','<script>'+(r/'scripts/qa-runtime-profile.js').read_text(encoding='utf-8')+'</script></body>')
(r/'public/3d/.qa-runtime-profile.html').write_text(s,encoding='utf-8')
(r/'public/3d/.qa-runtime-legacy.json').write_bytes((r/'docs/art-validation/player-readiness-20261020/legacy-storage.json').read_bytes())
print('Built isolated .qa-runtime-profile.html')
