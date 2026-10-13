"""Create local, untracked QA pages; no production browser storage is used."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[1]
before = '2e6bb5f1'
payload = (root / 'scripts/qa-class-wardrobe-state.js').read_text(encoding='utf8')
for name, source in [('class-before', subprocess.check_output(['git','show', before+':public/3d/index.html'],cwd=root).decode('utf8')), ('class-state',(root/'public/3d/index.html').read_text(encoding='utf8'))]:
    source=source.replace('<head>', '<head><base href="/3d/">',1)
    source=source.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
    if name=='class-before':
        old_catalog=subprocess.check_output(['git','show',before+':public/3d/class-looks.js'],cwd=root).decode('utf8')
        source=source.replace('<script src="./class-looks.js?v=2084"></script>', '<script>'+old_catalog+'</script>')
    source=source.replace('</body>','<script>'+payload+'</script></body>')
    (root/'public/3d'/('.qa-'+name+'.html')).write_text(source,encoding='utf8')
(root/'public/3d/.qa-class-render.js').write_text((root/'scripts/qa-class-wardrobe-render.js').read_text(encoding='utf8'),encoding='utf8')
(root/'public/3d/.qa-class-render.html').write_text('''<!doctype html><html><meta charset="utf-8"><title>Class wardrobe render verification</title><style>body{background:#142733;color:white;font:14px system-ui}canvas{width:500px;height:500px;float:right}pre{white-space:pre-wrap}button{padding:15px}</style><script type="importmap">{"imports":{"three":"./three.module.js"}}</script><button id="run">Run all class fittings</button><canvas></canvas><pre id="result">Ready</pre><script src="./face-options.js"></script><script src="./class-looks.js?v=2191"></script><script type="module" src="./.qa-class-render.js"></script></html>''',encoding='utf8')
(root/'public/3d/.qa-class-mobile.html').write_text('''<!doctype html><html><meta charset="utf-8"><title>Wardrobe responsive check</title><style>body{margin:0;background:#101a24;color:white}iframe{display:block;border:0;width:390px;height:844px}aside{position:fixed;left:410px;top:20px}button{padding:15px}pre{white-space:pre-wrap}</style><iframe title="390 by 844 wardrobe" src="./class-skins.html?class=mage&tier=2"></iframe><aside><button id="check">Check phone layout</button><pre id="result"></pre></aside><script>document.getElementById('check').onclick=()=>{const f=document.querySelector('iframe'),w=f.contentWindow,d=f.contentDocument;d.querySelector('.stage').scrollIntoView({block:'start'});document.getElementById('result').textContent=JSON.stringify({width:w.innerWidth,contentWidth:d.documentElement.scrollWidth,view:d.querySelector('#view').value,loaded:d.querySelector('#loading').hidden,images:[...d.images].every(x=>x.complete&&x.naturalWidth>0)},null,2);};</script></html>''',encoding='utf8')
print('Created five temporary QA pages/scripts on the local test origin.')
