"""Original Bladefall enemy art. Blender 4.5; rigid-weighted faceted meshes, six clips."""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/3d/enemy-assets'; OUT.mkdir(exist_ok=True)
ROSTER=json.loads(Path(__file__).with_name('enemy-roster.json').read_text())
ROSTER['marblecolossus']=dict(ROSTER['colossus'],label='MARBLE COLOSSUS')
P={
 'wood':['574932','8c7951','e2ce91','a8c967'],
 'sand':['755345','bc9769','f3ddaa','83cbd2'],
 'ruin':['343e4b','72818a','c5c2ac','dd7052'],
 'ice':['284d70','6aabbf','d3f3ed','85e7ff'],
 'fire':['302f39','64504a','c99067','ff9342'],
 'void':['302843','665782','aaa0c8','ce87ff'],
 'sun':['6c6774','c9c6ba','f7ead0','edbc62'],
 'royal':['292d43','515a77','a8aac2','bd86f1'],
}
GROUPS={
 'wood':'grunt goblin slime slimelet toxling thornboar sporeback brute dummy',
 'sand':'dustjackal cragspitter galewisp charger archer',
 'ruin':'bones caster sentinel revenant warden mimic',
 'ice':'frostling frostshell frostlobber sorcerer',
 'fire':'emberling magmaskit embertotem colossus',
 'void':'flyer shadeling sparkling blinkstalker voidtether king bosscrystal',
 'sun':'sunpriest marblestatue marblecolossus',
 'royal':'siegeknight royalarcanist tyrant',
}
THEME={n:k for k,v in GROUPS.items() for n in v.split()}
QUADS={'thornboar','sporeback','dustjackal','charger','frostshell','magmaskit','cragspitter'}
FLOAT={'flyer','galewisp','shadeling','sparkling','voidtether','bosscrystal'}
CASTERS={'caster','frostlobber','sunpriest','royalarcanist','sorcerer'}
HEAVY={'sentinel','marblestatue','siegeknight','warden','brute','colossus','marblecolossus','king','tyrant'}
parts=[]; palette=[]
def rgba(h):
 c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in c)+(1,)
def tag(o,b,col):
 bpy.context.view_layer.objects.active=o
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 vg=o.vertex_groups.new(name=b); vg.add(list(range(len(o.data.vertices))),1,'REPLACE')
 a=o.data.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
 for p in o.data.polygons:
  # Small deterministic facet shifts keep the hand-cut planes legible.
  c=rgba(palette[col] if isinstance(col,int) else col)
  f=1-(p.index%4)*.025
  for li in p.loop_indices:a.data[li].color=tuple(x*f for x in c[:3])+(1,)
 parts.append(o); return o
def ico(pos,scale,col=1,b='body',sub=1):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos)
 o=bpy.context.object; o.scale=scale; return tag(o,b,col)
def box(pos,scale,col=1,b='body'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
 o=bpy.context.object; o.scale=scale; return tag(o,b,col)
def cone(a,c,r1,r2,col=1,b='body',n=6):
 d=Vector(c)-Vector(a)
 bpy.ops.mesh.primitive_cone_add(vertices=n,radius1=r1,radius2=r2,depth=d.length,location=(Vector(a)+Vector(c))/2)
 o=bpy.context.object; o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); return tag(o,b,col)
def spike(a,c,r=.055,col=2,b='head'):return cone(a,c,r,0,col,b,5)
def ring(pos,r=.21,col=3,b='head'):
 bpy.ops.mesh.primitive_torus_add(major_segments=12,minor_segments=4,location=pos,major_radius=r,minor_radius=.019,rotation=(math.pi/2,0,0))
 return tag(bpy.context.object,b,col)
def eyes(z=.85,y=-.145,x=.073,b='head',col=3):
 for s in [-1,1]:box((s*x,y,z),(.064,.025,.027),col,b)
def crown(z=1.01,wide=.16,col=3):
 for i in range(5):
  a=i*math.pi/4
  x=math.cos(a)*wide; y=-math.sin(a)*wide
  spike((x,y,z-.05),(x*1.2,y*1.2,z+.09+(i%2)*.07),.037,col)
def blade(x=.33,z=.38,col=2,b='armR',big=False):
 box((x,-.09,z),(.045,.05,.21),0,b)
 box((x,-.09,z+.1),(.22,.065,.035),3,b)
 cone((x,-.09,z+.12),(x,-.09,z+(.68 if big else .45)),.075,0,col,b,4)
