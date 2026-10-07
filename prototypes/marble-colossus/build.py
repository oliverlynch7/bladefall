"""Author the Sunspire Marble Colossus on its production skeleton.

Run with Blender in background. The source .blend and a rigged .glb are kept
beside this script so the production asset can be rebuilt without guessing.
"""
import bpy
import json
import math
import os
from collections import defaultdict
from mathutils import Vector

OUT = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(OUT, '..', '..'))
SOURCE = os.path.join(ROOT, 'public', '3d', 'enemy-assets', 'articulated', 'marblecolossus.glb')

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=SOURCE)
rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
for obj in list(bpy.context.scene.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)

parts = []

def mat(name, color, metallic=0, roughness=.7, glow=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    if glow:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = glow
    return m

stone = mat('01 weathered blue-grey marble', (.43, .47, .48), .04, .78)
light = mat('02 polished ivory stone', (.79, .75, .64), .06, .54)
shadow = mat('03 recessed blue-grey stone', (.19, .23, .26), .02, .86)
crack = mat('04 dark fractured seams', (.055, .083, .11), .02, .91)
gold = mat('05 engraved sun-bronze', (.67, .44, .16), .40, .36)
gold_light = mat('06 worn gold edge', (.85, .68, .32), .36, .42)
blue = mat('07 imprisoned sky light', (.18, .71, .97), .02, .3, 3)
blue_dim = mat('08 low magical veins', (.09, .35, .48), .03, .48, 1.5)

def part(obj, name, material, bone, bevel=0):
    obj.name = name
    obj.data.materials.append(material)
    if bevel:
        mod = obj.modifiers.new('chiseled edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        obj.modifiers.new('weighted stone normals', 'WEIGHTED_NORMAL')
    obj['bone'] = bone
    parts.append(obj)
    return obj

def cube(name, pos, size, material, bone, bevel=.008, rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rot:
        obj.rotation_euler = rot
    return part(obj, name, material, bone, bevel)

def ico(name, pos, scale, material, bone, sub=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return part(obj, name, material, bone)

def taper(name, a, b, low, high, material, bone, sides=8):
    a, b = Vector(a), Vector(b)
    d = b-a
    bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=low, radius2=high,
                                    depth=d.length, location=(a+b)/2)
    obj = bpy.context.object
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = d.to_track_quat('Z', 'Y')
    return part(obj, name, material, bone, .004)

def stroke(name, points, radius, material, bone):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    spline = curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for point, xyz in zip(spline.points, points):
        point.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    return part(bpy.context.object, name, material, bone)

def panel(name, points, material, bone, depth=.008):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], [tuple(range(len(points)))])
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    part(obj, name, material, bone)
    if depth:
        modifier = obj.modifiers.new('solid stone slab', 'SOLIDIFY')
        modifier.thickness = depth
        obj.modifiers.new('beveled carved edge', 'WEIGHTED_NORMAL')
    return obj

def ring(name, center, major, minor, material, bone, rotation=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=20, minor_segments=5,
                                    location=center, major_radius=major, minor_radius=minor)
    obj = bpy.context.object
    if rotation:
        obj.rotation_euler = rotation
    return part(obj, name, material, bone)

# This guardian is a walking Sunspire monument, deliberately unlike the forge
# brute: pale tapering architecture, open hands, a gold sun, and a broken crown.
ico('shadow at the core', (0, 0, .51), (.205, .13, .24), shadow, 'body', 2)
taper('stone abdominal column', (0, 0, .40), (0, 0, .65), .17, .22, stone, 'body', 10)
cube('broad chest foundation', (0, 0, .68), (.62, .26, .32), stone, 'body', .035)
for side in (-1, 1):
    # Two split pectoral shields expose a hollow, blue-lit heart. There is no
    # ordinary human breastplate or copied furnace cage in this silhouette.
    panel('diagonal breast shield', [(side*.035,-.15,.79),(side*.33,-.14,.83),
          (side*.36,-.17,.66),(side*.20,-.185,.55),(side*.055,-.165,.61)],
          light, 'body', .035)
    stroke('gold breast engraving', [(side*.07,-.191,.78),(side*.28,-.174,.78),
           (side*.30,-.204,.67),(side*.19,-.211,.60)], .007, gold, 'body')
    for j in range(3):
        z=.50-j*.055
        cube('overlapping waist course', (side*.12,-.105,z), (.20,.24,.064),
             stone, 'body', .012)
    stroke('waist fracture',[(side*.08,-.228,.49),(side*.13,-.235,.47),
           (side*.10,-.232,.445),(side*.16,-.233,.42)],.0038,crack,'body')
    # The angular shoulders read as a carved building cornice from a distance.
    x=side*.37
    ico('dark shoulder separation', (x,0,.75), (.11,.12,.13), shadow, 'armL' if side<0 else 'armR', 2)
    arm='armL' if side<0 else 'armR'
    fore='forearmL' if side<0 else 'forearmR'
    cube('massive stepped upper pauldron', (side*.43,-.012,.78), (.34,.31,.12), light, arm, .025)
    cube('second shoulder stone course', (side*.44,-.014,.70), (.31,.28,.085), stone, arm, .017)
    panel('pointed outer shoulder', [(side*.41,-.17,.86),(side*.63,-.13,.78),
          (side*.61,-.15,.66),(side*.37,-.17,.68)], stone, arm, .03)
    stroke('shoulder carved gold lip', [(side*.29,-.176,.79),(side*.45,-.187,.82),
           (side*.58,-.16,.78)], .007, gold_light, arm)
    stroke('shoulder fracture',[(side*.55,-.153,.77),(side*.52,-.164,.74),
           (side*.56,-.159,.71),(side*.51,-.168,.69)],.004,crack,arm)
    taper('upper arm stone', (side*.40,0,.58), (side*.43,-.015,.71), .12,.095, stone, arm)
    ico('exposed elbow joint', (side*.43,-.01,.54), (.102,.105,.085), shadow, fore, 2)
    taper('large shieldlike forearm', (side*.43,-.015,.53), (side*.45,-.025,.35), .105,.125, light, fore, 10)
    cube('fluted vambrace face', (side*.45,-.119,.45), (.17,.052,.20), stone, fore, .017)
    stroke('forearm channel', [(side*.45,-.15,.52),(side*.45,-.16,.40),
           (side*.45,-.14,.35)], .006, gold, fore)
    stroke('forearm chipped vein',[(side*.40,-.152,.50),(side*.37,-.154,.47),
           (side*.40,-.156,.445),(side*.36,-.151,.42)],.004,crack,fore)
    ico('open palm', (side*.45,-.035,.31), (.12,.10,.073), stone, fore, 2)
    for finger in range(4):
        x=side*.45+(finger-1.5)*.045
        taper('stone finger', (x,-.09,.29), (x,-.115,.19), .021,.014, light, fore, 6)
        stroke('finger articulation', [(x-.013,-.105,.24),(x+.013,-.105,.24)], .003, gold, fore)
    # Widened shins and pointed knee masks ground the enormous upper body.
    thigh='legL' if side<0 else 'legR'
    shin='shinL' if side<0 else 'shinR'
    hip=(side*.14,0,.41); knee=(side*.16,-.01,.25); ankle=(side*.17,0,.08)
    taper('leg core', hip,knee,.11,.095,shadow,thigh)
    cube('long thigh slab',(side*.145,-.063,.39),(.22,.16,.21),stone,thigh,.018)
    panel('thigh inset',[(side*.10,-.153,.48),(side*.22,-.15,.45),
          (side*.215,-.155,.33),(side*.14,-.16,.30)],light,thigh,.01)
    ico('knee pivot', knee, (.11,.11,.08),shadow,shin,2)
    panel('sharp kneecap',[(side*.07,-.14,.27),(side*.16,-.19,.31),
          (side*.26,-.14,.26),(side*.16,-.18,.20)],light,shin,.015)
    taper('separate shin column',knee,ankle,.11,.115,stone,shin)
    cube('front greave',(side*.17,-.09,.15),(.22,.10,.18),light,shin,.014)
    stroke('greave vertical gold',[(side*.17,-.15,.23),(side*.17,-.152,.08)],.006,gold,shin)
    stroke('greave dark fracture',[(side*.08,-.151,.19),(side*.11,-.154,.16),
           (side*.09,-.152,.125)],.004,crack,shin)
    cube('wide monument foot',(side*.18,-.09,.055),(.25,.34,.11),stone,shin,.018)
    for toe in range(3):
        cube('jointed foot toe',(side*.18+(toe-1)*.075,-.25,.047),
             (.072,.14,.07),light,shin,.009)

# Core geometry and radiating seal are the visual center of its beam attack.
ico('heart void', (0,-.165,.69), (.115,.036,.135), crack, 'body', 2)
ico('held sky light', (0,-.198,.69), (.073,.025,.09), blue, 'body', 2)
ring('sun halo around heart',(0,-.195,.69),.145,.012,gold,'body',(math.pi/2,0,0))
for n in range(8):
    theta=2*math.pi*n/8
    x,z=.19*math.sin(theta),.69+.19*math.cos(theta)
    taper('engraved sun ray',(x*.75,-.191,.69+(z-.69)*.75),(x,-.188,z),
          .013,.002,gold_light,'body',5)
for side in (-1,1):
    stroke('fracture from heart',[(side*.10,-.17,.62),(side*.16,-.182,.59),
           (side*.20,-.187,.54)],.004,blue_dim,'body')
    stroke('fractured shoulder seam',[(side*.37,-.168,.81),(side*.45,-.18,.78),
           (side*.50,-.173,.72)],.005,crack,'armL' if side<0 else 'armR')

# Face is a blank sculpted mask, with two narrow blue eyes set below an
# asymmetrically broken five-spire crown. Its vacant expression fits Sunspire.
taper('neck plinth',(0,0,.78),(0,0,.89),.125,.105,shadow,'head',10)
ico('faceted helmet core',(0,-.002,.97),(.17,.135,.18),stone,'head',2)
panel('long ivory face', [(-.135,-.139,1.045),(.135,-.139,1.045),
       (.11,-.16,.895),(0,-.18,.835),(-.11,-.16,.895)], light,'head',.028)
panel('nose keel',[(-.025,-.167,1.005),(.025,-.167,1.005),(0,-.202,.89)],
      stone,'head',.014)
for side in (-1,1):
    panel('dark eye socket',[(side*.025,-.172,.985),(side*.115,-.164,.99),
          (side*.105,-.174,.949)], crack,'head',.008)
    stroke('thin imprisoned eye',[(side*.034,-.179,.971),(side*.09,-.18,.970)],
           .007,blue,'head')
    stroke('temple engraved line',[(side*.13,-.13,1.02),(side*.14,-.149,.94),
           (side*.08,-.169,.86)],.006,gold,'head')
    cube('crown horizontal course',(side*.12,-.01,1.115),(.20,.25,.042),gold,'head',.006)
for n,(x,height) in enumerate(((-.17,.11),(-.085,.18),(0,.23),(.09,.13),(.19,.10))):
    top=1.13+height
    if n==3: top-=.075  # visibly snapped third prong
    taper('chipped crown tooth',(x,0,1.11),(x+(0.02 if n==3 else 0),0,top),
          .045,.003,light,'head',5)
stroke('crown gold band',[(-.225,-.139,1.116),(0,-.163,1.125),
       (.225,-.139,1.116)],.009,gold_light,'head')

# Rear construction: broad carved spine and explicit masonry seams, not an
# empty identical back. These elements stay on the body bone during motion.
cube('rear tall spine',(0,.146,.68),(.17,.115,.47),stone,'body',.024)
for z in (.52,.64,.76):
    cube('back stone crosspiece',(0,.199,z),(.39,.05,.051),light,'body',.008)
    stroke('back recessed joint',[(-.16,.23,z-.032),(.16,.23,z-.032)],.004,crack,'body')
for side in (-1,1):
    panel('rear protecting wing',[(side*.12,.17,.80),(side*.33,.15,.77),
          (side*.25,.19,.51),(side*.11,.20,.55)],stone,'body',.022)
    stroke('rear wing golden seam',[(side*.23,.195,.74),(side*.19,.218,.60)],
           .006,gold,'body')

# Apply the authored stone-edge modifiers, bake all pieces into skeleton-local
# coordinates, and consolidate each material across bones. Blender preserves
# the vertex groups at join, so this keeps rigid joints with eight draw calls.
for obj in parts:
    bpy.context.view_layer.objects.active=obj
    for modifier in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        except RuntimeError:
            pass
    obj.data.transform(obj.matrix_world)
    obj.matrix_world.identity()
    group=obj.vertex_groups.new(name=obj['bone'])
    group.add(list(range(len(obj.data.vertices))),1.0,'REPLACE')
    obj.parent=rig
    arm=obj.modifiers.new('stone skeleton','ARMATURE')
    arm.object=rig

by_key=defaultdict(list)
for obj in parts:
    by_key[obj.data.materials[0].name].append(obj)
for bunch in by_key.values():
    if len(bunch)<2:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bunch: obj.select_set(True)
    bpy.context.view_layer.objects.active=bunch[0]
    bpy.ops.object.join()

meshes=[obj for obj in bpy.context.scene.objects if obj.type=='MESH']
for track in rig.animation_data.nla_tracks:
    track.mute=True
for bone in rig.pose.bones:
    bone.rotation_mode='XYZ'
    bone.rotation_euler=(0,0,0)
    bone.location=(0,0,0)
    bone.scale=(1,1,1)
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()

# A separate clean studio scene is rendered after exporting the production rig.
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
for obj in meshes: obj.select_set(True)
bpy.context.view_layer.objects.active=rig
production=os.path.join(OUT,'marble-colossus-rigged.glb')
bpy.ops.export_scene.gltf(filepath=production,export_format='GLB',use_selection=True,
    export_animations=True,export_animation_mode='NLA_TRACKS',
    export_force_sampling=True,export_frame_range=False,
    export_materials='EXPORT',export_yup=True)

triangles=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)
with open(os.path.join(OUT,'metrics.json'),'w',encoding='utf8') as handle:
    json.dump({'triangles':triangles,'meshes':len(meshes),'materials':8,
               'bones':len(rig.data.bones),'source':'articulated/marblecolossus.glb',
               'bytes':os.path.getsize(production)},handle,indent=2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'marble-colossus-rigged.blend'))

