"""After Hours at the Proof Desk. Original procedural scene; Blender 5.2 / Cycles."""
import os, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import bpy
from mathutils import Vector
from math import pi, sin, cos
random.seed(31)
TMP=Path('/tmp/opencode/contents-blender'); TMP.mkdir(parents=True,exist_ok=True)
OUT=Path(__file__).resolve().parent
W=int(os.environ.get('WIDTH','1600')); S=int(os.environ.get('SAMPLES','64'))
# Original screen artwork, rasterised solely as an internal material texture.
im=Image.new('RGB',(1200,900),(15,34,33)); d=ImageDraw.Draw(im)
def font(n,bold=False):
    return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf',n)
d.text((85,60),'Si.',font=font(235,True),fill=(188,223,183))
d.text((95,355),'SLOP ILLUSTRATED',font=font(54,True),fill=(187,216,176))
d.line((95,442,1100,442),fill=(92,141,120),width=3)
d.text((95,490),'THE AFTER-HOURS EDITION',font=font(31),fill=(150,190,157))
for i,t in enumerate(['contents.md','editorial / source notes','proofs / issue_01']):
    d.text((95,600+i*65),t,font=font(32),fill=(115,173,148))
for y in range(0,900,4): d.line((0,y,1200,y),fill=(4,12,12),width=1)
im.save(TMP/'screen.png')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=S
scene.cycles.use_denoising=True; scene.render.threads_mode='FIXED'; scene.render.threads=2
scene.render.resolution_x=W; scene.render.resolution_y=W*3//4; scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.world.use_nodes=True; scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.085,.12,.18,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.22
def mat(name,c,rough=.4,metal=0,grain=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    if grain:
        n=m.node_tree.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=180
        b=m.node_tree.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value=grain; b.inputs['Distance'].default_value=.018
        m.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']); m.node_tree.links.new(b.outputs[0],p.inputs['Normal'])
    return m
ivory=mat('Warm aged ivory ABS, fine mould texture',(.58,.53,.41),.34,grain=.12)
keys=mat('PBT keycaps',(.72,.68,.55),.4,grain=.1)
dark=mat('Graphite seams and rubber',(.022,.027,.025),.55)
ink=mat('Oxidised black printing ink',(.025,.038,.034),.8)
paper=mat('Uncoated warm cotton proof paper',(.78,.75,.63),.84,grain=.22)
brass=mat('Brushed and tarnished brass',(.36,.23,.075),.27,.78,grain=.09)
green=mat('Deep green polished opaline glass',(.013,.15,.065),.16)
green.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value=.6
ceramic=mat('Glazed porcelain',(.66,.69,.64),.19)
coffee=mat('Dark coffee',(.025,.011,.006),.18)
wood=mat('Oiled walnut with longitudinal grain',(.15,.065,.024),.32)
n=wood.node_tree.nodes; l=wood.node_tree.links; p=n.get('Principled BSDF')
t=n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value=3; t.inputs['Detail'].default_value=5; t.inputs['Roughness'].default_value=.75
coord=n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeVectorMath'); mapping.operation='MULTIPLY'; mapping.inputs[1].default_value=(1.5,90,12)
l.new(coord.outputs['Generated'],mapping.inputs[0]); l.new(mapping.outputs[0],t.inputs['Vector'])
r=n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color=(.025,.009,.004,1); r.color_ramp.elements[1].color=(.24,.12,.05,1)
l.new(t.outputs['Fac'],r.inputs[0]); l.new(r.outputs[0],p.inputs['Base Color'])
b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.23; b.inputs['Distance'].default_value=.025; l.new(t.outputs[0],b.inputs['Height']); l.new(b.outputs[0],p.inputs['Normal'])
def finish(o,name,m):
    o.name=name; o.data.materials.append(m)
    if hasattr(o.data,'polygons'):
        for f in o.data.polygons:f.use_smooth=True
    return o
def box(name,pos,size,m,bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos); o=bpy.context.object; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edge','BEVEL'); mod.width=bevel; mod.segments=4
        o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return finish(o,name,m)
def cyl(name,a,b,r,m):
    v=Vector(b)-Vector(a); bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=v.length,location=(Vector(a)+Vector(b))/2)
    o=bpy.context.object; o.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    mod=o.modifiers.new('Turned edge','BEVEL'); mod.width=.012; mod.segments=3
    o.modifiers.new('Normals','WEIGHTED_NORMAL'); return finish(o,name,m)
def tube(name,pts,r,m):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=r; c.bevel_resolution=4
    s=c.splines.new('BEZIER'); s.bezier_points.add(len(pts)-1)
    for p,co in zip(s.bezier_points,pts):p.co=co; p.handle_left_type=p.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o); return finish(o,name,m)