def staff(col=3):
 cone((.35,-.02,.06),(.35,-.02,1.05),.021,.018,2,'armR')
 ring((.35,-.02,1.05),.10,col,'armR'); ico((.35,-.02,1.05),(.048,.04,.09),col,'armR')
def cape(col=0,wide=.27):
 for i in range(3):
  x=(i-1)*wide*.6
  cone((x,.10,.76),(x*1.35,.17,.18+(.06 if i==1 else 0)),.07,.105,col,'body',4)
def humanoid(name):
 heavy=name in HEAVY; robe=name in CASTERS or name in {'king','tyrant'}
 w=.255 if heavy else .18
 ico((0,0,.57),(w,.13,.22),1,'body',2)
 cone((0,0,.40),(0,0,.72),w*.72,w,0,'body',6)
 # Breastplate and tapering waist establish a readable torso rather than a stack of cubes.
 ico((0,-.10,.61),(w*.83,.045,.15),1,'body')
 box((0,-.13,.46),(w*1.55,.055,.055),2,'body')
 ico((0,-.015,.845),(.128,.11,.145),1,'head',2)
 box((0,-.126,.84),(.185,.03,.066),0,'head'); eyes()
 for s,b,leg in [(-1,'armL','legL'),(1,'armR','legR')]:
  x=s*(w+.035)
  ico((x,0,.705),(.12 if heavy else .08,.10,.09),2 if heavy else 1,b)
  cone((x,0,.68),(s*(w+.085),-.035,.38),.065 if heavy else .045,.072 if heavy else .044,1,b)
  ico((s*(w+.085),-.04,.36),(.074,.068,.072),0,b)
  cone((s*.10,0,.39),(s*.11,0,.095),.072 if heavy else .046,.05,1,leg)
  box((s*.11,-.045,.065),(.135,.205,.10),0,leg)
 if robe:
  cone((0,0,.17),(0,0,.50),.22,.145,1,'body',8); cape(0)
  for s in [-1,1]:cone((s*.075,-.15,.48),(s*.14,-.17,.18),.022,.04,2,'body',4)
 if name in CASTERS:
  ico((0,.015,.865),(.159,.13,.174),0,'head')
  box((0,-.122,.84),(.12,.035,.11),0,'head'); eyes(y=-.146,x=.04)
  if name=='frostlobber':
   ico((-.28,-.12,.43),(.13,.12,.16),3,'armL')
   for x in [-.11,0,.11]:spike((x,.08,.67),(x,.13,.94),.06,2,'body')
  else:staff()
 if name in {'sentinel','siegeknight','warden'}:
  box((0,-.14,.86),(.034,.035,.19),2,'head')
  spike((0,0,.94),(0,.06,1.13),.09,3)
  if name!='warden':
   ico((-.34,-.09,.53),(.155,.048,.235),0,'armL')
   box((-.34,-.146,.53),(.03,.022,.31),3,'armL')
  blade(big=name in {'warden','siegeknight'})
  if name=='warden':cape('853d42',.32)
 elif name in {'grunt','revenant','goblin','bones'}:
  blade(x=.28,z=.29)
  if name=='revenant':cape('754449'); spike((.08,0,.95),(.13,.03,1.10),.06,2)
  if name=='goblin':
   for s in [-1,1]:spike((s*.1,0,.86),(s*.26,-.02,.91),.07,1)
   ico((0,.17,.47),(.19,.13,.23),'8b6540','body',2)
   for x in [-.08,0,.08]:ico((x,.22,.61),(.033,.02,.04),3,'body')
  if name=='bones':
   for z in [.51,.57,.63]:box((0,-.153,z),(.24,.03,.025),2,'body')
   for x in [-.04,0,.04]:box((x,-.126,.75),(.02,.025,.047),2,'head')
 elif name=='brute':
  for s in [-1,1]:
   cone((s*.09,0,.93),(s*.20,.015,1.16),.045,.025,0,'head')
   spike((s*.18,.015,1.10),(s*.29,-.02,1.19),.026,2)
   spike((s*.22,0,.76),(s*.37,.04,.93),.08,0,'armL' if s<0 else 'armR')
  cone((.33,-.05,.23),(.33,-.05,.80),.035,.025,0,'armR')
  ico((.33,-.05,.82),(.19,.13,.12),1,'armR')
  for x in [-.12,0,.12]:ico((x,.12,.7),(.10,.05,.09),3)
 elif name in {'colossus','marblecolossus'}:
  ico((0,-.15,.60),(.12,.06,.14),0); ico((0,-.207,.60),(.062,.016,.09),3)
  for s,b in [(-1,'armL'),(1,'armR')]:
   ico((s*.32,0,.72),(.17,.14,.15),1,b)
   box((s*.35,-.02,.38),(.20,.20,.19),1,b)
   for z in [.35,.41]:box((s*.35,-.124,z),(.13,.02,.025),3,b)
  if name=='colossus':
   for x in [-.14,.14]:cone((x,.09,.7),(x,.14,1.06),.095,.075,0); ico((x,.14,1.06),(.062,.06,.035),3)
  else:ring((0,.07,.87),.26);crown(col=2)
 elif name in {'king','tyrant','marblestatue'}:
  crown(col=3); cape(0,.36 if name=='tyrant' else .27)
  blade(big=True,col=3 if name!='marblestatue' else 2)
  if name=='tyrant':
   for s,b in [(-1,'armL'),(1,'armR')]:
    for i in range(3):spike((s*(.23+i*.045),.015,.74),(s*(.30+i*.07),.02,.97-i*.06),.065,2,b)
   ring((0,.12,.76),.34,3,'body')
 elif name=='archer':
  cape(0); spike((0,-.10,.84),(0,-.28,.79),.07,2)
  for a,c in [((-.33,-.03,.37),(-.45,-.03,.55)),((-.45,-.03,.55),(-.46,-.03,.83)),((-.46,-.03,.83),(-.33,-.03,1.02))]:cone(a,c,.022,.018,2,'armL')
  cone((-.33,-.03,.37),(-.33,-.03,1.02),.004,.004,3,'armL',4)
  cone((-.33,-.07,.66),(.29,-.07,.66),.01,.01,2,'armR',4)
 elif name in {'emberling','frostling','toxling','blinkstalker'}:
  for s in [-1,1]:spike((s*.09,0,.94),(s*.17,.025,1.1),.07,3)
  for s,b in [(-1,'armL'),(1,'armR')]:
   for i in range(3):spike((s*.27+(i-1)*.024,-.06,.36),(s*.27+(i-1)*.035,-.11,.22),.014,2,b)
  if name=='toxling':
   for x,z in [(-.1,.65),(.1,.71),(0,.53)]:ico((x,.15,z),(.10,.07,.1),3)
  if name=='frostling':
   for s,b in [(-1,'armL'),(1,'armR')]:spike((s*.23,0,.72),(s*.31,.02,.93),.08,2,b)
  if name=='blinkstalker':cape(0,.14); ring((0,.05,.86),.19,3)
 if name in {'sunpriest','sorcerer','royalarcanist'}:crown(col=3)
 if name=='sunpriest':ring((0,.065,.9),.23)
 if name=='sorcerer':
  for s in [-1,1]:spike((s*.13,.015,.71),(s*.28,.04,1.0),.07,2,'body')
