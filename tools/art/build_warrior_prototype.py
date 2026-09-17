"""Preview-only modular warrior; Blender 4.5. No gameplay assets are replaced."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'public/3d/prototypes/warrior';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for a in list(bpy.data.actions):bpy.data.actions.remove(a)
def mat(n,h,metal=0,rough=.5):
 m=bpy.data.materials.new(n);m.diffuse_color=(*h,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*h,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
M={'armor':mat('Armor',(.16,.24,.32),.7,.38),'trim':mat('Trim',(.68,.43,.16),.72,.32),'cloth':mat('Cloth',(.055,.22,.23),0,.92),'leather':mat('Leather',(.05,.034,.025),0,.9),'skin':mat('Skin',(.55,.32,.21),0,.78),'hair':mat('Hair',(.055,.026,.016),0,.9),'steel':mat('Steel',(.5,.61,.68),.85,.26),'eye':mat('Eyes',(.17,.75,.72),.25,.3)}
parts={}
def finish(o,name,bone,material,bevel=0):
 o.name=name;bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 if bevel:
  mod=o.modifiers.new('Forged edges','BEVEL');mod.width=bevel;mod.segments=1;bpy.ops.object.modifier_apply(modifier=mod.name)
 o.data.materials.append(M[material]);vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(o.data.vertices))),1,'REPLACE');parts.setdefault(name,[]).append(o);return o
def box(name,bone,pos,scale,material,bevel=.012):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.scale=scale;return finish(o,name,bone,material,bevel)
def ico(name,bone,pos,scale,material,sub=1):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos);o=bpy.context.object;o.scale=scale;return finish(o,name,bone,material)
def cone(name,bone,a,b,r1,r2,material,n=8):
 d=Vector(b)-Vector(a);bpy.ops.mesh.primitive_cone_add(vertices=n,radius1=r1,radius2=r2,depth=d.length,location=(Vector(a)+Vector(b))/2);o=bpy.context.object;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();return finish(o,name,bone,material)
def panel(name,bone,coords,depth,material):
 # Front silhouette extruded backward, with a raised center for broad readable planes.
 vs=[(x,y,z) for x,y,z in coords]+[(x,y+depth,z) for x,y,z in coords];n=len(coords);center=tuple(sum(p[k] for p in coords)/n for k in range(3));vs.append((center[0],center[1]-.022,center[2]));faces=[(i,(i+1)%n,2*n) for i in range(n)]+[tuple(range(n,2*n))]+[(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)];mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return finish(o,name,bone,material)
# Body undersuit and anatomical landmarks.
ico('body','hips',(0,0,1.0),(.22,.14,.16),'leather',2)
ico('body','chest',(0,0,1.37),(.275,.16,.27),'leather',2)
cone('body','neck',(0,0,1.56),(0,0,1.68),.075,.075,'skin')
cone('body','chest',(0,0,1.555),(0,0,1.655),.14,.105,'armor',10)
cone('body','chest',(0,0,1.648),(0,0,1.665),.11,.106,'trim',10)
# Plate cuirass, sternum crest and layered waist lames.
panel('body','chest',[(-.245,-.13,1.55),(-.10,-.18,1.59),(0,-.20,1.54),(.10,-.18,1.59),(.245,-.13,1.55),(.20,-.19,1.28),(0,-.23,1.19),(-.20,-.19,1.28)],.09,'armor')
for s in [-1,1]:
 cone('body','chest',(s*.02,-.246,1.29),(s*.19,-.208,1.5),.012,.009,'trim',4)
 panel('body','chest',[(s*.02,-.254,1.44),(s*.12,-.235,1.48),(s*.07,-.26,1.38)],.01,'trim')
for i in range(3):
 z=1.18-i*.055;panel('body','hips',[(-.19,-.15,z+.045),(.19,-.15,z+.045),(.17,-.17,z),(-.17,-.17,z)],.07,'armor')
box('body','hips',(0,-.18,1.035),(.43,.06,.065),'leather')
box('body','hips',(0,-.219,1.035),(.085,.018,.08),'trim',.006)
box('body','hips',(0,-.231,1.035),(.044,.008,.045),'cloth',.002)
# Split cloth, chain skirt side panels and metal tassets.
for s in [-1,1]:
 panel('body','hips',[(s*.018,-.17,1.00),(s*.15,-.16,1.0),(s*.13,-.17,.68),(s*.03,-.18,.64)],.018,'cloth')
 cone('body','hips',(s*.04,-.197,.67),(s*.06,-.187,.92),.005,.005,'trim',4)
 panel('body','hips',[(s*.155,-.10,1.03),(s*.28,-.045,1.0),(s*.27,-.07,.82),(s*.16,-.13,.86)],.065,'armor')
 # Arms: upper, elbow, forearm, wrist, articulated hand group.
 side='L' if s<0 else 'R';up='upper'+side;fore='fore'+side;hand='hand'+side
 cone('body',up,(s*.31,0,1.5),(s*.39,0,1.22),.085,.065,'leather')
 ico('body',fore,(s*.39,0,1.22),(.075,.075,.074),'steel')
 cone('body',fore,(s*.39,0,1.22),(s*.43,-.01,1.02),.083,.055,'armor')
 box('body',fore,(s*.418,-.054,1.105),(.095,.045,.17),'armor',.012)
 cone('body',fore,(s*.431,-.012,1.055),(s*.433,-.012,1.025),.064,.064,'trim')
 box('body',hand,(s*.435,-.01,.978),(.092,.08,.095),'leather',.015)
 box('body',hand,(s*.435,-.058,.982),(.09,.023,.072),'armor',.008)
 for j in range(4):box('body',hand,(s*(.401+j*.022),-.025,.929),(.019,.053,.033),'steel',.004)
 ico('body',hand,(s*.49,-.015,.977),(.025,.028,.04),'leather')
 # Upper leg, knee, shin and boot with toe cap.
 leg='thigh'+side;shin='shin'+side;foot='foot'+side
 cone('body',leg,(s*.12,0,.98),(s*.14,.0,.59),.103,.075,'leather')
 panel('body',leg,[(s*.055,-.079,.9),(s*.21,-.075,.9),(s*.20,-.081,.66),(s*.075,-.09,.64)],.06,'armor')
 ico('body',shin,(s*.14,-.03,.57),(.088,.10,.087),'armor')
 ico('body',shin,(s*.14,-.11,.57),(.032,.022,.035),'trim')
 cone('body',shin,(s*.14,0,.53),(s*.145,0,.17),.087,.063,'armor')
 cone('body',shin,(s*.145,-.078,.23),(s*.14,-.098,.49),.009,.012,'trim',4)
 box('body',foot,(s*.145,-.064,.10),(.16,.29,.15),'leather',.025)
 box('body',foot,(s*.145,-.143,.135),(.165,.14,.09),'armor',.018)
 box('body',foot,(s*.145,-.065,.029),(.172,.3,.025),'leather',.008)
 # Lightweight shoulders and heavy layered variant.
 ico('shoulders_light',up,(s*.31,0,1.5),(.137,.16,.095),'armor',1)
 for i in range(3):
  x=s*(.30+i*.043);z=1.56-i*.045
  ico('shoulders_heavy',up,(x,0,z),(.16-i*.02,.19-i*.014,.09),'armor',1)
  cone('shoulders_heavy',up,(x,-.171+i*.01,z+.01),(x+s*.07,-.16+i*.01,z-.028),.011,.008,'trim',4)
 # Side rivets.
 for z in [1.4,1.31]:ico('body','chest',(s*.22,-.192,z),(.012,.008,.012),'trim')
# Face deliberately retained under the removable helm.
ico('head','head',(0,-.005,1.79),(.112,.102,.145),'skin',2)
box('head','head',(0,-.025,1.71),(.13,.14,.073),'skin',.028)
ico('head','head',(0,-.112,1.79),(.023,.043,.042),'skin')
for s in [-1,1]:
 box('head','head',(s*.047,-.094,1.817),(.038,.012,.015),'leather',.002)
 box('head','head',(s*.047,-.102,1.817),(.017,.009,.01),'eye',.001)
 cone('head','head',(s*.026,-.103,1.838),(s*.079,-.089,1.831),.009,.008,'hair',4)
 ico('head','head',(s*.112,0,1.79),(.025,.026,.046),'skin')
ico('hair','head',(0,.007,1.88),(.117,.108,.066),'hair',2)
for s in [-1,1]:box('hair','head',(s*.098,.015,1.80),(.03,.1,.15),'hair',.014)
# Closed sallet, recessed eye slot and pointed lower visor.
ico('helmet','head',(0,.005,1.865),(.139,.132,.12),'armor',2)
for s in [-1,1]:
 panel('helmet','head',[(s*.008,-.146,1.858),(s*.126,-.12,1.844),(s*.116,-.129,1.827),(s*.008,-.154,1.837)],.018,'trim')
 panel('helmet','head',[(s*.008,-.16,1.81),(s*.115,-.13,1.8),(s*.088,-.14,1.73),(0,-.187,1.70)],.026,'armor')
 panel('helmet','head',[(s*.10,-.11,1.82),(s*.145,.01,1.83),(s*.129,.012,1.68),(s*.09,-.055,1.70)],.02,'armor')
 box('helmet','head',(s*.055,-.14,1.82),(.075,.011,.014),'leather',.001)
 box('helmet','head',(s*.055,-.148,1.82),(.052,.005,.005),'eye',.001)
 for j in range(3):box('helmet','head',(s*(.025+j*.023),-.158+j*.007,1.77),(.008,.009,.027),'leather',.001)
cone('helmet','head',(0,.04,1.97),(0,-.12,1.925),.026,.012,'trim',4)
# Cape has two weighted panels, folded facets, shoulder clasps.
for j in range(5):
 x=(j-2)*.09;y=.165+(j%2)*.025
 panel('cape','capeUpper',[(x-.048,y,1.55),(x+.048,y,1.55),(x+.07,y+.085,1.05),(x-.07,y+.085,1.05)],.012,'cloth')
 panel('cape','capeLower',[(x-.07,y+.085,1.05),(x+.07,y+.085,1.05),(x+.065,y+.10,.64+abs(j-2)*.025),(x-.065,y+.10,.64+abs(j-2)*.025)],.012,'cloth')
for s in [-1,1]:ico('cape','chest',(s*.19,-.10,1.565),(.036,.015,.034),'trim')
# Sword attached to right hand. Fuller, guard, grip, pommel, faceted diamond blade.
cone('sword','handR',(.435,-.055,.89),(.435,-.055,1.065),.024,.024,'leather')
ico('sword','handR',(.435,-.055,.872),(.033,.03,.032),'trim')
box('sword','handR',(.435,-.055,1.067),(.26,.06,.035),'trim',.008)
panel('sword','handR',[(.388,-.08,1.09),(.482,-.08,1.09),(.471,-.08,1.61),(.435,-.08,1.77),(.399,-.08,1.61)],.035,'steel')
cone('sword','handR',(.435,-.106,1.15),(.435,-.106,1.59),.006,.003,'trim',4)
# Heater shield carried on the left forearm.
panel('shield','foreL',[(-.62,-.11,1.28),(-.26,-.11,1.28),(-.275,-.13,.99),(-.435,-.17,.79),(-.60,-.13,.99)],.055,'trim')
panel('shield','foreL',[(-.595,-.17,1.25),(-.285,-.17,1.25),(-.30,-.19,1.0),(-.435,-.21,.83),(-.575,-.19,1.0)],.018,'armor')
panel('shield','foreL',[(-.45,-.24,1.22),(-.42,-.24,1.22),(-.42,-.25,.97),(-.435,-.25,.92),(-.45,-.25,.97)],.008,'trim')
panel('shield','foreL',[(-.54,-.23,1.13),(-.435,-.26,1.17),(-.33,-.23,1.13),(-.435,-.26,1.09)],.008,'trim')
# Stable hierarchy: local joints, separate hands and feet, two cape bones.
orig={'root':(0,0,0),'hips':(0,0,1.0),'spine':(0,0,1.18),'chest':(0,0,1.4),'neck':(0,0,1.59),'head':(0,0,1.69),'capeUpper':(0,.16,1.55),'capeLower':(0,.25,1.05)}
parents={'hips':'root','spine':'hips','chest':'spine','neck':'chest','head':'neck','capeUpper':'chest','capeLower':'capeUpper'}
for s,side in [(-1,'L'),(1,'R')]:
 for n,p,parent in [('upper',(s*.30,0,1.50),'chest'),('fore',(s*.39,0,1.22),'upper'+side),('hand',(s*.435,-.01,1.01),'fore'+side),('thigh',(s*.12,0,.97),'hips'),('shin',(s*.14,0,.57),'thigh'+side),('foot',(s*.145,0,.16),'shin'+side)]:orig[n+side]=p;parents[n+side]=parent
arm=bpy.data.armatures.new('WarriorRig');rig=bpy.data.objects.new('WarriorRig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for n,p in orig.items():
 b=arm.edit_bones.new(n);b.head=p;b.tail=Vector(p)+Vector((0,0,.07))
 if n in parents:b.parent=arm.edit_bones[parents[n]]
bpy.ops.object.mode_set(mode='OBJECT')
meshes=[]
for slot,objects in parts.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name='part_'+slot;o.parent=rig;mod=o.modifiers.new('Skin','ARMATURE');mod.object=rig;meshes.append(o)
rig.animation_data_create();bpy.context.scene.render.fps=24
for clip,frames in [('Idle',48),('Walk',24),('Guard',48),('Slash',30)]:
 action=bpy.data.actions.new(clip);rig.animation_data.action=action
 for frame in range(1,frames+1):
  u=(frame-1)/(frames-1);wave=math.sin(u*math.tau)
  for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
  def rot(n,x=0,y=0,z=0):rig.pose.bones[n].rotation_euler=(x,y,z)
  rig.pose.bones['chest'].location.z=.005*wave;rot('upperL',0,0,-.08);rot('upperR',0,0,.08)
  rot('capeUpper',.035*wave);rot('capeLower',.055*math.sin(u*math.tau-.5))
  if clip=='Walk':
   for side,sign in [('L',1),('R',-1)]:rot('thigh'+side,.36*wave*sign);rot('shin'+side,.55*max(0,-wave*sign));rot('upper'+side,-.22*wave*sign);rot('fore'+side,.14)
   rig.pose.bones['hips'].location.z=.015*abs(wave)
  if clip=='Guard':rot('upperL',-.75,0,-.25);rot('foreL',.6);rot('upperR',-.5,0,-.35);rot('foreR',.65);rot('handR',-.25);rot('chest',0,0,-.10)
  if clip=='Slash':
   wind=min(1,u/.35);strike=max(0,min(1,(u-.35)/.2));recover=max(0,(u-.55)/.45);hold=1-recover
   rot('chest',.08*strike*hold,0,(-.25*wind+.6*strike)*hold);rot('upperR',(-1.0*wind+.65*strike)*hold,-.25*wind*hold,(-.25*wind+.5*strike)*hold);rot('foreR',(.7*wind-.5*strike)*hold);rot('handR',(-.4*wind+1.0*strike)*hold);rot('upperL',-.5*hold,0,-.25*hold);rot('foreL',.45*hold)
  for b in rig.pose.bones:b.keyframe_insert('rotation_euler',frame=frame);b.keyframe_insert('location',frame=frame)
 rig.animation_data.action=None;track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,action);track.mute=True
for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
bpy.context.scene.frame_set(1);bpy.context.view_layer.update();bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in meshes:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'warrior.glb'),export_format='GLB',use_selection=True,export_animation_mode='NLA_TRACKS',export_animations=True,export_force_sampling=True,export_frame_range=False)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'warrior.blend'))
(OUT/'manifest.json').write_text(json.dumps({'bones':len(orig),'slots':[o.name for o in meshes],'trianglesAllOptions':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes),'bytes':(OUT/'warrior.glb').stat().st_size,'clips':['Idle','Walk','Guard','Slash']},indent=2))
