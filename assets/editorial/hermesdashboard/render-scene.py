"""The Drawer of Little Assistants — original Blender 5.2 Cycles conceptual still life for HermesDashboard.
All geometry and shaders are original and procedural.
"""
import os
import math
import random
from pathlib import Path
from math import sin, cos, pi
import bpy
from mathutils import Vector
from PIL import Image

random.seed(110)

ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/hermesdashboard-blender')
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
bg.inputs[0].default_value = (0.024, 0.020, 0.034, 1.0)
bg.inputs[1].default_value = 0.32


def make_mat(name, color, metal=0.0, rough=0.3, bump_strength=0.12, bump_scale=160.0,
             coat=0.0, emission=None, emission_strength=0.0, transmission=0.0, ior=1.48,
             subsurface=0.0, wood=False, voronoi=False):
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
    if subsurface > 0 and 'Subsurface Weight' in p.inputs:
        p.inputs['Subsurface Weight'].default_value = subsurface
    if transmission > 0:
        p.inputs['Transmission Weight'].default_value = transmission
        p.inputs['IOR'].default_value = ior
    if emission is not None and emission_strength > 0:
        p.inputs['Emission Color'].default_value = (*emission, 1.0)
        p.inputs['Emission Strength'].default_value = emission_strength

    if wood:
        coord = nodes.new('ShaderNodeTexCoord')
        mapping = nodes.new('ShaderNodeVectorMath')
        mapping.operation = 'MULTIPLY'
        mapping.inputs[1].default_value = (2.2, 55.0, 14.0)
        links.new(coord.outputs['Generated'], mapping.inputs[0])
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 3.2
        noise.inputs['Detail'].default_value = 5.0
        noise.inputs['Roughness'].default_value = 0.72
        links.new(mapping.outputs[0], noise.inputs['Vector'])
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.18
        ramp.color_ramp.elements[0].color = (*(c * 0.45 for c in color), 1.0)
        ramp.color_ramp.elements[1].position = 0.82
        ramp.color_ramp.elements[1].color = (*(min(1.0, c * 1.25) for c in color), 1.0)
        links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'], p.inputs['Base Color'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = bump_strength
        bump.inputs['Distance'].default_value = 0.018
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], p.inputs['Normal'])
    elif bump_strength > 0:
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = bump_scale
        noise.inputs['Detail'].default_value = 4.0
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = bump_strength
        bump.inputs['Distance'].default_value = 0.012
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], p.inputs['Normal'])

    if voronoi:
        vor = nodes.new('ShaderNodeTexVoronoi')
        vor.inputs['Scale'].default_value = 48.0
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (*(c * 0.76 for c in color), 1.0)
        ramp.color_ramp.elements[1].position = 0.85
        ramp.color_ramp.elements[1].color = (*(min(1.0, c * 1.10) for c in color), 1.0)
        links.new(vor.outputs['Distance'], ramp.inputs['Fac'])
        links.new(ramp.outputs['Color'], p.inputs['Base Color'])

    return m


# Materials
mat_walnut = make_mat('Oiled American Walnut', (0.18, 0.078, 0.032), rough=0.28, bump_strength=0.18, coat=0.35, wood=True)
mat_mahogany = make_mat('Rich Mahogany Drawer', (0.24, 0.072, 0.028), rough=0.25, bump_strength=0.16, coat=0.42, wood=True)
mat_slate_enamel = make_mat('Slate-Blue Vitreous Enamel', (0.09, 0.24, 0.36), metal=0.12, rough=0.16, bump_strength=0.05, coat=0.75)
mat_brass = make_mat('Polished Instrument Brass', (0.72, 0.49, 0.17), metal=0.92, rough=0.20, bump_strength=0.07, voronoi=True)
mat_brass_aged = make_mat('Patinated Astrolabe Bronze', (0.45, 0.28, 0.095), metal=0.85, rough=0.32, bump_strength=0.14, voronoi=True)
mat_gold_coin = make_mat('Gleaming Mint Gold', (0.88, 0.62, 0.18), metal=0.96, rough=0.15, bump_strength=0.05)
mat_porcelain = make_mat('Glazed Automaton Porcelain', (0.90, 0.84, 0.72), rough=0.18, bump_strength=0.05, coat=0.45, subsurface=0.05)
mat_enamel_dark = make_mat('Deep Instrument Black', (0.022, 0.026, 0.034), metal=0.2, rough=0.15, bump_strength=0.03, coat=0.7)
mat_glass = make_mat('Optical Bevel Glass', (0.90, 0.95, 0.98), rough=0.05, bump_strength=0.0, transmission=0.88, ior=1.47, coat=0.5)
mat_blueprint = make_mat('Prussian Cyan Blueprint Paper', (0.045, 0.22, 0.38), rough=0.62, bump_strength=0.18, bump_scale=210.0)
mat_blueprint_line = make_mat('Chalk White Schematic Trace', (0.86, 0.94, 0.98), rough=0.3, bump_strength=0.0, emission=(0.75, 0.92, 1.0), emission_strength=0.8)
mat_stage_velvet = make_mat('Drawer Stage Felt Lining', (0.14, 0.095, 0.065), rough=0.78, bump_strength=0.22)
mat_warm_lamp = make_mat('Drawer Work-Lamp Filament', (1.0, 0.72, 0.32), rough=0.1, bump_strength=0.0, emission=(1.0, 0.68, 0.25), emission_strength=14.0)

