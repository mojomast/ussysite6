"""Never Splice Mid-Sentence — original Blender 5.2 conceptual still life for RouteTok.
Run with the cached bpy 5.2.2 module and Pillow. All geometry and shaders are original/procedural.
"""
import os, math, random
from pathlib import Path
import bpy
from mathutils import Vector, Matrix
from math import sin, cos, pi, exp, sqrt
from PIL import Image

random.seed(106)
ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/routetok-blender')
TMP.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 2
SAMPLES = int(os.environ.get('SAMPLES', '64'))
WIDTH = int(os.environ.get('WIDTH', '1600'))
HEIGHT = int(round(WIDTH * 0.75))
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x = WIDTH
scene.render.resolution_y = HEIGHT
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.018, 0.028, 0.024, 1.0)
bg.inputs[1].default_value = 0.32


def mat(name, color, metal=0.0, rough=0.35, coat=0.0, grain=0.08, grain_scale=160.0, sheen=0.0, subsurf=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    links = m.node_tree.links
    p = nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1.0)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    p.inputs['Coat Weight'].default_value = coat
    if 'Sheen Weight' in p.inputs:
        p.inputs['Sheen Weight'].default_value = sheen
    if 'Subsurface Weight' in p.inputs:
        p.inputs['Subsurface Weight'].default_value = subsurf
    if grain > 0:
        tex = nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = grain_scale
        tex.inputs['Detail'].default_value = 4.0
        tex.inputs['Roughness'].default_value = 0.65
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = grain
        bump.inputs['Distance'].default_value = 0.014
        links.new(tex.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], p.inputs['Normal'])
    return m


def emit_mat(name, base_color, emit_color, strength=4.0, rough=0.15, metal=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*base_color, 1.0)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*base_color, 1.0)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Emission Color'].default_value = (*emit_color, 1.0)
    p.inputs['Emission Strength'].default_value = strength
    return m


# Materials
walnut = mat('Oiled cabinetmaker walnut', (0.11, 0.048, 0.020), metal=0.0, rough=0.34, coat=0.25, grain=0.18, grain_scale=45)
baize = mat('Deep telegraph table green baize', (0.022, 0.078, 0.052), metal=0.0, rough=0.88, grain=0.30, grain_scale=280, sheen=0.35)
brass = mat('Brushed switchboard brass', (0.64, 0.42, 0.14), metal=0.88, rough=0.21, coat=0.12, grain=0.07, grain_scale=190)
aged_brass = mat('Patinated manifold bronze', (0.42, 0.26, 0.09), metal=0.82, rough=0.32, grain=0.12, grain_scale=130)
gold_probe = mat('Gleaming gold trial probe sphere', (0.94, 0.72, 0.22), metal=0.98, rough=0.06, coat=0.3, grain=0.01)
copper = mat('Electrolytic knife-switch copper', (0.76, 0.33, 0.16), metal=0.92, rough=0.20, grain=0.06, grain_scale=210)
steel = mat('Forged shear blades steel', (0.74, 0.78, 0.81), metal=0.95, rough=0.11, coat=0.15, grain=0.04, grain_scale=240)
charred = mat('Carbonized open-circuit track', (0.020, 0.022, 0.024), metal=0.15, rough=0.78, grain=0.38, grain_scale=110)
porcelain_red = mat('Crimson glazed insulator porcelain', (0.58, 0.065, 0.055), metal=0.0, rough=0.16, coat=0.65, grain=0.04)
porcelain_ivory = mat('Fired cream relay porcelain', (0.86, 0.80, 0.68), metal=0.0, rough=0.20, coat=0.45, grain=0.05)
paper_tape = mat('Uncut cream telegraph ticker paper', (0.88, 0.81, 0.66), metal=0.0, rough=0.74, grain=0.18, grain_scale=260, subsurf=0.06)
ink_dark = mat('Telegraph code ink', (0.025, 0.030, 0.028), metal=0.05, rough=0.45, grain=0.04)
velvet_crimson = mat('Plush crimson velvet cushion', (0.14, 0.007, 0.012), metal=0.0, rough=0.88, grain=0.26, grain_scale=240, sheen=0.18)
wax_seal = mat('Stamped red sealing wax', (0.32, 0.012, 0.010), metal=0.0, rough=0.24, coat=0.45, grain=0.14, grain_scale=95, subsurf=0.03)

