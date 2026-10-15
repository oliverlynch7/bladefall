from pathlib import Path
import subprocess

root=Path(__file__).resolve().parents[1]
payload=(root/'scripts/qa-loot-readiness-page.js').read_text(encoding='utf-8')
old_save=root/'docs/art-validation/loot-readiness-20261015/previous-save.json'
if old_save.exists():
    payload='window.lootPreviousSave='+old_save.read_text(encoding='utf-8-sig')+';\n'+payload
before_hud=subprocess.check_output(['git','show','4d8637bd:public/3d/adventure-hud.js'],cwd=root).decode('utf-8')
(root/'public/3d/.qa-loot-before-hud.js').write_text(before_hud,encoding='utf-8')
for kind in ['before','current']:
    source=subprocess.check_output(['git','show','4d8637bd:public/3d/index.html'],cwd=root).decode('utf-8') if kind=='before' else (root/'public/3d/index.html').read_text(encoding='utf-8')
    source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
    if kind=='before':source=source.replace('./adventure-hud.js?v=2190','./.qa-loot-before-hud.js')
    (root/f'public/3d/.qa-loot-{kind}.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built localhost-only loot QA pages; do not commit generated public fixtures.')
