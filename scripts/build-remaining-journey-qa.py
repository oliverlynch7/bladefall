"""Local visible fixture. Browser driving remains in the Browser skill runtime."""
from pathlib import Path
import re, subprocess
ROOT=Path(__file__).resolve().parents[1]
NAMES=['snowbound','ice-caves','iron-halls','great-furnace','shipwreck-shore','thunder-cliffs','palace-courtyard','sky-library','castle-gates','long-ascent']
cases=[]
for n in NAMES:
    code=(ROOT/f'scripts/qa-{n}.cjs').read_text(encoding='utf-8').strip().rstrip(';')
    code=code.replace('for(const [name,path]of Object.entries', 'G.enemies.forEach(e=>{e.dead=true;e.hp=0;});p.invuln=999999;for(const [name,path]of Object.entries')
    code=code.replace('walks.push({name,to:q,', "if(Math.hypot(p.x-q[0],p.z-q[1])>35)throw Error(JSON.stringify({name,to:q,at:[p.x,p.z,p.y],mode:b.mode}));walks.push({name,to:q,")
    cases.append(repr(n)+':('+code+')')
payload=(ROOT/'scripts/qa-remaining-journey-page.js').read_text(encoding='utf-8').replace('/*CASES*/',','.join(cases))+'\n'+(ROOT/'scripts/qa-remaining-journey-watch.js').read_text(encoding='utf-8')
cornice=(ROOT/'scripts/qa-snowbound-cornice.cjs').read_text(encoding='utf-8').strip().rstrip(';')
payload+='\njourneyQA.button("Check cornice jumps",async()=>{await journeyQA.fresh(0);const result=await ('+cornice+')( {on(){},async goto(){},waitForFunction:journeyQA.until,async evaluate(fn,arg){return await fn(arg);}});journeyQA.results.cornice=result;return result;});'
for kind in ['current','before']:
    source=(ROOT/'public/3d/index.html').read_text(encoding='utf-8') if kind=='current' else subprocess.check_output(['git','show','fc6e6e24:public/3d/index.html'],cwd=ROOT).decode('utf-8')
    source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
    if kind=='before':
        for name in ['party-navigation','snowbound-peaks','deep-ice-caves','iron-halls','great-furnace','shipwreck-shore','thunder-cliffs','palace-courtyard','sky-library','castle-gates','long-ascent']:
            old=subprocess.check_output(['git','show',f'fc6e6e24:public/3d/{name}.js'],cwd=ROOT).decode('utf-8')
            source=re.sub(r'<script src="\./'+name+r'\.js\?[^" ]+"></script>',lambda m:'<script>'+old+'</script>',source)
    (ROOT/f'public/3d/.qa-remaining-{kind}.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built current and genuine fc6e6e24 save fixtures.')