# Color-coded Orrery Sphere Materials (Sessions, Files, Tools, Models, Skills)
mat_orb_session = make_mat('Warm Gold Session Orb', (0.92, 0.64, 0.16), metal=0.75, rough=0.14, coat=0.6, emission=(0.95, 0.58, 0.12), emission_strength=0.45)
mat_orb_file = make_mat('Sapphire Blue File Orb', (0.10, 0.38, 0.88), metal=0.25, rough=0.12, coat=0.85, emission=(0.12, 0.45, 0.95), emission_strength=0.40)
mat_orb_tool = make_mat('Emerald Green Tool Orb', (0.08, 0.68, 0.36), metal=0.25, rough=0.12, coat=0.85, emission=(0.10, 0.78, 0.42), emission_strength=0.40)
mat_orb_model = make_mat('Amethyst Violet Model Orb', (0.52, 0.22, 0.86), metal=0.25, rough=0.12, coat=0.85, emission=(0.58, 0.28, 0.92), emission_strength=0.40)
mat_orb_skill = make_mat('Warm Coral Skill Orb', (0.92, 0.28, 0.20), metal=0.20, rough=0.14, coat=0.85, emission=(0.95, 0.32, 0.22), emission_strength=0.40)

mat_plinth = make_mat('Dark Gallery Plinth', (0.042, 0.038, 0.052), metal=0.12, rough=0.52, bump_strength=0.16, bump_scale=90.0)
mat_floor = make_mat('Infinite Observatory Floor', (0.018, 0.015, 0.024), metal=0.0, rough=0.75, bump_strength=0.10, bump_scale=60.0)


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


def box(name, loc, dim, mat, bevel=0.035, segments=4, rot=(0, 0, 0)):
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


def cyl_between(name, p1, p2, r, mat, vertices=48, bevel=0.010):
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


def text_3d(name, body, loc, size, mat, rot=(pi / 2, 0, 0), extrude=0.010, align='CENTER'):
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
# 1. STUDIO FLOOR & PLINTH
# ==============================================================================
bpy.ops.mesh.primitive_plane_add(size=200.0, location=(0, 0, 0))
finish(bpy.context.object, 'Observatory Studio Floor', mat_floor)

box('Observatory Gallery Plinth', (0.20, -0.25, 0.18), (7.4, 5.0, 0.36), mat_plinth, bevel=0.05)
box('Plinth Brass Inlay', (0.20, -0.25, 0.04), (7.48, 5.08, 0.04), mat_brass_aged, bevel=0.01)

# ==============================================================================
# 2. MID-CENTURY WALNUT & SLATE-BLUE ENAMEL "SESSION OBSERVATORY" CABINET
# ==============================================================================
CX, CY = -0.15, 0.38

# Tapered mid-century walnut legs with brass ferrules
for lx in (-1.72, 1.72):
    for ly in (-0.92, 0.92):
        cyl_between(f'Cabinet Walnut Leg {lx}_{ly}', (CX + lx, CY + ly, 0.48), (CX + lx * 0.96, CY + ly * 0.96, 0.72), 0.11, mat_walnut)
        cyl_between(f'Cabinet Brass Ferrule {lx}_{ly}', (CX + lx, CY + ly, 0.36), (CX + lx, CY + ly, 0.49), 0.095, mat_brass)

