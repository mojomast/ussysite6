"""The Bureau of Becoming. Original procedural geometry; Blender 5.2 / Cycles."""
import os, math, random
from pathlib import Path
import bpy
from mathutils import Vector
from math import sin, cos, pi, exp, sqrt
random.seed(111)
OUT=Path(__file__).resolve().parent
TMP=Path('/tmp/opencode/becomussy-blender'); TMP.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene; s.render.engine='CYCLES'; s.cycles.samples=int(os.getenv('SAMPLES','64')); s.cycles.use_denoising=True
s.render.threads_mode='FIXED'; s.render.threads=2
s.render.resolution_x=int(os.getenv('WIDTH','1600')); s.render.resolution_y=s.render.resolution_x*3//4; s.render.resolution_percentage=100
s.view_settings.view_transform='AgX'
s.world.use_nodes=True; s.world.node_tree.nodes['Background'].inputs[0].default_value=(.19,.24,.28,1); s.world.node_tree.nodes['Background'].inputs[1].default_value=.22

def mat(name,c,metal=0,rough=.3,grain=.1):
 m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True; n=m.node_tree.nodes; p=n.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
 p.inputs['Coat Weight'].default_value=.25 if not metal else .08
 tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=170; tex.inputs['Detail'].default_value=3
 bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=grain; bump.inputs['Distance'].default_value=.018; m.node_tree.links.new(tex.outputs['Fac'],bump.inputs['Height']); m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 if metal:
  tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=5; tex.inputs['Detail'].default_value=4
  ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position=.22; ramp.color_ramp.elements[0].color=(.028,.075,.066,1); ramp.color_ramp.elements[1].position=.7; ramp.color_ramp.elements[1].color=(*c,1); m.node_tree.links.new(tex.outputs['Fac'],ramp.inputs[0]); m.node_tree.links.new(ramp.outputs[0],p.inputs['Base Color'])
 return m
ivory=mat('Warm celadon ivory • translucent porcelain',(.72,.75,.64),0,.22,.075)
ivory.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value=.045
bronze=mat('Hand patinated bronze',(.38,.21,.075),.8,.29,.18)
gold=mat('Polished worn brass edges',(.57,.35,.12),.78,.25,.05)
dark=mat('Deep verdigris enamel',(.023,.12,.105),.35,.3,.12)
paper=mat('Warm rag paper fibres',(.83,.73,.51),0,.78,.23)
ink=mat('Faded graphite',(.17,.19,.16),0,.9,.1)
stone=mat('Warm limestone studio',(.24,.205,.155),0,.82,.24)

def finish(o,m):
 o.data.materials.append(m)
 if hasattr(o.data,'polygons'):
  for p in o.data.polygons:p.use_smooth=True
 return o
def mesh(name,v,f,m):
 d=bpy.data.meshes.new(name); d.from_pydata(v,[],f); d.update(); o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); return finish(o,m)
def cube(name,p,dim,m,bevel=.035):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object; o.name=name; o.dimensions=dim; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); finish(o,m)
 b=o.modifiers.new('Soft cabinetmaker edges','BEVEL'); b.width=bevel; b.segments=3; o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL'); return o
def sphere(name,p,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,location=p); o=bpy.context.object; o.name=name; o.scale=scale; return finish(o,m)
def tube(name,pts,r,m,radii=None):
 d=bpy.data.curves.new(name,'CURVE'); d.dimensions='3D'; d.resolution_u=16; d.bevel_depth=r; d.bevel_resolution=4; sp=d.splines.new('BEZIER'); sp.bezier_points.add(len(pts)-1)
 for i,(p,co) in enumerate(zip(sp.bezier_points,pts)):
  p.co=co; p.handle_left_type=p.handle_right_type='AUTO'; p.radius=radii[i] if radii else 1
 o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); return finish(o,m)
def lathe(name,profile,m,loc=(0,0,0),yscale=1):
 v=[(loc[0]+r*cos(j*2*pi/128),loc[1]+r*sin(j*2*pi/128)*yscale,loc[2]+z) for r,z in profile for j in range(128)]
 f=[(i*128+j,i*128+(j+1)%128,(i+1)*128+(j+1)%128,(i+1)*128+j) for i in range(len(profile)-1) for j in range(128)]
 return mesh(name,v,f,m)

# One continuous sculpted ceramic face, its closed eyes modelled into the surface.
def gauss(x,z,cx,cz,sx,sz):return exp(-((x-cx)/sx)**2-((z-cz)/sz)**2)
def face_y(x,z):
 zz=(z-3.48)/1.18; width=.83*(1-.12*max(0,-zz)); y=-.66*sqrt(max(.001,1-zz*zz-(x/width)**2))
 y-=.28*gauss(x,z,0,3.58,.125,.36)+.30*gauss(x,z,0,3.39,.19,.115)
 y-=.10*gauss(x,z,0,2.91,.32,.17)
 for side in [-1,1]:
  y+=.105*gauss(x,z,side*.32,3.77,.21,.13)
  y-=.085*gauss(x,z,side*.4,3.48,.24,.2)
  y-=.05*gauss(x,z,side*.31,3.94,.24,.08)
 y-=.072*gauss(x,z,0,3.145,.26,.05)+.077*gauss(x,z,0,3.065,.24,.06)
 return y
