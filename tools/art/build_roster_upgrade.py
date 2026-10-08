"""Rebuild Bladefall's complete standard and Prison Break enemy art on production rigs.

Run: blender -b -t 4 --python tools/art/build_roster_upgrade.py -- [type ...]
The legacy GLBs remain untouched. The named pieces and bone assignments in this
file are the editable source for the versioned production exports.
"""
import bpy
import json
import math
import sys
from collections import defaultdict
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'public/3d/enemy-assets'
OUT = ASSETS / 'upgraded'
OUT.mkdir(exist_ok=True)
ROSTER = json.loads((ROOT / 'tools/art/enemy-roster.json').read_text())
THEME = {
 'wood':'grunt goblin toxling thornboar sporeback brute slime slimelet dummy',
 'sand':'archer charger dustjackal cragspitter galewisp',
 'ruin':'bones caster sentinel revenant warden mimic',
 'ice':'frostling frostshell frostlobber sorcerer officer-shield officer-spear',
 'fire':'emberling magmaskit embertotem',
 'void':'flyer shadeling sparkling blinkstalker voidtether bosscrystal king',
 'sun':'sunpriest marblestatue',
 'royal':'siegeknight royalarcanist tyrant',
}
THEME_OF={n:k for k,v in THEME.items() for n in v.split()}
PRISON_BASE={
 'prison_pike':'grunt','prison_guard':'sentinel','prison_hound':'dustjackal',
 'prison_vessel':'embertotem','prison_bell':'siegeknight',
 'prison_maw':'charger','prison_unbound':'tyrant'
}
PRISON_THEME={'prison_pike':'ruin','prison_guard':'ruin','prison_hound':'sand',
 'prison_vessel':'fire','prison_bell':'royal','prison_maw':'ruin','prison_unbound':'void'}
THEME_OF.update(PRISON_THEME)
COLORS={
 # Blender interprets these as linear values, so restraint here is essential:
 # mid-grey hex codes become pale plastic under the game's lighting.
 'wood':('#171d19','#303c29','#685943','#a88b60','#acd963','#d2b88a'),
 'sand':('#1d2021','#42362c','#796044','#baa276','#58b7b3','#e2d0a2'),
 'ruin':('#121920','#28333b','#555652','#9b8d75','#c74736','#d5c09c'),
 'ice':('#14202c','#2b4a5d','#557d94','#a4c3cd','#45d8ed','#e2f7fb'),
 'fire':('#16191e','#352724','#684335','#9e6e49','#f56a19','#ffd092'),
 'void':('#14121c','#342840','#604a70','#9980aa','#a658e1','#e3c6fb'),
 'sun':('#20252d','#52585b','#a49c82','#dfd6b3','#e1a933','#fff0ad'),
 'royal':('#161825','#30344e','#5e6079','#9e8b8d','#9e5bc6','#e5caef'),
}
# Four hand-authored identity colours per appearance: armor/hide, secondary,
# trim, and exposed magic/eye. Shared bone/mesh construction no longer means
# every foe from one region wears the same skin. The dark base and highlight
# still come from the region so a pack reads together at normal camera height.
IDENTITY={
 'grunt':('27352f','526859','b49d72','bde08d'),
 'flyer':('283748','536d7f','83b7b7','a4e6ee'),
 'emberling':('422820','a44d2a','d89450','ff8d33'),
 'frostling':('264b67','5f9cb6','b7dbe0','7ce8ff'),
 'toxling':('35442a','718c39','b4a064','b9eb53'),
 'shadeling':('29233c','53456d','8b70a0','c48aff'),
 'sparkling':('334e72','7399b3','c0c9d8','85dafa'),
 'goblin':('394630','736b42','d0a75a','c9e67b'),
 'bones':('494037','a79e82','d3c6a2','e3b46d'),
 'slime':('20534f','378f80','7ac4a2','b0eecb'),
 'slimelet':('326c60','5aaf8e','abe0b3','dbf6d0'),
 'caster':('372e37','625568','b99070','d27aef'),
 'charger':('4f4339','897765','b99d69','efa66e'),
 'mimic':('573b2b','9a7051','dbb369','e27950'),
 'dustjackal':('75533b','a37b54','e2b87d','e8cb94'),
 'cragspitter':('494944','837967','b9a176','81d7cf'),
 'galewisp':('385568','65a0b0','c3d8cc','a0f2ec'),
 'thornboar':('32422e','697b4c','ac9a62','bce070'),
 'sporeback':('4b3659','826994','b8999a','d6afeb'),
 'sentinel':('303c50','596d7c','c1a57c','79bfe5'),
 'revenant':('423637','79635b','c4a487','e5806b'),
 'dummy':('604d35','b4945c','e0c580','dd7152'),
 'bosscrystal':('373861','6769aa','b7a4df','b999ff'),
 'frostshell':('344e65','7399a7','c5d8dc','8cedfa'),
 'frostlobber':('315c67','74adb9','bfddd6','89ecf3'),
 'magmaskit':('43372f','7f5941','d58e55','ff7830'),
 'embertotem':('49302b','8e5243','c28c64','f78938'),
 'blinkstalker':('272b46','4a5078','9e95ba','b685eb'),
 'voidtether':('30233e','614a76','af8ac2','cf88ff'),
 'sunpriest':('6b6452','b7a780','e6cb82','fff1a4'),
 'marblestatue':('626b70','b5b7ac','e9dcb3','f6d783'),
 'siegeknight':('30364c','5e6478','c69b70','e17a64'),
 'royalarcanist':('383b68','6969a1','c7aacb','b9a5f4'),
 'brute':('383231','68514a','bc8f65','f9814d'),
 'warden':('3e3e46','787275','bca49a','e78672'),
 'archer':('434e45','818466','c5a879','a4ce8d'),
 'sorcerer':('2a4a67','5d8da2','bdd6e0','8de9ff'),
 'king':('302543','624477','ad83bd','cd85ff'),
 'tyrant':('38203f','794a7c','c992ae','eb7de2'),
 'officer-shield':('304358','627990','c6b18b','8edcf2'),
 'officer-spear':('364a5d','718f9f','d4bf91','89e8fa'),
 'prison_pike':('303941','677f85','c0ae86','8dd6dc'),
 'prison_guard':('393b3b','706858','caab77','f0bb63'),
 'prison_hound':('493d38','8c6a57','c7a68a','e8a075'),
 'prison_vessel':('422c28','93634a','d5a05e','ff9b51'),
 'prison_bell':('3d3440','7b6170','d0a86e','e5b96e'),
 'prison_maw':('343d3c','71817b','b9a888','ea9b70'),
 'prison_unbound':('342b4e','796192','c2a6c3','d799fb'),
}
HUMANOID=set('grunt goblin bones caster sentinel revenant frostling frostlobber emberling toxling blinkstalker sunpriest marblestatue siegeknight royalarcanist brute warden archer sorcerer king tyrant'.split())
QUAD=set('charger dustjackal cragspitter thornboar sporeback frostshell magmaskit'.split())
FLOAT=set('flyer shadeling sparkling galewisp voidtether'.split())
SMALL=set('slime slimelet mimic dummy bosscrystal embertotem'.split())
BOSSES=set('brute warden archer sorcerer king tyrant prison_bell prison_maw prison_unbound'.split())
ARGS=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
NAMES=ARGS or [n for n in ROSTER if n not in {'colossus','marblecolossus'}]+['officer-shield','officer-spear']+list(PRISON_BASE)
MANIFEST=[]

def color(code):
 # Artist-facing hex values are sRGB. Principled BSDF sockets expect linear
 # light values; skipping this conversion made black iron look pastel grey.
 def linear(v):
  s=int(v,16)/255
  return s/12.92 if s<=.04045 else ((s+.055)/1.055)**2.4
 return tuple(linear(code[i:i+2]) for i in (1,3,5))

def material(label,hexcode,metal=0,rough=.76,glow=0):
 m=bpy.data.materials.new(label);m.use_nodes=True
 c=(*color(hexcode),1);m.diffuse_color=c
 p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=c;p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if glow:p.inputs['Emission Color'].default_value=c;p.inputs['Emission Strength'].default_value=glow
 return m

def lift(code,factor):
 return '#'+''.join(f'{min(255,round(int(code[i:i+2],16)*factor)):02x}' for i in (1,3,5))

