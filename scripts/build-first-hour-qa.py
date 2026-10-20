"""Build local-only observability pages; generated files must never ship."""
from pathlib import Path
import re

r = Path(__file__).resolve().parents[1]
s = (r/'public/3d/index.html').read_text(encoding='utf-8')
s = s.replace('<head>', '<head><base href="/3d/"><script>window.firstHourErrors=[];addEventListener("error",e=>firstHourErrors.push(e.message));addEventListener("unhandledrejection",e=>firstHourErrors.push(String(e.reason)));</script>', 1)
s = s.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
# Instrumented test controls need the cursor; native mouse capture is tested separately.
s = s.replace('function regrabCam(){', 'function regrabCam(){return;',1)
for name in ['update','flushHero3D','flushBatch','flushDeferred','resolveObstacles','enemySupport','enemyRouteEdge','enemyRouteContext','moveGroundEnemy','hudUpdate','questUpdate']:
    needle = 'function '+name+'('
    assert needle in s, name
    s = s.replace(needle, 'function '+name+'(...args){const t=performance.now();try{return __hour_'+name+'.apply(this,args);}finally{const q=window.firstHourPhases;if(q)q["'+name+'"]=(q["'+name+'"]||0)+performance.now()-t;}}\nfunction __hour_'+name+'(', 1)
s = s.replace('function frame(ts){', 'function frame(ts){if(window.firstHourManual){lastT=ts;acc=0;requestAnimationFrame(frame);return;}', 1)
s = s.replace('function render(t){', 'function render(t){const start=performance.now();try{return __hourRender(t);}finally{const q=window.firstHourPhases;if(q)q.render=(q.render||0)+performance.now()-start;}}\nfunction __hourRender(t){',1)
hero = (r/'public/3d/hero3d.js').read_text(encoding='utf-8')
hero = 'const hourTime=(n,fn)=>{const t=performance.now();try{return fn();}finally{const q=window.firstHourPhases;if(q)q[n]=(q[n]||0)+performance.now()-t;}};\n'+hero
for name,args in [('syncWorld','scene'),('syncMobs','scene, dt, cam'),('syncNpcs','scene,dt'),('syncCampaignObjects','scene,dt'),('syncCompanions','scene,dt'),('syncRiftShards','scene'),('syncProjectiles','scene'),('syncProps','scene, dt'),('syncClass','')]:
    needle = name+'('+args+');'
    hero = hero.replace(needle,'hourTime("'+name+'",()=>'+needle[:-1]+');')
hero = hero.replace('renderer.render(scene, cam);', 'hourTime("threeRender",()=>renderer.render(scene,cam));')
(r/'public/3d/.qa-hero-first-hour.js').write_text(hero,encoding='utf-8')
s,n = re.subn(r'hero3d\.js\?v=[^"\s]+', '.qa-hero-first-hour.js?v=current', s)
assert n>=1
payload = (r/'scripts/qa-first-hour-page.js').read_text(encoding='utf-8')
page=s.replace('</body>', '<script>'+payload+'</script></body>')
(r/'public/3d/.qa-first-hour.html').write_text(page,encoding='utf-8')
isolated='<script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,"localStorage",{value:s});Object.defineProperty(window,"sessionStorage",{value:s});})();</script>'
(r/'public/3d/.qa-first-hour-profile.html').write_text(page.replace('<head>','<head>'+isolated,1),encoding='utf-8')
(r/'public/3d/.qa-starter-resume.html').write_text(page.replace('</body>','<script>'+(r/'scripts/qa-starter-resume-page.js').read_text(encoding='utf-8')+'</script></body>'),encoding='utf-8')
print('Built /3d/.qa-first-hour.html, instrumented hero, local-only. Port 4374 uses disposable separate-origin saves.')