# Clear vintage glass bell dome
bell_glass = mat('Blown borosilicate relay dome', (0.92, 0.97, 0.95), metal=0.0, rough=0.02, coat=0.85, grain=0.002)
pg = bell_glass.node_tree.nodes.get('Principled BSDF')
pg.inputs['Transmission Weight'].default_value = 0.95
pg.inputs['IOR'].default_value = 1.47

# Indicator filaments & jewel lamps
emerald_glow = emit_mat('Closed circuit emerald indicator', (0.18, 0.95, 0.48), (0.15, 1.0, 0.45), strength=5.5, rough=0.1)
amber_filament = emit_mat('Warm tungsten closed filament', (1.0, 0.72, 0.25), (1.0, 0.68, 0.20), strength=6.5, rough=0.1)
crimson_glow = emit_mat('Tripped open ruby indicator', (1.0, 0.16, 0.14), (1.0, 0.14, 0.10), strength=5.2, rough=0.1)
probe_glow = emit_mat('Half-open amber trial jewel', (1.0, 0.78, 0.22), (1.0, 0.72, 0.18), strength=4.8, rough=0.1)


def finish(obj, name, m):
    obj.name = name
    obj.data.materials.append(m)
    if hasattr(obj.data, 'polygons'):
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def box(name, loc, dims, m, bevel=0.025, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
        o.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL')
    return finish(o, name, m)


def cyl(name, a, b, r, m, vertices=48, bevel=0.010):
    va, vb = Vector(a), Vector(b)
    d = vb - va
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=r, depth=d.length, location=(va + vb) / 2)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        o.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL')
    return finish(o, name, m)


def tor(name, loc, major, minor, m, normal=(0, 0, 1), scale=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=16, major_radius=major, minor_radius=minor, location=loc)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector(normal).normalized())
    if scale:
        o.scale = scale
    return finish(o, name, m)


def sphere(name, loc, r, m, scale=(1, 1, 1), segments=40, rings=22):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=r, location=loc)
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, m)


def poly_tube(name, pts, r, m, bevel_res=6, cyclic=False):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.bevel_depth = r
    c.bevel_resolution = bevel_res
    s = c.splines.new('POLY')
    s.use_cyclic_u = cyclic
    s.points.add(len(pts) - 1)
    for sp, pt in zip(s.points, pts):
        sp.co = (*pt, 1.0)
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return finish(o, name, m)


