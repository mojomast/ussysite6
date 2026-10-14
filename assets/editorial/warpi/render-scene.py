"""The Unlicensed Sidecar — original Blender 5.2 Cycles editorial exaggeration for Warpi.
All geometry and shaders are original and procedural.
"""
import os
import math
import random
from pathlib import Path
from math import sin, cos, pi
import bpy
from mathutils import Vector, Euler
from PIL import Image

random.seed(109)

ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/warpi-blender')
TMP.mkdir(parents=True, exist_ok=True)

SAMPLES = int(os.environ.get("SAMPLES", "64"))
WIDTH = int(os.environ.get("WIDTH", "1600"))
HEIGHT = int(round(WIDTH * 0.75))

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 2
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x = WIDTH
scene.render.resolution_y = HEIGHT
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'

scene.world.use_nodes = True
bg = scene.world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.022, 0.034, 0.048, 1.0)
bg.inputs[1].default_value = 0.35


def make_mat(name, color, metal=0.0, rough=0.3, bump_strength=0.12, bump_scale=160.0,
             coat=0.0, emission=None, emission_strength=0.0, transmission=0.0, ior=1.48,
             sheen=0.0, voronoi=False):
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
    if transmission > 0:
        p.inputs['Transmission Weight'].default_value = transmission
        p.inputs['IOR'].default_value = ior
    if emission is not None and emission_strength > 0:
        p.inputs['Emission Color'].default_value = (*emission, 1.0)
        p.inputs['Emission Strength'].default_value = emission_strength

    if bump_strength > 0:
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = bump_scale
        noise.inputs['Detail'].default_value = 4.0
        noise.inputs['Roughness'].default_value = 0.65
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = bump_strength
        bump.inputs['Distance'].default_value = 0.012
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], p.inputs['Normal'])

    if voronoi:
        vor = nodes.new('ShaderNodeTexVoronoi')
        vor. inputs['Scale'].default_value = 42.0
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (*(c * 0.78 for c in color), 1.0)
        ramp.color_ramp.elements[1].position = 0.85
        ramp.color_ramp.elements[1].color = (*(min(1.0, c * 1.08) for c in color), 1.0)
        links.new(vor.outputs['Distance'], ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'], p.inputs['Base Color'])

    return m


# Materials
mat_aluminum = make_mat('Anodized Silver Aluminum', (0.74, 0.79, 0.84), metal=0.92, rough=0.22, bump_strength=0.07, bump_scale=240.0, coat=0.15)
mat_alu_dark = make_mat('Dark Slate Aluminum Trim', (0.11, 0.15, 0.19), metal=0.82, rough=0.28, bump_strength=0.10, bump_scale=190.0)
mat_screen_cavity = make_mat('Obsidian Terminal Cavity', (0.018, 0.028, 0.038), metal=0.25, rough=0.16, bump_strength=0.03, coat=0.6)
mat_louver_slate = make_mat('Slate Command Louver', (0.065, 0.105, 0.135), metal=0.45, rough=0.20, bump_strength=0.05, coat=0.45)
mat_cyan_glow = make_mat('Luminous Cyan Block Accent', (0.28, 0.88, 0.98), metal=0.0, rough=0.15, bump_strength=0.0, emission=(0.22, 0.84, 1.0), emission_strength=3.6)
mat_ice_glow = make_mat('Soft Ice Command Line', (0.62, 0.88, 0.95), metal=0.0, rough=0.2, bump_strength=0.0, emission=(0.55, 0.84, 0.96), emission_strength=1.9)

mat_brass = make_mat('Hand-Machined Solid Brass', (0.68, 0.46, 0.16), metal=0.91, rough=0.22, bump_strength=0.09, bump_scale=150.0, voronoi=True)
mat_brass_aged = make_mat('Patinated Cast Brass', (0.46, 0.29, 0.10), metal=0.85, rough=0.33, bump_strength=0.16, bump_scale=110.0, voronoi=True)
mat_copper = make_mat('Gleaming Stdio Copper Pipe', (0.85, 0.39, 0.20), metal=0.95, rough=0.17, bump_strength=0.07, bump_scale=180.0, coat=0.1)
mat_steel_vault = make_mat('Heavy Forged Vault Steel', (0.045, 0.052, 0.062), metal=0.86, rough=0.32, bump_strength=0.22, bump_scale=130.0, voronoi=True)
mat_chrome = make_mat('Polished Chrome Fitting', (0.82, 0.85, 0.88), metal=0.97, rough=0.12, bump_strength=0.03)
mat_velvet = make_mat('Crimson Stanchion Velvet', (0.34, 0.018, 0.028), metal=0.0, rough=0.88, bump_strength=0.28, bump_scale=220.0, sheen=0.45)
mat_ivory = make_mat('Warm Instrument Ivory', (0.88, 0.82, 0.68), metal=0.0, rough=0.26, bump_strength=0.08, coat=0.2)
mat_enamel_dark = make_mat('Deep Gloss Enamel Dial', (0.02, 0.025, 0.03), metal=0.1, rough=0.12, bump_strength=0.03, coat=0.8)
mat_quartz = make_mat('Clear Quartz Cylinder', (0.92, 0.96, 0.98), metal=0.0, rough=0.05, bump_strength=0.0, transmission=0.92, ior=1.46, coat=0.4)
mat_amber_filament = make_mat('Glowing Vacuum Filament', (1.0, 0.55, 0.12), metal=0.0, rough=0.1, bump_strength=0.0, emission=(1.0, 0.46, 0.08), emission_strength=11.0)
mat_plinth = make_mat('Studio Architectural Slate Plinth', (0.038, 0.050, 0.065), metal=0.18, rough=0.48, bump_strength=0.18, bump_scale=95.0)
mat_floor = make_mat('Seamless Studio Cyclorama', (0.015, 0.022, 0.030), metal=0.0, rough=0.72, bump_strength=0.12, bump_scale=60.0)


def finish(obj, name, mat):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj


def box(name, loc, dim, mat, bevel=0.04, segments=4, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = segments
        o.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL')
    return finish(o, name, mat)


def cyl_between(name, p1, p2, r, mat, vertices=48, bevel=0.012):
    a, b = Vector(p1), Vector(p2)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=r, depth=d.length, location=(a + b) / 2.0)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        o.modifiers.new('WeightedNormal', 'WEIGHTED_NORMAL')
    return finish(o, name, mat)


def sphere(name, loc, scale, mat, segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, mat)


def torus(name, loc, major_r, minor_r, mat, normal=(0, 0, 1), scale=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=16, major_radius=major_r, minor_radius=minor_r, location=loc)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector(normal).normalized())
    if scale:
        o.scale = scale
    return finish(o, name, mat)