def make_palette(name):
 p=list(COLORS[THEME_OF[name]])
 p[1:5]=['#'+value for value in IDENTITY[name]]
 # Keep the dark recesses, but lift the midtone so a figure remains legible at
 # the normal combat camera. Organic skin/hide must not shine like plate steel.
 p[1]=lift(p[1],1.22);p[2]=lift(p[2],1.10)
 design=PRISON_BASE.get(name,name)
 organic=design in QUAD|FLOAT|{'slime','slimelet','goblin','bones','emberling','frostling','toxling','blinkstalker'}
 return [material('%s %s'%(name,i),c,
                  (.12 if i==1 else .46 if i==3 else .02) if organic else (.46 if i in (1,3) else .04),
                  (.78 if i in (0,1,2) else .52) if organic else (.49 if i in (1,3) else .79),
                  1.25 if i==4 else 0) for i,c in enumerate(p)]

def source(name):
 if name in PRISON_BASE:return OUT/(PRISON_BASE[name]+'-v2128.glb') if not PRISON_BASE[name].startswith('officer-') else ASSETS/'officers'/(PRISON_BASE[name][8:]+'.glb')
 if name.startswith('officer-'):return ASSETS/'officers'/(('shield' if name.endswith('shield') else 'spear')+'.glb')
 if name in {'brute','warden','archer'}:return ASSETS/'articulated'/(name+'-v1980.glb')
 if (ASSETS/'articulated'/(name+'.glb')).exists():return ASSETS/'articulated'/(name+'.glb')
 return ASSETS/(name+'.glb')

def arm_bone(b):
 if b in RIG.data.bones:return b
 for candidate in ('body','head','armR','forearmR','root'):
  if candidate in RIG.data.bones:return candidate
 return next(iter(RIG.data.bones)).name

def add(obj,title,mat,bone,bevel=0):
 obj.name=title;obj.data.materials.append(PAL[mat]);obj['bone']=arm_bone(bone)
 if bevel:
  q=obj.modifiers.new('forged edge','BEVEL');q.width=bevel;q.segments=1
  obj.modifiers.new('weighted normals','WEIGHTED_NORMAL')
 PARTS.append(obj);return obj

def cube(title,pos,size,mat,bone='body',bevel=.006,rot=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if rot:o.rotation_euler=rot
 return add(o,title,mat,bone,bevel)

def ico(title,pos,size,mat,bone='body',sub=1):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos);o=bpy.context.object;o.scale=size
 return add(o,title,mat,bone)

def taper(title,a,b,r0,r1,mat,bone='body',sides=8):
 a,b=Vector(a),Vector(b);d=b-a
 bpy.ops.mesh.primitive_cone_add(vertices=sides,radius1=r0,radius2=r1,depth=d.length,location=(a+b)*.5)
 o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
 return add(o,title,mat,bone,.003)

def rod(title,pts,r,mat,bone='body'):
 curve=bpy.data.curves.new(title,'CURVE');curve.dimensions='3D';curve.bevel_depth=r;curve.bevel_resolution=1
 spline=curve.splines.new('POLY');spline.points.add(len(pts)-1)
 for p,v in zip(spline.points,pts):p.co=(*v,1)
 o=bpy.data.objects.new(title,curve);bpy.context.collection.objects.link(o)
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.object.convert(target='MESH');return add(bpy.context.object,title,mat,bone)

def plate(title,pts,mat,bone='body',depth=.012):
 me=bpy.data.meshes.new(title);me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update()
 o=bpy.data.objects.new(title,me);bpy.context.collection.objects.link(o);add(o,title,mat,bone)
 q=o.modifiers.new('thickness','SOLIDIFY');q.thickness=depth
 return o

def ring(title,pos,r,mat,bone='body',rotation=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=16,minor_segments=4,location=pos,major_radius=r,minor_radius=.012)
 o=bpy.context.object
 if rotation:o.rotation_euler=rotation
 return add(o,title,mat,bone)

def eyes(name,z=.92,y=-.155,width=.055,mat=4):
 for side in (-1,1):
  cube(name+' recessed eye', (side*width,y,z),(.055,.012,.018),0,'head',.001)
  cube(name+' iris', (side*width,y-.009,z),(.025,.012,.010),mat,'head',.001)

def foundation_humanoid(name):
 heavy=name in BOSSES|{'siegeknight','sentinel','marblestatue'}
 lean=name in {'goblin','blinkstalker','toxling','emberling','frostling','archer','caster','sorcerer'}
 w=.33 if name=='brute' else .275 if name in {'warden','siegeknight','prison_bell'} else .25 if heavy else .18 if lean else .22
 ico('layered torso',(0,.015,.63),(w,.145,.23),1,'body',2)
 taper('waist taper',(0,0,.43),(0,0,.66),w*.73,w*.96,0,'body',10)
 ico('hip socket',(0,.018,.43),(.155,.13,.095),0,'body',2)
 taper('neck',(0,0,.74),(0,0,.88),.085,.079,0,'head',8)
 for side in (-1,1):
  arm='armL' if side<0 else 'armR';fore='forearmL' if side<0 else 'forearmR'
  leg='legL' if side<0 else 'legR';shin='shinL' if side<0 else 'shinR'
  x=side*(w+.025)
  ico('shoulder joint',(x,0,.72),(.095,.10,.09),0,arm,2)
  taper('long upper arm',(x,0,.70),(side*(w+.065),-.015,.52),
      .080 if heavy else .066,.066,1,arm,10)
  ico('elbow joint',(side*(w+.065),-.015,.52),(.06,.067,.055),0,fore,2)
  taper('shaped forearm',(side*(w+.065),-.015,.52),
      (side*(w+.09),-.04,.35),.065,.050,1,fore,10)
  ico('closed hand',(side*(w+.09),-.065,.34),(.058,.07,.07),0,fore,2)
  ico('upper thigh',(side*.10,.015,.34),(.078,.105,.17),1,leg,2)
  taper('thigh',(side*.10,.01,.38),(side*.115,-.005,.23),.078,.069,1,leg,10)
  ico('knee',(side*.115,-.005,.23),(.07,.072,.065),0,leg,2)
  taper('calf',(side*.115,-.005,.23),(side*.12,-.015,.08),.064,.052,1,shin,10)
  ico('heel',(side*.12,-.012,.055),(.071,.097,.065),0,shin,2)

def elemental_body(name):
 # These enemies are creatures, never miniature soldiers in armor.
 broad=name=='frostling';thin=name=='blinkstalker'
 width=.26 if broad else .145 if thin else .19
 ico('inhuman thorax',(0,.01,.61),(width,.13,.22),0,'body',2)
 ico('exposed beating core',(0,-.115,.64),(.09,.045,.12),4,'body',2)
 taper('hollow waist',(0,0,.40),(0,0,.62),width*.65,width*.83,1,'body',9)
 ico('predatory skull',(0,-.03,.89),(.13 if thin else .16,.13,.15),1,'head',2)
 plate('lower muzzle',[(-.095,-.15,.88),(.095,-.15,.88),
    (.065,-.19,.79),(0,-.20,.75),(-.065,-.19,.79)],0,'head',.014)
 eyes(name,z=.90,y=-.167,width=.055,mat=4)
 for side in (-1,1):
  arm='armL' if side<0 else 'armR';fore='forearmL' if side<0 else 'forearmR'
  leg='legL' if side<0 else 'legR';shin='shinL' if side<0 else 'shinR'
  elbow=side*(width+.10)
  ico('free shoulder',(side*(width+.025),.01,.73),(.085,.082,.09),2,arm,2)
  taper('long sinew',(side*(width+.025),0,.70),(elbow,-.025,.48),.065,.037,1,arm)
  ico('joint',(elbow,-.025,.48),(.044,.048,.05),0,fore)
  taper('reach forearm',(elbow,-.025,.48),(side*(width+.15),-.10,.29),.055,.032,1,fore)
  ico('open taloned hand',(side*(width+.15),-.10,.29),(.055,.06,.05),0,fore)
  taper('spring thigh',(side*.10,0,.41),(side*.16,.035,.24),.080,.049,1,leg)
  ico('haunch',(side*.16,.035,.24),(.06,.065,.07),2,leg)
  taper('rear hock',(side*.16,.035,.24),(side*.13,-.06,.08),.053,.033,1,shin)
  ico('claw foot',(side*.13,-.115,.07),(.095,.14,.055),0,shin)
 if name=='frostling':
  for side in (-1,1):
   plate('ice shelf pauldron',[(side*.12,-.02,.83),(side*.32,.07,.84),
      (side*.36,.09,.61),(side*.19,-.02,.65)],3,'armL' if side<0 else 'armR',.02)
 if name=='toxling':
  for side in (-1,1):
   ico('swollen chemical gland',(side*.13,.09,.54),(.11,.10,.13),4,'body',2)
   rod('winding vein',[(side*.10,-.13,.70),(side*.16,-.06,.52),
      (side*.25,-.09,.42)],.012,4,'body')
 if name=='emberling':
  for side in (-1,1):
   plate('charred chest shell',[(side*.02,-.13,.78),(side*.19,-.11,.78),
      (side*.18,-.15,.49),(side*.05,-.15,.49)],1,'body',.018)
   rod('lava fracture',[(side*.04,-.17,.71),(side*.12,-.17,.61),
      (side*.07,-.17,.51)],.012,4,'body')
 if name=='blinkstalker':
  plate('blade-like spine',[(-.12,.12,.81),(.12,.12,.81),
    (.16,.18,.29),(0,.22,.08),(-.16,.18,.29)],0,'body',.014)
  for side in (-1,1):
   taper('forearm blade',(side*.28,-.10,.34),(side*.35,-.15,.03),.045,.002,3,'forearmL' if side<0 else 'forearmR',5)

