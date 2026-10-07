"""Retarget the Forge Brute's disconnected armor pieces to the existing Colossus rig.

Exports only to this prototype folder; never overwrites a production enemy model.
"""
import bpy, json, os
from collections import defaultdict, deque
from mathutils import Vector

OUT=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.abspath(os.path.join(OUT,'..','..'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
old=os.path.join(ROOT,'public','3d','enemy-assets','articulated','colossus.glb')
bpy.ops.import_scene.gltf(filepath=old)
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':bpy.data.objects.remove(o,do_unlink=True)
before=set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(OUT,'sol-forge-brute.glb'))
added=set(bpy.context.scene.objects)-before
meshes=[o for o in added if o.type=='MESH']
for o in meshes:
    # The authored 3.5m statue is normalized to the existing rig's 1m rest body.
    # Bake the full world transform, including each joined part's object position.
    # Scaling object.scale alone left the helmet/head at its original 3m height.
    world=o.matrix_world.copy()
    vertices=[world@v.co*.285 for v in o.data.vertices]
    o.parent=None;o.matrix_world.identity()
    for v,co in zip(o.data.vertices,vertices):v.co=co
    mesh=o.data
    graph=defaultdict(list)
    for e in mesh.edges:
        a,b=e.vertices;graph[a].append(b);graph[b].append(a)
    unvisited=set(range(len(mesh.vertices)))
    while unvisited:
        start=unvisited.pop();piece=[start];queue=deque([start])
        while queue:
            for n in graph[queue.popleft()]:
                if n in unvisited:unvisited.remove(n);queue.append(n);piece.append(n)
        points=[mesh.vertices[i].co for i in piece]
        c=sum(points,Vector())/len(points)
        x,z=c.x,c.z
        # Assign whole disconnected parts so plates stay rigid instead of tearing.
        if x>.24 and z<.49:bone='forearmR' # Hammer + gripping fist.
        elif x<-.20 and .31<z<.54:bone='forearmL'
        elif x>.20 and .31<z<.54:bone='forearmR'
        elif x<-.18 and z>.53:bone='armL'
        elif x>.18 and z>.53:bone='armR'
        elif abs(x)<.22 and z>.77:bone='head'
        elif z<.23 and x<-.045:bone='shinL'
        elif z<.23 and x>.045:bone='shinR'
        elif z<.42 and x<-.045:bone='legL'
        elif z<.42 and x>.045:bone='legR'
        else:bone='body'
        group=o.vertex_groups.get(bone) or o.vertex_groups.new(name=bone)
        group.add(piece,1.0,'REPLACE')
    o.parent=rig
    mod=o.modifiers.new('Rigid armored skeleton','ARMATURE');mod.object=rig

# Keep the source rig's six NLA clips. Force the same rest pose before export.
if rig.animation_data:
    for track in rig.animation_data.nla_tracks:track.mute=True
for bone in rig.pose.bones:
    bone.rotation_mode='XYZ';bone.rotation_euler=(0,0,0);bone.location=(0,0,0);bone.scale=(1,1,1)
bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=rig
path=os.path.join(OUT,'forge-colossus-rigged.glb')
bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,
    export_animations=True,export_animation_mode='NLA_TRACKS',
    export_force_sampling=True,export_frame_range=False,
    export_nla_strips_merged_animation_name='Animation',export_optimize_animation_size=True,
    export_materials='EXPORT',export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'forge-colossus-rigged.blend'))
print('RIGGED_FORGE_COLOSSUS',len(meshes),os.path.getsize(path))
