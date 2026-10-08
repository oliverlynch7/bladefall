"""Studio and gameplay-distance review renders for the upgraded enemy GLBs."""
import bpy, json, sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
ASSETS=ROOT/'public/3d/enemy-assets/upgraded'
OUT=ROOT/'output/enemy-roster-upgrade-v2141'
OUT.mkdir(parents=True,exist_ok=True)
ARGS=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
records=json.loads((ASSETS/('sample-manifest-v2141.json' if ARGS else 'manifest-v2141.json')).read_text())
if ARGS:records=[r for r in records if r['type'] in ARGS]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE_NEXT';s.render.resolution_x=460;s.render.resolution_y=550;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
w=s.world;w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(.09,.11,.13,1);w.node_tree.nodes['Background'].inputs['Strength'].default_value=.40

def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for pos,power,tint,size in [((-2,-3,3),170,(1,.84,.72),3),((2,1,2.5),230,(.67,.83,1),2.5)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.color=tint;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,.55))
bpy.ops.object.camera_add(location=(1.6,-3.2,1.45));cam=bpy.context.object;aim(cam,(0,0,.58));cam.data.type='ORTHO';s.camera=cam
base=set(s.objects)
for rec in records:
 bpy.ops.import_scene.gltf(filepath=str(ASSETS/rec['file']))
 added=set(s.objects)-base
 for o in added:
  if o.animation_data:o.animation_data_clear()
  if o.type=='ARMATURE':
   for b in o.pose.bones:
    b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
 bpy.context.view_layer.update()
 corners=[o.matrix_world@Vector(p) for o in added if o.type=='MESH' for p in o.bound_box]
 lo=min(v.z for v in corners);hi=max(v.z for v in corners);h=max(.001,hi-lo)
 # Keep the creature nearly full frame at a consistent perceptual size.
 for o in added:
  if o.parent not in added:o.scale*=1.10/h;o.location.z-=lo*1.10/h
 bpy.context.view_layer.update()
 pts=[o.matrix_world@Vector(p) for o in added if o.type=='MESH' for p in o.bound_box]
 width=max(v.x for v in pts)-min(v.x for v in pts)
 cam.data.ortho_scale=max(1.16,width*1.28)
 s.render.filepath=str(OUT/(rec['type']+'.png'));bpy.ops.render.render(write_still=True)
 for o in added:bpy.data.objects.remove(o,do_unlink=True)
 print('ROSTER_RENDER',rec['type'],flush=True)