def text_obj(body, loc, size, m, rot=(pi / 2, 0, 0), extrude=0.006, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = 0.0012
    o.data.align_x = align
    return finish(o, f'Label {body}', m)


# 1. WALNUT CABINETMAKER TABLE & GREEN BAIZE INLAY
bpy.ops.mesh.primitive_plane_add(size=180, location=(0, 0, 0))
finish(bpy.context.object, 'Dark walnut studio floor', walnut)

box('Walnut switchboard table frame', (0.0, 0.0, 0.18), (7.20, 4.40, 0.32), walnut, bevel=0.04)
box('Recessed green baize desk bed', (0.0, 0.0, 0.345), (6.72, 3.92, 0.03), baize, bevel=0.01)
# Brass perimeter inlay strip around the green baize
box('Front brass baize trim', (0.0, -1.96, 0.355), (6.76, 0.035, 0.025), brass, bevel=0.005)
box('Rear brass baize trim', (0.0, 1.96, 0.355), (6.76, 0.035, 0.025), brass, bevel=0.005)
box('Left brass baize trim', (-3.38, 0.0, 0.355), (0.035, 3.94, 0.025), brass, bevel=0.005)
box('Right brass baize trim', (3.38, 0.0, 0.355), (0.035, 3.94, 0.025), brass, bevel=0.005)


# 2. THE THREE-STATE CIRCUIT BREAKER TURRET (CLOSED / OPEN / HALF-OPEN)
my = 0.42
# Stepped walnut & brushed-brass manifold block
box('Manifold walnut base plinth', (0.0, my, 0.48), (4.86, 1.62, 0.24), walnut, bevel=0.03)
box('Stepped brushed-brass manifold block', (0.0, my, 0.68), (4.58, 1.38, 0.22), brass, bevel=0.025)
box('Manifold upper porcelain insulator deck', (0.0, my, 0.82), (4.36, 1.18, 0.08), aged_brass, bevel=0.015)

# Front manifold master plaque
box('Manifold master plaque', (0.0, my - 0.70, 0.66), (2.56, 0.04, 0.14), ink_dark, bevel=0.006)
text_obj('HEALTH ROUTER · PRE-OUTPUT FAILOVER', (0.0, my - 0.725, 0.635), 0.078, brass, rot=(pi / 2, 0, 0), extrude=0.004)

# Heavy copper busbars linking the three relay stations across the front deck
cyl('Front copper busbar A', (-1.95, my - 0.48, 0.89), (1.95, my - 0.48, 0.89), 0.024, copper)
cyl('Rear copper busbar B', (-1.95, my + 0.48, 0.89), (1.95, my + 0.48, 0.89), 0.024, copper)


def build_bell_dome(cx, cy, z_base, r_dome=0.58, h_dome=1.42):
    # Turned brass base ring & gasket
    cyl('Dome brass base seat', (cx, cy, z_base), (cx, cy, z_base + 0.08), r_dome + 0.06, brass, vertices=64)
    cyl('Dome porcelain deck', (cx, cy, z_base + 0.08), (cx, cy, z_base + 0.13), r_dome - 0.02, porcelain_ivory, vertices=64)
    tor('Dome rubber/brass gasket', (cx, cy, z_base + 0.09), r_dome + 0.01, 0.022, aged_brass)

    # Glass bell jar profile
    prof = []
    for i in range(28):
        t = i / 27.0
        if t < 0.52:
            r = r_dome
            z = z_base + 0.09 + (t / 0.52) * (h_dome * 0.56)
        else:
            u = (t - 0.52) / 0.48
            ang = u * (pi / 2.0)
            r = r_dome * cos(ang)
            z = z_base + 0.09 + h_dome * 0.56 + (h_dome * 0.44) * sin(ang)
        prof.append((r, z))
    seg = 64
    verts = [(cx + r * cos(j * 2 * pi / seg), cy + r * sin(j * 2 * pi / seg), z) for r, z in prof for j in range(seg)]
    faces = [(i * seg + j, i * seg + (j + 1) % seg, (i + 1) * seg + (j + 1) % seg, (i + 1) * seg + j)
             for i in range(len(prof) - 1) for j in range(seg)]
    msh = bpy.data.meshes.new(f'RelayBell_{cx:.1f}')
    msh.from_pydata(verts, [], faces)
    msh.update()
    ob = bpy.data.objects.new(f'Glass relay bell {cx:.1f}', msh)
    bpy.context.collection.objects.link(ob)
    finish(ob, ob.name, bell_glass)
    sol = ob.modifiers.new('GlassWall', 'SOLIDIFY')
    sol.thickness = 0.020

    # Top brass finial knob on the bell dome
    top_z = z_base + 0.09 + h_dome
    cyl('Bell dome crown collar', (cx, cy, top_z - 0.02), (cx, cy, top_z + 0.05), 0.095, brass)
    sphere('Bell dome brass finial', (cx, cy, top_z + 0.10), 0.065, brass)


z0 = 0.86
# Station X positions
x_closed, x_open, x_half = -1.52, 0.0, 1.52

for st_x, label_txt, jewel_mat in [
    (x_closed, 'CLOSED', emerald_glow),
    (x_open, 'OPEN', crimson_glow),
    (x_half, 'HALF-OPEN · 1 PROBE', probe_glow),
]:
    build_bell_dome(st_x, my, z0)
    # Sloped front porcelain/brass state plaque
    box(f'Plaque frame {label_txt}', (st_x, my - 0.58, 0.85), (0.98, 0.16, 0.14), aged_brass, bevel=0.01, rot=(0.45, 0, 0))
    box(f'Plaque face {label_txt}', (st_x, my - 0.60, 0.86), (0.90, 0.14, 0.11), porcelain_ivory, bevel=0.006, rot=(0.45, 0, 0))
    t_size = 0.064 if 'HALF' in label_txt else 0.088
    text_obj(label_txt, (st_x, my - 0.665, 0.835), t_size, ink_dark, rot=(1.12, 0, 0), extrude=0.004)
    # Front jewel indicator lamp & knurled binding posts
    tor(f'Jewel bezel {label_txt}', (st_x - 0.42, my - 0.54, 0.93), 0.055, 0.014, brass)
    sphere(f'Jewel lamp {label_txt}', (st_x - 0.42, my - 0.54, 0.93), 0.046, jewel_mat)
    for px_off in (-0.28, 0.28):
        cyl('Knurled binding post', (st_x + px_off, my - 0.52, 0.86), (st_x + px_off, my - 0.52, 1.02), 0.036, brass)
        tor('Binding post thumb nut', (st_x + px_off, my - 0.52, 0.98), 0.046, 0.012, copper)

# --- DOME 1 INTERIOR (LEFT: CLOSED) ---
# Twin copper solenoid coils + closed copper knife-switch bridge + warm emerald/amber glowing filament
for side in (-1, 1):
    cx = x_closed + side * 0.22
    cyl('Closed relay bobbin core', (cx, my + 0.10, z0 + 0.13), (cx, my + 0.10, z0 + 0.58), 0.12, copper)
    cyl('Bobbin lower flange', (cx, my + 0.10, z0 + 0.13), (cx, my + 0.10, z0 + 0.17), 0.15, brass)
    cyl('Bobbin upper flange', (cx, my + 0.10, z0 + 0.54), (cx, my + 0.10, z0 + 0.58), 0.15, brass)
    # Contact pedestals in front
    box('Knife switch contact jaw', (cx, my - 0.14, z0 + 0.28), (0.09, 0.12, 0.30), brass, bevel=0.008)

# Closed heavy copper knife-switch blade seated firmly across both jaws
box('Closed copper knife blade', (x_closed, my - 0.14, z0 + 0.38), (0.58, 0.035, 0.09), copper, bevel=0.008)
cyl('Closed switch handle post', (x_closed + 0.26, my - 0.14, z0 + 0.38), (x_closed + 0.38, my - 0.22, z0 + 0.38), 0.025, brass)
cyl('Closed switch insulated grip', (x_closed + 0.34, my - 0.20, z0 + 0.38), (x_closed + 0.46, my - 0.28, z0 + 0.38), 0.048, porcelain_ivory)

# Glowing emerald & warm amber filament arch above the closed relay
cyl('Filament post L', (x_closed - 0.16, my + 0.08, z0 + 0.58), (x_closed - 0.16, my + 0.08, z0 + 0.92), 0.020, brass)
cyl('Filament post R', (x_closed + 0.16, my + 0.08, z0 + 0.58), (x_closed + 0.16, my + 0.08, z0 + 0.92), 0.020, brass)
fil_pts = []
for i in range(45):
    t = i / 44.0
    ang = t * pi
    fx = x_closed - 0.16 + 0.32 * t
    fy = my + 0.08 + 0.025 * sin(t * 10 * pi)
    fz = z0 + 0.90 + 0.28 * sin(ang)
    fil_pts.append((fx, fy, fz))
poly_tube('Glowing amber filament loop', fil_pts, 0.016, amber_filament, bevel_res=5)
sphere('Closed emerald core beacon', (x_closed, my + 0.08, z0 + 0.88), 0.095, emerald_glow)


# --- DOME 2 INTERIOR (CENTER: OPEN) ---
# Dark charred carbonized contact track on the base + tripped red porcelain insulator arm raised high
box('Charred open circuit track', (x_open, my - 0.02, z0 + 0.16), (0.64, 0.28, 0.06), charred, bevel=0.01)
for side in (-1, 1):
    box('Open breaker stationary contact', (x_open + side * 0.25, my - 0.02, z0 + 0.28), (0.11, 0.14, 0.26), aged_brass, bevel=0.01)

# Tripped hinge pillar on left, red porcelain insulator arm & copper blade sprung high at 54 degrees
pivot_open = Vector((x_open - 0.24, my - 0.02, z0 + 0.38))
tip_open = Vector((x_open + 0.18, my - 0.02, z0 + 1.08))
cyl('Tripped copper breaker blade', pivot_open, tip_open, 0.032, copper)
# Ribbed crimson glazed-porcelain insulator sleeve along the raised arm
for k in range(5):
    u = 0.22 + k * 0.14
    pos = pivot_open.lerp(tip_open, u)
    cyl(f'Red porcelain insulator shed {k}', pos - Vector((0.02, 0, 0.03)), pos + Vector((0.02, 0, 0.03)), 0.085 if k % 2 == 0 else 0.062, porcelain_red)

# Coiled release spring & glowing red trip flag inside the center dome
cyl('Breaker trip stop post', (x_open - 0.28, my + 0.16, z0 + 0.14), (x_open - 0.28, my + 0.16, z0 + 0.95), 0.035, brass)
sphere('Tripped red warning beacon', (x_open - 0.28, my + 0.16, z0 + 1.00), 0.075, crimson_glow)


# --- DOME 3 INTERIOR (RIGHT: HALF-OPEN · 1 PROBE) ---
# Precision brass balance beam holding ONE single gleaming gold ball-bearing probe poised over a narrow gate
cyl('Balance fulcrum pillar', (x_half, my + 0.08, z0 + 0.13), (x_half, my + 0.08, z0 + 0.78), 0.055, brass)
box('Knife-edge fulcrum cradle', (x_half, my + 0.08, z0 + 0.80), (0.16, 0.12, 0.08), steel, bevel=0.008)

# Tilted precision brass balance beam
beam_l = Vector((x_half - 0.34, my + 0.02, z0 + 0.88))
beam_r = Vector((x_half + 0.32, my - 0.04, z0 + 0.74))
cyl('Half-open brass balance beam', beam_l, beam_r, 0.026, brass)
cyl('Counterweight brass cylinder', beam_l - Vector((0, 0, 0.08)), beam_l + Vector((0, 0, 0.08)), 0.078, aged_brass)

# Narrow twin-rail admission gate on the right side of Dome 3
box('Probe gate jaw L', (x_half + 0.26, my - 0.12, z0 + 0.28), (0.06, 0.18, 0.32), brass, bevel=0.006)
box('Probe gate jaw R', (x_half + 0.38, my + 0.04, z0 + 0.28), (0.06, 0.18, 0.32), brass, bevel=0.006)
tor('Probe gate target ring', (x_half + 0.32, my - 0.04, z0 + 0.50), 0.115, 0.018, copper)

# THE SINGLE GLEAMING GOLD BALL-BEARING PROBE (halfOpenMaxProbes = 1)
tor('Probe cradle ring', (x_half + 0.32, my - 0.04, z0 + 0.68), 0.105, 0.016, brass)
sphere('Single golden trial probe sphere', (x_half + 0.32, my - 0.04, z0 + 0.78), 0.135, gold_probe)
# Tiny internal plaque inside Dome 3
box('1 Probe internal tag', (x_half - 0.18, my - 0.22, z0 + 0.22), (0.38, 0.03, 0.12), brass, bevel=0.004, rot=(0.25, 0, 0))
text_obj('1 PROBE', (x_half - 0.18, my - 0.24, z0 + 0.195), 0.058, ink_dark, rot=(1.32, 0, 0), extrude=0.003)


# 3. FOREGROUND LEFT-TO-CENTER: THE UN-SPLICED PAPER TICKER TAPE & BRASS FEED HORN
tx, ty = -2.28, -0.78
# Brass telegraph tape turret & spoked supply reel
cyl('Ticker turret base', (tx, ty, 0.36), (tx, ty, 0.46), 0.46, brass, vertices=64)
box('Ticker upright standard', (tx - 0.12, ty + 0.08, 0.84), (0.14, 0.18, 0.76), brass, bevel=0.015)
# Spoked brass supply reel & paper roll
reel_pos = (tx - 0.12, ty - 0.06, 1.06)
cyl('Paper tape supply roll', (tx - 0.12, ty - 0.14, 1.06), (tx - 0.12, ty + 0.02, 1.06), 0.36, paper_tape, vertices=64)
tor('Brass reel front rim', (tx - 0.12, ty - 0.15, 1.06), 0.40, 0.020, brass, normal=(0, 1, 0))
tor('Brass reel rear rim', (tx - 0.12, ty + 0.03, 1.06), 0.40, 0.020, brass, normal=(0, 1, 0))
cyl('Reel center hub', (tx - 0.12, ty - 0.18, 1.06), (tx - 0.12, ty + 0.06, 1.06), 0.085, aged_brass)
for spk in range(6):
    ang = spk * pi / 3.0
    cyl('Reel spoke',
        (tx - 0.12, ty - 0.15, 1.06),
        (tx - 0.12 + 0.38 * cos(ang), ty - 0.15, 1.06 + 0.38 * sin(ang)),
        0.016, brass, vertices=16)

# Flared brass feed horn & pinch rollers guiding the paper tape onto the table
cyl('Upper knurled pinch roller', (tx + 0.28, ty - 0.14, 0.72), (tx + 0.28, ty + 0.14, 0.72), 0.065, brass)
cyl('Lower steel pinch roller', (tx + 0.28, ty - 0.14, 0.58), (tx + 0.28, ty + 0.14, 0.58), 0.065, steel)
box('Brass feed horn mouth', (tx + 0.46, ty, 0.64), (0.24, 0.44, 0.18), brass, bevel=0.02, rot=(0, 0.22, 0))

# Continuous, completely UN-SPLICED cream paper ticker tape flowing across the foreground
tape_ctrl = [
    (-2.12, -0.78, 0.82),
    (-1.82, -0.78, 0.64),
    (-1.35, -0.84, 0.42),
    (-0.78, -0.96, 0.54),
    (-0.18, -1.04, 0.40),
    (0.42, -0.92, 0.49),
    (0.88, -1.06, 0.39),
]


def eval_catmull(pts, n_samples=160):
    vecs = [Vector(p) for p in pts]
    out = []
    segs = len(vecs) - 1
    for i in range(segs):
        p0 = vecs[max(0, i - 1)]
        p1 = vecs[i]
        p2 = vecs[i + 1]
        p3 = vecs[min(segs, i + 2)]
        for j in range(n_samples // segs):
            t = j / (n_samples // segs)
            pos = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * (t * t) + (-p0 + 3 * p1 - 3 * p2 + p3) * (t * t * t))
            out.append(pos)
    out.append(vecs[-1])
    return out


tape_pts = eval_catmull(tape_ctrl, 150)
tape_w = 0.175  # half-width = 0.175 -> full width = 0.35
t_verts = []
t_faces = []
t_norms = []
t_sides = []
for i, p in enumerate(tape_pts):
    tang = (tape_pts[min(len(tape_pts) - 1, i + 1)] - tape_pts[max(0, i - 1)]).normalized()
    side = Vector((0, 1, 0)). rotated(Matrix.Rotation(0.12 * sin(i * 0.06), 3, tang)) if hasattr(Vector((0, 1, 0)), 'rotated') else Vector((0, 1, 0))
    side = (tang.cross(Vector((0, 0, 1)))).normalized()
    # Keep width mostly along Y so the broad face is tilted toward the camera
    side = Vector((-tang.y * 0.25, 0.94, 0.22)).normalized()
    norm = tang.cross(side).normalized()
    if norm.z < 0:
        norm = -norm
    t_verts.append(tuple(p - side * tape_w))
    t_verts.append(tuple(p + side * tape_w))
    t_norms.append(norm)
    t_sides.append(side)

for i in range(len(tape_pts) - 1):
    t_faces.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))

