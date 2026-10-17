from pathlib import Path
import json,sys
root=Path(__file__).resolve().parent.parent
s=(root/'public/3d/index.html').read_text(encoding='utf8')
s=s.replace('<head>',"""<head><base href='/3d/'><script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:s});Object.defineProperty(window,'sessionStorage',{value:s});})();</script>""",1)
s=s.replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
save=json.loads((root/'docs/art-validation/hollow-review-20261015/canyon-arrival-before.json').read_text(encoding='utf8'))['save']
payload=(root/'scripts/bag-equip-matrix.html').read_text(encoding='utf8')+"""<pre id='equipResult' style='position:fixed;bottom:6px;left:6px;z-index:200001;max-height:30vh;max-width:440px;overflow:auto;background:#102331;color:white'>Loading</pre><script>
(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)),out=document.getElementById('equipResult'),rows=[];while(!window.__BF3||!window.HERO3D?.ready)await wait(50);const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,SAVE,{originSeen:true,hubTutDone:true,tutOff:true});b.openHub();await wait(600);
try{const a=b.makeArmor('common','chest','vigor');a.name='QA Equip Chest';b.meta.stash=[{armor:a}];b.update(.016);b.openBag(()=>__BF_SOCIAL_API.resume());const initial=b.meta.hero; b.G.time+=9;b.update(.016);const refreshed=b.meta.hero!==initial;const button=document.querySelector('[data-eq="0"]');button.click();rows.push({label:'equip after actual background autosave',snapshotRefreshed:refreshed,stash:b.meta.stash.map(x=>(x.armor||x.trinket||x.weapon)?.name),live:b.G.p.gear.chest?.name,saved:b.meta.hero.gear.chest?.name,ui:[...document.querySelectorAll('.bagslotname')].map(n=>n.textContent),level:b.G.p.level,xp:b.G.p.xp,gold:b.meta.gold});if(new URLSearchParams(location.search).has('matrix'))rows.push(...await runBagEquipMatrix(b));out.textContent=JSON.stringify({done:true,rows,version:b.snap().version},null,2);
}catch(e){out.textContent=JSON.stringify({error:String(e.stack),rows},null,2);}})();</script>""".replace('SAVE',json.dumps(save))
suffix=sys.argv[1] if len(sys.argv)>1 else 'current'
(root/f'public/3d/.qa-bag-equip-{suffix}.html').write_text(s.replace('</body>',payload+'</body>'),encoding='utf8')
print('Built isolated inventory equip fixture: '+suffix)
