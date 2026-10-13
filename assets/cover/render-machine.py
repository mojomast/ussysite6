"""The Machine Beneath the Skin — original procedural cover sculpture.
Rebuild with Blender's bpy module; the website serves only the baked WebP.
Camera, geometry and materials are deterministic. No external image assets.
"""
import bpy, math, random, os
from mathutils import Vector
from math import sin, cos, pi
random.seed(19)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = int(os.getenv('SAMPLES', '64'))
scene.cycles.use_denoising = True
scene.render.resolution_x = int(os.getenv('WIDTH', '1520'))
scene.render.resolution_y = int(scene.render.resolution_x * 540 / 760)
scene.render.resolution_percentage = 100
scene.world.color = (.055, .055, .055)
scene.view_settings.view_transform = 'AgX'

def material(name, color, metallic, roughness, grain=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    n = m.node_tree.nodes
    p = n.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Coat Weight'].default_value = .28
    p.inputs['Coat Roughness'].default_value = .18
    if grain:
        tex = n.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 165
        tex.inputs['Detail'].default_value = 3
        bump = n.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = grain
        bump.inputs['Distance'].default_value = .026
        m.node_tree.links.new(tex.outputs['Fac'], bump.inputs['Height'])
        m.node_tree.links.new(bump.outputs['Normal'], p.inputs['Normal'])
        patina = n.new('ShaderNodeTexNoise')
        patina.inputs['Scale'].default_value = 7
        patina.inputs['Detail'].default_value = 5
        ramp = n.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = .2
        ramp.color_ramp.elements[0].color = (*(c*.35 for c in color),1)
        ramp.color_ramp.elements[1].position = .8
        ramp.color_ramp.elements[1].color = (*(c*1.25 for c in color),1)
        m.node_tree.links.new(patina.outputs['Fac'],ramp.inputs['Fac'])
        m.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])
    return m

bone = material('Smoked ivory / micro-pitted ceramic', (.17,.155,.12), .65,.36,.28)
shell = material('Anthracite carapace / wet clear coat', (.045,.055,.052), .7,.24,.12)
steel = material('Brushed palladium', (.22,.24,.22), .83,.32,.16)
black = material('Oiled graphite', (.013,.019,.018), .5,.3,.14)
copper = material('Oxidised umber bronze', (.22,.094,.044), .8,.31,.2)
rubber = material('Soft black conduits', (.012,.015,.014), .18,.38,.15)
vein = material('Bronze-black vascular sheath', (.095,.059,.031), .48,.32,.23)
tendon = material('Mineralised tendon', (.12,.14,.11), .45,.36,.3)

def finish(obj, mat):
    obj.data.materials.append(mat)
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def ellipsoid(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, location=pos)
    ob = bpy.context.object
    ob.name = name
    ob.scale = scale
    return finish(ob, mat)

# A suspended thoracic machine: the silhouette is organic, its joints machined.
# Geometry is added below the helper declarations.

def tube(name, points, radius, mat, radii=None):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 18
    c.bevel_depth = radius
    c.bevel_resolution = 5
    s = c.splines.new('BEZIER')
    s.bezier_points.add(len(points)-1)
    for i, (p, co) in enumerate(zip(s.bezier_points, points)):
        p.co = co
        p.handle_left_type = p.handle_right_type = 'AUTO'
        if radii: p.radius = radii[i]
    ob = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(ob)
    return finish(ob, mat)

def torus(name, pos, major, minor, mat, normal=(0,0,1), scale=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=12, location=pos, major_radius=major, minor_radius=minor)
    ob = bpy.context.object
    ob.name = name
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = Vector((0,0,1)).rotation_difference(Vector(normal))
    if scale: ob.scale = scale
    return finish(ob, mat)

def cylinder(name, a, b, radius, mat):
    d = Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=d.length, location=(Vector(a)+Vector(b))/2)
    ob = bpy.context.object
    ob.name = name
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = d.to_track_quat('Z','Y')
    bevel = ob.modifiers.new('Machined edge', 'BEVEL')
    bevel.width = .025
    bevel.segments = 3
    return finish(ob, mat)