t_mesh = bpy.data.meshes.new('ContinuousTickerTape')
t_mesh.from_pydata(t_verts, [], t_faces)
t_mesh.update()
t_obj = bpy.data.objects.new('Uncut paper token stream', t_mesh)
bpy.context.collection.objects.link(t_obj)
finish(t_obj, 'Uncut paper token stream', paper_tape)
sol_t = t_obj.modifiers.new('PaperThickness', 'SOLIDIFY')
sol_t.thickness = 0.009

# Printed continuous telegraph code bars & center sprocket dots along the uncut paper tape
for i in range(6, len(tape_pts) - 5, 3):
    p = tape_pts[i]
    tang = (tape_pts[i + 1] - tape_pts[i - 1]).normalized()
    norm = t_norms[i]
    side = t_sides[i]
    top_p = p + norm * 0.008
    # Center sprocket feed dot
    sphere('Tape sprocket hole', top_p, 0.011, ink_dark, scale=(1, 1, 0.3), segments=12, rings=8)
    # Upper and lower telegraph token dashes (continuous single voice)
    for row_sign in (-1, 1):
        if (i + (1 if row_sign > 0 else 0)) % 2 == 0:
            p_a = top_p + side * (row_sign * 0.055)
            p_b = top_p + side * (row_sign * 0.135) + tang * 0.018
            cyl('Printed token mark', p_a, p_b, 0.0055, ink_dark, vertices=10, bevel=0)