v=[]; f=[]; rings=154; seg=192
for i in range(rings):
 z=2.305+(4.29-2.305)*i/(rings-1); zz=(z-3.48)/1.18; w=.83*(1-.12*max(0,-zz)); rr=sqrt(max(.0001,1-zz*zz))
 for j in range(seg):
  a=2*pi*j/seg; x=w*rr*sin(a); y=-.66*rr*cos(a)
  if cos(a)>0:y=face_y(x,z)
  v.append((x,y,z))
for i in range(rings-1):
 for j in range(seg):f.append((i*seg+j,i*seg+(j+1)%seg,(i+1)*seg+(j+1)%seg,(i+1)*seg+j))
o=mesh('Continuous sculpted sleeping porcelain portrait',v,f,ivory); sol=o.modifiers.new('Fired ceramic wall','SOLIDIFY'); sol.thickness=.045
for side in [-1,1]:
 pts=[]
 for i in range(17):
  x=side*(.16+i*.022); z=3.765-.03*sin(i/16*pi); pts.append((x,face_y(x,z)-.008,z))
 tube('Fine closed eyelid incision',pts,.009,bronze)
 sphere('Sculptural ear',(side*.79,.02,3.57),(.11,.15,.23),ivory)
pts=[]
for i in range(25):
 x=-.235+i*.47/24; z=3.112-.025*exp(-(x/.08)**2); pts.append((x,face_y(x,z)-.004,z))
tube('Quiet mouth incision',pts,.006,bronze)
lathe('Porcelain shoulder and neck',[(0,.5),(.66,.5),(1.2,.66),(1.32,.85),(1.18,1.05),(.72,1.23),(.38,1.58),(.30,1.87),(.33,2.12),(.43,2.36)],ivory,yscale=.62)
lathe('Turned bronze museum foot',[(0,.08),(.84,.08),(.9,.13),(.9,.24),(.84,.29),(.59,.31),(.52,.48),(.65,.51)],bronze,yscale=.78)
# Delicate exposed memories root the neck into its shoulders.
for j in range(17):
 a=j*2*pi/17; x=.34*cos(a); y=.25*sin(a)
 tube('Fine bronze root',[(x,y,2.4),(x*1.1,y*1.2,1.95),(x*1.4,y*1.7,1.5),(x*2.7,y*2.5,1.07),(x*3.3,y*2.6,.86)],.012+(j%3)*.004,bronze,[.7,1,1,.8,.1])

# Crown: five individual drawers, small enough to belong to the portrait.
lathe('Crown cast bronze lip',[(.57,4.26),(.65,4.28),(.65,4.34),(.59,4.36)],gold,yscale=.8)
cube('Crown archive carcass',(0,.15,4.64),(1.24,.91,.64),bronze,.055)
drawers=[(-.31,4.46,.53,0),(.31,4.46,.53,.07),(-.31,4.72,.53,.18),(.31,4.72,.53,0),(0,4.99,1.12,.30)]
for k,(x,z,w,pull) in enumerate(drawers):
 y=-.335-pull
 cube('Shadow behind drawer',(x,-.326,z),(w+.045,.022,.225),ink,.012)
 cube('Drawer tray',(x,.03-pull,z-.09),(w,.66,.042),bronze,.012)
 for side in [-1,1]:cube('Tray side',(x+side*(w/2-.015),.03-pull,z),( .028,.65,.2),bronze,.009)
 cube('Verdigris enamel drawer front',(x,y,z),(w,.075,.225),dark,.025)
 cube('Brass label holder',(x,y-.046,z+.018),(.19,.017,.076),gold,.012)
 cube('Unwritten paper provenance tab',(x,y-.058,z+.019),(.145,.005,.045),paper,.003)
 tube('Drawer drop handle',[(x-.10,y-.056,z-.038),(x-.10,y-.11,z-.084),(x+.10,y-.11,z-.084),(x+.10,y-.056,z-.038)],.011,gold)
 for sx in [-1,1]:sphere('Tiny slotted fastener',(x+sx*(w/2-.055),y-.042,z),(.013,.007,.013),gold)
 if pull:
  for j in range(7):
   ob=cube('Loose archived folio',(x,.03-pull,z+.035+j*.008),(w*.8,.48,.006),paper,.004); ob.rotation_euler[2]=random.uniform(-.05,.05)

