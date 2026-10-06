"""Isolated Bladefall Forge Brute visual-quality test. Blender 4.5 background script."""
import bpy, math, os, json
from mathutils import Vector
from math import sin, cos, pi

OUT = os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, rough=.6, glow=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    if glow:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=glow
    return m

iron=material('01 Charcoal forged iron',(.046,.050,.057),.84,.49)
iron_dark=material('02 Blackened iron recess',(.013,.015,.019),.68,.66)
edge=material('03 Worn silver edges',(.19,.19,.19),.86,.39)
bronze=material('04 Tarnished bronze',(.19,.105,.048),.76,.48)
leather=material('05 Oxblood leather',(.060,.015,.013),.12,.82)
cloth=material('06 Tattered burgundy cloth',(.075,.016,.014),.0,.95)
ember=material('07 Furnace ember',(.95,.16,.012),.12,.3,4.0)
ember_dim=material('08 Furnace low heat',(.49,.065,.008),.3,.45,1.8)
models=[]

def finish(o,name,m,bevel=0):
    o.name=name; o.data.materials.append(m); models.append(o)
    if bevel:
        b=o.modifiers.new('worn forged edge','BEVEL'); b.width=bevel; b.segments=2
        b.affect='EDGES' if hasattr(b,'affect') else None
        n=o.modifiers.new('face-weighted normals','WEIGHTED_NORMAL'); n.keep_sharp=True
    return o

def cube(name,pos,size,m,bevel=.025,rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos); o=bpy.context.object
    o.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if rotation:o.rotation_euler=rotation
    return finish(o,name,m,bevel)

def ico(name,pos,scale,m,sub=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos)
    o=bpy.context.object; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m)

def between(name,a,b,r1,r2,m,verts=12):
    a,b=Vector(a),Vector(b); d=b-a
    bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=d.length,location=(a+b)/2)
    o=bpy.context.object; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y')
    return finish(o,name,m,.012)

def line(name,points,r,m,verts=7):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'; curve.resolution_u=1
    curve.bevel_depth=r; curve.bevel_resolution=2
    spl=curve.splines.new('POLY'); spl.points.add(len(points)-1)
    for p,co in zip(spl.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');o=bpy.context.object
    return finish(o,name,m)

def poly(name,pts,m,thick=.025):
    me=bpy.data.meshes.new(name); me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o)
    finish(o,name,m)
    if thick:
        s=o.modifiers.new('plate thickness','SOLIDIFY');s.thickness=thick
        b=o.modifiers.new('rolled bevel','BEVEL');b.width=.013;b.segments=2
        n=o.modifiers.new('normal','WEIGHTED_NORMAL')
    return o

def torus(name,pos,major,minor,m,rot=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=16,minor_segments=6,location=pos,
        major_radius=major,minor_radius=minor)
    o=bpy.context.object
    if rot:o.rotation_euler=rot
    return finish(o,name,m)

def rivet(x,y,z,r=.018):ico('hammered rivet',(x,y,z),(r,r*.55,r),bronze,1)

# Root silhouette: powerful grounded body, narrower waist, long legs and broad shoulders.
cube('ribbed gambeson',(0,.01,1.93),(.91,.45,1.18),iron_dark,.14)
ico('waist leather',(0,0,1.34),(.41,.25,.29),leather,2)
for s in (-1,1):
    hip=(s*.31,0,1.37); knee=(s*.41,-.025,.77); ankle=(s*.45,-.005,.27)
    between('thick thigh',hip,knee,.23,.18,iron_dark)
    between('calf',knee,ankle,.19,.15,iron_dark)
    ico('knee joint',knee,(.20,.20,.17),iron_dark,2)
    # Overlapping forged thigh lames, flared knee, front and side greaves.
    for j in range(3):
        z=1.30-j*.15; x=s*(.31+j*.025)
        cube('thigh armor overlapping band',(x,-.14,z),(.42,.31,.19),iron,.044)
        line('thigh band silver lip',[(x-.19,-.307,z-.072),(x,-.326,z-.095),(x+.19,-.307,z-.072)],.008,edge)
    x=s*.41
    ico('faceted knee helm',(x,-.18,.76),(.25,.20,.18),iron,2)
    poly('knee beak',[(x-.21,-.27,.80),(x,-.38,.89),(x+.21,-.27,.80),(x,-.38,.64)],edge,.025)
    cube('deep greave',(s*.45,-.13,.42),(.39,.32,.52),iron,.05)
    line('greave raised ridge',[(s*.45,-.312,.64),(s*.45,-.34,.42),(s*.45,-.302,.19)],.019,edge)
    cube('armored boot',(s*.46,-.16,.15),(.42,.58,.27),iron_dark,.085)
    for j in range(3):
        cube('boot articulated toe',(s*.46,-.40-j*.058,.12),(.39-j*.045,.12,.17),iron,.025)
    cube('boot heel',(s*.45,.12,.095),(.37,.18,.15),bronze,.02)