# Walnut Cabinet Carcass (built around the open lower drawer cavity so the drawer is genuinely recessed)
box('Cabinet Bottom Base Board', (CX, CY, 0.78), (3.92, 2.28, 0.14), mat_walnut, bevel=0.04)
box('Cabinet Top Crown Deck', (CX, CY, 2.66), (3.96, 2.32, 0.16), mat_walnut, bevel=0.045)
box('Cabinet Rear Backboard', (CX, CY + 1.06, 1.72), (3.88, 0.14, 1.78), mat_walnut, bevel=0.03)
for side_s, sx in (('Left', -1.86), ('Right', 1.86)):
    box(f'Cabinet {side_s} Walnut Wall', (CX + sx, CY, 1.72), (0.18, 2.24, 1.78), mat_walnut, bevel=0.04)
    # Brass corner reinforcement brackets on front top and bottom corners
    for bz in (0.86, 2.56):
        box(f'Brass Corner Bracket {side_s}_{bz}', (CX + sx, CY - 1.10, bz), (0.22, 0.10, 0.12), mat_brass, bevel=0.015)

# Middle horizontal divider rail separating upper slate-blue instrument bay and lower subagent drawer
box('Cabinet Mid Divider Shelf', (CX, CY, 1.88), (3.62, 2.18, 0.12), mat_walnut, bevel=0.03)

# Upper Slate-Blue Vitreous Enamel Fascia Panel (Z = 1.96 to 2.58)
box('Fascia Brass Frame Trim', (CX, CY - 1.05, 2.27), (3.60, 0.10, 0.68), mat_brass_aged, bevel=0.02)
box('Slate-Blue Enamel Instrument Fascia', (CX, CY - 1.085, 2.27), (3.46, 0.08, 0.56), mat_slate_enamel, bevel=0.025)

# Engraved Brass Plaque on left of Slate-Blue Fascia: "HERMES OBSERVATORY"
box('Hermes Nameplate Base', (CX - 0.98, CY - 1.13, 2.38), (1.35, 0.04, 0.22), mat_brass, bevel=0.012)
box('Hermes Nameplate Enamel', (CX - 0.98, CY - 1.15, 2.38), (1.27, 0.02, 0.16), mat_enamel_dark, bevel=0.006)
text_3d('Hermes Nameplate Text', 'HERMES · SESSIONS', (CX - 0.98, CY - 1.165, 2.38), 0.088, mat_porcelain, extrude=0.005)

# Collapsible tool-call row flip-tabs & SSE indicator lamps on the slate-blue fascia
for t_i in range(4):
    tx = CX - 1.42 + t_i * 0.44
    box(f'Tool Call Flip Tab {t_i}', (tx, CY - 1.14, 2.10), (0.36, 0.06, 0.14), mat_brass if t_i == 0 else mat_slate_enamel, bevel=0.012, rot=(0.18 if t_i == 0 else 0, 0, 0))
    torus(f'Tool Call Lamp Bezel {t_i}', (tx, CY - 1.13, 2.10), 0.035, 0.008, mat_brass, normal=(0, 1, 0))

# Five jewel indicator lamps on right side of fascia matching the 5 Orrery node categories
orb_mats = [mat_orb_session, mat_orb_file, mat_orb_tool, mat_orb_model, mat_orb_skill]
for j_i, j_mat in enumerate(orb_mats):
    jx = CX + 0.18 + j_i * 0.32
    jz = 2.28
    torus(f'Fascia Jewel Bezel {j_i}', (jx, CY - 1.13, jz), 0.082, 0.018, mat_brass, normal=(0, 1, 0))
    sphere(f'Fascia Jewel Lens {j_i}', (jx, CY - 1.15, jz), (0.068, 0.045, 0.068), j_mat)

# ==============================================================================
# 3. UPPER CONSTELLATION ORRERY (THE GRAPH — SESSIONS, FILES, TOOLS, MODELS, SKILLS)
# ==============================================================================
OX, OY, OZ = CX, CY + 0.02, 2.74

# Stepped Brass & Smoked-Glass Azimuth Dial Base
cyl_between('Orrery Mahogany Plinth Ring', (OX, OY, OZ), (OX, OY, OZ + 0.08), 1.62, mat_mahogany)
cyl_between('Orrery Brass Azimuth Plate', (OX, OY, OZ + 0.08), (OX, OY, OZ + 0.15), 1.50, mat_brass)
cyl_between('Orrery Recessed Glass Dial', (OX, OY, OZ + 0.15), (OX, OY, OZ + 0.18), 1.38, mat_enamel_dark)
for r_ring in (0.48, 0.88, 1.28, 1.46):
    torus(f'Azimuth Graduated Ring {r_ring}', (OX, OY, OZ + 0.18), r_ring, 0.020 if r_ring > 1.3 else 0.012, mat_brass)

