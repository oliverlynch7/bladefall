"""Build a local-only, isolated-storage benchmark of the current game."""
from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
s = (root/'public/3d/index.html').read_text(encoding='utf8')
isolation = """<base href="/3d/"><script>(()=>{const d=new Map(),s={getItem:k=>d.get(k)??null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}};Object.defineProperty(window,'localStorage',{value:s});Object.defineProperty(window,'sessionStorage',{value:s});})();</script>"""
s=s.replace('<head>', '<head>'+isolation, 1)
s=s.replace('function frame(ts){','let qaLastFrame=0;function frame(ts){const qaGap=qaLastFrame?ts-qaLastFrame:0;qaLastFrame=ts;',1)
s=s.replace('  musicMixUpdate();journalNoticeSync();','  const qaUpdateStart=performance.now();musicMixUpdate();journalNoticeSync();',1)
s=s.replace('   updateSparringHud();','   updateSparringHud();const qaUpdateMs=performance.now()-qaUpdateStart,qaBaseStart=performance.now();',1)
s=s.replace('  flushHero3D();                      //', '  const qaBaseMs=performance.now()-qaBaseStart,qaHeroStart=performance.now();flushHero3D();const qaHeroMs=performance.now()-qaHeroStart; //',1)
probe="""window.__QA_PERF?.({gap:qaGap,main:VOXMET.lastMs,update:qaUpdateMs,base:qaBaseMs,hero:qaHeroMs,boxes:VOXMET.submitted,three:window.__BF_RENDER_STATS,world:(()=>{const w=window.__world3d?.();if(!w)return null;return {...w,counts:{...w.counts,craft:w.counts?.craft?{models:w.counts.craft.models,drawCalls:w.counts.craft.drawCalls,visibleDrawCalls:w.counts.craft.visibleDrawCalls}:null}}})(),npcs:window.__npcArtStats?.actors,mob:window.__mob3d?.(),enemies:G?.enemies?.length});"""
s=s.replace('  BFGuidedTutorial.map(G,mode);','  '+probe+'\n  BFGuidedTutorial.map(G,mode);',1)
s=s.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
old=json.loads((root/'docs/art-validation/hollow-review-20261015/canyon-arrival-before.json').read_text(encoding='utf8'))['save']
fixture=(root/'scripts/briar-performance-harness.html').read_text(encoding='utf8')
s=s.replace('</body>', '<script>window.__QA_OLD_SAVE='+json.dumps(old).replace('</','<\\/')+';</script>'+fixture+'</body>')
(root/'public/3d/.qa-briar-performance.html').write_text(s,encoding='utf8')
print('Built isolated Briar/Black Woods performance fixture; ?case=start|village|mill|woods|near|save and &camera=shoulder|far|fps.')