# Torso plating over a hollow furnace aperture; recess is readable from game camera.
cube('full chest shield',(0,-.24,2.12),(1.20,.35,.84),iron,.13)
poly('raised left pectoral',[(-.53,-.43,2.45),(-.08,-.46,2.48),(-.035,-.51,2.20),(-.25,-.50,2.06),(-.56,-.44,2.17)],iron,.045)
poly('raised right pectoral',[(.53,-.43,2.45),(.08,-.46,2.48),(.035,-.51,2.20),(.25,-.50,2.06),(.56,-.44,2.17)],iron,.045)
cube('furnace recess',(0,-.455,2.04),(.37,.05,.34),iron_dark,.03)
cube('furnace heart',(0,-.49,2.04),(.22,.028,.23),ember,.025)
for i in range(4):
    z=1.94+i*.073
    cube('vent bar',(0,-.525,z),(.34,.045,.028),iron,.008)
for s in (-1,1):
    line('pectoral worn trim',[(s*.10,-.517,2.44),(s*.50,-.48,2.37),(s*.46,-.50,2.20)],.014,edge)
    for z in (2.42,2.26):rivet(s*.46,-.51,z)
for j in range(3):
    z=1.64-j*.105
    cube('overlapping belly steel',(0,-.29,z),(1.03-j*.10,.38,.16),iron,.055)
    line('belly lower edge',[(-.46+j*.04,-.49,z-.065),(0,-.51,z-.074),(.46-j*.04,-.49,z-.065)],.008,edge)
# The back has its own readable construction instead of an empty rectangular shell.
cube('rear spine cage',(0,.255,2.09),(.49,.13,.83),iron,.065)
cube('rear furnace recess',(0,.331,2.05),(.25,.035,.50),iron_dark,.01)
for z in (1.87,2.00,2.13,2.26):
    cube('rear hot vent',(0,.355,z),(.20,.019,.033),ember_dim,.005)
for s in (-1,1):
    poly('rear flank plate',[(s*.11,.29,2.49),(s*.53,.29,2.40),(s*.55,.28,2.01),(s*.28,.36,1.78),(s*.12,.34,1.85)],iron,.035)
    line('rear flank worn edge',[(s*.48,.33,2.37),(s*.50,.33,2.06),(s*.28,.40,1.84)],.013,edge)
    for z in (2.39,2.08):rivet(s*.43,.35,z)

# Neck/helmet: chimney and furnace cage, no human face or visor ambiguity.
between('large gorget',(0,0,2.45),(0,0,2.70),.43,.33,iron,12)
torus('neck locking ring',(0,0,2.58),.33,.032,bronze)
cube('cage glowing interior',(0,-.02,2.90),(.40,.35,.50),ember_dim,.07)
cube('helmet upper armor',(0,.025,3.20),(.50,.48,.16),iron,.035)
cube('helmet rear shell',(0,.19,2.94),(.53,.15,.60),iron,.035)
for s in (-1,1):
    cube('cage side post',(s*.245,-.015,2.94),(.095,.55,.57),iron,.016)
    cube('rear chimney buttress',(s*.24,.19,3.30),(.12,.15,.43),iron,.026)
    cube('temple ear armor',(s*.30,-.06,2.86),(.22,.32,.30),iron,.04)
for z in (2.72,2.98,3.23):
    cube('cage crossbar',(0,-.286,z),(.54,.08,.072),iron,.01)
for x in (-.15,-.05,.05,.15):
    cube('cage dark grille',(x,-.292,2.92),(.035,.058,.42),iron_dark,.005)
for s in (-1,1):
    cube('crown horn',(s*.19,-.02,3.37),(.13,.43,.20),iron,.018)