def bare_bones():
 # An actual rib cage and skull instead of the Legion armor template.
 taper('spine',(0,0,.41),(0,0,.78),.038,.045,5,'body',8)
 ico('pelvis',(0,0,.42),(.15,.10,.065),5,'body',2)
 ico('cracked skull',(0,0,.88),(.145,.12,.14),5,'head',2)
 plate('upper jaw',[(-.10,-.11,.87),(.10,-.11,.87),(.08,-.14,.79),
    (-.08,-.14,.79)],5,'head',.018)
 for side in (-1,1):
  for z in (.57,.62,.67,.72):
   rod('curved exposed rib',[(0,-.05,z),(side*.15,-.13,z+.015),
      (side*.17,.02,z+.055)],.012,5,'body')
  arm='armL' if side<0 else 'armR';fore='forearmL' if side<0 else 'forearmR'
  leg='legL' if side<0 else 'legR';shin='shinL' if side<0 else 'shinR'
  taper('humerus',(side*.17,0,.72),(side*.22,-.02,.50),.035,.028,5,arm)
  ico('bone elbow',(side*.22,-.02,.50),(.040,.038,.04),5,fore)
  taper('forearm bones',(side*.22,-.02,.50),(side*.25,-.035,.30),.034,.024,5,fore)
  ico('claw hand',(side*.25,-.04,.30),(.052,.055,.045),5,fore)
  taper('femur',(side*.10,0,.40),(side*.11,0,.24),.045,.033,5,leg)
  ico('patella',(side*.11,0,.24),(.043,.04,.045),5,leg)
  taper('shin bone',(side*.11,0,.24),(side*.11,-.01,.07),.035,.023,5,shin)
  ico('bony foot',(side*.11,-.08,.055),(.062,.10,.04),5,shin)
 eyes('empty sockets',z=.91,y=-.123,width=.052,mat=0)
 plate('torn Legion shoulder',[( -.24,.04,.74),(-.07,.03,.78),
       (-.08,.12,.66),(-.25,.14,.66)],2,'armL',.016)

def scavenger_body():
 ico('bent scavenger torso',(0,.035,.55),(.18,.135,.20),1,'body',2)
 ico('underslung satchel belly',(0,-.10,.47),(.13,.07,.12),2,'body',2)
 ico('goblin skull',(0,-.06,.78),(.15,.13,.15),1,'head',2)
 plate('long triangular nose',[(-.04,-.17,.79),(.04,-.17,.79),
    (0,-.25,.69)],2,'head',.013)
 eyes('goblin',z=.83,y=-.175,width=.07)
 for side in (-1,1):
  arm='armL' if side<0 else 'armR';fore='forearmL' if side<0 else 'forearmR'
  leg='legL' if side<0 else 'legR';shin='shinL' if side<0 else 'shinR'
  taper('bent arm',(side*.17,0,.62),(side*.24,-.01,.46),.048,.036,1,arm)
  taper('reach forearm',(side*.24,-.01,.46),(side*.26,-.11,.29),.044,.031,1,fore)
  ico('grasping hand',(side*.26,-.11,.29),(.054,.06,.055),0,fore)
  ico('wide haunch',(side*.14,.01,.36),(.077,.085,.08),1,leg)
  taper('short thigh',(side*.14,.01,.36),(side*.20,.04,.21),.07,.047,1,leg)
  taper('hocked shin',(side*.20,.04,.21),(side*.13,-.06,.08),.052,.030,1,shin)
  ico('broad bare foot',(side*.13,-.09,.07),(.09,.14,.055),0,shin)
 plate('left scavenged jerkin',[(-.15,-.13,.66),(-.02,-.15,.68),
       (-.02,-.18,.42),(-.18,-.14,.45)],2,'body',.012)
 plate('right scavenged jerkin',[(.01,-.15,.66),(.16,-.13,.64),
       (.15,-.15,.44),(.01,-.18,.42)],1,'body',.012)
 rod('leather lacing',[(-.025,-.19,.62),(.02,-.19,.56),
      (-.025,-.19,.50),(.02,-.19,.44)],.007,3,'body')

def foundation_beast(name):
 long=name in {'dustjackal','charger','thornboar'}
 body={
  'dustjackal':(.23,.49,.18),'charger':(.34,.40,.24),
  'thornboar':(.37,.40,.25),'cragspitter':(.37,.32,.17),
  'sporeback':(.31,.39,.18),'frostshell':(.34,.33,.17),
  'magmaskit':(.29,.31,.16),
 }.get(name,(.28,.39,.19))
 ico('creature trunk',(0,.035,.43),body,1,'body',2)
 ico('ribcage',(0,-.16,.46),(body[0]*.92,.23,body[2]*1.08),1,'body',2)
 ico('haunches',(0,.26,.42),(body[0]*.88,.21,body[2]),0,'body',2)
 neck=(.14,.14) if name in {'cragspitter','frostshell','magmaskit'} else (.20,.13) if name in {'charger','thornboar'} else (.16,.11)
 taper('forward neck',(0,-.15,.49),(0,-.34,.45),neck[0],neck[1],1,'head',10)
 skull={
  'dustjackal':(.14,.19,.13),'charger':(.23,.16,.18),
  'thornboar':(.21,.19,.17),'cragspitter':(.25,.15,.12),
  'sporeback':(.20,.16,.13),'frostshell':(.19,.14,.12),
  'magmaskit':(.18,.12,.10),
 }.get(name,(.17,.18,.14))
 ico('species skull',(0,-.36,.47),skull,1,'head',2)
 muzzle={
  'dustjackal':(.10,.61,.34),'charger':(.14,.54,.31),
  'thornboar':(.18,.60,.28),'cragspitter':(.21,.52,.27),
  'sporeback':(.15,.53,.31),'frostshell':(.13,.49,.32),
  'magmaskit':(.10,.48,.30),
 }.get(name,(.11,.59,.33))
 taper('species muzzle',(0,-.40,.39),(0,-muzzle[1],muzzle[2]),muzzle[0],muzzle[0]*.58,2,'head',8)
 if name not in {'cragspitter','magmaskit','frostshell'}:
  ico('nose',(0,-muzzle[1]-.009,muzzle[2]),(.072,.043,.051),0,'head',2)
 for side in (-1,1):
  for rear in (False,True):
   y=.27 if rear else -.21;b=('rear' if rear else 'leg')+('L' if side<0 else 'R')
   ico('leg hip',(side*.22,y,.36),(.085,.10,.09),0,b,2)
   taper('heavy leg',(side*.23,y,.36),(side*.25,y-.035,.09),.090,.056,1,b,10)
   ico('planting paw',(side*.25,y-.10,.07),(.105,.14,.07),2,b,2)

def foundation_float(name):
 ico('dark inner body',(0,.03,.63),(.17,.15,.22),0,'body',2)
 ico('outer luminous mantle',(0,-.01,.67),(.14,.135,.20),2,'body',2)
 if name!='sparkling':
  ico('head source',(0,-.06,.83),(.13,.12,.13),1,'head',2)
  for side in (-1,1):
   taper('floating tendril',(side*.10,.035,.50),(side*.19,.12,.10),.050,.006,1,'tail',6)

def foundation_object(name):
 if name in {'slime','slimelet'}:
  r=.29 if name=='slime' else .23
  ico('wide pooled gelatin',(0,.035,.135),(r*1.38,r*1.26,.13),1,'body',2)
  for side in (-1,1):
   ico('rolling outer lobe',(side*r*.72,-.095,.105),(r*.53,r*.61,.088),2,'body',2)
 elif name=='mimic':
  cube('deep wooden trunk',(0,0,.28),(.53,.37,.27),1,'body',.025)
  cube('jaw lid',(0,.025,.49),(.57,.40,.14),2,'head',.029)
  cube('mouth shadow',(0,-.188,.39),(.47,.02,.08),0,'body',.001)
 elif name=='dummy':
  taper('oak support',(0,0,.03),(0,0,.84),.050,.039,1,'root')
  ico('straw torso',(0,0,.58),(.18,.14,.25),2,'body',2)
  ico('cloth head',(0,0,.87),(.12,.11,.13),2,'head',2)
  for side in (-1,1):taper('training arm',(side*.12,0,.68),(side*.33,0,.62),.051,.039,2,'armL' if side<0 else 'armR')
 elif name=='bosscrystal':
  ico('hovering prism',(0,0,.55),(.15,.15,.38),4,'head',1)
  taper('ancient pedestal',(0,0,.03),(0,0,.17),.23,.16,1,'body',8)
 elif name=='embertotem':
  for n,z in enumerate((.19,.45,.71)):
   taper('stacked shrine',(0,0,z-.13),(0,0,z+.13),.23-n*.023,.17-n*.014,1,'body' if n<2 else 'head',8)

