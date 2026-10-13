"""Build disposable local browser fixtures; generated .qa pages are never shipped."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
payload = (root / 'scripts/qa-tutorial-hud-page.js').read_text(encoding='utf-8')
old_ref = '10ac6708'
for kind in ['before', 'current']:
    source = subprocess.check_output(['git', 'show', old_ref + ':public/3d/index.html'], cwd=root).decode('utf-8') if kind == 'before' else (root / 'public/3d/index.html').read_text(encoding='utf-8')
    source = source.replace('<head>', '<head><base href="/3d/">', 1)
    source = source.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
    if kind == 'before':
        for module in ['guided-tutorial', 'hub-tour']:
            prior = subprocess.check_output(['git', 'show', old_ref + ':public/3d/' + module + '.js'], cwd=root).decode('utf-8')
            source = source.replace('<script src="./' + module + '.js?v=2190"></script>', '<script>' + prior + '</script>')
    source = source.replace('</body>', '<script>' + payload + '</script></body>')
    (root / 'public/3d' / ('.qa-tutorial-' + kind + '.html')).write_text(source, encoding='utf-8')

wrapper = '''<!doctype html><meta charset="utf-8"><title>Tutorial responsive QA</title><style>body{background:#121c26;color:white;font:14px system-ui}iframe{border:1px solid #8c9;width:390px;height:844px;transform:scale(.65);transform-origin:top left}button{padding:8px}pre{white-space:pre-wrap;max-height:64px;overflow:auto}</style><button id="phone">390 × 844</button><button id="tablet">820 × 700</button><button id="laptop">1280 × 720</button><button id="landscape">844 × 390</button><button id="audit">Measure all HUD callouts</button><button id="vitals">Show health tip</button><button id="bag">Show bag tip</button><pre id="result">Load frame, then run checks</pre><iframe id="game" title="Tutorial test game" src="/3d/.qa-tutorial-current.html?mute=1"></iframe><script>
const frame=document.getElementById('game');
for(const [id,w,h]of [['phone',390,844],['tablet',820,700],['laptop',1280,720],['landscape',844,390]])document.getElementById(id).onclick=()=>{frame.style.width=w+'px';frame.style.height=h+'px';frame.style.transform=h>760?'scale(.65)':'none';};
document.getElementById('audit').onclick=async()=>{document.getElementById('result').textContent='Running…';try{document.getElementById('result').textContent=JSON.stringify(await frame.contentWindow.tutorialQA.layout(),null,2);}catch(e){document.getElementById('result').textContent='FAIL '+e.stack;}};
for(const id of ['vitals','bag'])document.getElementById(id).onclick=async()=>{await frame.contentWindow.tutorialQA.show(id);frame.contentDocument.getElementById('tutorialQA').hidden=true;};
</script>'''
(root / 'public/.qa-tutorial-responsive.html').write_text(wrapper, encoding='utf-8')
print('Built before/current tutorial fixtures and responsive wrapper.')
