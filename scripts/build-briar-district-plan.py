"""Refresh the focused blueprint from the actual Homefields module and optional scene captures."""
import hashlib,json,subprocess
from pathlib import Path
r=Path(__file__).resolve().parents[1]
out=r/'public/design/campaign-geography'
plan=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./public/3d/briar-district.js').plan))"],cwd=r,text=True))
(out/'briar-district-plan.json').write_text(json.dumps(plan,indent=2),encoding='utf-8')
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3200 -5000 6400 6400" role="img" aria-label="Homefields district blueprint"><rect x="-3200" y="-5000" width="6400" height="6400" fill="#18352f"/>']
for b in plan['banks']:parts.append(f'<rect x="{b["x"]-b["w"]/2}" y="{b["z"]-b["d"]/2}" width="{b["w"]}" height="{b["d"]}" rx="60" fill="#466b43" stroke="#9ca56e" stroke-width="10"/>')
for road in plan['roads']:
    points=' '.join(f'{p[0]},{p[1]}' for p in road['points'])
    parts.append(f'<polyline points="{points}" fill="none" stroke="{"#ffd27a" if road.get("main") else "#73d4cb"}" stroke-width="{road["width"]*.38}" stroke-linecap="round" stroke-linejoin="round"/>')
for f in plan['fences']:parts.append(f'<path d="M{f["a"][0]} {f["a"][1]} L{f["b"][0]} {f["b"][1]}" stroke="#bb9366" stroke-width="20"/>')
for label,x,z in [('HOME / MARA',0,280),('GUS',-1460,-790),('SUPPLY RAID',-2380,-900),('ORCHARD',-2490,-1750),('DECK JUMPS',-1810,-1950),('GRANARY',1150,85),('BELL RIDGE',2350,-1810),('MILL',300,-1700),('CROSSING',180,-2160),('DEFENDED ROAD',230,-3490),('WOODS EXIT',-210,-4350)]:
    parts.append(f'<circle cx="{x}" cy="{z}" r="38" fill="#fff1c9"/><text x="{x}" y="{z-75}" text-anchor="middle" font-family="system-ui" font-size="62" fill="white" stroke="#18352f" stroke-width="12" paint-order="stroke">{label}</text>')
parts.append('<path d="M180 -2280 L50 -2620 L230 -3490 L-210 -4350" fill="none" stroke="#ffd27a" stroke-width="48" stroke-dasharray="65 30"/></svg>')
(out/'briar-district-plan.svg').write_text(''.join(parts),encoding='utf-8')
evidence=r/'docs/art-validation/briar-district-20261020'
if (evidence/'after.json').exists():
    before=json.loads((evidence/'before.json').read_text(encoding='utf-8'))
    after=json.loads((evidence/'after.json').read_text(encoding='utf-8'))
    def geo(d):
        def box(o,floor=False):return [round(o.get(k,0) or 0,1) for k in ('x','z','w','d')]+[round((o.get('h',0) if floor else o.get('y0',0)) or 0,1),round((0 if floor else o.get('h',0)-(o.get('y0',0) or 0)) or 0,1),o.get('geography','')]
        return dict(floors=[box(o) for o in d['segments'] if not o.get('nofloor')]+[box(o,True) for o in d['plats']],walls=[box(o) for o in d['walls']],blocks=[box(o) for o in d['obstacles'] if o.get('kind')!='plat'])
    p=out/'layout-data.json';data=json.loads(p.read_text(encoding='utf-8'));m=data['maps'][0]
    assert before['bounds']==after['bounds']==m['bounds']
    m['before']=geo(before);m['after']=geo(after);m['enemies']=after['enemies']
    retired={'lane0To1','lane1To2','lane2To4','westFarm','westReturn','eastPasture','eastReturn','villageMill','westSupply','supplyWorkshop','workshopOrchard','orchardMill','granaryFront','pastureTower','towerMill','millSouth','bellRidgeUp','bellRidgeReturn','pickingDecks'}
    m['paths']=[p for p in m['paths'] if p['id'] not in retired]+[dict(id=p['id'],main=p.get('main',False) or p['id']=='millSouth',points=[q+[0] for q in p['points']]) for p in plan['roads']]
    m['paths'] += [dict(id=k,main=False,points=v) for k,v in [('bellRidgeUp',after['district']['stairUp']),('bellRidgeReturn',after['district']['stairDown']),('pickingDecks',[[p['x'],p['z'],p['y']] for p in plan['jumps']])]]
    m['review']='Homefields district2342: actual captured new lanes, planted boundaries, tower approach/return and picking-deck route. Collision walks and actual quest/mill progression verified in isolated Chrome; human discovery/fun and Internet co-op remain separate.'
    m['source']['sha256']=hashlib.sha256((r/'public/3d/index.html').read_bytes().replace(b'\r\n',b'\n')).hexdigest()
    m['source']['districtSha256']=hashlib.sha256((r/'public/3d/briar-district.js').read_bytes().replace(b'\r\n',b'\n')).hexdigest()
    m['districtBoundaries']=plan['banks'];data['status']='Homefields2342 refreshed from actual before/after geometry. Other fifteen maps retain their earlier captures. Technical route checks do not establish human discovery or fun.'
    data['date']='2026-10-20';p.write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
print('District blueprint refreshed from builder data; other campaign layouts retained.')