# Azimuth degree ticks around outer brass ring
for deg_i in range(24):
    ang = deg_i * 2 * pi / 24
    p1 = (OX + 1.32 * cos(ang), OY + 1.32 * sin(ang), OZ + 0.185)
    p2 = (OX + 1.43 * cos(ang), OY + 1.43 * sin(ang), OZ + 0.185)
    cyl_between(f'Azimuth Tick {deg_i}', p1, p2, 0.008, mat_brass)

# Overarching semicircular Brass Meridian Arc framing the Orrery constellation
meridian_pts = [
    (OX + 1.56 * cos(t * pi / 24), OY + 0.15 * sin(t * pi / 24), OZ + 0.16 + 1.48 * sin(t * pi / 24))
    for t in range(25)
]
tube('Orrery Brass Meridian Arc', meridian_pts, 0.032, mat_brass_aged, resolution=24)

# Constellation Nodes: (x_off, y_off, z_height, radius, material, label)
# 0,1 = Sessions (Gold); 2,3,4 = Files (Sapphire); 5,6 = Tools (Emerald); 7,8 = Models (Violet); 9,10 = Skills (Coral)
orrery_nodes = [
    (-0.18, -0.08, 3.82, 0.25, mat_orb_session, 'Parent Session'),
    (0.48, -0.28, 3.48, 0.20, mat_orb_session, 'Child Session'),
    (-0.98, -0.22, 3.44, 0.155, mat_orb_file, 'File Node 1'),
    (-0.62, 0.36, 4.18, 0.150, mat_orb_file, 'File Node 2'),
    (0.08, -0.58, 3.22, 0.140, mat_orb_file, 'File Node 3'),
    (1.02, 0.08, 3.88, 0.165, mat_orb_tool, 'Tool Node 1'),
    (-0.42, -0.45, 4.12, 0.145, mat_orb_tool, 'Tool Node 2'),
    (-0.04, 0.42, 4.38, 0.175, mat_orb_model, 'Model Node 1'),
    (0.88, -0.38, 3.26, 0.145, mat_orb_model, 'Model Node 2'),
    (-1.08, 0.22, 3.92, 0.155, mat_orb_skill, 'Skill Node 1'),
    (0.54, 0.34, 4.20, 0.160, mat_orb_skill, 'Skill Node 2'),
]

node_positions = []
for idx, (nx, ny, nz, nr, nmat, nlabel) in enumerate(orrery_nodes):
    pos = (OX + nx, OY + ny, nz)
    node_positions.append(pos)
    # Slender vertical brass stalk from the azimuth dial up to the sphere
    cyl_between(f'Orrery Stalk {idx}', (OX + nx, OY + ny, OZ + 0.18), (OX + nx, OY + ny, nz - nr * 0.85), 0.018 if idx < 2 else 0.013, mat_brass_aged)
    torus(f'Orrery Stalk Foot {idx}', (OX + nx, OY + ny, OZ + 0.19), 0.055, 0.014, mat_brass)
    # Color-coded sphere + equatorial brass gimbal ring
    sphere(f'Orrery Sphere {nlabel}', pos, (nr, nr, nr), nmat)
    torus(f'Orrery Gimbal Ring {idx}', pos, nr * 1.18, 0.014, mat_brass, normal=(0.25, -0.8, 0.5))

# Fine tensioned brass rods linking the spheres into a rich graph network
graph_edges = [
    (0, 1), (0, 2), (0, 3), (0, 4), (0, 6), (0, 7), (0, 10),
    (1, 4), (1, 5), (1, 8), (1, 10),
    (2, 9), (3, 7), (3, 9), (5, 8), (5, 10), (6, 2), (6, 7), (7, 10),
]
for e_i, (u, v) in enumerate(graph_edges):
    p_u = Vector(node_positions[u])
    p_v = Vector(node_positions[v])
    cyl_between(f'Graph Tension Rod {e_i}', p_u, p_v, 0.013, mat_brass)
    # Tiny brass clevis collars near endpoints
    for t_end in (0.16, 0.84):
        c_pos = p_u.lerp(p_v, t_end)
        sphere(f'Rod Clevis Joint {e_i}_{t_end}', c_pos, (0.024, 0.024, 0.024), mat_brass_aged)

# ==============================================================================
# 4. PULLED-OUT "LIVE VIEW" SUBAGENT DRAWER & MINIATURE CLERK AUTOMATONS
# ==============================================================================
# The lower mahogany drawer is pulled halfway out toward the camera (Y from -0.20 to -1.72)
DX, DY, DZ = CX, -0.96, 0.90