def aim(obj, target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

def lamp(name, position, power, color, size):
    bpy.ops.object.light_add(type='AREA',location=position)
    obj=bpy.context.object
    obj.name=name
    obj.data.energy=power
    obj.data.color=color
    obj.data.shape='DISK'
    obj.data.size=size
    aim(obj,(0,0,.56))

lamp('warm frontal marble light',(-2.2,-3,3),520,(1,.89,.71),3)
lamp('cool sky fill',(2,-1.4,2.6),320,(.63,.8,1),2.5)
lamp('gold rim',(1.2,2.3,2),480,(1,.80,.46),2.7)
world=bpy.context.scene.world
world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.15,.17,.20,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.samples=32
bpy.context.scene.render.resolution_x=850
bpy.context.scene.render.resolution_y=1000
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.view_settings.view_transform='AgX'
for filename,position in [('front.png',(1.6,-2.6,1.45)),
                          ('side.png',(2.8,-.4,1.3)),
                          ('back.png',(-1.4,2.7,1.4))]:
    bpy.ops.object.camera_add(location=position)
    camera=bpy.context.object
    aim(camera,(0,0,.58))
    camera.data.type='ORTHO'
    camera.data.ortho_scale=1.45
    bpy.context.scene.camera=camera
    bpy.context.scene.render.filepath=os.path.join(OUT,filename)
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(camera,do_unlink=True)
print('MARBLE_COLOSSUS',triangles,len(meshes),os.path.getsize(production))
