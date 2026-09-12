import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]/'public/3d'
OUT=ROOT/'art-previews/enemies';OUT.mkdir(exist_ok=True)
manifest=json.loads((ROOT/'enemy-assets/manifest.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20
scene.render.resolution_x=480;scene.render.resolution_y=560;scene.render.resolution_percentage=100
scene.world.color=(.18,.18,.18);scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);return m
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.location.z=-.035;floor.data.materials.append(mat('Backdrop',(.025,.034,.048)))
bpy.ops.object.camera_add(location=(2.4,-5.8,2.35));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.53))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.65;scene.camera=cam
for pos,power,color,size in [((-3,-4,6),650,(1,.86,.70),5),((3,1,4),850,(.56,.76,1),3),((0,-3,2),100,(1,1,1),3)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
base=set(scene.objects)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for rec in manifest:
 name=rec['type']
 if args and name not in args:continue
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'enemy-assets'/f'{name}.glb'))
 added=set(scene.objects)-base
 for o in added:
  if o.animation_data:o.animation_data_clear()
  if o.type=='ARMATURE':
   for b in o.pose.bones:b.rotation_euler=(0,0,0);b.rotation_quaternion=(1,0,0,0);b.location=(0,0,0);b.scale=(1,1,1)
 bpy.context.view_layer.update()
 points=[o.matrix_world@Vector(p) for o in added if o.type=='MESH' and o.find_armature() is not None for p in o.bound_box]
 zmin=min(p.z for p in points);h=max(p.z for p in points)-zmin
 cam.data.ortho_scale=max(1.65,(max(p.x for p in points)-min(p.x for p in points))*1.05/h*560/480*1.2)
 roots=[o for o in added if not o.parent or o.parent not in added]
 for o in roots:o.scale*=1.05/h;o.location.z-=zmin*1.05/h
 scene.render.filepath=str(OUT/f'{name}.png');bpy.ops.render.render(write_still=True)
 for o in added:bpy.data.objects.remove(o,do_unlink=True)
print('RENDERED',len(manifest))