def tor(name,pos,major,minor,m,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=12,major_radius=major,minor_radius=minor,location=pos,rotation=rot)
    return finish(bpy.context.object,name,m)
def text(body,pos,size,m,rot=(0,0,0)):
    bpy.ops.object.text_add(location=pos,rotation=rot); o=bpy.context.object; o.data.body=body; o.data.size=size; o.data.extrude=.0003; return finish(o,body,m)
box('Solid walnut desktop',(0,0,-.17),(8,4.9,.32),wood,.08)
wall=mat('Night blue plaster',(.035,.055,.075),.92,grain=.22)
box('Studio back wall',(0,3.5,2.5),(15,.2,7),wall)
# A hint of a night window, mostly outside the crop.
for x in [1.7,3.2,4.7]: box('Window mullion',(x,3.32,2.7),(.055,.12,4.6),dark)
box('Window horizontal',(3.2,3.3,3.0),(3,.12,.06),dark)
# Desktop CPU and monitor foot, with functional seams and floppy slot.
box('Desktop computer lower chassis',(-.35,.25,.21),(2.8,1.8,.39),ivory,.09)
box('Case parting seam',(-.35,-.663,.20),(2.62,.012,.016),dark,.004)
box('Floppy drive recess',(.35,-.675,.27),(.72,.025,.14),dark,.015)
box('Floppy shutter',(.34,-.693,.29),(.60,.02,.016),brass,.002)
box('Eject button',(.79,-.695,.24),(.075,.045,.045),ivory,.009)
text('Si. / EDITORIAL',(-1.5,-.689,.29),.075,ink,(pi/2,0,0))
cyl('Swivel pedestal',(-.35,.3,.4),(-.35,.3,.62),.5,ivory)
box('Monitor rear shell',(-.35,.5,1.58),(2.47,1.62,1.97),ivory,.17)
box('CRT dark inset',(-.35,-.345,1.65),(2.21,.14,1.7),dark,.14)
# Four broad bezel pieces surround the curved face; the cavity is genuinely open.
for x in [-1.495,.795]: box('Vertical moulded bezel',(x,-.43,1.68),(.23,.30,1.87),ivory,.10)
box('Upper moulded bezel',(-.35,-.43,2.51),(2.40,.30,.23),ivory,.09)
box('Lower moulded bezel',(-.35,-.44,.82),(2.40,.32,.30),ivory,.085)
screen=mat('Curved phosphor behind glossy CRT glass',(.03,.06,.05),.16)
p=screen.node_tree.nodes['Principled BSDF']; p.inputs['Coat Weight'].default_value=1; p.inputs['Coat Roughness'].default_value=.085
tx=screen.node_tree.nodes.new('ShaderNodeTexImage'); tx.image=bpy.data.images.load(str(TMP/'screen.png'))
screen.node_tree.links.new(tx.outputs['Color'],p.inputs['Base Color']); screen.node_tree.links.new(tx.outputs['Color'],p.inputs['Emission Color']); p.inputs['Emission Strength'].default_value=.65
verts=[]; faces=[]; nx=64; nz=48
for j in range(nz+1):
    v=j/nz; z=(v-.5)*1.42
    for i in range(nx+1):
        u=i/nx; x=(u-.5)*2.02
        verts.append((x-.35,-.52-.20*(1-(x/1.09)**2)*(1-(z/.80)**2),z+1.69))
for j in range(nz):
    for i in range(nx):
        a=j*(nx+1)+i; faces.append((a,a+1,a+nx+2,a+nx+1))
