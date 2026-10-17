"""Render the six original game character assets; no AI reconstruction."""
import bpy, math, os
from mathutils import Vector
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'output', 'base-model-reference')
os.makedirs(OUT, exist_ok=True)
for name in ['Warrior', 'Ranger', 'Wizard', 'Rogue', 'Cleric', 'Monk']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.render.resolution_x = 700
    sc.render.resolution_y = 850
    sc.render.resolution_percentage = 100
    sc.world = bpy.data.worlds.new('Studio')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.21,.25,.30,1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = .8
    sc.view_settings.view_transform = 'Standard'
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'public','slice3d','assets','chars',name+'.gltf'))
    for obj in list(sc.objects):
        if obj.type == 'ARMATURE' and obj.animation_data:
            actions = list(bpy.data.actions)
            idle = next((a for a in actions if 'idle' in a.name.lower()), None)
            if idle:
                obj.animation_data.action = idle
                for track in obj.animation_data.nla_tracks:
                    track.mute = True
    sc.frame_set(1)
    bpy.context.view_layer.update()
    meshes = [o for o in sc.objects if o.type=='MESH' and not o.hide_render]
    corners = [o.matrix_world @ Vector(p) for o in meshes for p in o.bound_box]
    low = Vector(tuple(min(p[i] for p in corners) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in corners) for i in range(3)))
    center = (low+high)/2
    height = high.z-low.z
    bpy.ops.object.camera_add(location=center+Vector((height*.18,-height*2.8,height*.12)))
    cam=bpy.context.object
    cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='ORTHO'
    cam.data.ortho_scale=max(height*1.17,(high.x-low.x)*850/700*1.2)
    sc.camera=cam
    for loc,power,size in [((-3,-4,6),650,5),((4,-1,3),400,4),((1,3,5),750,3)]:
        bpy.ops.object.light_add(type='AREA',location=center+Vector(loc)*height/3)
        lamp=bpy.context.object
        lamp.data.energy=power*(height/3)**2
        lamp.data.shape='DISK'
        lamp.data.size=size*height/3
        lamp.rotation_euler=(center-lamp.location).to_track_quat('-Z','Y').to_euler()
    sc.render.image_settings.file_format='PNG'
    sc.render.filepath=os.path.join(OUT,name+'.png')
    bpy.ops.render.render(write_still=True)
    print('RENDERED',name, 'height',height,flush=True)
