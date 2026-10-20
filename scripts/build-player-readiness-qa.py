from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'public/3d/index.html').read_text(encoding='utf-8')
seed=json.loads((r/'docs/art-validation/player-readiness-20261020/legacy-storage.json').read_text(encoding='utf-8'))
prefix='<script>window.readinessLegacyStorage='+json.dumps(seed)+';(()=>{const d=new Map(window.readinessLegacyStorage);const st={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,"localStorage",{value:st});Object.defineProperty(window,"sessionStorage",{value:st});})();</script>'
payload=(r/'scripts/qa-fresh-progression-page.js').read_text(encoding='utf-8').replace('introSeen:true,introV2Seen:true','originSeen:true,introSeen:true,introV2Seen:true')
payload=payload.replace("while(!fn()){if(Date.now()>end)throw Error('Timeout '+fn);await wait(50);}","while(!fn()){if(Date.now()>end)throw Error('Timeout '+fn);if(window.__BF3?.G){__BF3.update(1/60);__BF3.render(1);}await wait(50);}")
payload+='\n'+(r/'scripts/qa-player-readiness-page.js').read_text(encoding='utf-8')
s=s.replace('<head>','<head><base href="/3d/">'+prefix,1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
(r/'public/3d/.qa-readiness.html').write_text(s.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built isolated readiness fixture; generated HTML must not ship.')