# Heavy brass paper-guide bridge straddling the ticker tape mid-stream
gx_bridge, gy_bridge = -0.78, -0.96
box('Tape inspection bridge L foot', (gx_bridge, gy_bridge - 0.25, 0.42), (0.18, 0.08, 0.14), brass, bevel=0.01)
box('Tape inspection bridge R foot', (gx_bridge, gy_bridge + 0.25, 0.42), (0.18, 0.08, 0.14), brass, bevel=0.01)
box('Tape inspection bridge arch', (gx_bridge, gy_bridge, 0.62), (0.22, 0.58, 0.06), brass, bevel=0.01)
text_obj('NO SPLICE', (gx_bridge, gy_bridge - 0.19, 0.655), 0.058, ink_dark, rot=(0.25, 0, 0), extrude=0.003)


# 4. FOREGROUND RIGHT: ORNATE TAILOR'S SHEARS LOCKED SHUT BY A WAX-SEALED RIBBON ON A CRIMSON CUSHION
cx_pil, cy_pil = 1.68, -0.86
# Brass cushion tray & tufted crimson velvet pillow
box('Cushion brass tray', (cx_pil, cy_pil, 0.38), (1.42, 1.06, 0.05), aged_brass, bevel=0.015, rot=(0, 0, -0.18))

