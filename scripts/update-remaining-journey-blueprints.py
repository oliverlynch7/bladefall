"""Update only the ten finished halves from a visible initial-geometry export."""
import importlib.util, json, hashlib, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('blueprints',ROOT/'scripts/build-campaign-blueprints.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
data=json.loads((ROOT/'public/design/campaign-geography/layout-data.json').read_text(encoding='utf-8'))
rows=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))['geometry']
assert len(rows)==10
preserved=json.dumps(data['maps'][:6],sort_keys=True)
for r in rows:
 i=r['zone']*2+r['area'];m=data['maps'][i];plan=b.PLANS[i]
 assert i>=6 and m['bounds']==r['bounds'], 'Map scale changed'
 lookup={str(o.get('key',o.get('id'))):o for o in r['objects']+r['npcs']};lookup['exit']=r['portal']
 points=[]
 for group in ('steps','branches'):
  for j,(key,label,note) in enumerate(plan[group]):
   o=lookup[key];assert o,key
   points.append(dict(id=key,label=label,note=note,group=group,number=str(j+1) if group=='steps' else chr(65+j),x=o['x'],z=o['z'],y=o.get('y',0)))
 assert all(k in r['paths'] for k in plan['main'])
 paths=[dict(id=k,main=k in plan['main'],points=[[round(n,1) for n in p] for p in ps]) for k,ps in r['paths'].items() if ps]
 rooms=[{k:b.clean(v) for k,v in o.items()} for o in r['rooms']]
 m.update(idea=plan['idea'],protect=plan['protect'],review=plan['review'],points=points,paths=paths,rooms=rooms,after=b.geometry(r),hazards=r['geography']['hazards'],enemies=r['enemies'],source=dict(file=plan['module'],sha256=hashlib.sha256((ROOT/'public/3d'/plan['module']).read_bytes().replace(b'\r\n',b'\n')).hexdigest()))
assert json.dumps(data['maps'][:6],sort_keys=True)==preserved
old=data['version'];data['version']='2.197.0-campaign-journeys';data['date']='2026-10-14'
(ROOT/'public/design/campaign-geography/layout-data.json').write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
print('Updated ten initial blueprints; bounds, historical geometry and the first six records retained.')