# Brass telescopic drawer runner rails extending from cabinet interior
for rx in (-1.66, 1.66):
    box(f'Brass Drawer Runner Rail {rx}', (CX + rx, -0.35, 1.05), (0.06, 1.95, 0.09), mat_brass, bevel=0.01)

# Drawer Box Structure (bottom, left/right mahogany sides, low rear wall, front face with nameplate)
box('Subagent Drawer Floor', (DX, DY, 0.92), (3.28, 1.68, 0.08), mat_mahogany, bevel=0.02)
box('Drawer Stage Felt Floor', (DX, DY, 0.965), (3.12, 1.54, 0.02), mat_stage_velvet, bevel=0.005)
for sx in (-1.60, 1.60):
    box(f'Subagent Drawer Side Wall {sx}', (DX + sx, DY, 1.18), (0.09, 1.66, 0.52), mat_mahogany, bevel=0.02)
# Front Mahogany Drawer Face (kept low enough at Z = 0.84..1.18 so the camera peers directly into the open theatre stage!)
box('Subagent Drawer Front Lip', (DX, -1.78, 1.03), (3.36, 0.11, 0.34), mat_mahogany, bevel=0.025)
# Brass cartouche on drawer front: "LIVE VIEW · SUBAGENTS"
box('Drawer Front Brass Cartouche', (DX, -1.84, 1.03), (1.68, 0.04, 0.21), mat_brass, bevel=0.012)
box('Drawer Front Cartouche Enamel', (DX, -1.86, 1.03), (1.58, 0.02, 0.15), mat_enamel_dark, bevel=0.006)
text_3d('Drawer Front Label', 'LIVE VIEW · SUBAGENTS', (DX, -1.875, 1.03), 0.086, mat_porcelain, extrude=0.005)
# Turned brass drawer handles on either side of the cartouche
for hx in (-1.18, 1.18):
    tube(f'Drawer Brass Pull Handle {hx}', [
        (DX + hx - 0.16, -1.82, 1.03),
        (DX + hx - 0.16, -1.94, 1.03),
        (DX + hx + 0.16, -1.94, 1.03),
        (DX + hx + 0.16, -1.82, 1.03),
    ], 0.022, mat_brass)

# Warm Golden Work-Lamp mounted under the upper drawer lip illuminating the little assistants
lamp_z = 1.76
lamp_y = -0.78
cyl_between('Drawer Work-Lamp Brass Hood', (DX - 0.45, lamp_y, lamp_z), (DX + 0.45, lamp_y, lamp_z), 0.085, mat_brass)
cyl_between('Drawer Work-Lamp Glowing Tube', (DX - 0.40, lamp_y - 0.02, lamp_z - 0.04), (DX + 0.40, lamp_y - 0.02, lamp_z - 0.04), 0.045, mat_warm_lamp)

# --- MINIATURE THEATRE PROP 1 (Left inside drawer): Slanted Blueprint Table & Blueprint ---
BX, BY, BZ = DX - 0.38, -1.12, 0.98
box('Miniature Drafting Table Base', (BX, BY, BZ + 0.16), (0.66, 0.44, 0.30), mat_walnut, bevel=0.015)
box('Slanted Blueprint Board', (BX, BY, BZ + 0.34), (0.76, 0.54, 0.04), mat_mahogany, bevel=0.01, rot=(0.28, 0, 0.08))
box('Cyan Blueprint Sheet', (BX, BY - 0.01, BZ + 0.365), (0.68, 0.46, 0.012), mat_blueprint, bevel=0.003, rot=(0.28, 0, 0.08))
# Luminous white schematic grid & nodes on the miniature blueprint
for bl_i in (-0.18, 0.0, 0.18):
    box(f'Blueprint Trace H {bl_i}', (BX, BY - 0.01 + bl_i * 0.7, BZ + 0.375 - bl_i * 0.2), (0.54, 0.012, 0.008), mat_blueprint_line, bevel=0.001, rot=(0.28, 0, 0.08))
for bn_x in (-0.16, 0.04, 0.18):
    sphere(f'Blueprint Schematic Node {bn_x}', (BX + bn_x, BY - 0.02, BZ + 0.38), (0.025, 0.025, 0.012), mat_blueprint_line)


