"""Build an isolated, untracked copy of the actual game; never changes user saves."""
from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
s=(r/'public/3d/index.html').read_text(encoding='utf-8')
legacy=json.loads((r/'docs/art-validation/player-readiness-20261020/legacy-storage.json').read_text(encoding='utf-8'))
isolation='''<base href="/3d/"><script>(()=>{function store(seed=[]){const d=new Map(seed);return {getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}}}Object.defineProperty(window,'localStorage',{value:store(LEGACY)});Object.defineProperty(window,'sessionStorage',{value:store()});})();</script>'''.replace('LEGACY',json.dumps(legacy))
s=s.replace('<head>','<head>'+isolation,1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
s=s.replace('</body>','<script>'+(r/'scripts/qa-npc-costumes.js').read_text()+'</script></body>')
(r/'public/3d/.qa-npc-costumes.html').write_text(s,encoding='utf-8')
(r/'public/3d/.qa-npc-costumes.js').write_text((r/'scripts/qa-npc-costumes.js').read_text(),encoding='utf-8')
print('Built .qa-npc-costumes.html with isolated legacy save')
