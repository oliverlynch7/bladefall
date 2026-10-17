"""Compare identical gear/class builds against pre-change and current campaign HP."""
from pathlib import Path
import subprocess, json
root=Path(__file__).resolve().parent.parent
isolation="""<base href='/3d/'><script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:s});Object.defineProperty(window,'sessionStorage',{value:s});})();</script>"""
for kind in ['before','current']:
 s=(root/'public/3d/index.html').read_text(encoding='utf8') if kind=='current' else subprocess.check_output(['git','show','d0cbeffa:public/3d/index.html'],cwd=root).decode('utf8')
 s=s.replace('<head>','<head>'+isolation,1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
 s=s.replace('window.__BF3={','window.__BF3={loadArea,effPower,effMagPower,classStyleMul,fireProjectile,freshPlayer,stageScale,tEnemyHp,tPlayerDmg,healthBars:()=>hpBars,',1)
 s=s.replace('</body>',(root/'scripts/campaign-durability-harness.html').read_text(encoding='utf8')+'</body>')
 (root/f'public/3d/.qa-campaign-durability-{kind}.html').write_text(s,encoding='utf8')
print('Built isolated before/current campaign durability fixtures.')

old=json.loads((root/'docs/art-validation/hollow-review-20261015/canyon-arrival-before.json').read_text(encoding='utf8'))['save']
(root/'public/3d/.qa-old-save.json').write_text(json.dumps(old),encoding='utf8')