def armor(name):
 elite=name in BOSSES|{'siegeknight','sentinel','marblestatue'}
 mage=name in {'caster','frostlobber','sunpriest','royalarcanist','sorcerer','king'}
 scout=name=='archer'
 light=name in {'goblin','blinkstalker','toxling','emberling','frostling'}
 shape=.29 if elite and not (mage or scout) else .21 if mage else .19 if scout or light else .235
 # Separate tapered metal/cloth planes give the torso actual construction.
 for side in (-1,1):
  plate('split breastplate',[(side*.014,-.145,.76),(side*shape,-.105,.78),
       (side*(shape-.02),-.15,.54),(side*.055,-.174,.52)],2 if mage or scout else 1,'body',.017 if mage or scout else .022)
  rod('plate seam',[(side*.045,-.185,.745),(side*(shape-.035),-.170,.70),
      (side*(shape-.05),-.174,.56)],.004,3,'body')
  arm='armL' if side<0 else 'armR';fore='forearmL' if side<0 else 'forearmR'
  if mage or scout:
   plate('soft shoulder drape',[(side*(shape-.06),-.11,.84),(side*(shape+.10),-.08,.80),
       (side*(shape+.16),.08,.61),(side*(shape+.03),-.14,.60)],2,arm,.012)
   rod('drape embroidered edge',[(side*(shape-.05),-.12,.83),
       (side*(shape+.13),.07,.63)],.006,3,arm)
  else:
   ico('shoulder socket',(side*(shape+.03),0,.73),(.105,.13,.12),0,arm,2)
   plate('sloped shoulder shell',[(side*(shape-.05),-.11,.84),(side*(shape+.13),-.09,.83),
        (side*(shape+.19),.05,.67),(side*(shape+.04),-.13,.66)],1,arm,.025)
   rod('shoulder rim',[(side*(shape-.05),-.12,.84),(side*(shape+.13),-.11,.83),
       (side*(shape+.19),.045,.67)],.007,3,arm)
  ico('sculpted vambrace',(side*(shape+.10),-.065,.43),(.067 if mage or scout else .083,.095,.145),2 if mage or scout else 1,fore,2)
  plate('vambrace front ridge',[(side*(shape+.05),-.15,.49),(side*(shape+.12),-.18,.56),
       (side*(shape+.17),-.15,.46),(side*(shape+.13),-.18,.35)],3,fore,.012)
  ico('fingered gauntlet',(side*(shape+.11),-.08,.345),(.069,.072,.062),0,fore,2)
  for digit in range(3):
   taper('clawed finger',(side*(shape+.075+digit*.033),-.105,.33),
         (side*(shape+.075+digit*.033),-.15,.26),.017,.007,3,fore,5)
  for z in (.47,.40):
   plate('layered hip fauld',[(side*.035,-.135,z),(side*.22,-.115,z-.01),
         (side*.24,-.125,z-.105),(side*.10,-.15,z-.11)],1,'body',.013)
  ico('split greave',(side*.115,-.055,.20),(.068,.095,.14),2 if mage or scout else 1,'shin'+('L' if side<0 else 'R'),2)
  plate('greave edge',[(side*.08,-.14,.29),(side*.14,-.155,.29),
        (side*.15,-.15,.11),(side*.09,-.15,.11)],3,'shin'+('L' if side<0 else 'R'),.009)
  ico('armored boot',(side*.12,-.13,.065),(.095,.145,.062),0,'shin'+('L' if side<0 else 'R'),2)
 for x in (-.09,0,.09):cube('belt stud',(x,-.172,.46),(.026,.014,.035),3,'body',.003)
 if mage or scout:
  for side in (-1,1):
   plate('weighted robe tail',[(side*.02,.12,.44),(side*.22,.13,.43),
        (side*.28,.19,.11 if mage else .25),(side*.06,.20,.15)],2,'body',.012)
   rod('robe hem',[(side*.28,.205,.11),(side*.06,.212,.15)],.005,3,'body')
 else:
  plate('weathered rear cape',[(-.16,.15,.78),(.16,.15,.78),(.27,.22,.21),
        (.12,.23,.13),(-.10,.22,.17),(-.25,.21,.24)],2,'body',.009)
  plate('front tabard',[(-.12,-.145,.45),(.12,-.145,.45),(.16,-.175,.12),
        (.03,-.18,.06),(-.15,-.165,.14)],2,'body',.011)
 # Mask and head profile vary by role; the glowing eyes do not float on a blank cube.
 ico('helmet skull',(0,-.006,.89),(.132,.12,.158),0 if not mage and not scout else 2,'head',2)
 plate('long beaked face mask',[(-.10,-.134,.965),(.10,-.134,.965),
       (.085,-.175,.84),(0,-.19,.80),(-.085,-.175,.84)],1,'head',.018)
 rod('mask central ridge',[(0,-.164,.97),(0,-.199,.83)],.008,3,'head')
 eyes(name)
 plate('high brow', [(-.13,-.141,.971),(0,-.165,.987),(.13,-.141,.971),
       (.105,-.16,.939),(-.105,-.16,.939)],3,'head',.013)
 for side in (-1,1):
  plate('angled cheek guard',[(side*.085,-.153,.919),(side*.143,-.12,.914),
       (side*.128,-.148,.824),(side*.065,-.184,.822)],2,'head',.015)
 if elite and not (mage or scout):
  for side in (-1,1):
   taper('helmet flared crest',(side*.10,0,1.0),(side*.17,.03,1.14),.047,.006,3,'head',6)
   plate('upper shoulder fin',[(side*.30,.02,.81),(side*.43,.07,.89),
         (side*.44,.09,.75)],0,'armL' if side<0 else 'armR',.018)