def quadruped(name):
 jack=name=='dustjackal'; crab=name=='magmaskit'; tall=name=='cragspitter'
 ico((0,.045,.39),(.185 if jack else .25,.39 if jack else .36,.17 if jack else .21 if not tall else .31),1,'body',2)
 for s in [-1,1]:
  for rear in [False,True]:
   y=.25 if rear else -.19; b=('rear' if rear else 'leg')+('L' if s<0 else 'R')
   cone((s*.18,y,.35),(s*(.27 if crab else .20),y+.015,.07),.065,.04,0,b)
   ico((s*.21,y-.025,.055),(.08,.12,.065),1,b)
  if crab:
   b='armL' if s<0 else 'armR'
   cone((s*.20,0,.38),(s*.40,-.02,.23),.045,.022,0,b)
   spike((s*.40,-.02,.23),(s*.44,-.13,.03),.027,1,b)
 ico((0,-.30,.40),(.15,.17,.14),1,'head',2)
 ico((0,-.45,.36),(.115 if not jack else .065,.14,.075),0,'head')
 eyes(.45,-.435,.08)
 if name in {'thornboar','charger'}:
  for s in [-1,1]:spike((s*.12,-.41,.30),(s*.17,-.49,.48),.037,2,'head')
  if name=='thornboar':
   for i in range(5):spike((0,.27-i*.11,.56),(0,.32-i*.11,.79+(i%2)*.06),.063,0,'body')
  else:
   spike((0,-.37,.44),(0,-.68,.65),.10,2,'head')
   for y in [-.05,.13,.3]:ico((0,y,.54),(.22,.13,.075),0,'body')
 if jack:
  for s in [-1,1]:spike((s*.09,-.28,.48),(s*.15,-.24,.76),.073,0,'head')
  cone((0,.31,.42),(0,.59,.34),.056,.018,1,'tail')
  box((0,-.15,.45),(.37,.10,.07),3,'body')
 if name=='sporeback':
  for x,y,z,r in [(-.13,0,.65,.16),(.12,.19,.66,.17),(0,-.18,.62,.13)]:
   cone((x,y,.48),(x,y,z),.025,.025,2)
   cone((x,y,z-.015),(x,y,z+.10),r,.035,3)
   for q in [-1,1]:ico((x+q*r*.4,y-.03,z+.066),(.027,.032,.015),2)
 if name in {'frostshell','cragspitter','magmaskit'}:
  for x,y in [(-.12,.1),(.12,.1),(0,-.07),(0,.29)]:
   ico((x,y,.57),(.15,.18,.18),2 if name=='frostshell' else 0)
   if name=='frostshell':spike((x,y,.63),(x*1.2,y,.89),.08,2,'body')
   if crab:box((x,y,.72),(.09,.075,.016),3)
  if tall:
   ring((0,-.48,.38),.102,0,'head');ico((0,-.47,.38),(.075,.02,.075),0,'head')