cube('crown cap',(0,0,3.45),(.61,.58,.12),iron,.024)
for s in (-1,1):line('bright eye slit',[(s*.06,-.336,3.04),(s*.17,-.336,3.04)],.014,ember)

# Shoulders and arms, with one gripping hand and one idle fist.
for s in (-1,1):
    shoulder=(s*.73,0,2.48);elbow=(s*.95,-.025,1.86);wrist=(s*1.12,-.12,1.38)
    ico('shoulder dark joint',shoulder,(.27,.28,.27),iron_dark,2)
    between('upper arm mass',shoulder,elbow,.23,.19,iron_dark)
    between('forearm mass',elbow,wrist,.21,.17,iron_dark)
    ico('armored elbow',elbow,(.22,.20,.19),iron,2)
    for j in range(3):
        x=s*(.71+j*.06);z=2.55-j*.145
        cube('stepped armored pauldron',(x,-.075,z),(.68-j*.09,.53,.20),iron,.07)
        line('pauldron face crease',[(x-.25+j*.04,-.36,z-.08),(x,-.39,z-.11),(x+.25-j*.04,-.36,z-.08)],.009,edge)
        for rr in (-1,1):rivet(x+rr*(.23-j*.03),-.36,z)
    cube('heavy upper arm plate',(s*.87,-.18,2.12),(.40,.38,.40),iron,.07)
    cube('long vambrace',(s*1.03,-.22,1.60),(.42,.40,.47),iron,.055)
    for z in (1.46,1.69):
        cube('wrist guard belt',(s*1.03,-.23,z),(.45,.45,.07),bronze,.025)
    ico('massive gauntlet',(s*1.12,-.13,1.30),(.23,.21,.17),iron,2)
    for j in range(4):
        x=s*1.12+(j-1.5)*.082
        cube('jointed finger',(x,-.28,1.18),(.069,.13,.14),iron,.022)
        rivet(x,-.359,1.20,.015)
    # Staggered silhouette spikes are authored, not randomized decoration.
    for j in range(3):
        x=s*(.66+j*.23);y=.015;z=2.65-j*.06
        between('forged shoulder tooth',(x,y,z),(x+s*.07,y,2.98-j*.08),.12,.004,iron,5)

# Fitting: right gauntlet wraps a vertical hammer shaft at x=1.14, y=-0.18.
hx,hy=1.14,-.19
between('hammer black steel grip',(hx,hy,.32),(hx,hy,1.55),.064,.064,iron_dark,12)
for z in (.95,1.03,1.11,1.19,1.27,1.35):
    torus('hammer grip binding',(hx,hy,z),.069,.01,leather)
cube('hammer haft butt',(hx,hy,1.57),(.19,.19,.09),bronze,.018)
cube('hammer massive head',(hx,hy,.43),(.82,.52,.58),iron,.075)
for s in (-1,1):
    cube('hammer striking face',(hx+s*.42,hy,.43),(.09,.58,.65),edge,.03)
    for z in (.22,.64):
        cube('hammer face forged corner',(hx+s*.47,hy,z),(.14,.60,.08),iron_dark,.012)
for y in (-.44,.06):
    cube('hammer armor seam',(hx,y,.43),(.68,.075,.44),iron_dark,.026)
    line('hammer glowing fracture',[(hx-.30,y+(-.041 if y<0 else .041),.35),(hx-.12,y+(-.041 if y<0 else .041),.42),(hx+.01,y+(-.041 if y<0 else .041),.29),(hx+.23,y+(-.041 if y<0 else .041),.48)],.019,ember)
for s in (-1,1):
    cube('hammer crown tooth',(hx+s*.29,hy,.73),(.12,.32,.12),bronze,.012)

# Waist drapery and equipment: asymmetry gives readable front/back identity.
cube('deep leather belt',(0,-.015,1.44),(1.14,.52,.18),leather,.03)
cube('forged square buckle',(0,-.295,1.44),(.23,.07,.22),bronze,.017)
cube('buckle iron center',(0,-.341,1.44),(.12,.03,.12),iron,.006)
for s in (-1,1):
    for j in range(3):
        x=s*(.40+j*.045);z=1.33-j*.13
        cube('articulated hip tasset',(x,-.08,z),(.33,.39,.20),iron,.045)
        rivet(x,-.291,z)

