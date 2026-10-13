"""An Improbable Turn of the Page. Original procedural editorial still life.
Run with bpy 5.2.2 and Pillow; no downloaded meshes, textures or fonts.
"""
import bpy, math, os, random
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi
from PIL import Image
random.seed(102)
ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/velvetrp-blender'); TMP.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene
s.render.engine='CYCLES'; s.cycles.samples=int(os.getenv('SAMPLES','64'))
s.cycles.use_denoising=True; s.render.threads_mode='FIXED'; s.render.threads=2
s.render.resolution_x=int(os.getenv('WIDTH','1600')); s.render.resolution_y=s.render.resolution_x*3//4
s.render.resolution_percentage=100; s.view_settings.view_transform='AgX'
s.world.color=(.022,.018,.016)

def mat(name,color,rough=.5,metal=0,grain=.1):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 n=m.node_tree.nodes; p=n.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
 p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
 if grain:
  t=n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value=150; t.inputs['Detail'].default_value=3
  b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=grain; b.inputs['Distance'].default_value=.026
  m.node_tree.links.new(t.outputs['Fac'],b.inputs['Height']); m.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
 t=n.new('ShaderNodeTexNoise');t.inputs['Scale'].default_value=7;t.inputs['Detail'].default_value=4
 ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[1].position=.83
 ramp.color_ramp.elements[0].color=(*(v*.65 for v in color),1)
 ramp.color_ramp.elements[1].color=(*(v*1.12 for v in color),1)
 m.node_tree.links.new(t.outputs['Fac'],ramp.inputs['Fac']);m.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])
 return m
velvet=mat('Bordeaux velvet / fine raised nap',(.078,.0025,.01),.94,0,.21)
velvet.node_tree.nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value=.24
leather=mat('Oxblood leather / worn pebbled calfskin',(.048,.012,.009),.43,0,.6)
gold=mat('Hand-polished aged brass',(.55,.3,.075),.27,.78,.07)
paper=mat('Warm rag parchment',(.73,.61,.40),.72,0,.17)
paper.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.065
ivory=mat('Carved ivory / satin lustre',(.86,.79,.61),.29,0,.055)
ivory.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.045
ink=mat('Charcoal inlaid pips',(.018,.014,.012),.36)
stone=[mat('Sandstone variation '+str(i),(.49+i*.027,.39+i*.025,.26+i*.023),.7,0,.25) for i in range(6)]
roof=mat('Patinated deep teal copper',(.028,.105,.095),.48,.6,.15)
wood=mat('Dark walnut stage carpentry',(.13,.052,.023),.48,0,.25)
snailmat=mat('Honey-coloured snail porcelain',(.35,.18,.07),.24,0,.15)
shellmat=mat('Burnished snail shell',(.28,.105,.035),.25,.35,.1)

def finish(o,name,m):
 o.name=name; o.data.materials.append(m); return o
def cube(name,loc,scale,m,bevel=.03):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Soft crafted edges','BEVEL'); b.width=bevel; b.segments=3
  o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return finish(o,name,m)
def mesh(name,verts,faces,m,smooth=False):
 d=bpy.data.meshes.new(name); d.from_pydata(verts,[],faces); d.update()
 o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); finish(o,name,m)
 for p in d.polygons:p.use_smooth=smooth
 return o
def tube(name,pts,r,m):
 c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=r; c.bevel_resolution=3
 sp=c.splines.new('POLY'); sp.points.add(len(pts)-1)
 for p,co in zip(sp.points,pts):p.co=(*co,1)
 o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o); return finish(o,name,m)
def sphere(name,loc,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=loc); o=bpy.context.object; o.scale=scale
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,m)
def cyl(name,loc,r,depth,m,vertices=64):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc)
 o=finish(bpy.context.object,name,m); b=o.modifiers.new('Edge wear','BEVEL');b.width=.014;b.segments=2
 o.modifiers.new('Normals','WEIGHTED_NORMAL');return o

# A continuous draped cloth with gathered ridges, not a flat ground plane.
N=180; verts=[]; faces=[]
for j in range(N+1):
 y=-13+j*26/N
 for i in range(N+1):
  x=-14+i*28/N
  z=-.22+.16*sin(x*1.7+y*.8)+.11*sin(y*2.1-x*.7)+.07*sin(x*3.2+y*1.3)
  z+=.34*math.exp(-((y-3.1-.38*sin(x))/.62)**2)
  verts.append((x,y,z))
for j in range(N):
 for i in range(N):
  a=j*(N+1)+i;faces.append((a,a+1,a+N+2,a+N+1))
mesh('Sumptuous folded wine-red velvet',verts,faces,velvet,True)
cube('Seamless distant velvet ground',(0,0,-.85),(200,200,.15),velvet,0)