# Foundation and a curving exoskeletal cathedral behind the suspended organ.
cylinder('Obsidian plinth', (0,0,.08), (0,0,.28), 2.75, black)
torus('Bronze footing', (0,0,.3), 2.52, .04, copper)
for side in [-1,1]:
    tube('Swept load-bearing arch', [(side*2.45,.65,.35),(side*2.8,.95,2.5),(side*2.35,1.2,5.45),(side*1.25,1.25,7.05),(0,1.2,7.35)], .17, bone, [1.3,1,.85,.6,.25])
    tube('Arch inner tendon', [(side*2.2,.72,.4),(side*2.48,.8,2.6),(side*2.07,1,5.4),(side*.95,1.03,6.85)], .054, copper)
    for i in range(15):
        z = .65+i*.34
        x = side*(2.4+.25*sin(z*.65))
        tube('Buttress rib', [(x,.7,z),(x+side*.25,.9,z+.13),(x+side*.27,1.06,z+.28)], .065, steel)
    cylinder('Hydraulic support', (side*1.8,.3,.4), (side*1.4,.3,3.65), .13, steel)
    cylinder('Piston sleeve', (side*1.8,.3,.4), (side*1.62,.3,1.8), .21, black)
    for z in [.6,.72,1.5,1.63]:
        torus('Sleeve seal', (side*(1.8-(z-.4)*.123),.3,z), .215,.035,copper)

# Vertebral column and tapering, overlapping thoracic ribs.
ellipsoid('Visceral graphite core', (0,0,3.25), (.83,.68,2.35), black)
for i in range(15):
    z=1.35+i*.245
    width=.43+1.05*sin((i/18)*pi)
    ellipsoid('Vertebral shield', (0,-.57,z), (.29,.23,.17), bone)
    for side in [-1,1]:
        tube('Cast rib / shadow-separated', [(side*.16,.25,z+.27),(side*width,.14,z+.38),(side*(width+.1),-.42,z+.17),(side*.64,-.91,z-.08),(side*.26,-.7,z-.12)], .09+ .035*sin(i/15*pi), bone, [.8,1.1,1,.75,.5])
        tube('Intercostal wire', [(side*.21,.28,z+.18),(side*(width-.08),.04,z+.28),(side*(width-.02),-.45,z+.08),(side*.51,-.84,z-.13)], .025, copper)
    torus('Spinal seal', (0,0,z), .46,.025,steel)

# Long, sealed cranial carapace; its highlights carry the upper silhouette.
head=ellipsoid('Elongated smoked carapace', (0,.05,5.65), (1.23,1.9,.91), shell)
head.rotation_euler[0]=-.21
ellipsoid('Crown ridge', (0,.24,6.34), (.09,1.32,.13), bone)
for side in [-1,1]:
    for i in range(7):
        y=-1.12+i*.35
        r=(1-(y/1.9)**2)**.5
        points=[]
        for j in range(10):
            a=.08+j*.17
            x=side*1.238*r*sin(a)
            z=.918*r*cos(a)
            points.append((x,.05+y*cos(.21)+z*sin(.21),5.65-y*sin(.21)+z*cos(.21)))
        tube('Fitted cranial segmentation',points,.027,steel)
        for j in [3,7]:
            ellipsoid('Flush shell rivet',points[j],(.032,.032,.026),copper)
    tube('Swept cheekbone', [(side*.35,-1.55,5.48),(side*1.1,-1.08,5.24),(side*1.37,.15,5.4),(side*.87,1.28,5.99)], .17,bone,[.3,.8,1,.3])

# An iris rather than a face: deeply recessed optics in a ribbed metal socket.
center=Vector((0,-1.13,4.68))
for r,thick,depth,mat in [( .65,.16,0,bone),(.52,.045,-.14,copper),(.46,.06,-.17,steel),(.36,.035,-.21,black)]:
    torus('Annular optical socket', center+Vector((0,depth,0)),r,thick,mat,(0,-1,.08))
