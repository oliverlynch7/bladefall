"""Build local-only visible QA pages; do not commit the generated HTML."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[1]
payload = (root/'scripts/qa-hollow-journey-page.js').read_text(encoding='utf-8')
for kind in ['before','current']:
    source = subprocess.check_output(['git','show','af0b92d4:public/3d/index.html'],cwd=root).decode('utf-8') if kind=='before' else (root/'public/3d/index.html').read_text(encoding='utf-8')
    source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
    if kind=='before':
        old_story=subprocess.check_output(['git','show','af0b92d4:public/3d/story/hollow-cliffs.json'],cwd=root)
        (root/'public/3d/.qa-hollow-story-before.json').write_bytes(old_story)
        source=source.replace("fetch('./story/'+id+'.json?v=2188')","fetch(id==='hollow-cliffs'?'./.qa-hollow-story-before.json':'./story/'+id+'.json?v=2188')")
        import re
        for name in ['hollow-cliffs','campaign-geography']:
            old=subprocess.check_output(['git','show','af0b92d4:public/3d/'+name+'.js'],cwd=root).decode('utf-8')
            source=re.sub(r'<script src="\./'+name+r'\.js\?[^" ]+"></script>',lambda m:'<script>'+old+'</script>',source)
    source=source.replace('</body>','<script>'+payload+'</script></body>')
    (root/'public/3d'/('.qa-hollow-'+kind+'.html')).write_text(source,encoding='utf-8')
print('Built isolated Hollow Pass before/current QA pages.')

coop = (root/'scripts/qa-hollow-journey-coop.html').read_text(encoding='utf-8')
(root/'public/.qa-hollow-coop.html').write_text(coop,encoding='utf-8')
