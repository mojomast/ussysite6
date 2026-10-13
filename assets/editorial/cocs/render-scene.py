"""A Reasonable Amount of Caution — original editorial exaggeration of COCS Claude.
Run with the cached bpy module. All geometry and shaders are original/procedural.
"""
import os, math, random
from pathlib import Path
import bpy
from mathutils import Vector
from math import sin, cos, pi
random.seed(42)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.render.threads_mode='FIXED'; scene.render.threads=2
scene.cycles.samples=int(os.getenv('SAMPLES','64')); scene.cycles.use_denoising=True
scene.render.resolution_x=int(os.getenv('WIDTH','1600'))
scene.render.resolution_y=scene.render.resolution_x*3//4
scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.world.color=(.16,.16,.16)

def mat(name,c,metal=0,rough=.3,ceramic=False):
 m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True
 n=m.node_tree.nodes; l=m.node_tree.links; p=n.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*c,1); p.inputs['Metallic'].default_value=metal
 p.inputs['Roughness'].default_value=rough; p.inputs['Coat Weight'].default_value=.35
 noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=190
 noise.inputs['Detail'].default_value=3
 b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.16; b.inputs['Distance'].default_value=.008
 l.new(noise.outputs['Fac'],b.inputs['Height']); l.new(b.outputs['Normal'],p.inputs['Normal'])
 if ceramic:
  v=n.new('ShaderNodeTexVoronoi'); v.feature='DISTANCE_TO_EDGE'; v.inputs['Scale'].default_value=115
  r=n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].position=.002
  r.color_ramp.elements[0].color=(*(x*.66 for x in c),1)
  r.color_ramp.elements[1].position=.014; r.color_ramp.elements[1].color=(*c,1)
  l.new(v.outputs['Distance'],r.inputs[0]); l.new(r.outputs[0],p.inputs['Base Color'])
 return m
ivory=mat('Warm ivory / fine crazed fired porcelain',(.86,.75,.59),rough=.23,ceramic=True)
peach=mat('Peach vitreous enamel',(.79,.34,.18),rough=.27,ceramic=True)
gold=mat('Aged champagne bronze',(.36,.23,.105),.82,.29)
steel=mat('Polished nickel actuator',(.5,.58,.59),.94,.21)
dark=mat('Graphite joint housings',(.025,.034,.035),.7,.3)
rubber=mat('Soft articulated rubber seals',(.015,.022,.022),0,.52)
glass=mat('Smoked petrol optical glass',(.046,.16,.18),.05,.09)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.65
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
tea=mat('Amber tea',(.15,.037,.007),.1,.16)
white=mat('Teacup bone china',(.97,.93,.82),rough=.15)
floor=mat('Studio mineral blue',(.075,.13,.15),rough=.73)

def finish(o,name,m):
 o.name=name; o.data.materials.append(m)
 if hasattr(o.data,'polygons'):
  for p in o.data.polygons:p.use_smooth=True
 return o
def ell(name,p,s,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=p)
 o=bpy.context.object; o.scale=s; return finish(o,name,m)
def box(name,p,s,m,b=.12):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object; o.dimensions=s
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('Hand finished radiused edges','BEVEL'); mod.width=b; mod.segments=5
 o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return finish(o,name,m)
def cyl(name,a,b,r,m):
 a,b=Vector(a),Vector(b); d=b-a
 bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=d.length,location=(a+b)/2)
 o=bpy.context.object; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y')
 mod=o.modifiers.new('Turned edge','BEVEL'); mod.width=.025; mod.segments=3
 return finish(o,name,m)
def tor(name,p,r,t,m,n=(0,0,1),scale=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=12,major_radius=r,minor_radius=t,location=p)
 o=bpy.context.object; o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(n).normalized())
 if scale:o.scale=scale
 return finish(o,name,m)
def tube(name,pts,r,m):
 c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=r; c.bevel_resolution=4
 s=c.splines.new('BEZIER'); s.bezier_points.add(len(pts)-1)
 for v,p in zip(s.bezier_points,pts):v.co=p; v.handle_left_type=v.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o);return finish(o,name,m)
def shield(name,x,y,z,w,h,m):
 outline=[(-.48,.5),(.48,.5),(.59,.29),(.49,-.17),(.24,-.43),(0,-.59),(-.24,-.43),(-.49,-.17),(-.59,.29)]
 vs=[(x+a*w,y+d,z+b*h) for d in [0,.22] for a,b in outline]
 N=len(outline); faces=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]
 faces += [(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],faces);mesh.update()
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
 mod=o.modifiers.new('Cast porcelain edge','BEVEL');mod.width=.07;mod.segments=4
 o.modifiers.new('Plate normals','WEIGHTED_NORMAL');return finish(o,name,m)

# Short waist emerging behind the folded, supporting arms.
ell('Under-armored torso',(0,.12,3.2),(1.16,.68,1.56),dark)
for i in range(5):
 z=1.5+i*.22
 box('Floating abdominal ceramic lamella',(0,-.50,z),(1.65-i*.05,.3,.18),ivory,.06)
 for s in [-1,1]:cyl('Abdominal side piston',(s*.91,-.12,z-.09),(s*.91,-.12,z+.14),.075,steel)
