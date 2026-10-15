from pathlib import Path
import subprocess

root=Path(__file__).resolve().parents[1]
payload=(root/'scripts/qa-fresh-progression-page.js').read_text(encoding='utf-8')
legacy=root/'docs/art-validation/fresh-progression-20261014/legacy-save.json'
if legacy.exists():payload='window.progressLegacy='+legacy.read_text(encoding='utf-8')+';\n'+payload
for kind in ['before','current']:
    source=subprocess.check_output(['git','show','d260c6d9:public/3d/index.html'],cwd=root).decode('utf-8') if kind=='before' else (root/'public/3d/index.html').read_text(encoding='utf-8')
    source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
    (root/f'public/3d/.qa-progression-{kind}.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built local progression fixtures; generated HTML is not for production.')
(root/'public/3d/.qa-progression-coop.html').write_text((root/'scripts/qa-fresh-progression-coop.html').read_text(encoding='utf-8'),encoding='utf-8')