# Heavy open binding, individual rag-paper leaves and gold tooling.
for side in [-1,1]:
 cube('Leather-bound folio', (side*1.72,0,.23),(3.52,4.7,.24),leather,.1)
 for inset in [0,.09]:
  x0=side*.13; x1=side*(3.37-inset); ya=2.22-inset
  tube('Double gold tooling',[(x0,-ya,.362),(x1,-ya,.362),(x1,ya,.362),(x0,ya,.362)],.012,gold)
 for k in range(24):
  vs=[]; fs=[]
  for j in range(13):
   y=-2.12+j*4.24/12
   for i in range(41):
    t=i/40; x=side*(.035+3.19*t)
    z=.39+k*.013+.18*sin(pi*t)+.035*cos(y*1.2)*t
    vs.append((x,y,z))
  for j in range(12):
   for i in range(40):
    a=j*41+i; fs.append((a,a+1,a+42,a+41))
  mesh('Individually layered parchment',vs,fs,paper,True)
 # Pale ribbons physically rise from the folio and curl into the architecture.
 for k in range(4):
  vs=[];fs=[]
  for j in range(65):
   t=j/64; x=side*(3.1-2.5*t+.52*sin(t*pi*1.4)); z=.75+2.2*t*t
   for q in range(9):
    y=.3+k*.38+(q/8-.5)*.34
    vs.append((x,y,z+.035*sin(q*pi/8)))
  for j in range(64):
   for q in range(8):
    a=j*9+q;fs.append((a,a+1,a+10,a+9))
  ob=mesh('Turning page becomes castle buttress',vs,fs,paper,True)
  so=ob.modifiers.new('Translucent paper edge','SOLIDIFY');so.thickness=.013
  tube('Gilded curled page edge',[vs[j*9] for j in range(65)],.007,gold)
tube('Hollow leather spine',[(0,-2.36,.31),(0,-1,.26),(0,1,.26),(0,2.36,.31)],.1,leather)

# A miniature stage floor, laid plank by plank, above the gutter.
for i in range(17):
 cube('Walnut stage floorboard',(-1.53+i*.19,.15,.87),(.181,2.52,.1),wood,.008)
 for y in [-1.05,1.34]:
  sphere('Minute brass floorboard pin',(-1.53+i*.19,y,.922),(.013,.013,.005),gold)
for n in range(5):
 cube('Fanlike theatre stair',(0,-1.62+n*.14,.74+n*.065),(1.25-n*.035,.3,.07),stone[3],.012)

def tower(x,y,r,h,conical=False):
 base=.91; rows=int(h/.17)
 for row in range(rows):
  for b in range(12):
   a=2*pi*(b+(row%2)*.5)/12; da=2*pi/12*.94
   vs=[]
   for z in [base+row*.17,base+row*.17+.158]:
    for rr in [r-.095,r]:
     for k in range(5):
      ang=a+da*k/4;vs.append((x+rr*cos(ang),y+rr*sin(ang),z))
   fs=[]
   for k in range(4):fs.extend([(k,k+1,11+k,10+k),(5+k,15+k,16+k,6+k),(k,5+k,6+k,k+1),(10+k,11+k,16+k,15+k)])
   fs.extend([(0,10,15,5),(4,9,19,14)])
   ob=mesh('Individually cut curved masonry',vs,fs,random.choice(stone));be=ob.modifiers.new('Stone softened arris','BEVEL');be.width=.008;be.segments=2
 top=base+rows*.17
 cyl('Carved cornice',(x,y,top),r+.055,.10,stone[4])
 if conical:
  for k in range(9):
   bpy.ops.mesh.primitive_cone_add(vertices=64,radius1=(r+.16)*(1-k/10),radius2=(r+.16)*(1-(k+1)/10),depth=.14,location=(x,y,top+.08+k*.135))
   finish(bpy.context.object,'Overlapping copper roof courses',roof)
  sphere('Roof finial',(x,y,top+1.35),(.055,.055,.08),gold)
 else:
  for i in range(10):
   a=2*pi*i/10; ob=cube('Crenellated parapet',(x+r*cos(a),y+r*sin(a),top+.16),(.18,.14,.26),stone[4],.012);ob.rotation_euler.z=a+pi/2
 # The applied arched window has a deep dark recess and individually framed stones.
 for z in [base+.65,base+1.4]:
  if z+.35>top:continue
  cube('Deep lancet window',(x,y-r-.002,z),(.16,.025,.38),ink,.07)
  pts=[(x-.115,y-r-.025,z-.2),(x-.115,y-r-.025,z+.1)]
  pts += [(x+.115*cos(pi-i*pi/16),y-r-.03,z+.1+.115*sin(pi-i*pi/16)) for i in range(17)]
  pts += [(x+.115,y-r-.025,z-.2)]
  tube('Arched limestone window surround',pts,.025,stone[5])
  tube('Window mullion',[(x,y-r-.045,z-.18),(x,y-r-.045,z+.19)],.011,gold)