def special(name):
 if name=='bones':
  cone((0,0,.39),(0,0,.72),.026,.028,2)
  for z,w in [(.52,.105),(.58,.125),(.64,.13)]:
   for s in [-1,1]:cone((0,.01,z),(s*w,-.035,z+.02),.017,.02,2)
  ico((0,0,.42),(.12,.07,.055),1)
  ico((0,0,.85),(.13,.10,.15),2,'head',2);eyes(.86,-.105,.055,col=0)
  box((0,-.075,.75),(.13,.075,.07),1,'head')
  for x in [-.04,0,.04]:box((x,-.117,.75),(.012,.012,.045),0,'head')
  for s,b,l in [(-1,'armL','legL'),(1,'armR','legR')]:
   cone((0,0,.70),(s*.19,0,.68),.02,.027,2,b)
   cone((s*.19,0,.68),(s*.25,-.025,.37),.023,.018,2,b)
   ico((s*.22,-.015,.52),(.035,.035,.035),1,b)
   cone((s*.08,0,.40),(s*.10,0,.08),.025,.02,2,l)
   box((s*.1,-.025,.055),(.065,.13,.055),1,l)
  blade(x=.27,z=.27)
 elif name in {'slime','slimelet'}:
  ico((0,0,.27),(.32,.28,.27),1,'body',2);ico((0,-.025,.37),(.19,.17,.18),3,'head',2)
  eyes(.32,-.245,.085,col=0)
  for s,b in [(-1,'legL'),(1,'legR')]:ico((s*.17,-.05,.07),(.18,.20,.08),1,b)
  if name=='slimelet':ico((.09,.035,.50),(.10,.10,.09),3,'head')
 elif name=='mimic':
  box((0,0,.28),(.53,.34,.26),'6f4733');box((0,0,.48),(.55,.36,.12),'986f43','head')
  for x in [-.21,.21]:box((x,-.18,.30),(.055,.035,.28),2);box((x,-.19,.48),(.055,.035,.12),2,'head')
  for x in [-.18,-.09,0,.09,.18]:spike((x,-.17,.42),(x,-.18,.34),.025,2,'head')
  eyes(.48,-.20,.1)
  for s,b in [(-1,'legL'),(1,'legR')]:cone((s*.20,0,.20),(s*.33,-.08,.04),.04,.022,0,b)
 elif name=='dummy':
  cone((0,0,.04),(0,0,.82),.038,.035,0)
  box((0,0,.08),(.45,.35,.08),0)
  ico((0,0,.56),(.18,.13,.23),1,'body',2);ico((0,0,.88),(.12,.10,.13),2,'head',2)
  for s,b in [(-1,'armL'),(1,'armR')]:cone((s*.12,0,.68),(s*.34,0,.60),.047,.04,1,b)
  for z in [.48,.56,.64]:box((0,-.133,z),(.27,.018,.025),0)
  ring((0,-.15,.58),.085,'ab5142','body');ico((0,-.16,.58),(.035,.014,.035),'eee2af','body')
  eyes(.89,-.101,.045,col=0)
 elif name=='embertotem':
  for i in range(3):
   z=.19+i*.25; cone((0,0,z-.1),(0,0,z+.1),.19-i*.025,.16-i*.015,1,'head' if i==2 else 'body',6)
   box((0,-.162+i*.014,z),(.15,.026,.041),3,'head' if i==2 else 'body')
  for s in [-1,1]:spike((s*.12,0,.75),(s*.17,.03,.94),.06,0,'head')
  ico((0,0,.84),(.07,.06,.17),3,'head')
 elif name=='bosscrystal':
  cone((0,0,.02),(0,0,.12),.24,.18,0,'body',6)
  ico((0,0,.58),(.14,.13,.4),3,'head')
  for s,b in [(-1,'armL'),(1,'armR')]:ico((s*.22,0,.40),(.055,.055,.20),2,b)
  ring((0,0,.55),.24,1,'body')
 else:
  ico((0,0,.52),(.15,.12,.21),0,'body',2)
  ico((0,-.015,.76),(.14,.10,.14),2,'head');eyes(.77,-.11,.055,col=0)
  if name=='flyer':
   for s,b in [(-1,'armL'),(1,'armR')]:
    # Three tapered panels form bat wings with a notched trailing edge.
    for i in range(3):cone((s*.11,0,.62),(s*(.32+i*.13),.10+i*.04,.48+i*.10),.085,.015,1,b,3)
    spike((s*.08,0,.85),(s*.14,.02,1.02),.047,0,'head')
  elif name=='sparkling':
   for i in range(6):
    a=i*math.pi/3;spike((0,0,.59),(math.cos(a)*.37,0,.59+math.sin(a)*.37),.08,3,'body')
  else:
   for i,b in enumerate(['legL','tail','legR']):cone(((i-1)*.08,0,.46),((i-1)*.13,.08,.10+(i%2)*.07),.066,0,1,b,4)
   for s,b in [(-1,'armL'),(1,'armR')]:cone((s*.1,0,.6),(s*.28,-.02,.41),.055,.02,1,b)
   if name=='voidtether':ring((0,.04,.66),.32,3,'body');ring((0,.04,.66),.25,1,'body')
   if name=='galewisp':ring((0,.02,.51),.26,3,'body')