shield('Bronze sternum perimeter',0,-.8,3.45,1.87,1.85,gold)
shield('Ivory warding shield',0,-.88,3.48,1.72,1.72,ivory)
shield('Peach inset heraldry',0,-.967,3.49,1.37,1.39,peach)
shield('Small nested porcelain escutcheon',0,-1.05,3.5,.63,.78,ivory)
box('Central sternum reinforcement',(0,-1.14,3.6),(.085,.065,.69),gold,.025)
for s in [-1,1]:
 for i in range(7):
  x=s*(.25+i*.09); z=3.97-i*.035
  ell('Gilt sternum rivet',(x,-1.01,z),(.021,.019,.021),gold)
 tube('Chest perimeter conduit',[(s*.86,-.50,4.1),(s*1.16,-.55,3.7),(s*1.06,-.67,2.8)],.055,rubber)
 for k in range(4):
  tube('Machined fluted flank',[(s*1.01,-.39,3.65-k*.18),(s*1.3,-.18,3.55-k*.18),(s*1.13,.12,3.43-k*.18)],.045,steel)

# Enormous layered pauldrons — exaggerated broad-shouldered ceramic anatomy.
for s in [-1,1]:
 ell('Spherical shoulder bearing',(s*1.33,.03,4.05),(.57,.57,.57),dark)
 for k in range(3):
  ell('Overlapping peach shoulder shell',(s*(1.62+k*.10),.04,4.38-k*.30),(1.0-k*.06,.77,.69-k*.06),gold if k==1 else peach)
 shield('Ivory pauldron face',s*1.65,-.67,4.25,1.48,1.00,ivory)
 shield('Inset shoulder porcelain',s*1.65,-.75,4.26,1.18,.74,peach)
 for j in [-1,1]:
  cyl('Shoulder panel recessed stud',(s*1.65+j*.43,-.79,4.46),(s*1.65+j*.43,-.84,4.46),.055,gold)
 ell('Upper arm enamel sleeve',(s*1.94,-.02,3.40),(.48,.5,.79),ivory)
 tor('Elbow outer bronze race',(s*1.99,-.20,2.88),.37,.09,gold,(1,0,0))
 cyl('Elbow hinge',(s*1.72,-.2,2.88),(s*2.3,-.2,2.88),.29,dark)
 cyl('Visible elbow pivot cap',(s*2.30,-.2,2.88),(s*2.35,-.2,2.88),.21,steel)
 # Folded forward arms cradle a tray; fingers are segmented castings.
 a=(s*1.94,-.26,2.80); b=(s*.76,-1.53,2.32)
 cyl('Forearm actuator',a,b,.29,dark)
 mid=(Vector(a)+Vector(b))/2
 ob=ell('Long porcelain forearm shell',mid,(.44,.44,.87),ivory)
 ob.rotation_mode='QUATERNION';ob.rotation_quaternion=(Vector(b)-Vector(a)).to_track_quat('Z','Y')
 tube('External hydraulic hose',[a,(s*1.82,-1.02,2.41),b],.065,rubber)
 cyl('Exposed polished piston',(s*1.94,-.66,2.82),(s*.95,-1.62,2.47),.069,steel)
 ell('Palm bearing',(s*.64,-1.52,2.29),(.36,.36,.20),dark)
 for k in range(4):
  x=s*(.35+k*.17)
  tube('Nickel finger tendon',[(x,-1.43,2.28),(x,-1.80,2.29),(x,-1.98,2.42)],.065,steel)
  for j in range(3):
   ob=box('Ceramic articulated finger',(x,-1.49-j*.16,2.32+j*.04),(.145,.17,.13),ivory,.05)

# Helmet: narrow smoked bar optics, swept cheeks and substantial lower jaw.
for z,r in [(4.39,.51),(4.52,.49),(4.63,.47)]:tor('Neck bellows', (0,0,z),r,.075,rubber)
tor('Collar rolled porcelain',(0,0,4.47),.65,.15,ivory)
box('Warden helmet gasket',(0,-.10,5.12),(1.63,1.22,1.23),dark,.39)
box('Oversized ceramic helmet',(0,-.015,5.39),(1.79,1.3,1.16),ivory,.38)
box('Peach forehead brow',(0,-.66,5.34),(1.58,.28,.53),peach,.16)
box('Recessed horizontal optical glass',(0,-.793,5.06),(1.34,.12,.155),glass,.065)
box('Thin optic reflector',(0,-.86,5.072),(.93,.014,.016),steel,.006)
for s in [-1,1]:
 ob=box('Swept ceramic cheek',(s*.65,-.59,4.88),(.39,.42,.55),ivory,.12);ob.rotation_euler[1]=s*.18
 cyl('Helmet ear bearing',(s*.84,-.015,5.16),(s*.99,-.015,5.16),.28,gold)
 cyl('Helmet ear porcelain cap',(s*.99,-.015,5.16),(s*1.04,-.015,5.16),.21,peach)
 for k in range(4):box('Helmet crown service vent',(s*.29,-.49+k*.15,5.965),(.045,.08,.02),dark,.01)