tower(-1.27,.72,.38,2.68,True)
tower(1.39,.96,.43,1.86,False)
tower(-1.78,-.33,.3,1.55,False)
tower(.47,1.38,.28,2.4,True)
# Backdrop arcade: slender turned columns and brass-trimmed arches.
for x in [-.85,-.28,.29,.86]:
 cyl('Theatre colonnade',(x,.73,1.5),.055,1.2,stone[4]);cyl('Capital',(x,.73,2.06),.09,.09,gold)
for x in [-.565,.005,.575]:
 tube('Arcade arch',[(x+.285*cos(t*pi/32),.73,2.06+.285*sin(t*pi/32)) for t in range(33)],.055,stone[5])

# An impossibly large ivory die: recessed black inlays, rotated as one assembly.
bpy.ops.object.empty_add(location=(.58,.16,3.65)); die=bpy.context.object;die.name='Impossible suspended ivory die'
o=cube('Rounded ivory die',(0,0,0),(1.65,1.65,1.65),ivory,.16);o.parent=die
patterns={1:[(0,0)],3:[(-.39,-.39),(0,0),(.39,.39)],5:[(-.39,-.39),(-.39,.39),(0,0),(.39,-.39),(.39,.39)]}
for axis,num in [('front',5),('right',3),('top',1)]:
 for a,b in patterns[num]:
  loc=(a,-.822,b) if axis=='front' else ((.822,a,b) if axis=='right' else (a,b,.822))
  sc=(.113,.025,.113) if axis=='front' else ((.025,.113,.113) if axis=='right' else (.113,.113,.025))
  o=sphere('Obsidian pip inlay',loc,sc,ink);o.parent=die
die.rotation_euler=(.14,-.20,-.19)

# An elegantly useless brass ladder ends in empty air to the right.
for side in [-1,1]:
 tube('Ladder brass rail',[(2.1+side*.16,-.2,.84),(2.72+side*.16,.05,3.57)],.021,gold)
for i in range(13):
 t=i/12;tube('Ladder rung',[(2.1-.16+.62*t,-.2+.25*t,.84+2.73*t),(2.1+.16+.62*t,-.2+.25*t,.84+2.73*t)],.016,gold)

# A crowned snail presides over the front page, shell built as a tapering spiral.
sx,sy,sz=-1.75,-1.48,.91
sphere('Snail foot',(sx,sy,sz),(.55,.18,.105),snailmat)
sphere('Snail raised head',(sx+.36,sy,sz+.18),(.15,.145,.23),snailmat)
sphere('Snail shell',(sx-.13,sy+.025,sz+.33),(.33,.20,.35),shellmat)
pts=[]
for i in range(160):
 a=i/159*pi*4.6;r=.29*(1-i/175);pts.append((sx-.13+r*cos(a),sy-.185,sz+.34+r*sin(a)))
tube('Shell spiral ridge',pts,.022,gold)
for side in [-1,1]:
 tube('Snail antenna',[(sx+.4,sy+side*.07,sz+.3),(sx+.5,sy+side*.13,sz+.48)],.018,snailmat)
 sphere('Snail eye',(sx+.5,sy+side*.13,sz+.48),(.026,.026,.026),ink)
cyl('Snail crown band',(sx+.33,sy,sz+.43),.13,.06,gold)
for k in range(5):
 a=k*2*pi/5
 bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=.041,radius2=0,depth=.14,location=(sx+.33+.11*cos(a),sy+.11*sin(a),sz+.52));finish(bpy.context.object,'Tiny royal crown point',gold)

# Small scattered brass stage stars make the foreground tactile.
for x,y in [(2.65,-1.54),(2.24,-1.75),(-2.7,-.65)]:
 pts=[(x+(.11 if i%2==0 else .045)*cos(i*pi/5),y+(.11 if i%2==0 else .045)*sin(i*pi/5),.78) for i in range(10)]
 mesh('Fallen brass star',pts,[tuple(range(10))],gold)

def area(name,loc,power,color,size,target):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size
 o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm photographic softbox',(-4,-5,9),950,(1,.84,.66),4,(0,0,1))
area('Cool high rim',(3,4,7),1100,(.69,.82,1),3,(0,0,2))
area('Soft frontal bounce',(5,-6,3),100,(1,.75,.55),4,(0,0,1.6))
bpy.ops.object.camera_add(location=(8,-12,8.5));cam=bpy.context.object
target=Vector((0,0,1.7));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='PERSP';cam.data.lens=49;s.camera=cam
bpy.ops.object.empty_add(location=(0,0,1.8));focus=bpy.context.object;cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=9
s.render.image_settings.file_format='PNG';s.render.filepath=str(TMP/('preview.png' if s.render.resolution_x<1600 else 'final.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(TMP/'scene.blend'))
bpy.ops.render.render(write_still=True)
out=ROOT/'an-improbable-turn-of-the-page.webp' if s.render.resolution_x>=1600 else TMP/'preview.webp'
Image.open(s.render.filepath).convert('RGB').save(out,'WEBP',quality=92,method=6)
print('FINISHED',out,flush=True)
