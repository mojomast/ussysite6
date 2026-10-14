"""The Critically Damped Umbilical — original Blender 5.2 editorial exaggeration for CoCS-Godot.
Run with the cached bpy 5.2.2 module and Pillow. All geometry and shaders are original/procedural.
"""
import os, math, random
from pathlib import Path
import bpy
from mathutils import Vector, Euler
from math import sin, cos, pi, sqrt
from PIL import Image

random.seed(105)
ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/cocs-godot-blender')
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
bg.inputs[0].default_value = (0.018, 0.032, 0.048, 1.0)
bg.inputs[1].default_value = 0.35


def mat(name, color, metal=0.0, rough=0.3, coat=0.0, grain=0.08, grain_scale=160.0, voronoi=False):
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
    if grain > 0:
        tex = nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = grain_scale
        tex.inputs['Detail'].default_value = 4.0
        tex.inputs['Roughness'].default_value = 0.65
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = grain
        bump.inputs['Distance'].default_value = 0.012
        links.new(tex.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], p.inputs['Normal'])
    if voronoi:
        v = nodes.new('ShaderNodeTexVoronoi')
        v.inputs['Scale'].default_value = 95.0
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (*(c * 0.68 for c in color), 1.0)
        ramp.color_ramp.elements[1].position = 0.65
        ramp.color_ramp.elements[1].color = (*(min(1.0, c * 1.15) for c in color), 1.0)
        links.new(v.outputs['Distance'], ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'], p.inputs['Base Color'])
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


# Studio & apparatus materials
chrome = mat('Polished spring chrome', (0.82, 0.87, 0.90), metal=0.98, rough=0.07, coat=0.2, grain=0.02, grain_scale=260)
steel = mat('Machined stainless steel', (0.58, 0.63, 0.67), metal=0.92, rough=0.18, grain=0.05, grain_scale=210)
brass = mat('Brushed metrological brass', (0.62, 0.41, 0.14), metal=0.88, rough=0.22, coat=0.15, grain=0.08, grain_scale=180)
aged_brass = mat('Patinated fitting brass', (0.44, 0.28, 0.09), metal=0.82, rough=0.31, grain=0.12, grain_scale=120)
copper = mat('Braided copper conductor', (0.68, 0.31, 0.16), metal=0.90, rough=0.24, grain=0.10, grain_scale=220)
anodized = mat('Dark anodized optical breadboard', (0.045, 0.068, 0.085), metal=0.76, rough=0.28, coat=0.25, grain=0.09, grain_scale=200)
cast_iron = mat('Foundry cast iron calibration mass', (0.038, 0.044, 0.050), metal=0.62, rough=0.48, grain=0.28, grain_scale=75, voronoi=True)
cloth_cord = mat('Woven graphite umbilical sheath', (0.032, 0.040, 0.048), metal=0.05, rough=0.68, grain=0.32, grain_scale=320)
enamel_face = mat('Warm ivory dial enamel', (0.91, 0.88, 0.79), metal=0.0, rough=0.18, coat=0.4, grain=0.03)
ink_dark = mat('Engraved dial markings', (0.02, 0.025, 0.03), metal=0.1, rough=0.35, grain=0.02)
ruby_mat = emit_mat('Synthetic ruby indicator tip', (0.85, 0.05, 0.12), (1.0, 0.12, 0.22), strength=1.8, rough=0.06)
studio_floor = mat('Dark mineral laboratory table', (0.022, 0.034, 0.045), metal=0.15, rough=0.62, grain=0.14, grain_scale=65)

# Crystalline cyan glass shield dome material
shield_glass = mat('Cyan interference shield glass', (0.48, 0.92, 0.98), metal=0.0, rough=0.022, coat=0.85, grain=0.004)
p_glass = shield_glass.node_tree.nodes.get('Principled BSDF')
p_glass.inputs['Transmission Weight'].default_value = 0.93
p_glass.inputs['IOR'].default_value = 1.49
p_glass.inputs['Emission Color'].default_value = (0.08, 0.58, 0.78, 1.0)
p_glass.inputs['Emission Strength'].default_value = 0.06

shield_strut_mat = emit_mat('Holographic geodesic strut', (0.28, 0.90, 1.0), (0.14, 0.82, 1.0), strength=3.2, rough=0.12, metal=0.4)
particle_gold = emit_mat('Golden particle sample', (1.0, 0.78, 0.24), (1.0, 0.70, 0.16), strength=5.5, rough=0.08)
particle_cyan = emit_mat('Cyan ion particle sample', (0.25, 0.95, 1.0), (0.15, 0.88, 1.0), strength=6.0, rough=0.08)
particle_ember = emit_mat('Warm plasma particle sample', (1.0, 0.36, 0.12), (1.0, 0.28, 0.08), strength=5.2, rough=0.10)


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


def cyl(name, a, b, r, m, vertices=48, bevel=0.012):
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


def sphere(name, loc, r, m, scale=(1, 1, 1), segments=36, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=r, location=loc)
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, m)