# Sculpted pillow mesh with plump center and pinched corners
pil_n = 44
p_verts = []
p_faces = []
rot_m = Matrix.Rotation(-0.18, 3, 'Z')
for j in range(pil_n + 1):
    v = (j / pil_n - 0.5) * 2.0
    for i in range(pil_n + 1):
        u = (i / pil_n - 0.5) * 2.0
        px_local = u * 0.64
        py_local = v * 0.46
        dome = max(0.0, (1.0 - u * u * 0.82) * (1.0 - v * v * 0.82))
        tuft = 1.0 - 0.14 * exp(-(u * u + v * v) * 9.0)
        pz = 0.40 + 0.21 * sqrt(dome) * tuft
        pt_w = rot_m @ Vector((px_local, py_local, 0.0))
        p_verts.append((cx_pil + pt_w.x, cy_pil + pt_w.y, pz))

for j in range(pil_n):
    for i in range(pil_n):
        a = j * (pil_n + 1) + i
        p_faces.append((a, a + 1, a + pil_n + 2, a + pil_n + 1))

pil_mesh = bpy.data.meshes.new('CrimsonVelvetCushion')
pil_mesh.from_pydata(p_verts, [], p_faces)
pil_mesh.update()
pil_obj = bpy.data.objects.new('Crimson velvet shear cushion', pil_mesh)
bpy.context.collection.objects.link(pil_obj)
finish(pil_obj, 'Crimson velvet shear cushion', velvet_crimson)