def humanoid(name):
 if name not in {'goblin','bones','emberling','frostling','toxling','blinkstalker'}:armor(name)
 if name=='grunt':
  cube('Legion shield',(-.37,-.14,.53),(.24,.06,.43),0,'forearmL',.02)
  plate('shield iron face',[(-.48,-.183,.70),(-.27,-.183,.70),
        (-.27,-.185,.38),(-.38,-.19,.28),(-.48,-.185,.38)],1,'forearmL',.018)
  rod('shield oath mark',[(-.38,-.208,.64),(-.38,-.21,.37)],.009,4,'forearmL')
  taper('long spear shaft',(.36,-.11,.19),(.36,-.11,1.18),.019,.014,2,'forearmR')
  taper('barbed spear point',(.36,-.11,1.17),(.36,-.11,1.45),.061,.002,3,'forearmR',5)
 elif name=='goblin':
  for side in (-1,1):taper('wide pointed ear',(side*.11,-.02,.91),(side*.32,-.08,.99),.075,.003,2,'head',6)
  ico('large scavenger pack',(0,.21,.52),(.20,.15,.24),2,'body',2)
  for side in (-1,1):rod('pack strap',[(side*.12,.17,.72),(side*.10,-.16,.51)],.013,0,'body')
  for n in range(3):taper('forked knife',(.35,-.10,.31),(.35+(n-1)*.045,-.10,.51),.02,.002,3,'forearmR',5)
 elif name=='bones':
  for z in (.55,.61,.67):
   for side in (-1,1):rod('separated rib',[(side*.015,-.173,z),
       (side*.17,-.175,z+.02),(side*.20,-.13,z+.045)],.011,5,'body')
  for side in (-1,1):cube('broken collar',(side*.18,-.09,.76),(.19,.16,.08),2,'body',.007)
 elif name in {'caster','royalarcanist','sunpriest','sorcerer','frostlobber'}:
  taper('segmented staff',(.39,-.08,.20),(.39,-.08,1.30),.026,.019,3,'forearmR')
  for z in (.34,.62,.92,1.18):ring('staff ferrule',(.39,-.08,z),.045,2,'forearmR')
  ring('spell focus',(.39,-.08,1.31),.105,3,'forearmR',(math.pi/2,0,0))
  ico('spell core',(.39,-.08,1.31),(.060,.045,.075),4,'forearmR',2)
  for side in (-1,1):
   taper('cowl horn',(side*.12,.04,1.01),(side*.19,.06,1.20),.066,.004,2,'head')
   plate('hanging sleeve',[(side*.25,-.07,.61),(side*.39,-.05,.59),
        (side*.41,-.03,.31),(side*.25,-.04,.34)],2,'forearmL' if side<0 else 'forearmR',.014)
  if name=='sunpriest':
   ring('sun halo',(0,.08,1.02),.25,4,'head',(math.pi/2,0,0))
   for i in range(8):
    a=i*math.tau/8;taper('halo sun ray',(.25*math.sin(a),.08,1.02+.25*math.cos(a)),
        (.34*math.sin(a),.08,1.02+.34*math.cos(a)),.025,.002,3,'head',5)
  if name=='frostlobber':ico('ice bomb',(-.37,-.10,.48),(.14,.13,.17),4,'forearmL',2)
  if name=='sorcerer':
   for side in (-1,1):taper('ice antler',(side*.12,.03,1.08),(side*.28,.04,1.32),.055,.002,5,'head')
  if name=='royalarcanist':
   for z in (.67,.75):ring('court collar',(0,.01,z),.27,3,'body')
 elif name=='archer':
  ico('hollow quiver',(.17,.18,.67),(.095,.09,.23),0,'body',2)
  for i in range(5):
   taper('fletched arrow',(.12+i*.027,.20,.68),(.12+i*.027,.22,1.17),.009,.006,3,'body',5)
   plate('feather',[(.12+i*.027,.20,1.10),(.09+i*.027,.22,1.18),
         (.12+i*.027,.21,1.16)],4,'body',.005)
  for s in (-1,1):
   taper('oversized recurve bow',(-.37,-.08,.43),(-.37+s*.055,-.02,.80 if s>0 else .05),
         .023,.009,2,'forearmL')
  rod('taut bowstring',[(-.425,-.02,.80),(-.22,-.12,.43),(-.425,-.02,.05)],.004,5,'forearmL')
  plate('scout hood',[(-.18,.08,1.01),(.18,.08,1.01),(.13,-.15,1.10),
        (0,-.19,1.14),(-.13,-.15,1.10)],0,'head',.018)
 elif name in {'sentinel','siegeknight','warden','brute','marblestatue'}:
  for side in (-1,1):
   cube('laminated collar',(side*.20,-.08,.82),(.22,.24,.095),2,'body',.016)
   for z in (.58,.64,.70):cube('overlap armoring',(side*.30,-.115,z),(.18,.07,.045),3,'armL' if side<0 else 'armR',.006)
  if name in {'sentinel','siegeknight'}:
   cube('tower shield',(-.43,-.12,.52),(.29,.09,.56),0,'forearmL',.026)
   plate('shield crest',[(-.52,-.171,.73),(-.32,-.171,.73),
         (-.32,-.18,.40),(-.42,-.19,.29),(-.52,-.18,.40)],2,'forearmL',.019)
   taper('shield spear',(.39,-.13,.25),(.39,-.13,1.24),.022,.016,3,'forearmR')
  if name=='warden':
   taper('fallen greatblade',(.40,-.11,.25),(.40,-.11,1.23),.07,.006,3,'weapon')
   plate('broken visor',[(-.13,-.17,.99),(.12,-.17,1.0),
         (.10,-.20,.86),(-.10,-.20,.83)],0,'head',.016)
  if name=='brute':
   taper('giant maul handle',(.38,-.11,.29),(.65,-.10,.91),.033,.027,0,'weapon')
   cube('hammer head',(.66,-.10,.92),(.34,.27,.25),1,'weapon',.027)
   for side in (-1,1):cube('hammer striking face',(.66+side*.18,-.10,.92),(.05,.30,.27),3,'weapon',.009)
  if name=='marblestatue':
   for side in (-1,1):taper('broken marble crown',(side*.10,0,1.03),(side*.18,.04,1.28),.071,.002,5,'head')
 elif name in {'king','tyrant'}:
  for side in (-1,1):
   taper('thorned royal mantle',(side*.19,.10,.80),(side*.39,.18,1.04),.10,.002,0,'body')
   plate('long royal cloak',[(side*.10,.15,.77),(side*.32,.16,.76),
         (side*.42,.25,.08),(side*.08,.27,.18)],2,'body',.018)
  for i in range(5):
   x=(i-2)*.083;taper('broken crown', (x,.01,1.01),
      (x+(i-2)*.015,.02,1.23+(i%2)*.10),.047,.002,3,'head',6)
  ring('void sigil',(0,-.202,.64),.15,4,'body',(math.pi/2,0,0))
  taper('king blade',(.39,-.09,.20),(.39,-.09,1.35),.062,.003,5,'forearmR',6)
  if name=='tyrant':
   for side in (-1,1):
    for i in range(3):taper('awakened wing', (side*.18,.16,.74),
       (side*(.37+i*.12),.36,1.16-i*.15),.105,.003,4,'body',6)
 elif name in {'emberling','frostling','toxling','blinkstalker'}:
  accents={'emberling':4,'frostling':5,'toxling':4,'blinkstalker':4}
  for side in (-1,1):
   taper('elemental horn',(side*.09,.025,1.0),(side*.19,.06,1.21),.069,.004,accents[name],'head')
   for i in range(3):taper('talon',(side*(.29+i*.026),-.11,.34),
      (side*(.30+i*.03),-.20,.21),.024,.003,3,'forearmL' if side<0 else 'forearmR',5)
  if name=='frostling':
   for x in (-.15,0,.15):taper('ice shoulder shard',(x,.09,.75),(x,.15,1.07),.054,.003,5,'body',5)
  if name=='toxling':
   for x in (-.12,0,.12):ico('poison blister',(x,.14,.66),(.085,.055,.09),4,'body',2)
  if name=='blinkstalker':
   plate('split shadow hood',[(-.17,.10,1.05),(.17,.10,1.05),
       (.22,-.12,.89),(-.22,-.12,.89)],0,'head',.018)
  if name=='emberling':
   for x in (-.11,0,.11):taper('charcoal flame crest',(x,.07,.74),(x,.12,1.06),.056,.003,4,'body')
 elif name=='revenant':
  plate('torn military mantle',[(-.23,.14,.80),(.17,.15,.80),
        (.34,.22,.16),(-.24,.22,.28)],2,'body',.015)
  for side in (-1,1):taper('corroded back spike',(side*.18,.10,.81),(side*.30,.18,1.10),.075,.003,0,'body')
 if name in BOSSES:
  # Named opponents read from a distance through a larger unique outline.
  if name=='brute':
   for side in (-1,1):
    plate('bent fortress shoulder',[(side*.16,-.14,.86),(side*.43,-.13,.90),
      (side*.52,.07,.63),(side*.28,-.15,.64)],0,'armL' if side<0 else 'armR',.034)
    for z in (.22,.31,.40):
     cube('maul bearer greave',(side*.12,-.095,z),(.14,.20,.055),2,'shinL' if side<0 else 'shinR',.009)
   rod('oath chain',[(-.27,-.19,.75),(-.12,-.21,.65),(.08,-.22,.58),(.28,-.19,.49)],.022,3,'body')
   ico('caged core',(0,-.205,.63),(.08,.05,.11),4,'body',2)
  elif name=='warden':
   for side in (-1,1):
    plate('ragged officer mantle',[(side*.12,.15,.79),(side*.33,.16,.80),
       (side*.39,.23,.12),(side*.28,.24,.22),(side*.11,.22,.05)],2,'body',.013)
    rod('chipped visor',[(side*.03,-.20,.95),(side*.14,-.18,.94)],.010,4,'head')
   for z in (.30,.41,.52):ring('blade grip ferrule',(.40,-.11,z),.055,3,'weapon')
  elif name=='archer':
   for side in (-1,1):
    plate('wind-cut scout cape',[(side*.08,.14,.75),(side*.27,.17,.72),
       (side*.40,.26,.25),(side*.27,.24,.08),(side*.10,.23,.22)],0,'body',.011)
   for z in (.12,.35,.62):cube('quiver stitch',(.18,.242,z),(.08,.01,.018),3,'body',.003)
  elif name=='sorcerer':
   for side in (-1,1):
    taper('ice crown tine',(side*.13,.03,1.05),(side*.34,.09,1.38),.075,.003,5,'head',6)
    plate('frozen mantle',[(side*.12,.14,.77),(side*.32,.16,.82),
       (side*.48,.20,.29),(side*.14,.19,.37)],3,'body',.018)
   for z in (.53,.64,.75):ring('cold focus ring',(.39,-.08,z),.063,4,'forearmR')
  elif name=='king':
   for side in (-1,1):
    plate('floating void fin',[(side*.25,.17,.81),(side*.47,.26,1.03),
       (side*.63,.32,.65),(side*.32,.22,.51)],0,'body',.022)
    rod('luminous blade vein',[(side*.29,.18,.79),(side*.51,.28,.75)],.012,4,'body')
   ring('black gate aura',(0,.14,.87),.33,4,'body',(math.pi/2,0,0))
  elif name=='tyrant':
   for side in (-1,1):
    for j in range(3):
     plate('awakened wing vane',[(side*.23,.15,.82),
       (side*(.48+j*.14),.26,1.06-j*.16),
       (side*(.56+j*.15),.30,.63-j*.16)],1,'body',.015)
    taper('arm blade',(side*.38,-.09,.47),(side*.45,-.13,.08),.057,.002,4,'forearmL' if side<0 else 'forearmR',5)
   ring('open chest vortex',(0,-.223,.65),.20,4,'body',(math.pi/2,0,0))