box('Protective chin casting',(0,-.64,4.69),(1.07,.45,.25),peach,.10)
for k in range(7):box('Jaw ventilation slits',((k-3)*.085,-.885,4.77),(.034,.025,.12),dark,.015)
# Hinged jeweller's inspection optic makes his intense concern legible.
tube('Loupe articulated bracket',[(.91,-.02,5.2),(1.1,-.61,5.18),(.61,-1.02,4.96)],.04,steel)
tor('Inspection loupe bronze frame',(.48,-1.045,4.96),.235,.045,gold,(0,-1,0))
ell('Convex inspection optic',(.48,-1.06,4.96),(.205,.054,.205),glass)

# Absurdly small ordinary cup, on an absurdly over-engineered supporting tray.
cyl('Small protective tray',(0,-1.67,2.47),(0,-1.67,2.54),.76,gold)
cyl('Tray ivory lining',(0,-1.67,2.54),(0,-1.67,2.575),.70,ivory)
cyl('Bone china saucer',(0,-1.74,2.58),(0,-1.74,2.61),.30,white)
tor('Saucer gilt rim',(0,-1.74,2.615),.282,.009,gold)
# Revolved open vessel with genuine inner surface and rolled lip.
profile=[(.105,2.62),(.13,2.64),(.16,2.69),(.19,2.84),(.195,2.89),(.178,2.90),(.171,2.85),(.142,2.7),(.105,2.67)]
vs=[(r*cos(i*2*pi/64),-1.74+r*sin(i*2*pi/64),z) for r,z in profile for i in range(64)]
fs=[(j*64+i,j*64+(i+1)%64,(j+1)*64+(i+1)%64,(j+1)*64+i) for j in range(len(profile)-1) for i in range(64)]
mesh=bpy.data.meshes.new('Wheel thrown cup');mesh.from_pydata(vs,[],fs);mesh.update()
o=bpy.data.objects.new('Tiny fragile teacup',mesh);bpy.context.collection.objects.link(o);finish(o,'Tiny fragile teacup',white)
tor('Cup gilt lip',(0,-1.74,2.893),.187,.009,gold)
tor('Delicate cup handle',(.22,-1.74,2.76),.088,.023,white,(0,1,0),(.85,1,1.12))
cyl('Tea surface',(0,-1.74,2.837),(0,-1.74,2.841),.168,tea)

# Small engraved character identification, physically attached to armor.
box('Helmet makers cartouche',(0,-.828,5.46),(.63,.026,.16),gold,.025)
bpy.ops.object.text_add(location=(0,-.848,5.419),rotation=(pi/2,0,0))
o=bpy.context.object;o.data.body='CLAUDE';o.data.align_x='CENTER';o.data.size=.106;o.data.extrude=.0015;finish(o,'Engraved CLAUDE',ivory)

box('Gallery base',(0,.10,.86),(3.15,1.8,.16),dark,.10)
box('Grounded gallery pedestal',(0,.15,.40),(1.9,1.3,.8),dark,.055)
cyl('Visible bust mounting spindle',(0,.15,.93),(0,.15,1.83),.40,dark)
tor('Mounting spindle lower bronze collar',(0,.15,.98),.41,.035,gold)
tor('Mounting spindle upper bronze collar',(0,.15,1.39),.41,.035,gold)
bpy.ops.mesh.primitive_plane_add(size=200);finish(bpy.context.object,'Infinite studio floor',floor)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def light(name,p,power,color,size,target):
 bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;aim(o,target)
light('Warm giant silkbox',(-5,-7,9),1450,(1,.80,.64),5,(0,0,3.4))
light('Cool soft frontal fill',(5,-5,5),1050,(.63,.82,1),4,(0,0,3.6))
light('Amber porcelain rim',(2,3,7),1700,(1,.69,.43),3,(0,0,4))
light('Top strip',(-1,0,9),800,(1,.96,.87),3,(0,0,3))
bpy.ops.object.camera_add(location=(8.3,-17.3,8.2));cam=bpy.context.object
aim(cam,(0,-.22,3.52));cam.data.type='ORTHO';cam.data.ortho_scale=8.45;scene.camera=cam
cam.data.lens=58;cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(cam.location-Vector((0,-.65,3.8))).length;cam.data.dof.aperture_fstop=9
scene.render.image_settings.file_format='PNG'
out=Path(os.getenv('OUTPUT','/tmp/opencode/cocs-blender/final.png'));out.parent.mkdir(parents=True,exist_ok=True)
scene.render.filepath=str(out);bpy.ops.render.render(write_still=True)
if os.getenv('WEBP'):
 from PIL import Image
 Image.open(out).convert('RGB').save(os.environ['WEBP'],'WEBP',quality=92,method=6)
