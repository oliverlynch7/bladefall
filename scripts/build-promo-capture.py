"""Local screenshot setup; original game assets and renderer, staged cameras only."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
source = (root / 'public/3d/index.html').read_text(encoding='utf-8')
source = source.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
# Capture the shipped companion implementation without disturbing unrelated edits.
companion = subprocess.check_output(['git', 'show', 'HEAD:public/3d/companion3d.js'], cwd=root)
(root / 'public/3d/.qa-promo-companion.js').write_bytes(companion)
source = source.replace('./companion3d.js', './.qa-promo-companion.js')
source = source.replace('gl.uniform2f(U.uFogNF,2600,9000)', 'gl.uniform2f(U.uFogNF,300,1000)')
baseline = json.loads((root / 'docs/art-validation/first-session-20261015/return-after-boss.json').read_text(encoding='utf-8'))['save']
payload = 'window.promoBaseline=' + json.dumps(baseline) + ';\n' + (root / 'scripts/qa-promo-capture.js').read_text(encoding='utf-8')
(root / 'public/3d/.qa-promo-game.html').write_text(source.replace('</body>', '<script>' + payload + '</script></body>'), encoding='utf-8')
wrapper = '''<!doctype html><html><head><meta charset="utf-8"><title>Bladefall screenshot studio</title><style>
html,body{margin:0;width:1600px;height:900px;background:#172d32;overflow:visible}iframe{display:block;width:1600px;height:900px;border:0}aside{position:fixed;left:5px;top:5px;width:300px;z-index:10000;padding:8px;background:#173746;color:white;font:12px system-ui;box-shadow:0 0 0 1px #99c9d6}button{background:#e8c275;color:#102631;padding:7px;margin:2px;border:0;border-radius:3px}textarea{width:290px;height:55px}pre{max-height:160px;overflow:auto;white-space:pre-wrap}
</style></head><body><iframe id="game" src="/3d/.qa-promo-game.html?mute=1" title="Current Bladefall game"></iframe><aside><b>Current game · camera staging</b><div id="scenes"></div><textarea aria-label="Camera and hero position">{"eye":[470,330,580],"target":[0,100,-80],"hero":[80,0,110]}</textarea><button id="camera">Set camera</button><button id="hud">Toggle HUD</button><button id="capture">Clean capture</button><pre id="report">Loading…</pre></aside><script>
const frame=document.getElementById('game'),report=document.getElementById('report');
for(const [label,zone,area] of [['Waystation',-1,0],['Briar Town',0,0],['Hollow Pass',1,0],['Frostfell',3,0],['Emberdeep',4,1],['Sunspire',6,0],['Hydra',5,-1],['Brute',0,-1]]){const button=document.createElement('button');button.textContent=label;button.onclick=async()=>{try{report.textContent=JSON.stringify(await frame.contentWindow.Promo.stage(zone,area),null,1)}catch(e){report.textContent=e.stack}};document.getElementById('scenes').append(button)}
document.getElementById('camera').onclick=()=>{try{report.textContent=JSON.stringify(frame.contentWindow.Promo.frame(JSON.parse(document.querySelector('textarea').value)),null,1)}catch(e){report.textContent=e.stack}};
document.getElementById('hud').onclick=()=>frame.contentWindow.Promo.hud();
document.getElementById('capture').onclick=()=>{document.querySelector('aside').style.visibility='hidden';setTimeout(()=>document.querySelector('aside').style.visibility='visible',12000)};
frame.onload=()=>report.textContent='Ready to stage a scene';
</script></body></html>'''
(root / 'public/.qa-promo.html').write_text(wrapper, encoding='utf-8')
skins = (root / 'public/3d/class-skins.html').read_text(encoding='utf-8')
skins = skins.replace('</head>', '''<style>body{width:1600px;height:900px;overflow:hidden}header,.intro,nav,.tools,footer,.stage-help,.camera-actions,.stage-top{display:none!important}main{max-width:none;padding:0}.workshop{border:0;border-radius:0}.stage{height:740px!important}.look-card{height:160px;padding:22px 40px}.look-card h2{font-size:28px}.look-card p,.look-card button,.swatches{display:none}.rank{font-size:15px}.look-cards{border:0}</style></head>''')
(root / 'public/3d/.qa-promo-skins.html').write_text(skins, encoding='utf-8')
(root / 'public/.qa-promo-models.html').write_text('''<!doctype html><html><head><title>Bladefall class models</title><style>html,body{margin:0;width:1600px;height:900px}iframe{display:block;width:1600px;height:900px;border:0}</style></head><body><iframe title="Bladefall Mage class appearances" src="/3d/.qa-promo-skins.html?class=mage"></iframe></body></html>''', encoding='utf-8')
print('Built local-only capture page. Do not ship .qa files.')
