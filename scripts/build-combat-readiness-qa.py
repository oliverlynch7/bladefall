from pathlib import Path
import subprocess, re

ROOT=Path(__file__).resolve().parents[1]
for kind in ['current','before']:
    source=(ROOT/'public/3d/index.html').read_text(encoding='utf-8') if kind=='current' else subprocess.check_output(['git','show','969ce1a9:public/3d/index.html'],cwd=ROOT).decode('utf-8')
    source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
    if kind=='before':
        old=subprocess.check_output(['git','show','969ce1a9:public/3d/hydra.js'],cwd=ROOT).decode('utf-8')
        source=re.sub(r'<script src="\./hydra\.js\?[^" ]+"></script>',lambda m:'<script>'+old+'</script>',source)
    payload=(ROOT/'scripts/qa-combat-readiness-page.js').read_text(encoding='utf-8')
    (ROOT/f'public/3d/.qa-combat-{kind}.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built local combat fixtures.')
(ROOT/'public/3d/.qa-combat-coop.html').write_text((ROOT/'scripts/qa-combat-readiness-coop.html').read_text(encoding='utf-8'),encoding='utf-8')