def build_automaton(name_prefix, ax, ay, az, facing_yaw, mode='blueprint'):
    """Builds a charming miniature porcelain-and-brass clerk automaton inside the open drawer."""
    # Turned brass pedestal waist & lower skirt
    cyl_between(f'{name_prefix} Brass Base', (ax, ay, az), (ax, ay, az + 0.16), 0.14, mat_brass_aged)
    # Porcelain & brass segmented torso leaning slightly into its work
    sphere(f'{name_prefix} Porcelain Torso', (ax, ay, az + 0.34), (0.16, 0.13, 0.22), mat_porcelain)
    torus(f'{name_prefix} Brass Waist Belt', (ax, ay, az + 0.28), 0.145, 0.022, mat_brass)
    torus(f'{name_prefix} Brass Collar Ring', (ax, ay, az + 0.52), 0.105, 0.020, mat_brass)
    # Chest clockwork badge
    cyl_between(f'{name_prefix} Chest Escutcheon', (ax, ay - 0.11, az + 0.36), (ax, ay - 0.14, az + 0.36), 0.055, mat_brass)

    # Sculpted Ivory Porcelain Head + Brass Spectacles
    hx = ax + 0.04 * sin(facing_yaw)
    hy = ay - 0.04 * cos(facing_yaw)
    hz = az + 0.68
    sphere(f'{name_prefix} Porcelain Head', (hx, hy, hz), (0.145, 0.145, 0.165), mat_porcelain)
    # Brass binocular spectacles facing toward the camera/work
    for eye_s in (-0.052, 0.052):
        ex = hx + eye_s * cos(facing_yaw) + 0.12 * sin(facing_yaw)
        ey = hy + eye_s * sin(facing_yaw) - 0.12 * cos(facing_yaw)
        torus(f'{name_prefix} Spectacle Rim {eye_s}', (ex, ey, hz + 0.01), 0.038, 0.009, mat_brass, normal=(sin(facing_yaw), -cos(facing_yaw), 0))
        sphere(f'{name_prefix} Eye Optic {eye_s}', (ex, ey, hz + 0.01), (0.026, 0.015, 0.026), mat_enamel_dark)
    # Tiny brass clerk cap / dome
    cyl_between(f'{name_prefix} Brass Clerk Cap', (hx, hy, hz + 0.12), (hx, hy, hz + 0.17), 0.11, mat_brass)

    # Articulated Brass Shoulders & Arms
    for s_side in (-1, 1):
        sh_x = ax + s_side * 0.17 * cos(facing_yaw)
        sh_y = ay + s_side * 0.17 * sin(facing_yaw)
        sh_z = az + 0.46
        sphere(f'{name_prefix} Shoulder Joint {s_side}', (sh_x, sh_y, sh_z), (0.045, 0.045, 0.045), mat_brass)

    if mode == 'blueprint':
        # Left automaton reaches out over the slanted blueprint with a brass divider/caliper
        el_l = (ax + 0.18, ay - 0.10, az + 0.38)
        hand_l = (BX - 0.08, BY - 0.04, BZ + 0.42)
        cyl_between(f'{name_prefix} Upper Arm R', (ax + 0.16, ay, az + 0.46), el_l, 0.030, mat_porcelain)
        cyl_between(f'{name_prefix} Forearm R', el_l, hand_l, 0.026, mat_brass)
        sphere(f'{name_prefix} Hand R', hand_l, (0.036, 0.036, 0.036), mat_porcelain)
        # Brass caliper / loupe held over the blueprint
        torus(f'{name_prefix} Inspection Loupe', (BX - 0.02, BY - 0.05, BZ + 0.43), 0.065, 0.012, mat_brass, normal=(0, 0.2, 1))

        el_r = (ax - 0.16, ay - 0.15, az + 0.36)
        hand_r = (BX - 0.26, BY - 0.12, BZ + 0.39)
        cyl_between(f'{name_prefix} Upper Arm L', (ax - 0.16, ay, az + 0.46), el_r, 0.030, mat_porcelain)
        cyl_between(f'{name_prefix} Forearm L', el_r, hand_r, 0.026, mat_brass)
    else:
        # Right automaton turns a sculpted solid-brass wrench on the subagent gear manifold
        el_l = (ax - 0.18, ay - 0.12, az + 0.40)
        hand_l = (ax - 0.32, ay - 0.16, az + 0.38)
        cyl_between(f'{name_prefix} Upper Arm L', (ax - 0.16, ay, az + 0.46), el_l, 0.030, mat_porcelain)
        cyl_between(f'{name_prefix} Forearm L', el_l, hand_l, 0.026, mat_brass)
        sphere(f'{name_prefix} Hand L', hand_l, (0.036, 0.036, 0.036), mat_porcelain)

        el_r = (ax + 0.15, ay - 0.16, az + 0.38)
        hand_r = (ax - 0.18, ay - 0.20, az + 0.38)
        cyl_between(f'{name_prefix} Upper Arm R', (ax + 0.16, ay, az + 0.46), el_r, 0.030, mat_porcelain)
        cyl_between(f'{name_prefix} Forearm R', el_r, hand_r, 0.026, mat_brass)
        sphere(f'{name_prefix} Hand R', hand_r, (0.036, 0.036, 0.036), mat_porcelain)