def tube(name, pts, r, m, bevel_res=6, cyclic=False):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 20
    c.bevel_depth = r
    c.bevel_resolution = bevel_res
    s = c.splines.new('BEZIER')
    s.use_cyclic_u = cyclic
    s.bezier_points.add(len(pts) - 1)
    for bp, pt in zip(s.bezier_points, pts):
        bp.co = pt
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return finish(o, name, m)


def poly_tube(name, pts, r, m, bevel_res=5):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.bevel_depth = r
    c.bevel_resolution = bevel_res
    s = c.splines.new('POLY')
    s.points.add(len(pts) - 1)
    for sp, pt in zip(s.points, pts):
        sp.co = (*pt, 1.0)
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return finish(o, name, m)


def text_obj(body, loc, size, m, rot=(pi / 2, 0, 0), extrude=0.008, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = 0.0015
    o.data.align_x = align
    return finish(o, f'Label {body}', m)


# 1. STUDIO FLOOR & MACHINED OPTICAL BREADBOARD
bpy.ops.mesh.primitive_plane_add(size=180, location=(0, 0, 0))
finish(bpy.context.object, 'Infinite studio surface', studio_floor)

# Optical breadboard slab (Z = 0.18 to 0.44)
box('Optical breadboard core', (0.0, 0.0, 0.31), (6.50, 3.70, 0.26), anodized, bevel=0.03)
box('Breadboard upper recessed plate', (0.0, 0.0, 0.445), (6.26, 3.46, 0.025), anodized, bevel=0.008)
# Brass perimeter datum rails
box('Front brass datum rail', (0.0, -1.855, 0.32), (6.52, 0.045, 0.16), brass, bevel=0.01)
box('Rear brass datum rail', (0.0, 1.855, 0.32), (6.52, 0.045, 0.16), brass, bevel=0.01)
box('Left brass datum rail', (-3.255, 0.0, 0.32), (0.045, 3.72, 0.16), brass, bevel=0.01)
box('Right brass datum rail', (3.255, 0.0, 0.32), (0.045, 3.72, 0.16), brass, bevel=0.01)

# Heavy adjustable leveling feet under optical breadboard
for fx in (-2.75, 0.0, 2.75):
    for fy in (-1.45, 1.45):
        cyl('Leveling foot pad', (fx, fy, 0.0), (fx, fy, 0.06), 0.22, steel)
        cyl('Knurled brass isolator collar', (fx, fy, 0.06), (fx, fy, 0.14), 0.18, brass)
        cyl('Threaded leg spindle', (fx, fy, 0.14), (fx, fy, 0.20), 0.11, steel)

# Optical breadboard M6 tapped matrix (countersunk brass bushings & dark bores)
for ix in range(-12, 13):
    for iy in range(-6, 7):
        hx = ix * 0.24
        hy = iy * 0.24
        # Skip right under main footprints to keep geometry clean, or keep visible border holes
        if (-2.6 < hx < -1.1 and -0.8 < hy < 0.6) or (-0.9 < hx < 0.9 and -0.5 < hy < 1.1) or (1.1 < hx < 2.8 and -0.9 < hy < 0.8):
            continue
        cyl('Breadboard tapped hole', (hx, hy, 0.452), (hx, hy, 0.460), 0.026, ink_dark, vertices=20, bevel=0)
        if (ix + iy) % 3 == 0:
            tor('Brass threaded insert', (hx, hy, 0.456), 0.029, 0.005, aged_brass)

# Front breadboard engraved badge
box('Front breadboard badge plate', (-1.55, -1.88, 0.32), (2.25, 0.03, 0.11), aged_brass, bevel=0.006)
text_obj('GL_COMPAT · SPRING / PARTICLE / SHADER LAB', (-1.55, -1.90, 0.295), 0.064, ink_dark, rot=(pi / 2, 0, 0), extrude=0.003)


# 2. LEFT HERO: THE CRITICALLY DAMPED SPRING RIG (ζ = 1.0) + RUBY DIAL INDICATOR
sx, sy = -1.88, -0.08
# Base plinth on breadboard
box('Spring rig baseplate', (sx, sy, 0.50), (1.42, 1.16, 0.09), steel, bevel=0.018)
box('Spring rig brass sub-stage', (sx, sy, 0.575), (1.24, 0.98, 0.06), brass, bevel=0.012)
for cx_off in (-0.60, 0.60):
    for cy_off in (-0.46, 0.46):
        cyl('Hold-down socket cap bolt', (sx + cx_off, sy + cy_off, 0.54), (sx + cx_off, sy + cy_off, 0.60), 0.042, chrome, bevel=0.006)

# Twin vertical brass vernier columns & top bridge
for side in (-1, 1):
    col_x = sx + side * 0.49
    cyl('Vernier frame column', (col_x, sy, 0.60), (col_x, sy, 2.52), 0.065, brass)
    tor('Column base collar', (col_x, sy, 0.63), 0.085, 0.022, aged_brass)
    tor('Column top collar', (col_x, sy, 2.48), 0.085, 0.022, aged_brass)
    # Vernier graduation rings along the right column
    if side == 1:
        for tick in range(14):
            tz = 0.80 + tick * 0.11
            tor('Vernier graduation ring', (col_x, sy, tz), 0.067, 0.004, ink_dark)

# Top micrometer crosshead bridge
box('Spring rig top bridge', (sx, sy, 2.58), (1.22, 0.44, 0.14), brass, bevel=0.02)
cyl('Micrometer preload barrel', (sx, sy, 2.65), (sx, sy, 2.95), 0.13, steel)
cyl('Knurled micrometer thimble', (sx, sy, 2.95), (sx, sy, 3.16), 0.16, brass)
tor('Micrometer locking ring', (sx, sy, 2.72), 0.145, 0.018, aged_brass)

# Central polished steel damper guide rod & lower/upper spring seats
cyl('Central damper guide shaft', (sx, sy, 0.60), (sx, sy, 2.54), 0.095, steel)
cyl('Lower brass spring seat', (sx, sy, 0.62), (sx, sy, 0.74), 0.36, aged_brass)
cyl('Upper movable spring carriage', (sx, sy, 1.98), (sx, sy, 2.12), 0.38, brass)
box('Vernier sliding index arm', (sx + 0.30, sy, 2.05), (0.48, 0.26, 0.08), steel, bevel=0.01)

# Heavy-gauge polished chrome helical recoil spring (true high-res 3D helix)
coil_pts = []
turns = 7.5
z_start, z_end = 0.74, 1.98
r_helix = 0.285
steps = 260
for i in range(steps + 1):
    t = i / steps
    ang = t * turns * 2.0 * pi
    # Smoothly flatten end turns against the seats
    z_t = t + 0.018 * sin(2 * pi * t)
    z = z_start + (z_end - z_start) * z_t
    coil_pts.append((sx + r_helix * cos(ang), sy + r_helix * sin(ang), z))
poly_tube('Critically damped chrome recoil spring', coil_pts, 0.056, chrome, bevel_res=8)

# Precision Dial Indicator Gauge with Ruby Tip measuring exact zero overshoot
gx, gy, gz = sx - 0.56, sy - 0.28, 2.32
# Articulated brass clamp arm holding the dial gauge
cyl('Gauge mounting post', (sx - 0.49, sy, 2.18), (gx, gy, gz), 0.038, steel)
sphere('Gauge ball joint knuckle', (sx - 0.49, sy, 2.18), 0.065, brass)
# Dial housing
cyl('Dial gauge brass bezel', (gx, gy + 0.06, gz), (gx, gy - 0.08, gz), 0.34, brass, vertices=64)
cyl('Dial gauge ivory face', (gx, gy - 0.05, gz), (gx, gy - 0.082, gz), 0.30, enamel_face, vertices=64, bevel=0.002)
tor('Dial bezel knurled rim', (gx, gy - 0.075, gz), 0.33, 0.022, aged_brass, normal=(0, 1, 0))
# Dial graduation ticks around perimeter
for k in range(36):
    a = k * 2.0 * pi / 36.0
    r_in = 0.22 if k % 3 == 0 else 0.245
    r_out = 0.28
    cyl('Dial tick mark',
        (gx + r_in * cos(a), gy - 0.086, gz + r_in * sin(a)),
        (gx + r_out * cos(a), gy - 0.086, gz + r_out * sin(a)),
        0.006 if k % 3 == 0 else 0.0035, ink_dark, vertices=12, bevel=0)
# Dial pointer needle pointing straight up to 0.00 (critical damping = zero overshoot)
cyl('Dial zero needle', (gx, gy - 0.092, gz - 0.05), (gx, gy - 0.092, gz + 0.23), 0.011, ruby_mat, vertices=16, bevel=0.002)
sphere('Dial center cap', (gx, gy - 0.095, gz), 0.035, brass)
# Dial plunger stem & glowing synthetic ruby contact tip touching the spring carriage flange
cyl('Gauge plunger sleeve', (gx + 0.22, gy, gz - 0.14), (sx - 0.26, sy, 2.05), 0.024, chrome)
sphere('Ruby contact indicator tip', (sx - 0.25, sy, 2.05), 0.042, ruby_mat)

# Brass plaque on the spring rig base
box('Spring plaque', (sx, sy - 0.52, 0.56), (0.98, 0.14, 0.05), aged_brass, bevel=0.006, rot=(0.45, 0, 0))
text_obj('ZETA = 1.00', (sx, sy - 0.555, 0.545), 0.092, enamel_face, rot=(1.12, 0, 0), extrude=0.004)


# 3. CENTER HERO: THE PARTICLE & SHADER BELL JAR (Geodesic Shield Dome + Frozen Particle Vortex)
bx, by = 0.05, 0.22
# Stepped brass & gunmetal turret pedestal
cyl('Bell jar base flange', (bx, by, 0.45), (bx, by, 0.56), 1.16, steel, vertices=64)
cyl('Bell jar brass collector ring', (bx, by, 0.56), (bx, by, 0.68), 1.06, brass, vertices=64)
cyl('Bell jar dark optical stage', (bx, by, 0.68), (bx, by, 0.76), 0.96, anodized, vertices=64)
tor('Glowing cyan shield emitter ring', (bx, by, 0.765), 0.95, 0.024, shield_strut_mat)

# 8 circumferential brass clamp dogs around the bell jar flange
for k in range(8):
    ang = k * pi / 4.0 + 0.2
    cx, cy = bx + 1.08 * cos(ang), by + 1.08 * sin(ang)
    box('Dome perimeter clamp dog', (cx, cy, 0.62), (0.14, 0.09, 0.14), aged_brass, bevel=0.01, rot=(0, 0, ang))
    cyl('Clamp bolt', (cx, cy, 0.69), (cx, cy, 0.74), 0.025, chrome)

# Interior optical prism & chrome calibration sphere inside the dome
sphere('Interior shader reference sphere', (bx - 0.24, by - 0.16, 1.02), 0.24, chrome)
tor('Reference sphere brass seat', (bx - 0.24, by - 0.16, 0.79), 0.16, 0.025, brass)

# Crystalline Geodesic Dome (faceted glass shell + glowing cyan wireframe lattice)
dome_z = 0.76
dome_r = 0.94
dome_h = 1.48
# Smooth inner glass bell jar with solidify
lathe_prof = []
for i in range(28):
    t = i / 27.0
    if t < 0.42:
        # Cylindrical lower wall
        r = dome_r
        z = dome_z + (t / 0.42) * 0.62
    else:
        # Hemispherical upper vault
        u = (t - 0.42) / 0.58
        ang = u * (pi / 2.0)
        r = dome_r * cos(ang)
        z = dome_z + 0.62 + (dome_h - 0.62) * sin(ang)
    lathe_prof.append((r, z))

seg = 64
d_verts = [(bx + r * cos(j * 2 * pi / seg), by + r * sin(j * 2 * pi / seg), z) for r, z in lathe_prof for j in range(seg)]
d_faces = [(i * seg + j, i * seg + (j + 1) % seg, (i + 1) * seg + (j + 1) % seg, (i + 1) * seg + j)
           for i in range(len(lathe_prof) - 1) for j in range(seg)]
d_mesh = bpy.data.meshes.new('ShieldBellJar')
d_mesh.from_pydata(d_verts, [], d_faces)
d_mesh.update()
d_obj = bpy.data.objects.new('Cyan glass shield bell jar', d_mesh)
bpy.context.collection.objects.link(d_obj)
finish(d_obj, 'Cyan glass shield bell jar', shield_glass)
sol = d_obj.modifiers.new('GlassWall', 'SOLIDIFY')
sol.thickness = 0.022

# Outer geodesic energy-shield facet cage (glowing cyan struts + brass vertex nodes)
rings_z = [
    (dome_z + 0.04, dome_r + 0.02, 12, 0.0),
    (dome_z + 0.52, dome_r + 0.02, 12, pi / 12.0),
    (dome_z + 0.98, dome_r * 0.84, 12, 0.0),
    (dome_z + 1.32, dome_r * 0.48, 12, pi / 12.0),
]
ring_pts = []
for rz, rr, n_seg, phase in rings_z:
    pts = []
    for k in range(n_seg):
        a = k * 2.0 * pi / n_seg + phase
        p = (bx + rr * cos(a), by + rr * sin(a), rz)
        pts.append(p)
        sphere('Geodesic node', p, 0.024, brass, segments=16, rings=10)
    ring_pts.append(pts)
    # Horizontal polygon ring
    for k in range(n_seg):
        cyl('Shield geodesic ring strut', pts[k], pts[(k + 1) % n_seg], 0.010, shield_strut_mat, vertices=12, bevel=0)

# Diagonal triangulated geodesic struts between rings
for r_idx in range(len(ring_pts) - 1):
    cur_r = ring_pts[r_idx]
    nxt_r = ring_pts[r_idx + 1]
    n_seg = len(cur_r)
    for k in range(n_seg):
        cyl('Shield diagonal strut A', cur_r[k], nxt_r[k], 0.009, shield_strut_mat, vertices=12, bevel=0)
        neighbor = (k - 1) % n_seg if r_idx % 2 == 1 else (k + 1) % n_seg
        cyl('Shield diagonal strut B', cur_r[k], nxt_r[neighbor], 0.009, shield_strut_mat, vertices=12, bevel=0)

# Apex crown finial on the bell jar
apex = (bx, by, dome_z + dome_h + 0.03)
for p in ring_pts[-1]:
    cyl('Shield apex strut', p, apex, 0.009, shield_strut_mat, vertices=12, bevel=0)
cyl('Bell jar brass crown cap', (bx, by, dome_z + dome_h - 0.02), (bx, by, dome_z + dome_h + 0.08), 0.14, brass)
tor('Bell jar crown finial ring', (bx, by, dome_z + dome_h + 0.14), 0.075, 0.020, brass, normal=(0, 1, 0))

# Frozen swirl of 72 glowing particle spheres inside the bell jar
for i in range(72):
    t = i / 71.0
    ang = t * 4.4 * pi + random.uniform(-0.18, 0.18)
    rad = (0.14 + 0.62 * sin(t * pi * 0.85)) * random.uniform(0.78, 1.04)
    rad = min(rad, 0.78)
    pz = dome_z + 0.18 + t * 1.18 + random.uniform(-0.04, 0.04)
    px = bx + rad * cos(ang)
    py = by + rad * sin(ang)
    pr = random.uniform(0.018, 0.048) * (1.15 - 0.4 * t)
    pmat = particle_gold if i % 3 == 0 else (particle_cyan if i % 3 == 1 else particle_ember)
    sphere(f'Suspended particle {i}', (px, py, pz), pr, pmat, segments=20, rings=12)

# Rigid brass linkage bridge connecting the Spring Rig to the Bell Jar base
cyl('Spring-to-shader coupling conduit', (sx + 0.52, sy + 0.12, 0.82), (bx - 0.92, by - 0.10, 0.64), 0.048, brass)
tor('Coupling union nut A', (sx + 0.62, sy + 0.14, 0.80), 0.068, 0.018, aged_brass, normal=(1, 0.2, 0))
tor('Coupling union nut B', (bx - 0.82, by - 0.08, 0.66), 0.068, 0.018, aged_brass, normal=(1, 0.2, 0))


# 4. RIGHT HERO: THE AUTHORITATIVE CAST-IRON CALIBRATION WEIGHT + BRAIDED UMBILICAL
wx, wy = 1.98, -0.18
# Heavy rubber/brass metrological pad under the weight
box('Cast iron landing pad', (wx, wy, 0.48), (1.68, 1.48, 0.05), aged_brass, bevel=0.01)

# Stepped trapezoidal cast-iron authority block (massive, squat, unyielding)
box('Cast iron lower plinth', (wx, wy, 0.78), (1.56, 1.36, 0.56), cast_iron, bevel=0.055)
box('Cast iron upper body', (wx, wy, 1.38), (1.36, 1.18, 0.74), cast_iron, bevel=0.055)
box('Cast iron crown shoulder', (wx, wy, 1.84), (1.06, 0.92, 0.24), cast_iron, bevel=0.04)

# Heavy forged brass lifting eye & thick calibration ring on top
cyl('Lifting lug boss', (wx, wy, 1.94), (wx, wy, 2.12), 0.26, cast_iron, bevel=0.025)
tor('Forged eye staple', (wx, wy, 2.20), 0.14, 0.048, aged_brass, normal=(0, 1, 0))
tor('Massive brass calibration lifting ring', (wx, wy - 0.06, 2.38), 0.34, 0.072, brass, normal=(0, 0.92, 0.38))

# Riveted brushed-brass nameplate on the front face of the cast-iron weight
plate_y = wy - 0.605
box('Authoritative brass nameplate', (wx, plate_y, 1.38), (1.16, 0.045, 0.46), brass, bevel=0.012)
box('Nameplate dark inset border', (wx, plate_y - 0.016, 1.38), (1.06, 0.02, 0.36), ink_dark, bevel=0.005)
box('Nameplate inner brass face', (wx, plate_y - 0.022, 1.38), (1.00, 0.02, 0.31), brass, bevel=0.004)
for rx in (-0.51, 0.51):
    for rz in (1.20, 1.56):
        sphere('Nameplate corner rivet', (wx + rx, plate_y - 0.024, rz), 0.026, aged_brass)

text_obj('AUTHORITATIVE', (wx, plate_y - 0.036, 1.42), 0.105, ink_dark, rot=(pi / 2, 0, 0), extrude=0.006)
text_obj('60 HZ NODE · WS JSON', (wx, plate_y - 0.036, 1.27), 0.070, ink_dark, rot=(pi / 2, 0, 0), extrude=0.005)

# Secondary stamped foundry tonnage badge on lower plinth
box('Lower foundry stamp plate', (wx, wy - 0.69, 0.78), (0.86, 0.035, 0.22), aged_brass, bevel=0.008)
text_obj('SERVER TRUTH', (wx, wy - 0.712, 0.75), 0.078, ink_dark, rot=(pi / 2, 0, 0), extrude=0.004)


# 5. THE COMICALLY HEAVY BRAIDED WEBSOCKET UMBILICAL CABLE
# Origin gland at the front-right of the flashy presentation rig, snaking across the foreground into the cast-iron weight
gland_a = (-0.58, -0.58, 0.62)
gland_b = (wx - 0.78, wy - 0.22, 0.86)

# Brass strain-relief glands at both ends
cyl('Presentation rig umbilical gland', (-0.72, -0.42, 0.62), gland_a, 0.11, brass)
tor('Gland hex collar A', gland_a, 0.125, 0.028, aged_brass, normal=(0.6, -0.8, 0))
cyl('Authority weight umbilical socket', (wx - 0.62, wy - 0.22, 0.86), gland_b, 0.14, brass)
tor('Gland flange collar B', gland_b, 0.16, 0.032, aged_brass, normal=(-1, 0, 0))

umbilical_ctrl = [
    (-0.62, -0.50, 0.62),
    (-0.42, -0.95, 0.55),
    (0.05, -1.28, 0.54),
    (0.62, -1.10, 0.55),
    (1.02, -0.68, 0.62),
    (1.26, -0.40, 0.86),
]

# Smooth Catmull-Rom interpolation for main umbilical & helical armor wrap
def eval_catmull(pts, n_samples=180):
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


umb_path = eval_catmull(umbilical_ctrl, 180)
poly_tube('Heavy woven umbilical core', [tuple(p) for p in umb_path], 0.078, cloth_cord, bevel_res=8)

# Helical braided copper/brass armor coils wrapping around the umbilical core
armor_pts_a = []
armor_pts_b = []
for idx, pos in enumerate(umb_path):
    t = idx / (len(umb_path) - 1)
    tang = (umb_path[min(len(umb_path) - 1, idx + 1)] - umb_path[max(0, idx - 1)]).normalized()
    up = Vector((0, 0, 1))
    side = tang.cross(up).normalized()
    bnorm = side.cross(tang).normalized()
    ang = t * 22.0 * 2.0 * pi
    r_wrap = 0.086
    offset_a = side * cos(ang) * r_wrap + bnorm * sin(ang) * r_wrap
    offset_b = side * cos(ang + pi) * r_wrap + bnorm * sin(ang + pi) * r_wrap
    armor_pts_a.append(tuple(pos + offset_a))
    armor_pts_b.append(tuple(pos + offset_b))

poly_tube('Helical brass umbilical armor A', armor_pts_a, 0.015, brass, bevel_res=4)
poly_tube('Helical copper umbilical armor B', armor_pts_b, 0.013, copper, bevel_res=4)

# Heavy brass tie-down saddle clamp bolting the umbilical to the optical breadboard mid-span
clamp_pos = umb_path[len(umb_path) // 2]
tor('Umbilical tie-down saddle', (clamp_pos.x, clamp_pos.y, clamp_pos.z + 0.01), 0.105, 0.024, brass, normal=umb_path[len(umb_path) // 2 + 1] - umb_path[len(umb_path) // 2 - 1])
box('Saddle clamp foot A', (clamp_pos.x - 0.11, clamp_pos.y - 0.08, 0.49), (0.09, 0.09, 0.06), brass, bevel=0.008)
box('Saddle clamp foot B', (clamp_pos.x + 0.11, clamp_pos.y + 0.08, 0.49), (0.09, 0.09, 0.06), brass, bevel=0.008)


# 6. STUDIO LIGHTING & CAMERA
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


# Rich warm tungsten key + crisp cyan rim + overhead specular strip + front fill
add_area_light('Warm tungsten key softbox', (-4.8, -5.4, 6.2), 1150, (1.0, 0.82, 0.62), 4.2, (-0.3, 0.0, 1.4))
add_area_light('Cyan laboratory rim light', (4.2, 4.5, 5.4), 1350, (0.42, 0.86, 1.0), 3.6, (0.2, 0.0, 1.5))
add_area_light('Overhead specular strip', (0.0, -1.2, 6.8), 780, (1.0, 0.95, 0.88), 4.8, (0.0, 0.0, 1.3), shape='RECTANGLE', size_y=1.6)
add_area_light('Warm brass frontal fill', (3.6, -5.8, 3.2), 480, (1.0, 0.76, 0.54), 3.2, (0.8, -0.3, 1.2))
add_area_light('Cyan dome internal booster', (bx, by, 1.55), 35, (0.25, 0.90, 1.0), 0.85, (bx, by, 0.75))

bpy.ops.object.camera_add(location=(0.12, -7.85, 3.85))
cam = bpy.context.object
cam.name = 'Editorial Studio Camera'
target = Vector((0.06, -0.05, 1.42))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 52
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.0, -0.35, 1.38)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

scene.render.image_settings.file_format = 'PNG'
png_out = Path(os.environ.get('OUTPUT', str(TMP / ('preview.png' if WIDTH < 1600 else 'final.png'))))
png_out.parent.mkdir(parents=True, exist_ok=True)
scene.render.filepath = str(png_out)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get('WEBP', str(ROOT / 'critically-damped-umbilical.webp' if WIDTH >= 1600 else TMP / 'preview.webp')))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_out).convert('RGB').save(webp_out, 'WEBP', quality=92, method=6)
print(f'FINISHED {webp_out} ({WIDTH}x{HEIGHT}, {SAMPLES} samples)', flush=True)