def rig_and_export(name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join(); mesh=bpy.context.object;mesh.name=name+'_facets'
 mat=bpy.data.materials.new(name+'_palette');mat.use_nodes=True
 bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.86
 vc=mat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Color';mat.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color'])
 mesh.data.materials.clear();mesh.data.materials.append(mat)
 for p in mesh.data.polygons:p.material_index=0
 arm=bpy.data.armatures.new(name+'_rig');obj=bpy.data.objects.new(name+'_rig',arm);bpy.context.collection.objects.link(obj)
 bpy.context.view_layer.objects.active=obj;mesh.select_set(False);obj.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 quad=name in QUADS
 origins={'root':(0,0,0),'body':(0,0,.4),'head':(0,-.25,.4) if quad else (0,0,.77),'armL':(-.21,0,.68),'armR':(.21,0,.68),'legL':(-.15,-.19,.35) if quad else (-.1,0,.38),'legR':(.15,-.19,.35) if quad else (.1,0,.38),'rearL':(-.18,.25,.35),'rearR':(.18,.25,.35),'tail':(0,.28,.4)}
 if name=='mimic':origins['head']=(0,.15,.41)
 for n,p in origins.items():
  b=arm.edit_bones.new(n);b.head=p;b.tail=Vector(p)+Vector((0,0,.1))
  if n!='root':b.parent=arm.edit_bones['root' if n=='body' else 'body']
 bpy.ops.object.mode_set(mode='OBJECT')
 mesh.parent=obj;mod=mesh.modifiers.new('Skin','ARMATURE');mod.object=obj
 obj.animation_data_create();bpy.context.scene.render.fps=24
 durations={'Idle':48,'Move':24,'Windup':24,'Attack':12,'Hit':8,'Death':20}
 for clip,end in durations.items():
  act=bpy.data.actions.new(clip);obj.animation_data.action=act
  for frame in sorted(set([1,round(end*.25),round(end*.5),round(end*.75),end])):
   u=(frame-1)/(end-1);wave=math.sin(u*math.tau)
   for b in obj.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
   body=obj.pose.bones['body'];head=obj.pose.bones['head'];root=obj.pose.bones['root']
   if clip=='Idle':
    body.location.z=.012*wave;head.rotation_euler.z=.035*wave
    if name in FLOAT:body.location.z=.035*wave
    if name in {'slime','slimelet'}:body.scale=(1+.04*wave,1+.04*wave,1-.05*wave)
   elif clip=='Move':
    body.location.z=.025*abs(wave);body.rotation_euler.y=.035*wave
    for n,sign in [('legL',1),('legR',-1),('rearL',-1),('rearR',1),('armL',-1),('armR',1)]:obj.pose.bones[n].rotation_euler.x=sign*wave*(.45 if name not in FLOAT else .12)
    if name=='flyer':
     obj.pose.bones['armL'].rotation_euler.y=wave*.55;obj.pose.bones['armR'].rotation_euler.y=-wave*.55
    if name in {'slime','slimelet'}:body.scale=(1-.14*wave,1-.14*wave,1+.17*wave)
   elif clip=='Windup':
    body.rotation_euler.x=-.16*u;head.rotation_euler.x=-.10*u
    for n in ['armL','armR']:obj.pose.bones[n].rotation_euler.x=(-.85 if name in CASTERS or name=='archer' else -2.1)*u
    if quad:body.location.z=-.055*u;head.rotation_euler.x=.22*u
   elif clip=='Attack':
    pulse=math.sin(u*math.pi);body.rotation_euler.x=.25*pulse
    obj.pose.bones['armR'].rotation_euler.x=-1.35*pulse if name in CASTERS else -2.1*(1-u)**2
    obj.pose.bones['armL'].rotation_euler.x=-.75*pulse
    if name=='archer':
     obj.pose.bones['armL'].rotation_euler.x=-.55
     obj.pose.bones['armR'].rotation_euler.z=-.5*pulse
    if quad:head.rotation_euler.x=-.4*pulse
    if name=='mimic':head.rotation_euler.x=-.6*pulse
   elif clip=='Hit':body.rotation_euler.x=-.23*math.sin(u*math.pi);head.rotation_euler.y=.15*math.sin(u*math.pi)
   else:
    root.rotation_euler.x=-1.3*u;root.location.z=-.14*u
    body.rotation_euler.z=.22*u
    if name in FLOAT:root.location.z=-.35*u;root.rotation_euler.x=.4*u
   if name=='flyer' and clip=='Idle':
    obj.pose.bones['armL'].rotation_euler.y=wave*.35;obj.pose.bones['armR'].rotation_euler.y=-wave*.35
   for b in obj.pose.bones:
    b.keyframe_insert('rotation_euler',frame=frame,group=b.name);b.keyframe_insert('location',frame=frame,group=b.name);b.keyframe_insert('scale',frame=frame,group=b.name)
  obj.animation_data.action=None
  tr=obj.animation_data.nla_tracks.new();tr.name=clip;tr.strips.new(clip,1,act)
 # Mute NLA while measuring rest; exporter still reads each track as separate clip.
 for tr in obj.animation_data.nla_tracks:tr.mute=True
 for b in obj.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);mesh.select_set(True)
 path=OUT/(name+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_nla_strips_merged_animation_name='Animation',export_optimize_animation_size=True,export_materials='EXPORT',export_yup=True)
 tris=sum(len(p.vertices)-2 for p in mesh.data.polygons)
 return {'type':name,'theme':THEME[name],'triangles':tris,'bytes':path.stat().st_size,'bones':len(origins),'clips':list(durations),'label':ROSTER[name].get('label',name.replace('colossus',' Colossus').replace('frost','Frost ').title())}
def build(name):
 global parts,palette
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
 parts=[];palette=P[THEME[name]]
 if name in {'slime','slimelet'}:palette=['25483f','4c9c75','b7d99e','8ed5a3']
 if name=='bones':palette=['303540','a99f85','ddd2b0','c97852']
 if name in QUADS:quadruped(name)
 elif name in FLOAT or name in {'bones','slime','slimelet','dummy','mimic','embertotem'}:special(name)
 else:humanoid(name)
 return rig_and_export(name)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
names=args or list(ROSTER)
stats=[build(n) for n in names]
(OUT/('manifest.json' if not args else 'prototype.json')).write_text(json.dumps(stats,indent=2))
print('ENEMY_ART_DONE',len(stats),sum(s['triangles'] for s in stats),sum(s['bytes'] for s in stats))