def torn_tabard(name,x,back=False):
    verts=[];nx=8;nz=12
    for j in range(nz+1):
        t=j/nz
        for i in range(nx+1):
            u=i/nx;xx=x+(u-.5)*.51*(1+.18*t)
            yy=(.30 if back else -.34)+(.12*t if back else -.11*t)+.029*sin(u*19+t*5)
            zz=1.39-1.01*t+.035*sin(u*15)*(t**4)
            if j==nz:zz+=.09*sin(i*3.6)+(.12 if i in (1,6) else 0)
            verts.append((xx,yy,zz))
    fs=[]
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],fs);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);finish(o,name,cloth)
    for face in o.data.polygons:face.use_smooth=True
    sol=o.modifiers.new('hem thickness','SOLIDIFY');sol.thickness=.012

torn_tabard('left charred apron panel',-.23)
torn_tabard('right charred apron panel',.23)
torn_tabard('long rear banner',0,True)
for s in (-1,1):
    line('apron vertical seam',[(s*.19,-.375,1.37),(s*.24,-.43,.92),(s*.29,-.47,.52)],.009,leather)

# Cross-body chain, forged links following the armor's front surface.
chainpts=[(-.63,-.36,2.55),(-.41,-.49,2.34),(-.14,-.54,2.18),(.18,-.53,2.00),(.40,-.46,1.73),(.51,-.34,1.47)]
for a,b in zip(chainpts,chainpts[1:]):
    d=Vector(b)-Vector(a);n=max(2,int(d.length/.072))
    for i in range(n):
        p=Vector(a)+d*(i+.5)/n
        torus('interlocking shoulder chain',p,.043,.011,bronze,(pi/2,0,pi/4 if i%2 else 0))
for s in (-1,1):
    cube('belt side pouch',(s*.51,-.02,1.34),(.23,.29,.27),leather,.037)
    cube('pouch flap',(s*.51,-.18,1.43),(.24,.04,.08),bronze,.008)

# Studio: present actual Blender geometry, not concept paint.
def look_at(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
ground=material('Studio floor',(.055,.056,.06),.12,.8)
cube('studio ground',(0,0,-.105),(200,200,.20),ground,0)
models.remove(bpy.data.objects['studio ground'])
def area(name,loc,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;look_at(o,(0,0,1.7))
area('warm key',(-3,-5,6),780,5,(1,.81,.66))
area('cool fill',(3,-2,4),470,4,(.55,.68,1))
area('furnace rim',(1,3,4),900,4,(1,.29,.12))
world=bpy.context.scene.world;world.color=(.12,.12,.12)
world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.12,.13,.15,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.25
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=48
bpy.context.scene.render.resolution_x=1000;bpy.context.scene.render.resolution_y=1100
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.view_settings.view_transform='AgX'
def render(name,loc,target=(0,0,1.7),ortho=5.0):
    bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;cam.name='Studio camera';look_at(cam,target)
    cam.data.type='ORTHO';cam.data.ortho_scale=ortho;bpy.context.scene.camera=cam
    bpy.context.scene.render.filepath=os.path.join(OUT,name)
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam,do_unlink=True)
render('front.png',(5,-8,4.15))
render('back.png',(-5,7,4.15))
render('detail.png',(2.4,-5.4,3.9),(0,0,2.32),2.5)

# Export only character and weapon. Collapse same-material parts into eight draw calls.
for o in models:
    bpy.context.view_layer.objects.active=o
    for mod in list(o.modifiers):
        try:bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:pass
for m in (iron,iron_dark,edge,bronze,leather,cloth,ember,ember_dim):
    objs=[o for o in models if o.type=='MESH' and o.data.materials and o.data.materials[0]==m]
    if len(objs)>1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:o.select_set(True)
        bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join()
        for o in objs[1:]:models.remove(o)

triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in models if o.type=='MESH')
meshes=len([o for o in models if o.type=='MESH'])
with open(os.path.join(OUT,'metrics.json'),'w') as f:
    json.dump({'triangles':triangles,'mesh_objects':meshes,'materials':8,'rigged':False,
        'note':'Static art prototype. Browser animation and crowd performance not validated.'},f,indent=2)
bpy.ops.object.select_all(action='DESELECT')
for o in models:o.select_set(True)
bpy.context.view_layer.objects.active=models[0]
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'sol-forge-brute.glb'),export_format='GLB',use_selection=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'sol-forge-brute.blend'))
print('MODEL_METRICS',triangles,meshes)