def tube(name, pts, r, mat, resolution=16):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = resolution
    curve.bevel_depth = r
    curve.bevel_resolution = 5
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(pts) - 1)
    for bp, co in zip(spline.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(o)
    return finish(o, name, mat)


def text_3d(name, body, loc, size, mat, rot=(pi / 2, 0, 0), extrude=0.012, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = 0.002
    o.data.align_x = align
    o.data.align_y = 'CENTER'
    return finish(o, name, mat)


# ==============================================================================
# 1. STUDIO FLOOR & ARCHITECTURAL PLINTH
# ==============================================================================
bpy.ops.mesh.primitive_plane_add(size=200.0, location=(0, 0, 0))
finish(bpy.context.object, 'Infinite Studio Floor', mat_floor)

box('Main Studio Plinth', (0.15, -0.20, 0.18), (7.6, 4.8, 0.36), mat_plinth, bevel=0.05)
box('Plinth Brass Trim', (0.15, -0.20, 0.04), (7.68, 4.88, 0.04), mat_brass_aged, bevel=0.01)

# ==============================================================================
# 2. LEFT HERO: THE SLEEK UPSTREAM MONOLITH (WARP TERMINAL CHASSIS)
# ==============================================================================
MX, MY = -1.65, 0.15

# Brushed aluminum ski legs under the monolith
for sx in (-0.95, 0.95):
    box(f'Monolith Ski Foot {sx}', (MX + sx, MY, 0.46), (0.22, 1.65, 0.20), mat_alu_dark, bevel=0.04)
    cyl_between(f'Monolith Riser {sx}', (MX + sx, MY - 0.45, 0.55), (MX + sx, MY - 0.45, 0.78), 0.09, mat_chrome)
    cyl_between(f'Monolith Rear Riser {sx}', (MX + sx, MY + 0.45, 0.55), (MX + sx, MY + 0.45, 0.78), 0.09, mat_chrome)

# Sleek rounded mid-century anodized-aluminum outer monolith
box('Upstream Anodized Monolith', (MX, MY, 2.68), (2.78, 1.75, 3.85), mat_aluminum, bevel=0.24, segments=6)
# Subtle brushed side accent panel on left flank
box('Monolith Left Flank Seam', (MX - 1.38, MY, 2.75), (0.06, 1.15, 2.95), mat_alu_dark, bevel=0.02)
# Top precision handle/recess
box('Monolith Top Bezel', (MX, MY, 4.62), (1.85, 0.95, 0.08), mat_alu_dark, bevel=0.03)

# Recessed dark front screen cavity
box('Monolith Front Bezel Frame', (MX, MY - 0.84, 2.76), (2.38, 0.14, 3.38), mat_alu_dark, bevel=0.10)
box('Monolith Recessed Glass Cavity', (MX, MY - 0.88, 2.76), (2.20, 0.08, 3.20), mat_screen_cavity, bevel=0.06)

# Header bar inside monolith screen
box('Monolith Top Header Strip', (MX, MY - 0.92, 4.10), (2.02, 0.05, 0.26), mat_louver_slate, bevel=0.02)
text_3d('Monolith Header Label', 'WARP UI', (MX - 0.42, MY - 0.955, 4.10), 0.14, mat_aluminum, extrude=0.008)
for dot_i, dot_c in enumerate([mat_cyan_glow, mat_ice_glow, mat_alu_dark]):
    sphere(f'Header Status Dot {dot_i}', (MX + 0.62 + dot_i * 0.13, MY - 0.95, 4.10), (0.035, 0.02, 0.035), dot_c)

# Stacked luminous slate/cyan horizontal command-block louvers
louver_zs = [3.58, 3.04, 2.50, 1.96]
louver_widths = [(1.15, 0.75), (1.35, 0.55), (0.95, 1.18), (1.42, 0.82)]
for idx, (lz, (w1, w2)) in enumerate(zip(louver_zs, louver_widths)):
    # Louver slate body tilted slightly like a sleek architectural louver
    box(f'Command Block Louver {idx}', (MX, MY - 0.93, lz), (2.02, 0.14, 0.40), mat_louver_slate, bevel=0.03, rot=(0.10, 0, 0))
    # Glowing cyan left block indicator bar
    box(f'Louver Cyan Gutter {idx}', (MX - 0.91, MY - 1.00, lz), (0.055, 0.04, 0.30), mat_cyan_glow, bevel=0.01, rot=(0.10, 0, 0))
    # Prompt chevron / glowing command lines on the louver
    box(f'Louver Primary Line {idx}', (MX - 0.78 + w1 / 2, MY - 1.005, lz + 0.065), (w1, 0.03, 0.048), mat_cyan_glow if idx % 2 == 0 else mat_ice_glow, bevel=0.008, rot=(0.10, 0, 0))
    box(f'Louver Secondary Line {idx}', (MX - 0.78 + w2 / 2, MY - 0.995, lz - 0.065), (w2, 0.03, 0.038), mat_ice_glow, bevel=0.006, rot=(0.10, 0, 0))
    # Tiny approval / block badge on right of louver
    box(f'Louver Right Pill {idx}', (MX + 0.76, MY - 1.00, lz + 0.05), (0.22, 0.035, 0.07), mat_alu_dark, bevel=0.015, rot=(0.10, 0, 0))

# Lower entrance portal at bottom of monolith (behind the bypassed turnstile)
box('Monolith Entrance Portal Frame', (MX, MY - 0.91, 1.32), (1.15, 0.12, 0.62), mat_alu_dark, bevel=0.04)
box('Monolith Entrance Recessed Threshold', (MX, MY - 0.94, 1.30), (0.96, 0.08, 0.50), mat_enamel_dark, bevel=0.02)

# ==============================================================================
# 3. FOREGROUND LEFT: BYPASSED VELVET-ROPED BRASS TURNSTILE ("CLOUD LOGIN")
# ==============================================================================
TX, TY, TZ = -1.65, -1.52, 0.36

# Four brass velvet-rope stanchions forming a tiny VIP queue that is completely empty & roped shut
stanchion_coords = [
    (TX - 0.88, TY + 0.25),
    (TX + 0.88, TY + 0.25),
    (TX - 0.88, TY - 0.38),
    (TX + 0.88, TY - 0.38),
]
for idx, (sx, sy) in enumerate(stanchion_coords):
    cyl_between(f'Stanchion Base {idx}', (sx, sy, TZ), (sx, sy, TZ + 0.06), 0.15, mat_brass)
    torus(f'Stanchion Base Molding {idx}', (sx, sy, TZ + 0.06), 0.12, 0.022, mat_brass)
    cyl_between(f'Stanchion Post {idx}', (sx, sy, TZ + 0.06), (sx, sy, TZ + 0.88), 0.032, mat_brass)
    sphere(f'Stanchion Crown Ball {idx}', (sx, sy, TZ + 0.92), (0.065, 0.065, 0.065), mat_brass)
    torus(f'Stanchion Rope Ring {idx}', (sx, sy, TZ + 0.78), 0.052, 0.010, mat_brass)

# Velvet ropes: side ropes + front barrier rope closing off the entrance
tube('Velvet Rope Left Side', [
    (TX - 0.88, TY + 0.25, TZ + 0.77),
    (TX - 0.88, TY - 0.06, TZ + 0.56),
    (TX - 0.88, TY - 0.38, TZ + 0.77),
], 0.036, mat_velvet)
tube('Velvet Rope Right Side', [
    (TX + 0.88, TY + 0.25, TZ + 0.77),
    (TX + 0.88, TY - 0.06, TZ + 0.56),
    (TX + 0.88, TY - 0.38, TZ + 0.77),
], 0.036, mat_velvet)
# Front velvet rope hooked right across the front stanchions — nobody goes through!
tube('Velvet Rope Front Gate Closed', [
    (TX - 0.88, TY - 0.38, TZ + 0.77),
    (TX - 0.42, TY - 0.42, TZ + 0.58),
    (TX + 0.42, TY - 0.42, TZ + 0.58),
    (TX + 0.88, TY - 0.38, TZ + 0.77),
], 0.038, mat_velvet)
for rx in (-0.84, 0.84):
    cyl_between(f'Rope Brass Clasp {rx}', (TX + rx, TY - 0.38, TZ + 0.77), (TX + rx * 0.92, TY - 0.39, TZ + 0.72), 0.044, mat_brass)

# Central brass mechanical turnstile stand + 3-arm tripod rotor
cyl_between('Turnstile Pedestal Base', (TX, TY + 0.05, TZ), (TX, TY + 0.05, TZ + 0.08), 0.22, mat_brass_aged)
box('Turnstile Central Column', (TX, TY + 0.05, TZ + 0.52), (0.22, 0.26, 0.86), mat_brass, bevel=0.05)
box('Turnstile Top Cap', (TX, TY + 0.05, TZ + 0.96), (0.26, 0.32, 0.08), mat_brass, bevel=0.025)
sphere('Turnstile Rotor Hub', (TX, TY - 0.12, TZ + 0.78), (0.09, 0.09, 0.09), mat_chrome)
# Three tripod turnstile arms
for arm_a in (0.0, 2.1, -2.1):
    dx = 0.44 * sin(arm_a)
    dy = -0.34 * cos(arm_a)
    dz = -0.18 * (1.0 - cos(arm_a))
    cyl_between(f'Turnstile Arm {arm_a:.1f}', (TX, TY - 0.12, TZ + 0.78), (TX + dx, TY - 0.12 + dy, TZ + 0.78 + dz), 0.024, mat_chrome)
    sphere(f'Turnstile Arm Tip {arm_a:.1f}', (TX + dx, TY - 0.12 + dy, TZ + 0.78 + dz), (0.03, 0.03, 0.03), mat_brass)

# Signplate above turnstile: "CLOUD LOGIN"
cyl_between('Turnstile Sign Post', (TX, TY + 0.08, TZ + 0.98), (TX, TY + 0.08, TZ + 1.24), 0.024, mat_brass)
box('Cloud Login Brass Sign Frame', (TX, TY + 0.06, TZ + 1.34), (1.28, 0.08, 0.30), mat_brass, bevel=0.025)
box('Cloud Login Enamel Face', (TX, TY + 0.02, TZ + 1.34), (1.18, 0.03, 0.22), mat_enamel_dark, bevel=0.01)
text_3d('Cloud Login Text', 'CLOUD LOGIN', (TX, TY - 0.005, TZ + 1.34), 0.115, mat_ivory, extrude=0.008)

# ==============================================================================
# 4. RIGHT HERO: THE LOCAL PI SIDECAR & COPPER STDIO PIPES
# ==============================================================================
SX, SY = 1.85, 0.10

# Heavy structural mounting struts bolting the sidecar to the monolith
for sz in (0.85, 1.45):
    cyl_between(f'Sidecar Chassis Strut {sz}', (MX + 1.35, MY, sz), (SX - 1.05, SY, sz), 0.075, mat_alu_dark)
    torus(f'Strut Collar Left {sz}', (MX + 1.38, MY, sz), 0.10, 0.025, mat_brass, normal=(1, 0, 0))
    torus(f'Strut Collar Right {sz}', (SX - 1.05, SY, sz), 0.10, 0.025, mat_brass, normal=(1, 0, 0))

# Twin gleaming curved copper stdio pneumatic pipes (STDIN / STDOUT)
pipe_configs = [
    ('STDIN', 3.02, 2.74, -0.35),
    ('STDOUT', 2.22, 1.96, -0.42),
]
for label_txt, z_left, z_right, y_bulge in pipe_configs:
    # Left heavy brass flange bolted to the aluminum monolith flank
    cyl_between(f'{label_txt} Monolith Flange', (MX + 1.36, MY - 0.12, z_left), (MX + 1.50, MY - 0.12, z_left), 0.28, mat_brass)
    torus(f'{label_txt} Left Gasket', (MX + 1.50, MY - 0.12, z_left), 0.20, 0.035, mat_brass_aged, normal=(1, 0, 0))
    for b_i in range(8):
        ba = b_i * 2 * pi / 8
        sphere(f'{label_txt} Flange Bolt L {b_i}', (MX + 1.51, MY - 0.12 + 0.22 * cos(ba), z_left + 0.22 * sin(ba)), (0.024, 0.024, 0.024), mat_chrome)

    # Right heavy brass flange bolted into the Pi sidecar flank
    cyl_between(f'{label_txt} Sidecar Flange', (SX - 1.24, SY - 0.12, z_right), (SX - 1.08, SY - 0.12, z_right), 0.26, mat_brass)
    for b_i in range(8):
        ba = b_i * 2 * pi / 8
        sphere(f'{label_txt} Flange Bolt R {b_i}', (SX - 1.25, SY - 0.12 + 0.20 * cos(ba), z_right + 0.20 * sin(ba)), (0.022, 0.022, 0.022), mat_chrome)

    # Gleaming curved copper stdio pipe
    p_pts = [
        (MX + 1.48, MY - 0.12, z_left),
        (-0.02, y_bulge, z_left + 0.06),
        (0.38, y_bulge - 0.08, (z_left + z_right) * 0.5),
        (SX - 1.18, SY - 0.12, z_right),
    ]
    tube(f'Copper Pipe {label_txt}', p_pts, 0.135, mat_copper, resolution=24)

    # Central brass clamping collar & stamped stdio label plate
    mid_x = 0.16
    mid_y = y_bulge - 0.06
    mid_z = (z_left + z_right) * 0.5 + 0.02
    torus(f'{label_txt} Pipe Collar', (mid_x, mid_y, mid_z), 0.155, 0.028, mat_brass, normal=(1, 0.1, -0.15))
    box(f'{label_txt} Collar Tag', (mid_x, mid_y - 0.17, mid_z), (0.58, 0.04, 0.17), mat_brass, bevel=0.015)
    box(f'{label_txt} Collar Enamel', (mid_x, mid_y - 0.19, mid_z), (0.52, 0.02, 0.12), mat_enamel_dark, bevel=0.008)
    text_3d(f'{label_txt} Tag Text', label_txt, (mid_x, mid_y - 0.205, mid_z), 0.085, mat_ivory, extrude=0.005)

# Vintage brass pressure gauge mounted atop the upper STDIN pipe manifold
gx, gy, gz = 0.08, -0.32, 3.48
cyl_between('Stdio Gauge Stem', (gx, gy, 3.12), (gx, gy, gz - 0.18), 0.038, mat_brass)
cyl_between('Stdio Gauge Case', (gx, gy + 0.06, gz), (gx, gy - 0.06, gz), 0.22, mat_brass)
torus('Stdio Gauge Bezel', (gx, gy - 0.06, gz), 0.21, 0.025, mat_brass, normal=(0, 1, 0))
cyl_between('Stdio Gauge Face', (gx, gy - 0.05, gz), (gx, gy - 0.065, gz), 0.19, mat_ivory)
box('Stdio Gauge Needle', (gx + 0.03, gy - 0.072, gz + 0.03), (0.13, 0.01, 0.018), mat_velvet, bevel=0.003, rot=(0, 0.65, 0))

# ==============================================================================
# 5. HAND-MACHINED BRASS & COPPER PI SIDECAR BODY
# ==============================================================================
# Heavy dark-steel lower cradle + shock springs supporting the sidecar
box('Sidecar Lower Cradle', (SX, SY, 1.18), (2.26, 1.68, 0.28), mat_alu_dark, bevel=0.05)
for sx_leg in (-0.82, 0.82):
    for sy_leg in (-0.58, 0.58):
        cyl_between(f'Sidecar Foot {sx_leg}_{sy_leg}', (SX + sx_leg, SY + sy_leg, 0.36), (SX + sx_leg, SY + sy_leg, 1.05), 0.085, mat_brass_aged)
        for sp_k in range(5):
            torus(f'Sidecar Coil Spring {sx_leg}_{sy_leg}_{sp_k}', (SX + sx_leg, SY + sy_leg, 0.50 + sp_k * 0.10), 0.115, 0.024, mat_copper)

# Main warm hand-machined brass sidecar engine hull
box('Pi Sidecar Main Brass Hull', (SX, SY, 2.22), (2.18, 1.56, 1.82), mat_brass, bevel=0.22, segments=6)
# Copper Belly Band & Riveted Boiler Straps
box('Sidecar Copper Waist Band', (SX, SY, 2.22), (2.23, 1.60, 0.52), mat_copper, bevel=0.06)
for strap_x in (SX - 0.78, SX + 0.78):
    box(f'Sidecar Brass Boiler Strap {strap_x:.2f}', (strap_x, SY, 2.22), (0.14, 1.64, 1.88), mat_brass_aged, bevel=0.03)
    for rz in (1.48, 1.85, 2.22, 2.59, 2.96):
        sphere(f'Sidecar Front Rivet {strap_x:.2f}_{rz:.2f}', (strap_x, SY - 0.82, rz), (0.028, 0.028, 0.028), mat_chrome)

# External copper cooling coil looping around right flank of sidecar
for c_i in range(4):
    cz = 1.68 + c_i * 0.28
    tube(f'Sidecar Right Cooling Pipe {c_i}', [
        (SX + 1.06, SY + 0.45, cz),
        (SX + 1.28, SY, cz),
        (SX + 1.06, SY - 0.45, cz),
    ], 0.045, mat_copper)

# Rotary Endpoint Dial on the Front Face of the Sidecar
DX, DY, DZ = SX, SY - 0.80, 2.18
cyl_between('Rotary Dial Brass Bezel', (DX, DY + 0.05, DZ), (DX, DY - 0.06, DZ), 0.52, mat_brass_aged)
torus('Rotary Dial Outer Ring', (DX, DY - 0.06, DZ), 0.50, 0.042, mat_brass, normal=(0, 1, 0))
cyl_between('Rotary Dial Enamel Face', (DX, DY - 0.04, DZ), (DX, DY - 0.075, DZ), 0.46, mat_enamel_dark)
# Radial dial tick marks around the rotary selector
for tick_i in range(12):
    ang = -pi * 0.75 + tick_i * (pi * 1.5 / 11)
    tx1, tz1 = DX + 0.34 * sin(ang), DZ + 0.34 * cos(ang)
    tx2, tz2 = DX + 0.42 * sin(ang), DZ + 0.42 * cos(ang)
    cyl_between(f'Dial Tick {tick_i}', (tx1, DY - 0.08, tz1), (tx2, DY - 0.08, tz2), 0.014 if tick_i % 3 == 0 else 0.009, mat_ivory if tick_i == 8 else mat_brass)
# Heavy knurled rotary selector knob + ivory pointer
cyl_between('Rotary Selector Knob', (DX, DY - 0.06, DZ), (DX, DY - 0.20, DZ), 0.21, mat_brass)
box('Rotary Knob Pointer Bar', (DX + 0.04, DY - 0.21, DZ + 0.04), (0.10, 0.06, 0.34), mat_ivory, bevel=0.015, rot=(0, -0.55, 0))
# Brass Nameplate below dial: "BYOK ENDPOINT"
box('Endpoint Plate Frame', (DX, DY - 0.04, 1.48), (1.32, 0.06, 0.22), mat_brass, bevel=0.015)
box('Endpoint Plate Enamel', (DX, DY - 0.065, 1.48), (1.24, 0.02, 0.16), mat_enamel_dark, bevel=0.008)
text_3d('Endpoint Plate Text', 'BYOK ENDPOINT', (DX, DY - 0.08, 1.48), 0.092, mat_ivory, extrude=0.005)

# ==============================================================================
# 6. GLOWING VACUUM-TUBE / QUARTZ CYLINDER CHAMBERS & SCULPTED SOLID-BRASS Pi (π)
# ==============================================================================
# Two large glowing quartz vacuum-tube chambers flanking the Pi emblem on top of the sidecar
for side_i, vx in enumerate((SX - 0.68, SX + 0.68)):
    vy = SY - 0.08
    vz_base = 3.14
    cyl_between(f'Vacuum Tube Base Socket {side_i}', (vx, vy, vz_base), (vx, vy, vz_base + 0.14), 0.25, mat_brass_aged)
    # Clear quartz glass cylinder
    cyl_between(f'Quartz Cylinder Chamber {side_i}', (vx, vy, vz_base + 0.14), (vx, vy, vz_base + 0.92), 0.20, mat_quartz, bevel=0.02)
    # Glowing internal helical filament + plasma core
    cyl_between(f'Glowing Plasma Rod {side_i}', (vx, vy, vz_base + 0.20), (vx, vy, vz_base + 0.84), 0.055, mat_amber_filament)
    for ring_k in range(4):
        torus(f'Filament Coil {side_i}_{ring_k}', (vx, vy, vz_base + 0.28 + ring_k * 0.15), 0.095, 0.018, mat_amber_filament)
    # Brass top dome cap & 4 guard rods
    cyl_between(f'Vacuum Tube Top Cap {side_i}', (vx, vy, vz_base + 0.92), (vx, vy, vz_base + 1.02), 0.22, mat_brass)
    sphere(f'Vacuum Tube Finial {side_i}', (vx, vy, vz_base + 1.05), (0.08, 0.08, 0.08), mat_copper)
    for rod_i in range(4):
        ra = rod_i * pi / 2 + pi / 4
        rx, ry = vx + 0.225 * cos(ra), vy + 0.225 * sin(ra)
        cyl_between(f'Tube Guard Rod {side_i}_{rod_i}', (rx, ry, vz_base + 0.12), (rx, ry, vz_base + 0.94), 0.014, mat_brass)

# Central stepped brass turret pedestal for the Greek Pi (π) emblem
PX, PY, PZ = SX, SY - 0.02, 3.14
cyl_between('Pi Turret Lower Plinth', (PX, PY, PZ), (PX, PY, PZ + 0.16), 0.48, mat_brass_aged)
cyl_between('Pi Turret Upper Plinth', (PX, PY, PZ + 0.16), (PX, PY, PZ + 0.28), 0.38, mat_brass)
torus('Pi Turret Collar Ring', (PX, PY, PZ + 0.28), 0.38, 0.032, mat_copper)

# Sculptural 3D Solid-Brass Greek π (Pi) Emblem crowning the sidecar
# Built from high-precision sculpted 3D geometry so the silhouette is heroic and unmistakable
pi_base_z = PZ + 0.28
# Left leg of π (slightly tapered column with flared foot)
box('Pi Left Leg Column', (PX - 0.26, PY, pi_base_z + 0.44), (0.19, 0.22, 0.86), mat_brass, bevel=0.045, rot=(0, 0.05, 0))
box('Pi Left Leg Foot', (PX - 0.29, PY, pi_base_z + 0.06), (0.28, 0.26, 0.11), mat_brass, bevel=0.03)
# Right leg of π (with classic curved hook foot at bottom right)
box('Pi Right Leg Column', (PX + 0.24, PY, pi_base_z + 0.44), (0.19, 0.22, 0.84), mat_brass, bevel=0.045, rot=(0, -0.04, 0))
tube('Pi Right Leg Hook Foot', [
    (PX + 0.24, PY, pi_base_z + 0.22),
    (PX + 0.28, PY, pi_base_z + 0.07),
    (PX + 0.42, PY, pi_base_z + 0.11),
], 0.095, mat_brass)
# Bold sweeping top crossbar (tilde-like Greek pi bar with upturned right tip and downturned left serif)
tube('Pi Sculpted Top Bar', [
    (PX - 0.62, PY, pi_base_z + 0.78),
    (PX - 0.42, PY, pi_base_z + 0.92),
    (PX, PY, pi_base_z + 0.90),
    (PX + 0.42, PY, pi_base_z + 0.88),
    (PX + 0.64, PY, pi_base_z + 0.97),
], 0.115, mat_brass, resolution=24)
box('Pi Crossbar Core Fillet', (PX, PY, pi_base_z + 0.88), (1.06, 0.24, 0.18), mat_brass, bevel=0.05)
# Copper inlay rim on front of the Pi legs & crossbar for extra readability
box('Pi Left Copper Inlay', (PX - 0.26, PY - 0.105, pi_base_z + 0.45), (0.07, 0.03, 0.68), mat_copper, bevel=0.01, rot=(0, 0.05, 0))
box('Pi Right Copper Inlay', (PX + 0.24, PY - 0.105, pi_base_z + 0.45), (0.07, 0.03, 0.68), mat_copper, bevel=0.01, rot=(0, -0.04, 0))
box('Pi Top Copper Inlay', (PX, PY - 0.115, pi_base_z + 0.89), (0.92, 0.03, 0.07), mat_copper, bevel=0.01)

# ==============================================================================
# 7. FOREGROUND RIGHT: THE OS KEYCHAIN VAULT (CREDENTIAL REF)
# ==============================================================================
VX, VY, VZ = 1.95, -1.48, 0.36

# Heavy dark-steel combination strongbox resting on the plinth beneath the sidecar
box('OS Keychain Steel Vault Body', (VX, VY, VZ + 0.42), (1.28, 0.94, 0.84), mat_steel_vault, bevel=0.055)
# Recessed vault door on the front face
box('Vault Door Frame', (VX, VY - 0.46, VZ + 0.42), (1.06, 0.06, 0.66), mat_alu_dark, bevel=0.025)
box('Vault Steel Door Plate', (VX, VY - 0.48, VZ + 0.42), (0.96, 0.06, 0.58), mat_steel_vault, bevel=0.02)
# External heavy barrel hinges on right side of vault door
for hz in (VZ + 0.24, VZ + 0.60):
    cyl_between(f'Vault Barrel Hinge {hz:.2f}', (VX + 0.49, VY - 0.50, hz - 0.07), (VX + 0.49, VY - 0.50, hz + 0.07), 0.042, mat_brass)
# Brass combination dial & 3-spoke handle on vault door
cyl_between('Vault Combination Dial Base', (VX - 0.12, VY - 0.50, VZ + 0.44), (VX - 0.12, VY - 0.55, VZ + 0.44), 0.15, mat_brass)
cyl_between('Vault Combination Dial Knob', (VX - 0.12, VY - 0.55, VZ + 0.44), (VX - 0.12, VY - 0.60, VZ + 0.44), 0.085, mat_chrome)
for sp_a in (0, 2 * pi / 3, 4 * pi / 3):
    cyl_between(f'Vault Handle Spoke {sp_a:.2f}', (VX + 0.22, VY - 0.53, VZ + 0.44),
                (VX + 0.22 + 0.11 * cos(sp_a), VY - 0.56, VZ + 0.44 + 0.11 * sin(sp_a)), 0.016, mat_brass)

# Heavy brass chain linking the vault to the Pi sidecar + prominent Brass Key Tag ("CREDENTIAL REF")
chain_pts = [
    (SX - 0.55, SY - 0.68, 1.15),
    (1.22, -1.10, 0.96),
    (1.15, -1.30, 0.78),
    (1.02, -1.48, 0.56),
    (0.92, -1.62, 0.44),
]
for c_idx in range(len(chain_pts) - 1):
    p_mid = (Vector(chain_pts[c_idx]) + Vector(chain_pts[c_idx + 1])) * 0.5
    n_vec = (1, 0.4, 0.2) if c_idx % 2 == 0 else (0.2, 1, 0.5)
    torus(f'Credential Chain Link {c_idx}', p_mid, 0.075, 0.020, mat_brass, normal=n_vec)

# Prominent Brass Key Tag resting in front-left of the strongbox
KX, KY, KZ = 0.72, -1.68, 0.44
box('Brass Credential Key Tag', (KX, KY, KZ), (1.02, 0.42, 0.08), mat_brass, bevel=0.03, rot=(0.32, 0.0, 0.22))
box('Key Tag Dark Inset', (KX, KY - 0.01, KZ + 0.025), (0.86, 0.28, 0.04), mat_enamel_dark, bevel=0.01, rot=(0.32, 0.0, 0.22))
text_3d('Key Tag Label', 'CREDENTIAL REF', (KX + 0.02, KY - 0.01, KZ + 0.052), 0.082, mat_ivory, rot=(0.32, 0.0, 0.22), extrude=0.006)
torus('Key Tag Brass Ring', (KX - 0.52, KY + 0.12, KZ + 0.02), 0.085, 0.018, mat_brass, normal=(0, 0.3, 1))

# Sculpted solid-brass bit key attached to the ring
cyl_between('Vault Key Shaft', (KX - 0.62, KY + 0.08, KZ), (KX - 0.98, KY - 0.12, KZ - 0.02), 0.024, mat_brass)
torus('Vault Key Bow', (KX - 0.56, KY + 0.11, KZ + 0.01), 0.075, 0.020, mat_brass, normal=(0, 0, 1))
box('Vault Key Bit Teeth', (KX - 0.92, KY - 0.04, KZ - 0.02), (0.11, 0.09, 0.028), mat_brass, bevel=0.006, rot=(0, 0, 0.52))

# ==============================================================================
# 8. STUDIO LIGHTING & CAMERA FRAMING
# ==============================================================================
def add_area_light(name, loc, target, energy, color, size, shape='DISK', size_y=None):
    bpy.ops.object.light_add(type='AREA', location=loc)
    lt = bpy.context.object
    lt.name = name
    lt.data.energy = energy
    lt.data.color = color
    lt.data.shape = shape
    lt.data.size = size
    if size_y is not None:
        lt.data.size_y = size_y
    lt.rotation_euler = (Vector(target) - lt.location).to_track_quat('-Z', 'Y').to_euler()
    return lt


# Cool silver key & rim light on the left anodized-aluminum monolith
add_area_light('Cool Silver Monolith Key', (-5.5, -5.8, 6.8), (-1.6, 0.0, 2.6), 950.0, (0.68, 0.86, 1.0), 4.2)
add_area_light('Cool Cyan Monolith Rim', (-4.2, 3.8, 6.2), (-1.6, 0.1, 3.0), 780.0, (0.50, 0.80, 1.0), 3.2)

# Warm amber/copper key & rim light on the right brass Pi sidecar and stdio pipes
add_area_light('Warm Brass Sidecar Key', (5.6, -5.4, 6.4), (1.7, -0.2, 2.4), 1150.0, (1.0, 0.76, 0.48), 4.0)
add_area_light('Warm Copper Rim Light', (4.2, 3.6, 5.8), (1.8, 0.0, 3.2), 920.0, (1.0, 0.64, 0.32), 3.0)

# Overhead studio softbox strip for clean specular highlights across both machines
add_area_light('Overhead Studio Strip', (0.1, -1.8, 8.2), (0.1, -0.3, 2.2), 680.0, (1.0, 0.95, 0.88), 5.5, shape='RECTANGLE', size_y=2.5)
# Low front fill for the turnstile and steel credential vault
add_area_light('Foreground Vault & Turnstile Fill', (0.2, -7.2, 2.4), (0.1, -1.4, 0.9), 340.0, (0.95, 0.88, 0.78), 3.5)

# Camera setup
bpy.ops.object.camera_add(location=(0.35, -10.8, 4.35))
cam = bpy.context.object
cam.name = 'Editorial Studio Camera'
cam_target = Vector((0.12, -0.25, 2.25))
cam.rotation_euler = (cam_target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 50.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.15, -0.65, 2.25)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

# Render output
png_path = TMP / ('preview.png' if WIDTH < 1600 else 'final.png')
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_path = Path(os.environ.get('WEBP', str(ROOT / 'the-unlicensed-sidecar.webp')))
webp_path.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert('RGB').save(webp_path, 'WEBP', quality=92, method=6)
print(f'Rendered {webp_path} ({WIDTH}x{HEIGHT}, samples={SAMPLES})', flush=True)