def beast(name):
 # The base quadruped already has a body skeleton; these new parts push each
 # creature toward a different ecology and make its attack end readable.
 is_long=name in {'dustjackal','thornboar','charger'}
 for side in (-1,1):
  for y in (-.25,.15,.35):
   plate('overlapping flank scale',[(side*.16,y-.11,.57),(side*.32,y-.07,.54),
         (side*.34,y+.11,.35),(side*.18,y+.15,.43)],1,'body',.018)
   rod('flank seam',[(side*.19,y-.10,.57),(side*.32,y-.07,.54)],.005,3,'body')
  for rear in (False,True):
   b=('rear' if rear else 'leg')+('L' if side<0 else 'R')
   y=.27 if rear else -.22
   cube('jointed leg armor',(side*.23,y,.22),(.13,.17,.18),2,b,.012)
   for toe in range(3):
    taper('cloven claw',(side*.22+(toe-1)*.037,y-.10,.07),
      (side*.22+(toe-1)*.046,y-.20,.035),.026,.002,3,b,5)
 eyes(name,z=.46,y=-.47,width=.075,mat=4)
 if is_long:
  taper('working tail',(0,.35,.41),(0,.72,.47),.084,.008,1,'tail')
 if name=='dustjackal':
  for side in (-1,1):
   taper('high alert ear',(side*.12,-.31,.52),(side*.19,-.27,.80),.080,.003,2,'head')
   rod('sand mask',[(side*.08,-.47,.48),(side*.13,-.49,.36)],.009,0,'head')
  taper('long muzzle',(0,-.41,.40),(0,-.71,.35),.115,.032,2,'head')
 elif name=='charger':
  for side in (-1,1):
   taper('charging horn',(side*.10,-.38,.40),(side*.24,-.68,.55),.071,.003,5,'head')
  cube('reinforced brow',(0,-.43,.54),(.32,.18,.10),0,'head',.013)
 elif name=='thornboar':
  for j,y in enumerate((-.31,-.06,.18,.40)):
   for side in (-1,1):
    taper('branch antler',(side*.10,y,.53),(side*(.26+j*.01),y+.07,.75+j*.018),.065,.003,3,'body',6)
  for side in (-1,1):taper('curled tusk',(side*.10,-.45,.32),(side*.22,-.57,.54),.046,.004,5,'head')
 elif name=='sporeback':
  for x,y,r in ((-.16,.23,.15),(.15,.08,.17),(0,-.16,.13)):
   taper('spore stalk',(x,y,.46),(x,y,.78),.047,.035,2,'body')
   ico('broad mushroom cap',(x,y,.80),(r,r,.045),4,'body',2)
   for side in (-1,1):ico('gill',(x+side*r*.45,y-.04,.79),(.034,.055,.015),5,'body')
 elif name=='frostshell':
  for y in (-.25,.03,.30):
   plate('crystal carapace',[(-.27,y-.16,.50),(.27,y-.16,.50),
       (.32,y+.12,.65),(0,y+.18,.86),(-.32,y+.12,.65)],3,'body',.024)
   taper('ice dorsal horn',(0,y,.75),(0,y+.04,1.05),.09,.004,5,'body',5)
 elif name=='cragspitter':
  for side in (-1,1):
   plate('cragged stone jaw',[(side*.05,-.39,.32),(side*.18,-.44,.31),
       (side*.21,-.57,.21),(side*.08,-.60,.22)],2,'head',.022)
  for x in (-.16,0,.16):
   taper('spit barrel',(x,-.20,.60),(x,-.38,.87),.10,.056,0,'body')
   ring('muzzle ring',(x,-.38,.87),.066,4,'body')
 elif name=='magmaskit':
  for side in (-1,1):
   taper('obsidian pinch claw',(side*.21,-.13,.30),(side*.48,-.40,.18),.09,.004,0,'armL' if side<0 else 'armR')
  for x,y in ((-.15,-.15),(.13,.12)):
   plate('broken basalt back',[(x-.14,y-.16,.52),(x+.14,y-.16,.52),
       (x+.11,y+.12,.78),(x-.11,y+.12,.75)],0,'body',.028)
   rod('molten seam',[(x-.09,y-.11,.60),(x+.05,y+.07,.73)],.008,4,'body')

def hovering(name):
 # These are deliberately not miniature humanoids: appendages, rings and
 # cores pull their silhouettes away from the default bat-shaped base.
 ico('nested glowing heart',(0,-.025,.62),(.10,.09,.14),4,'body',2)
 if name=='flyer':
  for side in (-1,1):
   bone='armL' if side<0 else 'armR'
   for tip,z in ((.45,.92),(.72,.72),(.62,.43)):
    plate('jointed wing vane',[(side*.10,.04,.67),(side*tip,.12,z),
         (side*(tip*.84),.14,z-.13),(side*.28,.10,.52)],2,bone,.009)
    rod('wing finger',[(side*.10,.035,.67),(side*tip,.11,z)],.013,3,bone)
   taper('hunting wing talon',(side*.60,.09,.47),(side*.69,-.03,.33),.045,.003,0,bone)
  for side in (-1,1):taper('horned bat mask',(side*.07,0,.83),(side*.18,.05,1.11),.055,.004,0,'head')
 elif name=='shadeling':
  for side in (-1,1):
   plate('long hollow shroud',[(side*.08,.08,.75),(side*.21,.11,.70),
       (side*.28,.13,.06),(side*.11,.14,.28)],1,'body',.008)
   taper('empty sleeve',(side*.13,-.01,.64),(side*.31,-.03,.22),.061,.006,0,'armL' if side<0 else 'armR')
  plate('faceless mask',[(-.13,-.105,.88),(.13,-.105,.88),
      (.09,-.16,.65),(0,-.17,.60),(-.09,-.16,.65)],0,'head',.018)
  eyes(name,z=.79,y=-.17)
 elif name=='sparkling':
  for i in range(8):
   a=i*math.tau/8;x=math.sin(a);z=math.cos(a)
   taper('arcane star arm',(x*.10,0,.65+z*.10),
      (x*(.40 if i%2==0 else .30),0,.65+z*(.40 if i%2==0 else .30)),
      .065,.002,5 if i%2 else 3,'body',5)
  ring('spinning magic frame',(0,.02,.65),.26,3,'body',(math.pi/2,0,0))
 elif name=='galewisp':
  for i in range(3):
   a=i*math.tau/3
   rod('wind ribbon',[(.13*math.cos(a),.04,.68),(.24*math.cos(a+.45),.07,.50),
      (.31*math.cos(a+1),.13,.20)],.019,2,'body')
  for r in (.20,.32):ring('gust spiral',(0,.01,.61),r,4,'body',(math.pi/2,0,0))
 elif name=='voidtether':
  for r in (.25,.32,.40):ring('binding ring',(0,.04,.63),r,3 if r<.4 else 4,'body',(math.pi/2,0,0))
  for side in (-1,1):
   rod('hanging chain',[(side*.32,.02,.62),(side*.37,.03,.40),
       (side*.33,.07,.16)],.012,1,'armL' if side<0 else 'armR')