# Automaton #1 (Left inside drawer, inspecting the blueprint)
build_automaton('Clerk Automaton 1', DX - 0.96, -1.04, 0.98, facing_yaw=0.52, mode='blueprint')

# --- MINIATURE THEATRE PROP 2 (Right inside drawer): Brass Clockwork Gear Manifold & Wrench ---
GX, GY, GZ = DX + 0.34, -1.14, 0.98
cyl_between('Subagent Gear Pedestal', (GX, GY, GZ), (GX, GY, GZ + 0.30), 0.14, mat_brass_aged)
torus('Subagent Main Brass Gear', (GX, GY, GZ + 0.30), 0.19, 0.032, mat_brass)
for tooth_i in range(12):
    ta = tooth_i * 2 * pi / 12
    box(f'Gear Tooth {tooth_i}', (GX + 0.21 * cos(ta), GY + 0.21 * sin(ta), GZ + 0.30), (0.045, 0.035, 0.05), mat_brass, bevel=0.005, rot=(0, 0, ta))
# Central hex bolt being turned by the wrench
cyl_between('Gear Central Hex Nut', (GX, GY, GZ + 0.30), (GX, GY, GZ + 0.40), 0.075, mat_gold_coin, vertices=6)

# Sculpted solid-brass open-end wrench engaged on the hex nut and held by Automaton #2
box('Miniature Brass Wrench Shaft', (GX + 0.24, GY - 0.03, GZ + 0.36), (0.46, 0.07, 0.035), mat_gold_coin, bevel=0.008, rot=(0, 0, -0.14))
torus('Miniature Wrench Jaw', (GX, GY, GZ + 0.36), 0.095, 0.024, mat_gold_coin)

# Automaton #2 (Right inside drawer, turning the brass wrench)
build_automaton('Clerk Automaton 2', DX + 0.92, -1.04, 0.98, facing_yaw=-0.48, mode='wrench')

# ==============================================================================
# 5. THE COST COUNTER (VEEDER-ROOT BRASS ODOMETER & STACKED GOLD COINS)
# ==============================================================================
# Positioned on the right side of the cabinet & foreground plinth
VX, VY, VZ = 2.28, -0.62, 0.36

# Stepped Walnut & Brass Instrument Pedestal attached to cabinet right flank
box('Odometer Walnut Base', (VX, VY, VZ + 0.16), (1.36, 1.12, 0.32), mat_walnut, bevel=0.035)
box('Odometer Brass Mounting Bracket', (VX - 0.62, VY + 0.20, VZ + 0.58), (0.36, 0.28, 0.22), mat_brass_aged, bevel=0.02)

# Mechanical Brass Veeder-Root Style Odometer Housing
box('Veeder-Root Brass Casing', (VX, VY + 0.08, VZ + 0.68), (1.18, 0.72, 0.72), mat_brass, bevel=0.05)
box('Odometer Recessed Window Frame', (VX, VY - 0.27, VZ + 0.74), (0.98, 0.08, 0.36), mat_brass_aged, bevel=0.02)
box('Odometer Window Dark Backing', (VX, VY - 0.26, VZ + 0.74), (0.90, 0.04, 0.28), mat_enamel_dark, bevel=0.01)

# Five individual rotating ivory number wheels inside the odometer window ("0" "4" "2" "8" "9")
digits = ['0', '4', '2', '8', '9']
for d_i, dig in enumerate(digits):
    wx = VX - 0.34 + d_i * 0.17
    wy = VY - 0.22
    wz = VZ + 0.74
    cyl_between(f'Odometer Number Wheel {d_i}', (wx - 0.065, wy, wz), (wx + 0.065, wy, wz), 0.135, mat_porcelain)
    # Brass divider ring between wheels
    if d_i < 4:
        torus(f'Odometer Wheel Divider {d_i}', (wx + 0.085, wy, wz), 0.138, 0.008, mat_brass, normal=(1, 0, 0))
    text_3d(f'Odometer Digit {d_i}', dig, (wx, wy - 0.142, wz), 0.135, mat_enamel_dark, extrude=0.006)

