"""Companion models use the project's shared faceted art/export helpers."""
from pathlib import Path
source=Path(__file__).with_name('build_enemy_art.py').read_text();exec(source[:source.index('args=sys.argv')])
OUT=ROOT/'public/3d/enemy-assets/companions';OUT.mkdir(exist_ok=True)
styles={'emberpup':['281e22','554049','b4a298','ff9b42'],'spiritwolf':['283953','577e9e','b2dce5','d8faff'],'stonewhelp':['303844','737d8b','b5c3bd','84dbcb'],'wisp':['223749','6da9bb','d0f3ef','8ae9ff'],'mender':['25463d','69a37d','b8dfb0','cbffe3'],'coinsprite':['66502e','b99048','e8d197','fff0ac'],'gravewraith':['252333','524560','b3a6bf','baa6eb'],'skeleton':['353c36','aaa994','ddd9b7','86dbb8']}
results=[]
for name,colors in styles.items():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
 parts=[];palette=colors;THEME[name]='ally';ROSTER[name]={'label':name}
 if name in {'emberpup','spiritwolf','stonewhelp'}:
  QUADS.add(name);quadruped('frostshell' if name=='stonewhelp' else 'dustjackal')
  cone((0,-.2,.42),(0,-.26,.42),.17,.17,0,'body',10)
  ico((0,-.285,.34),(.045,.02,.058),3,'body')
  if name=='emberpup':
   for i in range(4):spike((0,.16-i*.09,.53),(0,.17-i*.09,.65+(i%2)*.04),.04,3,'body')
  if name=='spiritwolf':
   for s in [-1,1]:cone((s*.16,-.06,.42),(s*.12,.12,.60),.075,0,2,'body')
 else:
  if name=='skeleton':
   special('bones');eyes(.86,-.113,.055,col=3)
   for s in [-1,1]:ico((s*.18,0,.68),(.08,.07,.045),0,'armL' if s<0 else 'armR')
   cape(0,.13)
  elif name=='gravewraith':
   FLOAT.add(name);humanoid('caster');ring((0,.045,.88),.20,3);cone((-.24,0,.37),(-.3,-.02,.19),.06,0,3,'armL')
  else:
   FLOAT.add(name);special('galewisp')
   for side in [-1,1]:
    for i in range(3):cone((side*.08,.03,.54),(side*(.26+i*.04),.10,.72-i*.13),.038,0,2,'armL' if side<0 else 'armR')
   if name=='mender':
    for i in range(6):a=i*math.tau/6;ico((math.cos(a)*.1,-.12,.55+math.sin(a)*.1),(.06,.024,.07),2,'head')
   if name=='coinsprite':
    for z in [.36,.43,.5]:ring((0,-.04,z),.11,2,'body')
   if name=='wisp':
    for side in [-1,1]:cone((side*.16,0,.26),(side*.16,0,.74),.015,.012,2,'body')
 results.append(rig_and_export(name))
(OUT/'manifest.json').write_text(json.dumps(results,indent=2))