def object_enemy(name):
 if name in {'slime','slimelet'}:
  large=name=='slime';r=.30 if large else .23
  ico('visible engulfed prize',(0,-r*1.17,.145),(r*.32,r*.16,r*.27),4,'body',2)
  ring('jelly heart ring',(0,-r*1.22,.145),r*.24,5,'body',(math.pi/2,0,0))
  for side in (-1,1):
   ico('ink-black eye',(side*r*.39,-r*1.16,.19),(.033,.02,.043),0,'head',2)
   ico('glowing eye shine',(side*r*.39,-r*1.23,.20),(.012,.009,.015),5,'head',1)
  for a in range(7 if large else 5):
   t=a*math.tau/(7 if large else 5)
   ico('bubbling cell',(math.sin(t)*r*.80,math.cos(t)*r*.72,.27+(a%3)*.075),
       (.052,.052,.05),5,'body',2)
  for side in (-1,1):
   ico('weight-bearing slime lobe',(side*r*.75,-.05,.09),(.12,.15,.07),1,'legL' if side<0 else 'legR',2)
 elif name=='mimic':
  for side in (-1,1):
   cube('brass chest corner',(side*.25,-.16,.32),(.065,.055,.34),3,'body',.010)
   cube('lid armature',(side*.25,-.15,.51),(.07,.06,.13),3,'head',.010)
  for n in range(7):
   x=(n-3)*.074
   taper('jagged bite tooth',(x,-.186,.47),(x,-.24,.34),.026,.003,5,'head',5)
  ring('false lock eye',(0,-.21,.54),.075,4,'head',(math.pi/2,0,0))
  ico('false jewel',(0,-.23,.54),(.025,.025,.03),5,'head',2)
 elif name=='dummy':
  for z in (.47,.56,.65):ring('training wound target',(0,-.159,z),.10,4,'body',(math.pi/2,0,0))
  for side in (-1,1):
   rod('stitch seam',[(side*.07,-.14,.71),(side*.13,-.14,.41)],.008,3,'body')
  cube('sandbag base',(0,0,.04),(.48,.34,.08),0,'root',.015)
 elif name=='bosscrystal':
  for a in range(6):
   t=a*math.tau/6
   taper('orbiting shard',(.26*math.sin(t),.26*math.cos(t),.61),
      (.36*math.sin(t),.36*math.cos(t),.86 if a%2 else .28),.060,.003,3,'body',5)
  ico('prismatic heart',(0,0,.60),(.14,.15,.31),4,'head',2)
  ring('crystal restraint',(0,0,.61),.29,1,'body',(math.pi/2,0,0))
 elif name=='embertotem':
  for z in (.25,.50,.75):
   ring('banded furnace idol',(0,0,z),.18,3,'body')
   cube('heat vent',(0,-.166,z),(.17,.025,.052),4,'body',.004)
  for side in (-1,1):taper('idol horn',(side*.09,.02,.82),(side*.20,.07,1.03),.073,.003,0,'head')

def discard_named(*fragments):
 global PARTS
 keep=[]
 for obj in PARTS:
  if any(fragment in obj.name for fragment in fragments):bpy.data.objects.remove(obj,do_unlink=True)
  else:keep.append(obj)
 PARTS=keep

def prison_finish(name):
 # These seven encounters used to be immediate-mode boxes. Their armatures
 # inherit a compatible roster rig, but their equipment and faces are new.
 if name=='prison_pike':
  discard_named('Legion shield','shield iron face','shield oath mark')
  for side in (-1,1):
   plate('striped prison shoulder',[(side*.16,-.11,.83),(side*.34,-.12,.81),
    (side*.39,.08,.64),(side*.22,-.13,.68)],1,'armL' if side<0 else 'armR',.018)
  for z in (.44,.56,.68):cube('watcher chest strap',(0,-.19,z),(.39,.025,.025),3,'body',.004)
  plate('watcher cage visor',[(-.11,-.191,.98),(.11,-.191,.98),(.13,-.20,.82),(-.13,-.20,.82)],0,'head',.014)
  for x in (-.07,0,.07):rod('watcher visor bar',[(x,-.21,.98),(x,-.22,.83)],.008,3,'head')
  taper('watcher signal spike',(0,.07,1.02),(0,.08,1.27),.045,.003,3,'head',6)
  taper('iron pike tip',(.36,-.11,1.39),(.36,-.11,1.61),.073,.001,5,'forearmR',5)
 elif name=='prison_guard':
  discard_named('shield spear')
  cube('heavy shield rim',(-.43,-.185,.52),(.34,.035,.61),3,'forearmL',.012)
  for z in (.37,.55,.72):cube('shield cross brace',(-.43,-.215,z),(.28,.027,.025),2,'forearmL',.004)
  taper('guard short mace',(.37,-.11,.28),(.37,-.11,.75),.027,.021,0,'forearmR')
  ico('guard mace head',(.37,-.11,.78),(.105,.10,.13),3,'forearmR',1)
  for side in (-1,1):taper('helmet cheek spike',(side*.11,-.15,.88),(side*.20,-.19,.78),.044,.003,3,'head',5)
 elif name=='prison_hound':
  for side in (-1,1):
   rod('broken neck chain',[(side*.13,-.34,.53),(side*.22,-.25,.49),(side*.23,-.14,.45)],.021,3,'head')
   taper('hound torn ear',(side*.12,-.30,.57),(side*.25,-.30,.78),.067,.003,0,'head',5)
  for z in (.37,.45):rod('hound iron collar',[(-.18,-.27,z),(0,-.40,z),(.18,-.27,z)],.017,2,'head')
 elif name=='prison_vessel':
  for side in (-1,1):
   plate('cracked furnace wing',[(side*.15,.06,.77),(side*.36,.13,.85),
    (side*.39,.17,.41),(side*.18,.12,.36)],0,'body',.022)
   rod('vessel molten seam',[(side*.16,-.17,.36),(side*.13,-.18,.59),(side*.09,-.15,.82)],.012,4,'body')
  ico('captive fire',(0,-.19,.54),(.12,.055,.17),4,'body',2)
 elif name=='prison_bell':
  discard_named('tower shield','shield crest','shield spear')
  for side in (-1,1):
   plate('bell keeper apron',[(side*.04,-.23,.59),(side*.20,-.21,.57),
    (side*.24,-.24,.13),(side*.03,-.25,.16)],2,'body',.014)
   rod('bell chain',[(side*.21,.09,.83),(side*.31,.08,.67),(side*.29,.06,.39)],.019,3,'body')
  taper('great bell haft',(.40,-.12,.23),(.40,-.12,1.17),.036,.026,0,'forearmR')
  taper('bronze bell body',(.40,-.12,.96),(.40,-.12,1.22),.19,.115,1,'forearmR',12)
  ring('bell iron lip',(.40,-.12,.96),.19,3,'forearmR')
  ring('bell crown seam',(.40,-.12,1.19),.124,3,'forearmR')
  ico('bell hollow mouth',(.40,-.12,.95),(.145,.145,.024),0,'forearmR',1)
  ico('bell clapper',(.40,-.12,.91),(.065,.065,.08),4,'forearmR',2)
  for side in (-1,1):
   rod('bell engraved oath',[(.40+side*.14,-.18,1.15),(.40+side*.16,-.18,1.03)],.011,3,'forearmR')
 elif name=='prison_maw':
  for side in (-1,1):
   plate('iron maw cheek',[(side*.06,-.42,.40),(side*.23,-.43,.43),
    (side*.27,-.61,.23),(side*.09,-.67,.22)],0,'head',.022)
   for j in range(3):taper('maw tooth',(side*(.08+j*.048),-.64,.28),
    (side*(.08+j*.048),-.67,.16),.027,.003,5,'head',5)
   taper('shoulder barbed chain',(side*.20,-.10,.57),(side*.41,.01,.73),.065,.004,3,'body',5)
  cube('iron jaw bridge',(0,-.62,.35),(.36,.10,.08),3,'head',.012)
 elif name=='prison_unbound':
  discard_named('king blade')
  for side in (-1,1):
   plate('unbound mantle',[(side*.16,.10,.81),(side*.42,.18,.92),
    (side*.46,.26,.29),(side*.24,.21,.18)],1,'body',.015)
   for z in (.43,.55,.68):ico('soul lantern',(side*.36,-.10,z),(.048,.046,.06),4,'forearmL' if side<0 else 'forearmR',2)
  ring('prison seal halo',(0,.08,1.24),.27,3,'head',(math.pi/2,0,0))
  ico('unbound face void',(0,-.20,.89),(.077,.026,.095),4,'head',2)

def identity_finish(name,design):
 # Repeated small marks sit on the existing rig, so regional enemies share a
 # visual language without becoming one reskinned toy soldier at game scale.
 if name.startswith('prison_'):prison_finish(name);return
 if design in HUMANOID or name.startswith('officer-'):
  for side in (-1,1):
   b='armL' if side<0 else 'armR'
   cube('faction cuff',(side*.30,-.10,.48),(.15,.16,.032),3,b,.005)
  if design not in {'bones','goblin'}:
   plate('rank chest emblem',[(-.055,-.205,.70),(.055,-.205,.70),
    (.075,-.209,.61),(0,-.22,.56),(-.075,-.209,.61)],4,'body',.006)
 elif design in QUAD:
  for side in (-1,1):
   for y in (-.25,.19):
    taper('creature back crest',(side*.10,y,.61),(side*.16,y+.06,.75),.048,.003,3,'body',5)
 elif design in FLOAT:
  for side in (-1,1):ico('floating eye jewel',(side*.13,-.12,.70),(.032,.025,.047),4,'head',1)
 elif design not in {'slime','slimelet'}:
  ring('core identity seal',(0,-.17,.58),.095,4,'body',(math.pi/2,0,0))