cylinder('Recessed optic', (0,-1.05,4.68),(0,-1.29,4.68),.43,black)
for i in range(32):
    a=i/32*2*pi
    tube('Iris vanes', [(.29*cos(a),-1.305,4.68+.29*sin(a)),(.42*cos(a+.12),-1.32,4.68+.42*sin(a+.12)),(.51*cos(a+.16),-1.30,4.68+.51*sin(a+.16))],.017,steel)
ellipsoid('Black glass pupil', (0,-1.32,4.68),(.255,.07,.255),shell)
torus('Pupil bronze lip',(0,-1.35,4.68),.25,.014,copper,(0,1,0))

def bezier(p,t):
    return (1-t)**3*p[0]+3*(1-t)**2*t*p[1]+3*(1-t)*t*t*p[2]+t**3*p[3]

# Corrugated umbilicals catch alternating thin rim lights and deep black roots.
for side in [-1,1]:
    for k in range(4):
        p=list(map(Vector,[(side*(.83+k*.1),.45,5.35-k*.19),(side*(3.15+k*.16),-.2,4.9),(side*(2.72+k*.15),-1.1,1.22),(side*(.5+k*.3),-.1,.36)]))
        samples=[bezier(p,i/64) for i in range(65)]
        tube('Looped umbilical',samples[::4],.095,rubber)
        for i in range(1,64):
            t=i/64
            q=bezier(p,t)
            tangent=bezier(p,min(1,t+.003))-bezier(p,max(0,t-.003))
            torus('Umbilical corrugation',q,.102,.025,steel if k==0 else shell,tangent)
        torus('Socket ferrule',p[0],.15,.055,copper,(1,0,0))
    for k in range(7):
        tube('Hanging fine cable', [(side*(.2+k*.1),.15,2.4),(side*(.2+k*.17),-.95,1.05),(side*(1.0+k*.15),-1.1,.31),(side*(2.05+k*.07),.65,.32)], .022+(k%3)*.008, copper if k%3==0 else rubber)
    for k in range(5):
        z=2.1+k*.42
        ellipsoid('Lateral ganglion',(side*1.27,-.1,z),(.25,.24,.19),shell)
        torus('Ganglion seam',(side*1.27,-.15,z),.19,.026,copper,(0,1,0))

# Small machined details imply construction without fictional telemetry.
for i in range(12):
    a=i/12*2*pi
    cylinder('Plinth fastener',(2.38*cos(a),2.38*sin(a),.29),(2.38*cos(a),2.38*sin(a),.335),.055,steel)
    tube('Fastener slot',[(2.38*cos(a)-.026,2.38*sin(a),.338),(2.38*cos(a)+.026,2.38*sin(a),.338)],.006,black)
ellipsoid('Maker medallion',(0,-.86,3.43),(.28,.07,.34),copper)
bpy.ops.object.text_add(location=(-.155,-.945,3.31),rotation=(pi/2,0,0))
text=bpy.context.object
text.name='Si. foundry monogram'
text.data.body='Si.'
text.data.size=.29
text.data.extrude=.003
text.data.materials.append(bone)

# Recessed fasteners, capillaries and heat-sink lamellae give the casting scale.
for side in [-1,1]:
    for i in range(12):
        z=1.72+i*.245
        ellipsoid('Countersunk rib pin',(side*.62,-.93,z),(.035,.018,.035),black)
        ellipsoid('Pin head',(side*.62,-.947,z),(.018,.008,.018),steel)
    for i in range(10):
        y=-.65+i*.14
        tube('Subcranial gill',[(side*1.1,y,5.14),(side*1.32,y,5.03),(side*1.23,y,4.88)],.027,steel)
    for k in range(3):
        tube('Nerve capillary',[(side*(.55+k*.06),-.42,1.9),(side*(.95+k*.04),-.77,2.65),(side*(1.13+k*.04),-.6,3.5),(side*(1.28+k*.04),-.22,4.36)],.012,copper)
    for z in [2.05,3.18,4.2]:
        cylinder('Accessory socket',(side*1.38,-.03,z),(side*1.55,-.03,z),.075,black)
        torus('Socket retaining ring',(side*1.57,-.03,z),.073,.014,copper,(1,0,0))