# Engraved brass plate on odometer front: "TOKENS · COST"
box('Odometer Label Plate', (VX, VY - 0.28, VZ + 0.46), (0.92, 0.04, 0.16), mat_enamel_dark, bevel=0.008)
text_3d('Odometer Label Text', 'TOKENS · COST', (VX, VY - 0.305, VZ + 0.46), 0.078, mat_porcelain, extrude=0.005)

# Mechanical reset crank on the right side of the odometer
cyl_between('Odometer Reset Shaft', (VX + 0.58, VY + 0.08, VZ + 0.74), (VX + 0.74, VY + 0.08, VZ + 0.74), 0.045, mat_brass)
cyl_between('Odometer Reset Arm', (VX + 0.72, VY + 0.08, VZ + 0.74), (VX + 0.72, VY - 0.12, VZ + 0.98), 0.028, mat_brass)
sphere('Odometer Reset Knob', (VX + 0.72, VY - 0.14, VZ + 1.00), (0.065, 0.065, 0.065), mat_orb_skill)

# Stacked Gold Coins beside & in front of the odometer on the plinth
coin_stacks = [
    (1.88, -1.35, 9, 0.175),
    (2.28, -1.42, 6, 0.175),
    (2.65, -1.28, 4, 0.175),
]
for st_idx, (cx_st, cy_st, count, cr) in enumerate(coin_stacks):
    for c_k in range(count):
        cz_coin = VZ + 0.022 + c_k * 0.046
        jx = cx_st + (0.012 if c_k % 2 == 0 else -0.008)
        jy = cy_st + (0.009 if c_k % 3 == 0 else -0.007)
        cyl_between(f'Gold Coin {st_idx}_{c_k}', (jx, jy, cz_coin), (jx, jy, cz_coin + 0.040), cr, mat_gold_coin, bevel=0.006)
        torus(f'Gold Coin Rim {st_idx}_{c_k}', (jx, jy, cz_coin + 0.040), cr * 0.86, 0.006, mat_brass)

# Two loose gold coins resting flat in foreground
for l_idx, (lx, ly) in enumerate([(1.54, -1.52), (2.48, -1.66)]):
    cyl_between(f'Loose Gold Coin {l_idx}', (lx, ly, VZ), (lx, ly, VZ + 0.042), 0.175, mat_gold_coin, bevel=0.006)
    torus(f'Loose Coin Rim {l_idx}', (lx, ly, VZ + 0.042), 0.15, 0.006, mat_brass)

# ==============================================================================
# 6. STUDIO LIGHTING & CAMERA FRAMING
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


# Warm Golden Interior Work-Lamp Spill inside the Open Subagent Drawer
add_area_light('Drawer Interior Work-Lamp Spill', (DX, -0.92, 1.70), (DX, -1.08, 1.05), 95.0, (1.0, 0.70, 0.28), 0.95, shape='RECTANGLE', size_y=0.45)
add_area_light('Drawer Automaton Front Fill', (DX, -2.6, 1.45), (DX, -1.05, 1.25), 110.0, (1.0, 0.78, 0.45), 1.4)

# Crisp Studio Key & Rim Lights for the Walnut Cabinet, Brass Orrery Spheres, and Odometer
add_area_light('Studio Warm Key Softbox', (-5.2, -5.8, 6.8), (-0.1, 0.0, 2.6), 980.0, (1.0, 0.88, 0.72), 4.2)
add_area_light('Orrery Crisp Overhead Highlight', (0.2, -1.2, 7.8), (0.0, 0.2, 3.6), 820.0, (1.0, 0.96, 0.90), 3.6)
add_area_light('Cool Observatory Rim Light', (4.8, 3.8, 6.4), (0.0, 0.2, 3.2), 860.0, (0.66, 0.82, 1.0), 3.4)
add_area_light('Right Odometer & Coins Accent', (5.4, -4.6, 4.2), (2.1, -0.9, 1.0), 540.0, (1.0, 0.82, 0.54), 2.8)

# Camera setup
bpy.ops.object.camera_add(location=(0.42, -9.85, 4.45))
cam = bpy.context.object
cam.name = 'Observatory Studio Camera'
cam_target = Vector((0.18, -0.35, 2.28))
cam.rotation_euler = (cam_target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 50.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.05, -0.85, 2.15)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

# Render output
png_path = TMP / ('preview.png' if WIDTH < 1600 else 'final.png')
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_path = Path(os.environ.get('WEBP', str(ROOT / 'drawer-of-little-assistants.webp')))
webp_path.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert('RGB').save(webp_path, 'WEBP', quality=92, method=6)
print(f'Rendered {webp_path} ({WIDTH}x{HEIGHT}, samples={SAMPLES})', flush=True)