def silhouette_finish(name,design):
 # Large, functional contours survive the normal gameplay camera. Each group
 # is built from the enemy's actual role, not a decorative random selection.
 if name in {'grunt','prison_pike','officer-spear'}:
  plate('spear pennant',[(.36,.025,1.05),(.53,.02,.98),(.45,.03,.84),(.36,.025,.85)],
        4 if name=='officer-spear' else 2,'forearmR',.012)
  ring('spear counterweight',(.36,-.11,.22),.055,3,'forearmR')
 if name in {'sentinel','siegeknight','prison_guard','officer-shield'}:
  for side in (-1,1):
   taper('shield wall shoulder spike',(side*.31,.07,.77),
         (side*(.44 if name=='siegeknight' else .39),.12,.96),.06,.002,3,
         'armL' if side<0 else 'armR',5)
  plate('raised shield identity', [(-.49,-.224,.63),(-.40,-.23,.74),
       (-.31,-.224,.63),(-.40,-.23,.43)],4,'forearmL',.009)
 if name in {'caster','royalarcanist','sorcerer','frostlobber'}:
  for side in (-1,1):
   plate('deep scholar collar',[(side*.08,-.09,.80),(side*.23,.04,.87),
      (side*.27,.17,.66),(side*.12,.12,.70)],0,'body',.013)
  if name=='caster':
   ring('conjurer shoulder focus',(-.28,-.01,.78),.09,4,'armL',(math.pi/2,0,0))
  if name=='frostlobber':
   for i in range(3):taper('ice satchel vial',(-.23+i*.09,.18,.55),
        (-.23+i*.09,.20,.72),.036,.022,4,'body',6)
 if name in {'brute','warden','prison_bell'}:
  for side in (-1,1):
   plate('boss asymmetrical battle damage',[(side*.13,-.19,.76),
      (side*.29,-.16,.72),(side*.18,-.21,.51)],0 if side<0 else 3,'body',.013)
  if name=='prison_bell':
   for x in (-.15,0,.15):taper('bell crown spike',(x,.01,1.04),
         (x*1.3,.04,1.27),.045,.003,3,'head',5)
 if name in {'king','tyrant','prison_unbound'}:
  for side in (-1,1):
   taper('void mantle outward fang',(side*.25,.15,.78),
      (side*(.58 if name!='tyrant' else .72),.23,1.12),.07,.002,4,'body',6)
  if name=='prison_unbound':
   for i in range(5):
    a=i*math.tau/5
    ico('floating captive spark',(.25*math.sin(a),.16,.68+.28*math.cos(a)),
        (.035,.032,.045),4,'body',1)
 if design in QUAD:
  # A shared canine jaw was the strongest repeated form in the first pass.
  jaw_width=.18 if design in {'charger','thornboar'} else .13
  plate('species lower jaw',[(-jaw_width,-.50,.31),(jaw_width,-.50,.31),
        (jaw_width*.70,-.58,.22),(-jaw_width*.70,-.58,.22)],
        0 if design in {'magmaskit','frostshell'} else 2,'head',.018)
  if design in {'dustjackal','prison_hound','prison_maw','charger'}:
   for side in (-1,1):
    for j in range(3):
     x=side*(.06+j*.045)
     taper('exposed predator tooth',(x,-.55,.32),(x,-.56,.23),
           .019,.002,5,'head',5)
  elif design=='thornboar':
   ico('broad rooting snout',(0,-.63,.29),(.19,.07,.095),2,'head',2)
  elif design=='cragspitter':
   ico('bulging spitter throat',(0,-.29,.30),(.18,.14,.14),4,'head',2)
  elif design=='sporeback':
   for side in (-1,1):
    ico('hanging fungal gill',(side*.16,-.45,.36),(.09,.055,.07),4,'head',2)
  elif design=='frostshell':
   taper('hard crystal beak',(0,-.45,.39),(0,-.62,.29),.10,.002,5,'head',5)
  elif design=='magmaskit':
   for side in (-1,1):
    taper('insect mandible',(side*.13,-.44,.33),(side*.08,-.62,.20),
          .045,.002,0,'head',5)
 if name in {'flyer','shadeling','galewisp'}:
  for side in (-1,1):
   taper('trailing spirit point',(side*.09,.10,.44),
         (side*.16,.15,.02),.045,.002,2,'tail',5)

def build(name):
 global RIG,PAL,PARTS
 design=PRISON_BASE.get(name,name)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for act in list(bpy.data.actions):bpy.data.actions.remove(act)
 bpy.ops.import_scene.gltf(filepath=str(source(name)))
 RIG=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
 EXISTING=[o for o in bpy.context.scene.objects if o.type=='MESH']
 for tr in RIG.animation_data.nla_tracks:tr.mute=True
 for b in RIG.pose.bones:
  b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
 bpy.context.scene.frame_set(1)
 PAL=make_palette(name);PARTS=[]
 if design in HUMANOID or name.startswith('officer-'):
  if design=='bones':bare_bones()
  elif design=='goblin':scavenger_body()
  elif design in {'emberling','frostling','toxling','blinkstalker'}:elemental_body(design)
  else:foundation_humanoid(design)
  if name.startswith('officer-'):
   armor(name)
   if name.endswith('shield'):
    cube('guard oval shield',(-.42,-.15,.54),(.31,.08,.58),1,'forearmL',.03)
    ring('guard sigil',(-.42,-.197,.54),.13,4,'forearmL',(math.pi/2,0,0))
   else:
    taper('long ice spear',(.40,-.10,.13),(.40,-.10,1.43),.026,.012,2,'forearmR')
    taper('ice spear tip',(.40,-.10,1.40),(.40,-.10,1.63),.061,.003,5,'forearmR',5)
  else:humanoid(design)
  RIG.scale=(.88,.88,1.25 if name not in BOSSES else 1.17)
 elif design in QUAD:
  foundation_beast(design)
  beast(design);RIG.scale=(1.07,1.20,1.06)
 elif design in FLOAT:
  foundation_float(design)
  hovering(design);RIG.scale=(1.06,1.06,1.08)
 else:
  foundation_object(design)
  object_enemy(design);RIG.scale=(1.07,1.07,1.10)
 identity_finish(name,design)
 silhouette_finish(name,design)
 # Old low-detail meshes were useful scaffolds for rigging, but leaving them
 # visible makes a double body and the same toy-soldier face under new armor.
 for old in EXISTING:bpy.data.objects.remove(old,do_unlink=True)
 # Bake primitive transforms and keep rigid parts driven by the appropriate
 # inherited bone, as in the two bespoke Colossus exports.
 # Blender's last primitive can still have a stale evaluated matrix here.
 # Without this update, the final appendage exports at its unscaled default
 # radius (a giant orb on a slime, for example) and hides the whole model.
 bpy.context.view_layer.update()
 for obj in PARTS:
  bpy.context.view_layer.objects.active=obj
  for mod in list(obj.modifiers):
   try:bpy.ops.object.modifier_apply(modifier=mod.name)
   except RuntimeError:pass
  obj.data.transform(obj.matrix_world);obj.matrix_world.identity()
  group=obj.vertex_groups.new(name=obj['bone']);group.add(list(range(len(obj.data.vertices))),1,'REPLACE')
 by_material=defaultdict(list)
 for obj in PARTS:by_material[obj.data.materials[0].name].append(obj)
 for batch in by_material.values():
  if len(batch)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in batch:o.select_set(True)
  bpy.context.view_layer.objects.active=batch[0];bpy.ops.object.join()
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 for obj in meshes:
  obj.parent=RIG;mod=obj.modifiers.new('production rig','ARMATURE');mod.object=RIG
 bpy.ops.object.select_all(action='DESELECT');RIG.select_set(True)
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=RIG
 path=OUT/(name+'-v2142.glb')
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
     export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,
     export_frame_range=False,export_materials='EXPORT',export_yup=True)
 triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
 result={'type':name,'file':path.name,'triangles':triangles,'meshes':len(meshes),
         'bones':len(RIG.data.bones),'bytes':path.stat().st_size,
         'theme':THEME_OF[name],'added_parts':len(PARTS)}
 print('ROSTER_UPGRADE',json.dumps(result),flush=True)
 return result

for name in NAMES:
 if name not in THEME_OF:raise ValueError('Missing design category for '+name)
 MANIFEST.append(build(name))
(OUT/('manifest-v2142.json' if not ARGS else 'sample-manifest-v2142.json')).write_text(json.dumps(MANIFEST,indent=2))
print('ROSTER_COMPLETE',len(MANIFEST),sum(x['bytes'] for x in MANIFEST),flush=True)