for i in range(16):
    a=i/16*2*pi
    x,z=.665*cos(a),4.68+.665*sin(a)
    ellipsoid('Optical collar recessed screw',(x,-1.27,z),(.027,.014,.027),black)
    tube('Collar screw slot',[(x-.01,-1.285,z),(x+.01,-1.285,z)],.004,steel)

# Vascular tracery conforms to the cranial surface rather than floating above it.
def crown_point(y,a,lift=.025):
    r=max(.01,1-(y/1.9)**2)**.5
    x=(1.23+lift)*r*sin(a)
    z=(.91+lift)*r*cos(a)
    return (x,.05+y*cos(.21)+z*sin(.21),5.65-y*sin(.21)+z*cos(.21))

for side in [-1,1]:
    for k in range(4):
        angle=side*(.26+k*.36)
        points=[crown_point(-1.64+j*.155,angle+side*.08*sin(j*.8+k)) for j in range(21)]
        tube('Branching cranial vein',points,.019+k*.004,vein,[.35]+[1]*18+[.5,.12])
        for j in range(2,18,3):
            y=-1.64+j*.155
            a=angle+side*.08*sin(j*.8+k)
            direction=1 if (j+k)%2 else -1
            branch=[crown_point(y+t*.48,a+direction*side*t*.29) for t in [0,.23,.5,.75,1]]
            tube('Cranial capillary fork',branch,.013,tendon,[1,.9,.6,.35,.05])
            branch2=[crown_point(y+.22+t*.3,a+direction*side*(.14-t*.22)) for t in [0,.33,.66,1]]
            tube('Fine branching capillary',branch2,.008,vein,[.8,.65,.3,.03])

# A plexus snakes across the rib ends; smaller branches disappear into the slots.
for side in [-1,1]:
    for k in range(3):
        points=[]
        for j in range(17):
            z=1.6+j*.215
            x=side*(.72+k*.14+.065*sin(j*.85+k))
            y=-.94+.13*k+.035*cos(j*1.4)
            points.append((x,y,z))
        tube('Thoracic vascular trunk',points,.025+k*.009,vein if k!=1 else tendon,[.1]+[1]*14+[.7,.2])
        for j in range(2,16,2):
            x,y,z=points[j]
            tube('Fork into intercostal space',[(x,y,z),(x+side*.11,y-.02,z+.075),(x+side*.22,y+.07,z+.14),(x+side*.28,y+.19,z+.17)],.015,tendon,[1,.85,.4,.08])
            tube('Returning nerve branch',[(x,y,z),(x-side*.08,y-.035,z-.06),(x-side*.23,y+.01,z-.13)],.01,vein,[1,.65,.08])
    tube('Arterial arch braid',[(side*2.4,.43,.5),(side*2.65,.62,2.1),(side*2.43,.9,4.55),(side*1.45,1.02,6.8)],.042,vein)
    for j in range(9):
        z=1+j*.45
        x=side*(2.4+.25*sin(z*.65))
        tube('Arch rootlet',[(x,.61,z),(x-side*.13,.41,z+.15),(x-side*.27,.25,z+.32)],.022,tendon,[1,.6,.08])

# Open, toothed gear trains and hydraulic hardware nestled inside the tendons.
def gear(name,center,radius,teeth,mat):
    n=teeth*4
    verts=[]
    x,y,z=center
    for depth in [-.045,.045]:
        for ring in [0,1]:
            for i in range(n):
                a=i/n*2*pi
                r=radius*(1 if i%4 in [1,2] else .86) if ring==0 else radius*.52
                verts.append((x+r*cos(a),y+depth,z+r*sin(a)))
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+i,3*n+i,3*n+j,2*n+j),(i,2*n+i,2*n+j,j),(n+i,n+j,3*n+j,3*n+i)])
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    ob=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    bevel=ob.modifiers.new('Worn tooth shoulders','BEVEL')
    bevel.width=.009
    bevel.segments=2
    cylinder('Gear hub',(x,y-.09,z),(x,y+.09,z),radius*.18,steel)
    torus('Gear concentric tool mark',(x,y-.051,z),radius*.69,.01,steel,(0,1,0))
    for k in range(5):
        a=k/5*2*pi
        tube('Swept gear spoke',[(x,y-.04,z),(x+radius*.32*cos(a+.3),y-.04,z+radius*.32*sin(a+.3)),(x+radius*.6*cos(a),y-.04,z+radius*.6*sin(a))],radius*.065,mat)