# Gold corner tassels on the cushion
for cu in (-0.62, 0.62):
    for cv in (-0.44, 0.44):
        c_pt = rot_m @ Vector((cu, cv, 0.0))
        sphere('Cushion gold tassel knot', (cx_pil + c_pt.x, cy_pil + c_pt.y, 0.43), 0.048, brass)

# Ornate Brass-and-Steel Tailor's Shears resting LOCKED SHUT atop the cushion
# Pivot point of the closed shears
sh_pivot = Vector((cx_pil - 0.02, cy_pil + 0.02, 0.64))
sh_dir = Vector((-0.88, -0.42, 0.0)).normalized()  # Blades point toward foreground-left (toward the paper tape, but locked shut!)
sh_perp = Vector((-sh_dir.y, sh_dir.x, 0.0))

# Two closed steel shear blades (overlapping tightly, locked shut)
for b_idx, z_off in enumerate((0.0, 0.024)):
    angle_tiny = 0.035 if b_idx == 0 else -0.035
    b_vec = (sh_dir + sh_perp * angle_tiny).normalized()
    tip_pt = sh_pivot + b_vec * 0.78 + Vector((0, 0, -0.02))
    mid_pt = sh_pivot.lerp(tip_pt, 0.48) + Vector((0, 0, z_off))
    box(f'Locked shear blade {b_idx}', mid_pt, (0.78, 0.095, 0.022), steel, bevel=0.006,
        rot=(0.08 * (1 if b_idx == 0 else -1), 0.04, math.atan2(b_vec.y, b_vec.x)))

# Brass pivot screw uniting the blades
cyl('Shear brass pivot boss', sh_pivot - Vector((0, 0, 0.02)), sh_pivot + Vector((0, 0, 0.055)), 0.058, brass)
box('Shear pivot screw slot', sh_pivot + Vector((0, 0, 0.058)), (0.075, 0.014, 0.008), ink_dark, bevel=0.001)