# A physically thin, continuous paper ribbon spills out of the top drawer and
# makes a gratuitous loop before descending into a perfectly ordinary teacup.
controls=[(.2,-.24,5.06),(.65,-.25,5.20),(1.2,-.21,5.05),(1.60,-.18,4.55),(1.75,-.22,3.96),(2.18,-.24,3.60),(2.64,-.22,3.91),(2.49,-.19,4.25),(2.10,-.21,4.06),(2.04,-.28,3.35),(2.29,-.37,2.35),(2.13,-.49,1.40),(2.42,-.61,.74),(2.27,-.62,.5)]
def catmull(p0,p1,p2,p3,t):return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
ps=list(map(Vector,controls)); line=[]
for i in range(len(ps)-1):
 for j in range(28):line.append(catmull(ps[max(0,i-1)],ps[i],ps[i+1],ps[min(len(ps)-1,i+2)],j/28))
v=[]; ribbon_sides=[]; ribbon_normals=[]
for i,p in enumerate(line):
 tangent=(line[min(i+1,len(line)-1)]-line[max(0,i-1)]).normalized(); broad=tangent.cross(Vector((0,-1,.3))).normalized(); side=Vector((0,1,0)).lerp(broad,min(1,i/65)*.88).normalized(); side.rotate(__import__('mathutils').Matrix.Rotation(.35*sin(i*.018),4,tangent)); v.extend([p-side*.17,p+side*.17]); ribbon_sides.append(side); ribbon_normals.append(tangent.cross(side).normalized())
f=[(2*i,2*i+1,2*i+3,2*i+2) for i in range(len(line)-1)]
ob=mesh('Improbably long recollection on rag paper',v,f,paper); mod=ob.modifiers.new('Paper thickness','SOLIDIFY'); mod.thickness=.006
# Discrete graphite strokes suggest handwriting, never product UI or claims.
for i in range(8,len(line)-6,5):
 p=line[i]; tangent=(line[i+1]-line[i-1]).normalized(); norm=ribbon_normals[i]; side=ribbon_sides[i]
 for k in range(2):
  length=random.uniform(.08,.22)
  for face in [-1,1]:
   q=p+norm*(face*.007)+tangent*(k*.014)
   tube('Faint manuscript mark',[q-side*.12,q+side*(length-.12)],.0022,ink)

cx,cy=2.28,-.58
lathe('Porcelain saucer',[(0,.035),(.43,.035),(.63,.10),(.66,.14),(.63,.17),(.42,.10),(0,.085)],ivory,(cx,cy,0))
lathe('Teacup with real hollow interior',[(.18,.11),(.22,.14),(.24,.20),(.31,.4),(.36,.66),(.35,.69),(.325,.685),(.29,.43),(.21,.22),(0,.20)],ivory,(cx,cy,0))
lathe('Gilt lip on teacup',[(.35,.669),(.357,.681),(.347,.693)],gold,(cx,cy,0))
tube('Teacup handle',[(cx+.32,cy,.58),(cx+.57,cy,.61),(cx+.64,cy,.38),(cx+.45,cy,.25),(cx+.25,cy,.30)],.042,ivory)

cube('Infinite limestone photographic stage',(0,0,-.075),(200,200,.12),stone,.015)
def area(name,p,power,c,size,target,shape='DISK',size_y=None):
 bpy.ops.object.light_add(type='AREA',location=p); o=bpy.context.object; o.name=name; o.data.energy=power; o.data.color=c; o.data.shape=shape; o.data.size=size
 if size_y:o.data.size_y=size_y
 o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm gallery window',(-3.8,-4.5,7.5),700,(1,.85,.65),4,(0,0,2.8))
area('Cool silk rim',(3,2.7,6.5),1000,(.64,.82,1),3,(0,0,3))
area('Narrow brass reflection',(-3,1,4.7),450,(1,.72,.43),2,(0,0,3),'RECTANGLE',4)
area('Front soft fill',(1,-6,3),100,(.83,.91,1),3,(0,0,3))
bpy.ops.object.camera_add(location=(7.2,-14,7.1)); cam=bpy.context.object; target=Vector((.65,0,2.64)); cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.type='ORTHO'; cam.data.ortho_scale=8.35; s.camera=cam
cam.data.dof.use_dof=True; cam.data.dof.focus_distance=(Vector((0,-.2,3.4))-cam.location).length; cam.data.dof.aperture_fstop=9
s.render.image_settings.file_format='PNG'; s.render.filepath=str(TMP/('preview.png' if s.render.resolution_x<1600 else 'final.png'))
bpy.ops.render.render(write_still=True)
from PIL import Image
dest=Path(os.getenv('OUTPUT',str(OUT/'bureau-of-becoming.webp')))
Image.open(s.render.filepath).convert('RGB').save(dest,'WEBP',quality=92,method=6)
print(f'FINISHED {dest} ({s.render.resolution_x} x {s.render.resolution_y})',flush=True)