for side in [-1,1]:
    for x,z,r,t in [(1.38,2.15,.34,20),(1.65,2.65,.25,16),(1.55,3.04,.18,12),(1.38,1.7,.16,12)]:
        gear('Exposed timing gear',(side*x,-.69,z),r,t,copper if r>.3 else steel)
    tube('Bearing carrier',[(side*.85,-.25,1.5),(side*1.62,-.43,1.75),(side*1.92,-.3,2.67),(side*1.3,.02,3.48)],.072,black)
    a=Vector((side*1.74,-.48,3.05))
    b=Vector((side*1.29,-.45,4.38))
    cylinder('Exposed piston rod',a,b,.054,steel)
    cylinder('Hydraulic black barrel',a,a+(b-a)*.49,.12,black)
    for t in [.05,.12,.39,.47]:
        torus('Hydraulic compression collar',a+(b-a)*t,.121,.024,copper,b-a)
    for p in [a,b]:
        torus('Piston pivot clevis',p,.13,.041,steel,(0,1,0))
        cylinder('Pivot pin',p+Vector((0,-.12,0)),p+Vector((0,.12,0)),.052,black)
    for k in range(4):
        tube('Hard-line manifold',[(side*(1.1+k*.065),.02,1.6),(side*(1.7+k*.065),-.03,1.45),(side*(1.9+k*.055),-.1,1.7),(side*(1.9+k*.055),-.1,3.35),(side*1.53,-.15,3.64+k*.05)],.022,steel if k%2 else copper)
    for k in range(3):
        z=3.5+k*.22
        cylinder('Finned solenoid',(side*1.45,.08,z),(side*1.83,.08,z),.115,black)
        for j in range(6):
            torus('Solenoid heat-sink fin',(side*(1.47+j*.065),.08,z),.127,.023,steel,(1,0,0))
    tube('Pressure return hose',[(side*1.9,-.1,3.4),(side*2.1,-.4,3.8),(side*1.75,-.6,4.55),(side*.7,-.58,4.94)],.048,rubber)

ground=material('Charcoal studio floor',(.018,.022,.021),.24,.4,.14)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,0))
finish(bpy.context.object,ground)

def area(name,pos,power,color,size,target,size_y=None):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.color=color
    data.shape='DISK' if size_y is None else 'RECTANGLE'
    data.size=size
    if size_y is not None: data.size_y=size_y
    ob=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(ob)
    ob.location=pos
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()

area('Warm high softbox',(-5,-6,10),1300,(1,.83,.61),4,(0,0,4),2)
area('Cold surgical rim',(5,2,7),1800,(.57,.75,.79),3,(0,0,4),5)
area('Upper bone reflection',(-1,3,10),1300,(1,.77,.5),3,(0,0,4),2)
area('Narrow wet highlight',(-3,-4,4),350,(.75,.88,1),.6,(0,0,4),5)
area('Quiet frontal fill',(1,-8,5),65,(.78,.82,.8),5,(0,0,3))
bpy.ops.object.camera_add(location=(8,-19,8.8))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,3.6))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=11.6
scene.camera=camera
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.getenv('OUTPUT','/tmp/opencode/cover-machine.png')
print(f'Rendering {len(scene.objects)} objects at {scene.render.resolution_x} × {scene.render.resolution_y}, {scene.cycles.samples} samples', flush=True)
bpy.ops.render.render(write_still=True)
print(f'Saved {scene.render.filepath}', flush=True)