mesh=bpy.data.meshes.new('Bulged CRT face'); mesh.from_pydata(verts,[],faces); mesh.update()
o=bpy.data.objects.new('Reflective curved CRT screen',mesh); bpy.context.collection.objects.link(o); finish(o,o.name,screen)
uv=mesh.uv_layers.new()
for poly in mesh.polygons:
    for li in poly.loop_indices:
        vi=mesh.loops[li].vertex_index; uv.data[li].uv=(vi%(nx+1)/nx,vi//(nx+1)/nz)
for i in range(13):
    box('Side cooling vent',(.895,.11+i*.083,1.74),(.018,.035,.68),dark,.01)
for x in [-1.43,.73]:
    cyl('Recessed bezel screw',(x,-.608,.84),(x,-.619,.84),.031,brass)
    box('Screwdriver slot',(x,-.63,.84),(.027,.006,.006),dark,.001)
cyl('Power knob',(.56,-.60,.81),(.56,-.65,.81),.065,ivory)
led=mat('Amber power indicator',(.4,.16,.005)); led.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(1,.3,.01,1); led.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=2
cyl('Power indicator',(.39,-.60,.81),(.39,-.618,.81),.017,led)
# Individual gently bevelled, tapered keycap profiles.
box('Keyboard lower tray',(-.38,-1.36,.12),(2.86,.88,.23),ivory,.09)
box('Keyboard inset',(-.38,-1.36,.244),(2.68,.72,.026),dark,.04)
letters=['1234567890-=','QWERTYUIOP[]','ASDFGHJKL;\'','ZXCVBNM,./']
for row in range(4):
    for col,ch in enumerate(letters[row]):
        x=-1.57+col*.205+row*.025; y=-1.10-row*.163
        o=box('Sculpted key '+ch,(x,y,.29),(.177,.145,.104),keys,.026)
        for v in o.data.vertices:
            if v.co.z>0: v.co.x*=.83; v.co.y*=.82
        # Smaller upper shoulder gives the mechanical key its familiar profile.
        text(ch,(x-.045,y-.031,.345),.059,ink)
box('Spacebar',(-.43,-1.72,.30),(1.12,.13,.10),keys,.025)
for x in [-1.5,-1.28,.40,.62,.84]: box('Modifier key',(x,-1.72,.30),(.18,.13,.10),keys,.023)
tube('Keyboard coiled cable',[(-1.7,-1.2,.09),(-1.99,-.95,.05),(-1.93,-.35,.05),(-1.5,.12,.16)],.024,dark)
# Banker lamp: turned brass, double-shell curved opaline shade, warm bulb.
lamp_objects_before=set(bpy.data.objects)
cyl('Lamp weighted base',(-2.52,.57,.015),(-2.52,.57,.10),.47,brass)
tor('Base concentric moulding',(-2.52,.57,.10),.37,.025,brass)
tube('Lamp curved brass stem',[(-2.52,.57,.12),(-2.52,.57,1.25),(-2.52,.55,1.72),(-2.52,.29,1.87)],.049,brass)
v=[]; f=[]
for end in range(2):
    for j in range(33):
        a=j*pi/32; v.append((-3.18+end*1.32,.27+.39*cos(a),1.81+.39*sin(a)))
for j in range(32): f.append((j,j+1,j+34,j+33))
me=bpy.data.meshes.new('Bent opaline glass'); me.from_pydata(v,[],f); me.update(); ob=bpy.data.objects.new('Emerald bankers shade',me); bpy.context.collection.objects.link(ob); finish(ob,ob.name,green)
mod=ob.modifiers.new('Glass thickness','SOLIDIFY'); mod.thickness=.026
mod=ob.modifiers.new('Polished rim','BEVEL'); mod.width=.018; mod.segments=3
for x in [-3.18,-1.86]: tube('Brass shade end rim',[(x,.27+.39*cos(j*pi/24),1.81+.39*sin(j*pi/24)) for j in range(25)],.018,brass)
for x in [-3.18,-1.86]:
    cap=[(x,.27,1.81)]+[(x,.27+.39*cos(j*pi/32),1.81+.39*sin(j*pi/32)) for j in range(33)]
    me=bpy.data.meshes.new('Opaline shade end'); me.from_pydata(cap,[],[(0,j+1,j+2) for j in range(32)]); me.update()
    ob=bpy.data.objects.new('Closed green glass shade end',me); bpy.context.collection.objects.link(ob); finish(ob,ob.name,green)
    mod=ob.modifiers.new('Glass wall','SOLIDIFY'); mod.thickness=.025
bulb=mat('Warm opal bulb',(1,.7,.34)); bulb.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(1,.65,.26,1); bulb.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=4
cyl('Lamp bulb',(-2.94,.27,1.88),(-2.09,.27,1.88),.065,bulb)
tube('Pull chain',[(-1.99,.45,1.82),(-1.99,.45,1.32)],.008,brass)
for ob in set(bpy.data.objects)-lamp_objects_before:
    ob.location.x-=.37; ob.location.y-=.60
# Proofs and an accordion of tractor-feed stock spilling over the front edge.
for i in range(5):
    o=box('Loose editorial proof',(1.80,.18,.012+i*.008),(1.30,1.55,.007),paper,.005); o.rotation_euler[2]=-.06+i*.025
text('Si.',(1.27,.55,.061),.32,ink); text('SLOP ILLUSTRATED',(1.28,.39,.061),.076,ink)
for j in range(13): box('Proof typesetting',(1.83,.22-j*.047,.061),(1.05 if j%4 else .73,.012,.001),ink,.001)
points=[(1.08,.075),(1.53,.11),(1.96,.065),(2.36,.15),(2.51,-.12),(2.53,-.65),(2.49,-1.14)]
# y coordinates run towards the viewer, expressed as positive distances here.
for k in range(len(points)-1):
    ya,za=points[k]; yb,zb=points[k+1]
    vv=[(1.35,-ya,za),(2.50,-ya,za),(2.50,-yb,zb),(1.35,-yb,zb)]
    me=bpy.data.meshes.new('Folded continuous stock'); me.from_pydata(vv,[],[(0,1,2,3)]); me.update(); ob=bpy.data.objects.new('Accordion proof fold',me); bpy.context.collection.objects.link(ob); finish(ob,ob.name,paper)
    mod=ob.modifiers.new('Paper thickness','SOLIDIFY'); mod.thickness=.003
    for q in range(8):
        t=(q+.5)/8; y=-(ya+(yb-ya)*t); z=za+(zb-za)*t+.004
        for x in [1.40,2.45]:
            # Dark circular perforation interiors, tiny at photograph scale.
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=1,location=(x,y,z)); o=bpy.context.object; o.scale=(.014,.014,.002); finish(o,'Tractor feed perforation',dark)
        if k<3: box('Continuous proof line',(1.92,y,z),(.77 if q%3 else .48,.009,.002),ink,.001)