# Sculpted brass finger bows (handles) extending toward the rear-right of the cushion
for h_sign in (-1, 1):
    shank_end = sh_pivot - sh_dir * 0.28 + sh_perp * (h_sign * 0.07) + Vector((0, 0, 0.02))
    cyl('Brass shear shank', sh_pivot + Vector((0, 0, 0.015)), shank_end, 0.026, brass)
    bow_center = sh_pivot - sh_dir * 0.48 + sh_perp * (h_sign * 0.16) + Vector((0, 0, 0.03))
    tor('Ornate brass shear handle bow', bow_center, 0.155, 0.030, brass,
        normal=(0.0, 0.0, 1.0), scale=(1.35 if h_sign > 0 else 1.10, 0.82, 1.0))

# Wax-Sealed Ribbon locking the shear blades shut
bind_pos = sh_pivot + sh_dir * 0.34 + Vector((0, 0, 0.012))
for r_wrap in (-0.03, 0.0, 0.03):
    tor('Silk binding ribbon wrap', bind_pos + sh_dir * r_wrap, 0.072, 0.018, wax_seal,
        normal=sh_dir, scale=(0.65, 1.15, 0.85))

# Ribbon tails draping down onto the velvet cushion & embossed red wax seal stamp
seal_pos = bind_pos + sh_perp * (-0.08) + Vector((0, 0, -0.02))
cyl('Ribbon tail A', bind_pos, seal_pos, 0.024, wax_seal)
cyl('Ribbon tail B', bind_pos, seal_pos + Vector((0.12, -0.10, -0.03)), 0.022, wax_seal)
cyl('Red sealing wax disc', seal_pos - Vector((0, 0, 0.02)), seal_pos + Vector((0, 0, 0.025)), 0.125, wax_seal, vertices=48)
tor('Wax seal raised rim', seal_pos + Vector((0, 0, 0.022)), 0.105, 0.022, wax_seal)
sphere('Wax seal gold emblem impression', seal_pos + Vector((0, 0, 0.028)), 0.065, brass, scale=(1, 1, 0.25))


# 5. STUDIO LIGHTING & CAMERA
def add_area_light(name, loc, energy, color, size, target, shape='DISK', size_y=None):
    bpy.ops.object.light_add(type='AREA', location=loc)
    lt = bpy.context.object
    lt.name = name
    lt.data.energy = energy
    lt.data.color = color
    lt.data.shape = shape
    lt.data.size = size
    if size_y:
        lt.data.size_y = size_y
    lt.rotation_euler = (Vector(target) - lt.location).to_track_quat('-Z', 'Y').to_euler()
    return lt


# Warm brass key + cool emerald/teal rim + overhead glass-bell specular strip + warm foreground fill
add_area_light('Warm tungsten key softbox', (-4.6, -5.2, 6.0), 1100, (1.0, 0.83, 0.62), 4.0, (0.0, 0.0, 1.1))
add_area_light('Cool studio rim softbox', (4.4, 4.2, 5.4), 1150, (0.58, 0.86, 0.96), 3.5, (0.0, 0.2, 1.2))
add_area_light('Overhead glass-bell reflection strip', (0.0, -1.0, 6.4), 820, (1.0, 0.95, 0.86), 4.6, (0.0, 0.2, 1.2), shape='RECTANGLE', size_y=1.5)
add_area_light('Foreground tape & shears fill', (2.8, -5.6, 3.0), 460, (1.0, 0.78, 0.58), 3.0, (0.3, -0.8, 0.6))

bpy.ops.object.camera_add(location=(0.08, -7.25, 3.95))
cam = bpy.context.object
cam.name = 'Editorial Studio Camera'
target = Vector((0.02, -0.18, 1.05))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 52
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.0, -0.35, 1.02)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

scene.render.image_settings.file_format = 'PNG'
png_out = Path(os.environ.get('OUTPUT', str(TMP / ('preview.png' if WIDTH < 1600 else 'final.png'))))
png_out.parent.mkdir(parents=True, exist_ok=True)
scene.render.filepath = str(png_out)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get('WEBP', str(ROOT / 'never-splice-mid-sentence.webp' if WIDTH >= 1600 else TMP / 'preview.webp')))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_out).convert('RGB').save(webp_out, 'WEBP', quality=92, method=6)
print(f'FINISHED {webp_out} ({WIDTH}x{HEIGHT}, {SAMPLES} samples)', flush=True)