# Source notebook in the rear right.
cover=mat('Forest green linen notebook',(.035,.075,.059),.85,grain=.35)
box('Notebook cloth cover',(2.40,1.37,.08),(1.35,.86,.14),cover,.035)
box('Notebook page block',(2.40,1.36,.10),(1.27,.80,.09),paper,.012)
box('Notebook front cover',(2.40,1.37,.155),(1.35,.86,.023),cover,.02)
text('SOURCE NOTES',(1.91,1.38,.169),.105,paper)
cyl('Brass fountain pen',(1.9,1.08,.19),(2.82,1.22,.19),.028,brass)
# Coffee cup with genuine open interior, rim, dark liquid and handle.
cyl('Saucer',(2.96,-.58,.008),(2.96,-.58,.047),.42,ceramic)
tor('Cup wall',(2.96,-.58,.22),.233,.033,ceramic)
for j in range(10): tor('Porcelain cup body',(2.96,-.58,.07+j*.026),.22+j*.0015,.025,ceramic)
cyl('Coffee surface',(2.96,-.58,.27),(2.96,-.58,.275),.211,coffee)
tor('Cup lip',(2.96,-.58,.323),.234,.018,ceramic)
tor('Cup handle',(3.22,-.58,.20),.115,.028,ceramic,(pi/2,0,0))
# Magnifier on the proof stack, actual transmissive optical glass.
glass=mat('Magnifying lens glass',(.85,.95,.9),.07); p=glass.node_tree.nodes['Principled BSDF']; p.inputs['Transmission Weight'].default_value=1; p.inputs['IOR'].default_value=1.48
tor('Magnifier brass rim',(2.29,.18,.105),.225,.018,brass)
cyl('Magnifying glass lens',(2.29,.18,.09),(2.29,.18,.107),.214,glass)
cyl('Magnifier ebony handle',(2.47,.03,.095),(2.83,-.25,.095),.039,dark)
def area(name,pos,power,color,size,target,shape='DISK',size_y=None):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape=shape; data.size=size
    if size_y:data.size_y=size_y
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Banker lamp warm desk pool',(-2.89,-.37,1.80),100,(1,.66,.32),.85,(-2.52,-.9,0))
area('Large warm photographic bounce',(-3.4,-3.2,4.6),370,(1,.78,.54),4,(0,0,1))
area('Cool window softbox',(3,2.6,4.8),570,(.40,.64,1),3.3,(-.2,0,1),'RECTANGLE',4)
area('Narrow window reflected in glass',(-3,-1.4,3.9),85,(.61,.79,1),.55,(-.35,0,1.6),'RECTANGLE',2.5)
area('Phosphor spill',(-.35,-.88,1.6),12,(.41,.8,.61),1.5,(-.4,-1.6,.2))
bpy.ops.object.camera_add(location=(4.45,-7.8,4.18)); cam=bpy.context.object; cam.rotation_euler=(Vector((-.10,-.03,1.06))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.lens=46; cam.data.dof.use_dof=True; cam.data.dof.focus_distance=(Vector((-.35,-.5,1.5))-cam.location).length; cam.data.dof.aperture_fstop=7.1; scene.camera=cam
scene.render.image_settings.file_format='PNG'; scene.render.filepath=str(TMP/('preview.png' if W<1600 else 'final.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(TMP/'contents.blend'))
bpy.ops.render.render(write_still=True)
if W>=1600:
    Image.open(scene.render.filepath).convert('RGB').save(OUT/'after-hours-proof-desk.webp','WEBP',quality=92,method=6)
