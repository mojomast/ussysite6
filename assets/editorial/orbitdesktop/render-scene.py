"""The Concierge of the Curved Arc — original procedural editorial still life for OrbitDesktop.
Run with Blender 5.2.2 (bpy) and Pillow; all geometry, shaders, and internal graphics are procedural.
"""
import os
import math
import random
from pathlib import Path
from math import sin, cos, pi
import bpy
from mathutils import Vector, Euler
from PIL import Image, ImageDraw, ImageFont

random.seed(101)

ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/orbitdesktop-blender')
TMP.mkdir(parents=True, exist_ok=True)

WIDTH = int(os.environ.get("WIDTH", "1600"))
HEIGHT = int(round(WIDTH * 0.75))
SAMPLES = int(os.environ.get("SAMPLES", "64"))

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
scene.view_settings.exposure = 0.15

scene.world.use_nodes = True
bg = scene.world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.018, 0.025, 0.038, 1.0)
bg.inputs[1].default_value = 0.35


def load_font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono' + ('-Bold' if bold else '') + '.ttf'
    if not os.path.exists(path):
        path = '/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if bold else '') + '.ttf'
    return ImageFont.truetype(path, size)


def make_pane_textures():
    specs = [
        ("pane_0.png", "PANE 01 · WORKSPACE.SQLITE", (255, 178, 72), (18, 28, 38), [
            "sqlite> SELECT id, mode FROM layout_v1;",
            "pane_id: 'notes-01'  | movable",
            "pane_id: 'term-tmux' | persistent",
            "checkpoint: rev_042  | atomic commit",
            "receipt: cmd_9c4069a | verified",
        ]),
        ("pane_1.png", "PANE 02 · MOVABLE WINDOWS", (95, 228, 212), (14, 32, 42), [
            "DEFAULT MODE: MOVABLE DOM PANES",
            "Element.moveBefore() -> state kept",
            "iframe continuity: ACTIVE",
            "window_bounds: { x: 140, y: 88 }",
            "focus_layer: native browser DOM",
        ]),
        ("pane_2.png", "PANE 03 · SPATIAL : CURVE", (255, 196, 88), (22, 26, 36), [
            "THREE.PerspectiveCamera + CSS3D",
            "tileSpatial(panes, 'curve', arc)",
            "layout_modes: [grid | row | curve]",
            "orbit_workspace -> read_only: true",
            "allow_mutations: OPT-IN REQUIRED",
        ]),
        ("pane_3.png", "PANE 04 · DOCKVIEW (OPT-IN)", (82, 235, 168), (14, 32, 34), [
            "EXPERIMENTAL DOCKING · OPT-IN",
            "dockview-core@8.3.1 tab groups",
            "split_pane: horizontal / vertical",
            "pane_registry: stable IDs",
            "serialize -> layout_v1 schema",
        ]),
        ("pane_4.png", "PANE 05 · XTERM.JS + TMUX", (255, 168, 64), (24, 22, 30), [
            "tmux attach -t orbit:0.0",
            "$ node server.py --local-first",
            "pty_bridge: node-pty connected",
            "reload_survival: TRUE (tmux)",
            "session_state: ATTACHED",
        ]),
    ]
    paths = []
    for fname, title, accent, bg_col, lines in specs:
        im = Image.new('RGB', (900, 680), bg_col)
        dr = ImageDraw.Draw(im)
        # Outer glowing border
        dr.rectangle((8, 8, 891, 671), outline=accent, width=6)
        dr.rectangle((20, 20, 879, 96), fill=(accent[0] // 4, accent[1] // 4, accent[2] // 4), outline=accent, width=2)
        dr.text((38, 38), title, font=load_font(34, True), fill=(248, 244, 230))
        # Subtle grid lines
        for gx in range(40, 860, 60):
            dr.line((gx, 110, gx, 650), fill=(bg_col[0] + 10, bg_col[1] + 14, bg_col[2] + 18), width=1)
        for gy in range(120, 650, 45):
            dr.line((30, gy, 870, gy), fill=(bg_col[0] + 10, bg_col[1] + 14, bg_col[2] + 18), width=1)
        for idx, line in enumerate(lines):
            y = 135 + idx * 88
            dr.rectangle((38, y - 6, 54, y + 32), fill=accent)
            col = accent if idx == 0 else (218, 232, 228)
            dr.text((72, y - 4), line, font=load_font(31, idx == 0), fill=col)
        # Scanlines
        for sy in range(0, 680, 4):
            dr.line((0, sy, 900, sy), fill=(6, 10, 14), width=1)
        out_p = TMP / fname
        im.save(out_p)
        paths.append((out_p, accent))
    return paths


def make_crt_texture():
    im = Image.new('RGB', (800, 600), (22, 12, 4))
    dr = ImageDraw.Draw(im)
    amber = (255, 168, 42)
    bright = (255, 220, 135)
    dim = (155, 88, 18)
    dr.rectangle((14, 14, 785, 585), outline=amber, width=4)
    dr.rectangle((26, 26, 773, 88), fill=(68, 34, 6), outline=amber, width=2)
    dr.text((42, 40), "TMUX [0:orbit] · XTERM.JS + NODE-PTY", font=load_font(28, True), fill=bright)
    lines = [
        "$ orbit_workspace --status",
        "mode: READ-ONLY (default)",
        "mutations: LOCKED (opt-in required)",
        "store: workspace.sqlite [rev 42]",
        "spatial: tileSpatial('curve', arc)",
        "tmux: session survives reload [OK]",
        "hermes@orbit:~$ █",
    ]
    for i, ln in enumerate(lines):
        c = bright if i in (0, 6) else amber
        dr.text((44, 112 + i * 62), ln, font=load_font(29, i in (0, 2, 6)), fill=c)
    for y in range(0, 600, 4):
        dr.line((0, y, 800, y), fill=(10, 5, 1), width=1)
    p = TMP / "crt_amber.png"
    im.save(p)
    return p


def make_tag_texture():
    im = Image.new('RGB', (900, 420), (228, 212, 178))
    dr = ImageDraw.Draw(im)
    # Border & Industrial Stamp
    dr.rectangle((16, 16, 883, 403), outline=(145, 32, 24), width=8)
    dr.rectangle((30, 30, 869, 389), outline=(42, 34, 28), width=3)
    dr.text((110, 54), "ORBIT_WORKSPACE CONTROLLER", font=load_font(34, True), fill=(45, 35, 28))
    dr.line((110, 108, 840, 108), fill=(145, 32, 24), width=4)
    dr.text((110, 134), "MUTATIONS: OPT-IN", font=load_font(58, True), fill=(155, 26, 20))
    dr.text((110, 224), "DEFAULT: READ-ONLY · ALLOW_MUTATIONS=0", font=load_font(28, True), fill=(50, 40, 32))
    dr.text((110, 278), "SQLITE CHECKPOINT REQUIRED", font=load_font(26, False), fill=(85, 68, 52))
    p = TMP / "tag_mutations.png"
    im.save(p)
    return p


pane_tex_info = make_pane_textures()
crt_tex_path = make_crt_texture()
tag_tex_path = make_tag_texture()


def mat(name, color, metal=0.0, rough=0.35, bump_strength=0.12, bump_scale=160.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    n = m.node_tree.nodes
    l = m.node_tree.links
    p = n.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1.0)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    p.inputs['Coat Weight'].default_value = coat
    if bump_strength > 0:
        noise = n.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = bump_scale
        noise.inputs['Detail'].default_value = 4.0
        bump = n.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = bump_strength
        bump.inputs['Distance'].default_value = 0.012
        l.new(noise.outputs['Fac'], bump.inputs['Height'])
        l.new(bump.outputs['Normal'], p.inputs['Normal'])
    return m


# Rich procedural materials
mahogany = mat('Polished dark mahogany bench', (0.11, 0.036, 0.016), metal=0.0, rough=0.26, bump_strength=0.18, bump_scale=18.0, coat=0.45)
wn = mahogany.node_tree.nodes
wl = mahogany.node_tree.links
wp = wn.get('Principled BSDF')
wcoord = wn.new('ShaderNodeTexCoord')
wmap = wn.new('ShaderNodeVectorMath')
wmap.operation = 'MULTIPLY'
wmap.inputs[1].default_value = (1.6, 55.0, 10.0)
wnoise = wn.new('ShaderNodeTexNoise')
wnoise.inputs['Scale'].default_value = 3.2
wnoise.inputs['Detail'].default_value = 6.0
wnoise.inputs['Roughness'].default_value = 0.7
wramp = wn.new('ShaderNodeValToRGB')
wramp.color_ramp.elements[0].position = 0.2
wramp.color_ramp.elements[0].color = (0.045, 0.014, 0.006, 1.0)
wramp.color_ramp.elements[1].position = 0.8
wramp.color_ramp.elements[1].color = (0.19, 0.068, 0.026, 1.0)
wl.new(wcoord.outputs['Generated'], wmap.inputs[0])
wl.new(wmap.outputs[0], wnoise.inputs['Vector'])
wl.new(wnoise.outputs['Fac'], wramp.inputs[0])
wl.new(wramp.outputs[0], wp.inputs['Base Color'])

slate = mat('Machined optical slate', (0.045, 0.058, 0.072), metal=0.25, rough=0.38, bump_strength=0.16, bump_scale=190.0)
brass = mat('Brushed instrument brass', (0.64, 0.43, 0.14), metal=0.92, rough=0.22, bump_strength=0.08, bump_scale=240.0)
aged_brass = mat('Patinated vernier brass', (0.46, 0.30, 0.10), metal=0.88, rough=0.29, bump_strength=0.12, bump_scale=180.0)
steel = mat('Ground vernier steel', (0.62, 0.66, 0.70), metal=0.95, rough=0.18, bump_strength=0.06, bump_scale=260.0)
cast_iron = mat('Heavy black cast iron', (0.032, 0.036, 0.042), metal=0.65, rough=0.48, bump_strength=0.28, bump_scale=140.0)
red_enamel = mat('Safety crimson baked enamel', (0.58, 0.045, 0.035), metal=0.05, rough=0.20, bump_strength=0.08, bump_scale=160.0, coat=0.7)
velvet = mat('Crimson calliper jaw velvet', (0.32, 0.015, 0.025), metal=0.0, rough=0.88, bump_strength=0.30, bump_scale=320.0)
velvet.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value = 0.45
cream_paper = mat('Unbleached perforated paper tape', (0.84, 0.77, 0.62), metal=0.0, rough=0.78, bump_strength=0.22, bump_scale=220.0)
stoneware = mat('Warm speckled stoneware mug', (0.72, 0.67, 0.56), metal=0.0, rough=0.24, bump_strength=0.15, bump_scale=140.0, coat=0.5)
coffee_mat = mat('Dark espresso', (0.025, 0.012, 0.005), metal=0.0, rough=0.12, bump_strength=0.0)
ivory_case = mat('Warm vintage terminal housing', (0.54, 0.49, 0.39), metal=0.0, rough=0.34, bump_strength=0.14, bump_scale=170.0)
dark_ink = mat('Stamped charcoal ink', (0.04, 0.04, 0.045), metal=0.0, rough=0.65, bump_strength=0.05)

glass = mat('Beveled optical crown glass', (0.82, 0.94, 0.96), metal=0.0, rough=0.05, bump_strength=0.0, coat=0.8)
gp = glass.node_tree.nodes['Principled BSDF']
gp.inputs['Transmission Weight'].default_value = 0.90
gp.inputs['IOR'].default_value = 1.51

bell_cover_glass = mat('Hinged protective cover glass', (0.90, 0.95, 0.96), metal=0.0, rough=0.06, bump_strength=0.0, coat=0.6)
bgp = bell_cover_glass.node_tree.nodes['Principled BSDF']
bgp.inputs['Transmission Weight'].default_value = 0.88
bgp.inputs['IOR'].default_value = 1.49
bgp.inputs['Alpha'].default_value = 0.42


def emissive_mat(name, rgb, strength=3.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*rgb, 1.0)
    p.inputs['Emission Color'].default_value = (*rgb, 1.0)
    p.inputs['Emission Strength'].default_value = strength
    p.inputs['Roughness'].default_value = 0.15
    return m


glow_amber = emissive_mat('Amber edge glow', (1.0, 0.58, 0.14), 4.5)
glow_cyan = emissive_mat('Cyan edge glow', (0.18, 0.86, 0.82), 4.2)
glow_emerald = emissive_mat('Emerald edge glow', (0.18, 0.92, 0.52), 4.2)


def tex_plane_mat(name, img_path, emission_strength=1.35):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    l = m.node_tree.links
    p = n.get('Principled BSDF')
    p.inputs['Roughness'].default_value = 0.14
    p.inputs['Coat Weight'].default_value = 0.75
    tex = n.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(str(img_path))
    l.new(tex.outputs['Color'], p.inputs['Base Color'])
    if emission_strength > 0:
        l.new(tex.outputs['Color'], p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value = emission_strength
    return m


def finish(obj, name, material):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)
    if hasattr(obj.data, 'polygons'):
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def box(name, loc, dim, material, bevel=0.025, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        o.modifiers.new('WN', 'WEIGHTED_NORMAL')
    return finish(o, name, material)


def cyl(name, a, b, r, material, vertices=48, bevel=0.01):
    va, vb = Vector(a), Vector(b)
    d = vb - va
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=r, depth=d.length, location=(va + vb) / 2.0)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    if bevel > 0:
        mod = o.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        o.modifiers.new('WN', 'WEIGHTED_NORMAL')
    return finish(o, name, material)


def tor(name, loc, major_r, minor_r, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=64, minor_segments=16,
        major_radius=major_r, minor_radius=minor_r,
        location=loc, rotation=rot
    )
    return finish(bpy.context.object, name, material)


def sphere(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, location=loc)
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, material)


def tube(name, pts, r, material, bevel_res=4):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.bevel_depth = r
    c.bevel_resolution = bevel_res
    s = c.splines.new('BEZIER')
    s.bezier_points.add(len(pts) - 1)
    for bp, co in zip(s.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return finish(o, name, material)


def add_uv_plane(name, width, height, material, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = (width, height, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(o, name, material)
    if parent is not None:
        o.parent = parent
    return o


def text3d(body, loc, size, material, rot=(0, 0, 0), extrude=0.003, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.align_x = align
    return finish(o, f"Text_{body}", material)


# ==============================================================================
# 1. DARK MAHOGANY & BRUSHED-BRASS OPTICAL WORKBENCH
# ==============================================================================
box('Mahogany Optical Workbench', (0, 0.2, -0.18), (11.5, 6.8, 0.36), mahogany, bevel=0.06)
box('Front Brass Bench Rule', (0, -2.55, 0.005), (9.6, 0.14, 0.025), brass, bevel=0.005)
for i in range(-36, 37):
    tx = i * 0.125
    ln = 0.08 if i % 5 == 0 else 0.04
    box('Rule Tick', (tx, -2.52, 0.02), (0.008, ln, 0.004), dark_ink, bevel=0.001)

# Recessed Slate Optical Breadboard Base in Center
box('Optical Slate Bed', (0.05, 0.35, 0.04), (5.6, 3.6, 0.09), slate, bevel=0.03)
box('Optical Bed Brass Trim', (0.05, -1.43, 0.05), (5.5, 0.07, 0.07), brass, bevel=0.01)
text3d('ORBIT DESKTOP · CSS3D SPATIAL BENCH [GRID · ROW · CURVE]', (0.05, -1.47, 0.035), 0.075, aged_brass, rot=(pi / 2, 0, 0))

# M6 Tapped Optical Breadboard Holes + Brass Cap Screws
for gx in range(-5, 6, 2):
    for gy in range(-2, 4):
        hx = 0.05 + gx * 0.46
        hy = 0.35 + gy * 0.48
        cyl('Breadboard Hole', (hx, hy, 0.082), (hx, hy, 0.088), 0.032, cast_iron, vertices=24, bevel=0.003)

# ==============================================================================
# 2. THE CURVED ARC RIG (Single Semicircular Brass Rail + 5 Glass Panes)
# ==============================================================================
ARC_CENTER = Vector((0.05, -0.55, 0.0))
ARC_RADIUS = 2.25
RAIL_Z = 0.62

# Build a custom semicircular brushed-brass rail mesh (spanning -72 deg to +72 deg around +Y)
def build_arc_rail(name, radius, z_pos, width, height, material, a_start=-74, a_end=74, steps=72):
    verts = []
    faces = []
    r_in = radius - width / 2.0
    r_out = radius + width / 2.0
    z_bot = z_pos - height / 2.0
    z_top = z_pos + height / 2.0
    for i in range(steps + 1):
        ang = math.radians(a_start + (a_end - a_start) * i / steps)
        # Arc bows away from camera (+Y) and wraps around viewer
        sx = math.sin(ang)
        cy = math.cos(ang)
        verts.extend([
            (ARC_CENTER.x + r_in * sx, ARC_CENTER.y + r_in * cy, z_bot),
            (ARC_CENTER.x + r_out * sx, ARC_CENTER.y + r_out * cy, z_bot),
            (ARC_CENTER.x + r_out * sx, ARC_CENTER.y + r_out * cy, z_top),
            (ARC_CENTER.x + r_in * sx, ARC_CENTER.y + r_in * cy, z_top),
        ])
    for i in range(steps):
        b = i * 4
        faces.extend([
            (b, b + 1, b + 5, b + 4),
            (b + 1, b + 2, b + 6, b + 5),
            (b + 2, b + 3, b + 7, b + 6),
            (b + 3, b, b + 4, b + 7),
        ])
    faces.append((0, 3, 2, 1))
    last = steps * 4
    faces.append((last, last + 1, last + 2, last + 3))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    mod = ob.modifiers.new('Bevel', 'BEVEL')
    mod.width = 0.012
    mod.segments = 3
    ob.modifiers.new('WN', 'WEIGHTED_NORMAL')
    return finish(ob, name, material)


build_arc_rail('Semicircular Brass Optical Rail', ARC_RADIUS, RAIL_Z, 0.24, 0.11, brass, -72, 72, 80)
build_arc_rail('Lower Slate Dovetail Track', ARC_RADIUS, RAIL_Z - 0.09, 0.30, 0.06, cast_iron, -74, 74, 80)
build_arc_rail('Upper Steel Vernier Strip', ARC_RADIUS - 0.02, RAIL_Z + 0.062, 0.12, 0.018, steel, -70, 70, 72)

# Turned Brass Pillars Supporting the Semicircular Arc Rail
for deg in (-66, -33, 0, 33, 66):
    rad = math.radians(deg)
    px = ARC_CENTER.x + ARC_RADIUS * math.sin(rad)
    py = ARC_CENTER.y + ARC_RADIUS * math.cos(rad)
    cyl('Arc Pillar Base', (px, py, 0.08), (px, py, 0.16), 0.16, brass)
    tor('Arc Pillar Collar', (px, py, 0.165), 0.135, 0.024, aged_brass)
    cyl('Arc Pillar Shaft', (px, py, 0.16), (px, py, RAIL_Z - 0.08), 0.085, steel)
    tor('Arc Pillar Upper Ring', (px, py, RAIL_Z - 0.10), 0.12, 0.022, brass)

# Five Miniature Beveled Glass Panes Clamped Along the Curved Arc
pane_angles = [-52, -26, 0, 26, 52]
edge_glows = [glow_amber, glow_cyan, glow_amber, glow_emerald, glow_amber]
pane_titles = ["WORKSPACE.SQLITE", "MOVABLE DOM", "SPATIAL : CURVE", "DOCKVIEW", "XTERM · TMUX"]

for idx, deg in enumerate(pane_angles):
    rad = math.radians(deg)
    # Position along the arc
    px = ARC_CENTER.x + ARC_RADIUS * math.sin(rad)
    py = ARC_CENTER.y + ARC_RADIUS * math.cos(rad)
    # Pane faces inward toward the viewer/camera with a clean curve
    yaw = -rad * 0.72
    pane_z = 1.62 + (0.08 if idx == 2 else (0.03 if idx in (1, 3) else 0.0))
    pw = 1.06 if idx == 2 else 0.94
    ph = 0.80 if idx == 2 else 0.72

    # Parent empty for the entire clamped pane + calliper assembly
    bpy.ops.object.empty_add(location=(px, py, pane_z), rotation=(0.06, 0.0, yaw))
    rig = bpy.context.object
    rig.name = f"Pane_Rig_{idx}"

    # 1. Thick Beveled Transmissive Optical Glass Pane
    g_pane = box(f"Beveled_Glass_Pane_{idx}", (0, 0, 0), (pw, 0.055, ph), glass, bevel=0.018)
    g_pane.parent = rig

    # 2. Glowing Translucent Edge Strips (Amber / Cyan / Emerald)
    eg_mat = edge_glows[idx]
    box(f"Edge_Glow_Left_{idx}", (-pw / 2 - 0.006, 0, 0), (0.014, 0.032, ph - 0.06), eg_mat, bevel=0.004).parent = rig
    box(f"Edge_Glow_Right_{idx}", (pw / 2 + 0.006, 0, 0), (0.014, 0.032, ph - 0.06), eg_mat, bevel=0.004).parent = rig
    box(f"Edge_Glow_Bottom_{idx}", (0, 0, -ph / 2 - 0.006), (pw - 0.04, 0.032, 0.014), eg_mat, bevel=0.004).parent = rig

    # 3. Internal Luminous UI Display Plane Inside the Glass
    tex_path, _ = pane_tex_info[idx]
    ui_mat = tex_plane_mat(f"Pane_UI_Mat_{idx}", tex_path, emission_strength=1.45)
    ui_plane = add_uv_plane(
        f"Pane_Display_{idx}", pw * 0.90, ph * 0.84, ui_mat,
        loc=(0, -0.004, -0.02), rot=(pi / 2, 0, 0), parent=rig
    )

    # 4. Etched Brass Title-Bar Header Clamped Across the Top of the Glass Pane
    hbar = box(f"Brass_Title_Header_{idx}", (0, 0, ph / 2 + 0.038), (pw + 0.05, 0.085, 0.095), brass, bevel=0.012)
    hbar.parent = rig
    hplate = box(f"Header_Dark_Inlay_{idx}", (0, -0.044, ph / 2 + 0.038), (pw - 0.14, 0.012, 0.058), cast_iron, bevel=0.003)
    hplate.parent = rig
    t_obj = text3d(pane_titles[idx], (0, -0.053, ph / 2 + 0.018), 0.044, brass, rot=(pi / 2, 0, 0), extrude=0.002)
    t_obj.parent = rig
    # Miniature window control rivets on header
    for b_i, bx_off in enumerate((-pw / 2 + 0.06, pw / 2 - 0.06)):
        s_dot = sphere(f"Header_Rivet_{idx}_{b_i}", (bx_off, -0.048, ph / 2 + 0.038), (0.016, 0.012, 0.016), eg_mat if b_i == 1 else steel)
        s_dot.parent = rig

    # 5. Velvet-Padded Brass Clamps + Articulated Vernier Callipers Holding the Pane to the Arc Rail
    for side in (-1, 1):
        cx = side * (pw * 0.34)
        # Upper and lower velvet cushion pads gripping the bottom edge of the glass pane
        vp = box(f"Velvet_Clamp_Pad_{idx}_{side}", (cx, 0, -ph / 2 + 0.032), (0.165, 0.105, 0.095), velvet, bevel=0.012)
        vp.parent = rig
        # Brass clamp jaw around the velvet pad
        bj = box(f"Brass_Clamp_Jaw_{idx}_{side}", (cx, 0, -ph / 2 - 0.018), (0.195, 0.125, 0.10), brass, bevel=0.014)
        bj.parent = rig
        # Knurled brass thumbscrew on the front of the clamp jaw
        ts = cyl(f"Clamp_Thumbscrew_{idx}_{side}", (cx, -0.06, -ph / 2 - 0.018), (cx, -0.125, -ph / 2 - 0.018), 0.032, aged_brass)
        ts.parent = rig

    # Central Vernier Calliper Post & Articulated Knuckle descending from Pane to Arc Rail
    calliper_top = Vector((px, py, pane_z - ph / 2 - 0.05))
    calliper_mid = Vector((px - 0.08 * math.sin(rad), py + 0.16, (pane_z - ph / 2 + RAIL_Z) * 0.5))
    calliper_base = Vector((px, py, RAIL_Z + 0.06))

    # Rail Rider Carriage with Vernier Scale
    box(f"Rail_Carriage_{idx}", (px, py, RAIL_Z + 0.02), (0.28, 0.30, 0.16), aged_brass, bevel=0.015, rot=(0, 0, yaw))
    cyl(f"Vernier_Lock_Knob_{idx}", (px, py - 0.15, RAIL_Z + 0.02), (px, py - 0.23, RAIL_Z + 0.02), 0.045, brass)
    # Dual vernier calliper bars + central lead screw
    cyl(f"Calliper_Lower_Arm_{idx}", calliper_base, calliper_mid, 0.036, steel)
    sphere(f"Calliper_Joint_{idx}", calliper_mid, (0.065, 0.065, 0.065), brass)
    cyl(f"Calliper_Joint_Pin_{idx}", calliper_mid + Vector((-0.08, 0, 0)), calliper_mid + Vector((0.08, 0, 0)), 0.025, aged_brass)
    cyl(f"Calliper_Upper_Arm_{idx}", calliper_mid, calliper_top, 0.032, brass)
    # Graduated vernier scale bar alongside the arm
    cyl(f"Vernier_Scale_Bar_{idx}", calliper_base + Vector((0.055, -0.03, 0)), calliper_top + Vector((0.055, -0.03, 0)), 0.016, steel)


# Central SQLite Workspace Cartridge & Brass Vernier Hub inside the Semicircular Arc
HUB_POS = Vector((0.05, 0.15, 0.24))
box('SQLite Vault Base', (HUB_POS.x, HUB_POS.y, 0.15), (1.35, 0.92, 0.16), cast_iron, bevel=0.025)
box('SQLite Brass Ledger Plate', (HUB_POS.x, HUB_POS.y, 0.26), (1.18, 0.76, 0.08), brass, bevel=0.018)
box('SQLite Dark Face', (HUB_POS.x, HUB_POS.y, 0.305), (1.04, 0.62, 0.02), slate, bevel=0.005)
text3d('WORKSPACE.SQLITE', (HUB_POS.x, HUB_POS.y + 0.08, 0.316), 0.082, brass, rot=(0, 0, 0), extrude=0.003)
text3d('REV 042 · LAYOUT_V1 · ATOMIC', (HUB_POS.x, HUB_POS.y - 0.10, 0.316), 0.052, cream_paper, rot=(0, 0, 0), extrude=0.002)

# Copper/Brass Conduit Tubes radiating from SQLite Hub to the Arc Rail Pillars
for deg in (-52, -26, 0, 26, 52):
    rad = math.radians(deg)
    tx = ARC_CENTER.x + (ARC_RADIUS - 0.12) * math.sin(rad)
    ty = ARC_CENTER.y + (ARC_RADIUS - 0.12) * math.cos(rad)
    mid_x = (HUB_POS.x + tx) * 0.5
    mid_y = (HUB_POS.y + ty) * 0.5
    tube(
        f"SQLite_Conduit_{deg}",
        [(HUB_POS.x + 0.35 * math.sin(rad), HUB_POS.y + 0.25 * math.cos(rad), 0.22),
         (mid_x, mid_y, 0.12),
         (tx, ty, 0.22)],
        0.020, aged_brass
    )


# ==============================================================================
# 3. FOREGROUND RIGHT: THE GATED MUTATION SWITCH & CONCIERGE BELL
#    (Hinged Glass Safety Cover + Miniature Brass Padlock + "MUTATIONS: OPT-IN" Tag)
# ==============================================================================
SW_POS = Vector((2.15, -1.25, 0.08))
SW_ROT = (0, 0, -0.32)

bpy.ops.object.empty_add(location=SW_POS, rotation=SW_ROT)
sw_root = bpy.context.object
sw_root.name = "Gated_Mutation_Switch_Assembly"

# Heavy Cast-Iron & Red-Enamel Switch Base
box('Mutation Switch Cast Iron Plinth', (0, 0, 0.14), (1.48, 1.16, 0.28), cast_iron, bevel=0.035).parent = sw_root
box('Mutation Switch Red Enamel Deck', (0, 0, 0.31), (1.34, 1.02, 0.10), red_enamel, bevel=0.025).parent = sw_root
box('Switch Brass Rim Frame', (0, 0, 0.37), (1.26, 0.94, 0.035), brass, bevel=0.008).parent = sw_root

# Left side inside cover: Ornate Polished Brass Concierge Bell
cyl('Concierge Bell Pedestal', (-0.28, 0.04, 0.38), (-0.28, 0.04, 0.44), 0.26, cast_iron).parent = sw_root
tor('Concierge Bell Base Moulding', (-0.28, 0.04, 0.44), 0.22, 0.025, aged_brass).parent = sw_root
bell_dome = sphere('Concierge Bell Dome', (-0.28, 0.04, 0.46), (0.23, 0.23, 0.19), brass)
bell_dome.parent = sw_root
cyl('Bell Plunger Post', (-0.28, 0.04, 0.62), (-0.28, 0.04, 0.72), 0.026, steel).parent = sw_root
cyl('Bell Plunger Cap', (-0.28, 0.04, 0.72), (-0.28, 0.04, 0.75), 0.065, brass).parent = sw_root

# Right side inside cover: Heavy Guardsman Toggle Switch (`allow_mutations`)
cyl('Toggle Collar', (0.28, 0.04, 0.38), (0.28, 0.04, 0.46), 0.11, brass, vertices=6).parent = sw_root
tor('Toggle Lock Ring', (0.28, 0.04, 0.46), 0.085, 0.018, steel).parent = sw_root
cyl('Toggle Bat Handle', (0.28, 0.04, 0.46), (0.28, -0.08, 0.72), 0.034, steel).parent = sw_root
sphere('Toggle Tip Ball', (0.28, -0.09, 0.74), (0.052, 0.052, 0.052), red_enamel).parent = sw_root

# Hinged Protective Glass Safety Cover over the Bell & Switch
COVER_W, COVER_D, COVER_H = 1.18, 0.86, 0.52
COVER_Z = 0.65
# Top glass plate & 4 side glass plates forming a clear protective lockout box
box('Safety Cover Top Glass', (0, 0.04, COVER_Z + COVER_H / 2), (COVER_W, COVER_D, 0.032), bell_cover_glass, bevel=0.008).parent = sw_root
box('Safety Cover Front Glass', (0, 0.04 - COVER_D / 2, COVER_Z), (COVER_W, 0.032, COVER_H), bell_cover_glass, bevel=0.008).parent = sw_root
box('Safety Cover Back Glass', (0, 0.04 + COVER_D / 2, COVER_Z), (COVER_W, 0.032, COVER_H), bell_cover_glass, bevel=0.008).parent = sw_root
box('Safety Cover Left Glass', (-COVER_W / 2, 0.04, COVER_Z), (0.032, COVER_D, COVER_H), bell_cover_glass, bevel=0.008).parent = sw_root
box('Safety Cover Right Glass', (COVER_W / 2, 0.04, COVER_Z), (0.032, COVER_D, COVER_H), bell_cover_glass, bevel=0.008).parent = sw_root

# Brass Corner Frame Rails & Rear Hinges on the Glass Safety Cover
for sx in (-1, 1):
    for sy in (-1, 1):
        cx = sx * (COVER_W / 2)
        cy = 0.04 + sy * (COVER_D / 2)
        cyl(f"Cover_Corner_Post_{sx}_{sy}", (cx, cy, 0.39), (cx, cy, COVER_Z + COVER_H / 2 + 0.015), 0.024, brass).parent = sw_root
    # Top side brass bars
    cyl(f"Cover_Top_Side_Bar_{sx}", (sx * COVER_W / 2, 0.04 - COVER_D / 2, COVER_Z + COVER_H / 2),
        (sx * COVER_W / 2, 0.04 + COVER_D / 2, COVER_Z + COVER_H / 2), 0.022, brass).parent = sw_root
for sy in (-1, 1):
    cyl(f"Cover_Top_FrontBack_Bar_{sy}", (-COVER_W / 2, 0.04 + sy * COVER_D / 2, COVER_Z + COVER_H / 2),
        (COVER_W / 2, 0.04 + sy * COVER_D / 2, COVER_Z + COVER_H / 2), 0.022, brass).parent = sw_root
    # Rear brass hinge knuckles
    cyl(f"Rear_Hinge_Barrel_{sy}", (sy * 0.36 - 0.08, 0.04 + COVER_D / 2 + 0.02, 0.40),
        (sy * 0.36 + 0.08, 0.04 + COVER_D / 2 + 0.02, 0.40), 0.035, aged_brass).parent = sw_root

# Front Lockout Hasp & Miniature Brass Padlock
box('Cover Hasp Strap', (0.0, 0.04 - COVER_D / 2 - 0.025, 0.46), (0.16, 0.035, 0.22), brass, bevel=0.006).parent = sw_root
tor('Lock Staple Loop', (0.0, 0.04 - COVER_D / 2 - 0.055, 0.39), 0.048, 0.014, steel, rot=(0, pi / 2, 0)).parent = sw_root

# Miniature Heavy Brass Padlock Hanging from the Staple
bpy.ops.object.empty_add(location=(0.0, 0.04 - COVER_D / 2 - 0.08, 0.25), rotation=(0.18, 0.08, 0.0))
padlock = bpy.context.object
padlock.name = "Brass_Padlock"
padlock.parent = sw_root
box('Padlock Brass Body', (0, 0, -0.06), (0.28, 0.13, 0.30), brass, bevel=0.028).parent = padlock
box('Padlock Brass Band', (0, -0.066, -0.06), (0.20, 0.008, 0.20), aged_brass, bevel=0.004).parent = padlock
box('Padlock Keyhole Slot', (0, -0.071, -0.06), (0.028, 0.006, 0.09), cast_iron, bevel=0.002).parent = padlock
# Hardened brass/steel shackle loop
for sx in (-0.075, 0.075):
    cyl(f"Padlock_Shackle_Leg_{sx}", (sx, 0, 0.07), (sx, 0, 0.18), 0.028, brass).parent = padlock
tor('Padlock Shackle Arch', (0, 0, 0.18), 0.075, 0.028, brass, rot=(pi / 2, 0, 0)).parent = padlock

# Stamped Cream Paper Lockout Tag reading "MUTATIONS: OPT-IN" resting beside/attached to the Padlock
tag_mat = tex_plane_mat("Mutations_Tag_Mat", tag_tex_path, emission_strength=0.12)
bpy.ops.object.empty_add(location=(-0.55, -0.66, 0.14), rotation=(0.28, -0.10, 0.18))
tag_rig = bpy.context.object
tag_rig.name = "Mutations_Tag_Rig"
tag_rig.parent = sw_root
box('Cream Tag Card Body', (0, 0, 0), (0.88, 0.42, 0.018), cream_paper, bevel=0.004).parent = tag_rig
add_uv_plane('Cream Tag Printed Face', 0.85, 0.39, tag_mat, loc=(0, 0, 0.011), rot=(0, 0, 0), parent=tag_rig)
tor('Tag Brass Eyelet', (0.36, 0.12, 0.012), 0.036, 0.010, brass).parent = tag_rig
# Brass wire tying tag eyelet to padlock shackle
tube('Tag Lockout Wire', [(-0.22, -0.58, 0.20), (-0.08, -0.52, 0.28), (0.0, -0.46, 0.34)], 0.009, brass).parent = sw_root


# ==============================================================================
# 4. FOREGROUND LEFT: THE PERSISTENT TERMINAL (Amber CRT + Telegraph Ticker +
#    Perforated Paper Tape Spooling into Stoneware Mug "TMUX : PERSISTENT")
# ==============================================================================
TERM_POS = Vector((-2.35, -0.55, 0.08))
TERM_ROT = (0, 0, 0.42)

bpy.ops.object.empty_add(location=TERM_POS, rotation=TERM_ROT)
term_root = bpy.context.object
term_root.name = "Persistent_Terminal_Assembly"

# Lower Brass & Cast-Iron Telegraph Ticker Plinth
box('Ticker Lower Plinth', (0, 0, 0.15), (1.52, 1.24, 0.30), cast_iron, bevel=0.035).parent = term_root
box('Ticker Brass Trim Deck', (0, 0, 0.32), (1.42, 1.14, 0.06), brass, bevel=0.015).parent = term_root

# Compact Warm Vintage Amber CRT Monitor on Top of Plinth
box('CRT Outer Shell', (0, 0.06, 0.84), (1.32, 1.02, 0.96), ivory_case, bevel=0.08).parent = term_root
box('CRT Brass Bezel Frame', (0, -0.43, 0.85), (1.18, 0.08, 0.82), brass, bevel=0.025).parent = term_root
box('CRT Recessed Cavity', (0, -0.45, 0.85), (1.06, 0.06, 0.70), cast_iron, bevel=0.02).parent = term_root

# Glowing Amber CRT Screen Face
crt_mat = tex_plane_mat("Amber_CRT_Mat", crt_tex_path, emission_strength=2.2)
add_uv_plane('Amber CRT Screen', 1.00, 0.66, crt_mat, loc=(0, -0.485, 0.85), rot=(pi / 2, 0, 0), parent=term_root)
# Glass lens cover over CRT
box('CRT Curved Glass Cover', (0, -0.495, 0.85), (1.02, 0.018, 0.68), bell_cover_glass, bevel=0.006).parent = term_root

# Brass Telegraph Ticker Spool Wheel Mounted on the Side/Front of the Plinth
cyl('Ticker Reel Axle', (0.62, -0.25, 0.52), (0.88, -0.25, 0.52), 0.038, steel).parent = term_root
for rx in (0.68, 0.82):
    cyl(f"Ticker_Reel_Flange_{rx}", (rx, -0.25, 0.52), (rx + 0.018, -0.25, 0.52), 0.24, brass).parent = term_root
cyl('Ticker Paper Core', (0.69, -0.25, 0.52), (0.81, -0.25, 0.52), 0.16, cream_paper).parent = term_root
# Indicator Jewel on Terminal Front
sphere('Amber Terminal Pilot LED', (-0.46, -0.57, 0.20), (0.035, 0.035, 0.035), glow_amber).parent = term_root
tor('Pilot Bezel', (-0.46, -0.57, 0.20), 0.042, 0.010, brass, rot=(pi / 2, 0, 0)).parent = term_root

# Miniature Glazed Stoneware Mug in Foreground Left receiving the Continuous Paper Tape
MUG_POS = Vector((-1.42, -1.62, 0.0))
# Cork / Brass Coaster
cyl('Mug Brass Coaster', (MUG_POS.x, MUG_POS.y, 0.005), (MUG_POS.x, MUG_POS.y, 0.042), 0.46, aged_brass)
# Revolved Hollow Stoneware Mug
mug_profile = [
    (0.0, 0.045), (0.34, 0.045), (0.37, 0.08), (0.38, 0.68),
    (0.39, 0.74), (0.35, 0.75), (0.33, 0.68), (0.31, 0.11), (0.0, 0.11)
]
m_verts = [
    (MUG_POS.x + r * cos(i * 2 * pi / 64), MUG_POS.y + r * sin(i * 2 * pi / 64), z)
    for r, z in mug_profile for i in range(64)
]
m_faces = [
    (j * 64 + i, j * 64 + (i + 1) % 64, (j + 1) * 64 + (i + 1) % 64, (j + 1) * 64 + i)
    for j in range(len(mug_profile) - 1) for i in range(64)
]
m_mesh = bpy.data.meshes.new('Stoneware_Mug_Mesh')
m_mesh.from_pydata(m_verts, [], m_faces)
m_mesh.update()
mug_obj = bpy.data.objects.new('Stoneware Mug', m_mesh)
bpy.context.collection.objects.link(mug_obj)
finish(mug_obj, 'Stoneware Mug', stoneware)

# Mug Handle
tor('Stoneware Mug Handle', (MUG_POS.x - 0.38, MUG_POS.y, 0.40), 0.17, 0.045, stoneware, rot=(pi / 2, 0, 0))
cyl('Dark Coffee Inside Mug', (MUG_POS.x, MUG_POS.y, 0.56), (MUG_POS.x, MUG_POS.y, 0.58), 0.32, coffee_mat)

# Curved Brass Plaque on the Front of the Mug: "TMUX : PERSISTENT"
box('Mug Brass Plaque', (MUG_POS.x, MUG_POS.y - 0.375, 0.39), (0.50, 0.03, 0.20), brass, bevel=0.008)
box('Mug Plaque Inset', (MUG_POS.x, MUG_POS.y - 0.388, 0.39), (0.45, 0.01, 0.15), cast_iron, bevel=0.003)
text3d('TMUX', (MUG_POS.x, MUG_POS.y - 0.396, 0.405), 0.068, brass, rot=(pi / 2, 0, 0), extrude=0.002)
text3d('PERSISTENT', (MUG_POS.x, MUG_POS.y - 0.396, 0.335), 0.042, cream_paper, rot=(pi / 2, 0, 0), extrude=0.002)

# Continuous Perforated Paper Tape Unspooling from the Ticker into the Stoneware Mug
tape_ctrl = [
    Vector((-1.78, -0.82, 0.58)),
    Vector((-1.62, -1.02, 0.78)),
    Vector((-1.45, -1.18, 0.96)),
    Vector((-1.32, -1.36, 0.88)),
    Vector((-1.48, -1.48, 0.72)),
    Vector((-1.36, -1.58, 0.86)),
    Vector((-1.40, -1.62, 0.68)),
    Vector((-1.44, -1.60, 0.59)),
]


def catmull_rom(p0, p1, p2, p3, t):
    return 0.5 * (
        (2.0 * p1)
        + (-p0 + p2) * t
        + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * (t * t)
        + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * (t * t * t)
    )


tape_pts = []
for i in range(len(tape_ctrl) - 1):
    for j in range(18):
        tape_pts.append(catmull_rom(
            tape_ctrl[max(0, i - 1)],
            tape_ctrl[i],
            tape_ctrl[i + 1],
            tape_ctrl[min(len(tape_ctrl) - 1, i + 2)],
            j / 18.0
        ))

t_verts = []
t_faces = []
tape_half_w = 0.115
for i, pt in enumerate(tape_pts):
    tang = (tape_pts[min(i + 1, len(tape_pts) - 1)] - tape_pts[max(0, i - 1)]).normalized()
    side_v = Vector((cos(0.42), sin(0.42), 0.15 * sin(i * 0.08))).normalized()
    t_verts.extend([pt - side_v * tape_half_w, pt + side_v * tape_half_w])
for i in range(len(tape_pts) - 1):
    t_faces.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))

t_mesh = bpy.data.meshes.new('Perforated_Paper_Tape')
t_mesh.from_pydata(t_verts, [], t_faces)
t_mesh.update()
tape_obj = bpy.data.objects.new('Perforated Paper Tape', t_mesh)
bpy.context.collection.objects.link(tape_obj)
finish(tape_obj, 'Perforated Paper Tape', cream_paper)
sol = tape_obj.modifiers.new('Thickness', 'SOLIDIFY')
sol.thickness = 0.008

# Punched telegraph holes & dark ink ticks along the paper tape
for i in range(4, len(tape_pts) - 6, 4):
    pt = tape_pts[i]
    side_v = Vector((cos(0.42), sin(0.42), 0.0)).normalized()
    for s_mul in (-0.82, 0.0, 0.82):
        hp = pt + side_v * (tape_half_w * s_mul) + Vector((0, 0, 0.006))
        r_dot = 0.010 if s_mul != 0.0 else 0.022
        sphere(f"Tape_Punch_{i}_{s_mul}", hp, (r_dot, r_dot * 0.5, 0.004), dark_ink)


# ==============================================================================
# 5. STUDIO BACKDROP & DRAMATIC TUNGSTEN / SLATE LIGHTING
# ==============================================================================
wall_mat = mat('Dark Slate Studio Backdrop', (0.024, 0.032, 0.046), metal=0.1, rough=0.82, bump_strength=0.14, bump_scale=90.0)
box('Studio Rear Wall', (0, 3.2, 2.4), (16.0, 0.25, 8.0), wall_mat, bevel=0.02)
for wx in (-3.2, -1.6, 0.0, 1.6, 3.2):
    box('Studio Wall Brass Pilaster', (wx, 3.06, 2.4), (0.04, 0.04, 7.5), aged_brass, bevel=0.005)


def add_area_light(name, loc, energy, color, size, target, shape='DISK', size_y=None):
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


# Warm tungsten key light from upper-left raking across the curved brass arc and glass panes
add_area_light('Warm Tungsten Key', (-4.2, -3.6, 5.2), 620, (1.0, 0.80, 0.56), 3.4, (0.0, -0.2, 1.1))
# Cool slate fill from the right
add_area_light('Cool Slate Right Fill', (4.8, -2.8, 3.8), 340, (0.56, 0.76, 1.0), 3.2, (0.2, -0.4, 1.0))
# High warm brass rim light behind the arc to make glass bevels and callipers gleam
add_area_light('Warm Optical Rim', (0.5, 2.6, 4.6), 540, (1.0, 0.74, 0.44), 3.8, (0.0, -0.4, 1.2), shape='RECTANGLE', size_y=1.6)
# Overhead specular strip reflection for the mahogany workbench & glass safety cover
add_area_light('Overhead Specular Strip', (-0.4, -1.2, 5.8), 260, (1.0, 0.92, 0.80), 4.2, (0.0, -0.5, 0.8), shape='RECTANGLE', size_y=1.2)
# Subtle warm foreground bounce for padlock, tag, and mug
add_area_light('Foreground Detail Fill', (0.8, -4.5, 1.8), 110, (1.0, 0.85, 0.68), 2.5, (0.4, -1.2, 0.5))

# Warm internal bounce point lights near CRT and Arc Center
bpy.ops.object.light_add(type='POINT', location=(-1.85, -1.05, 0.95))
pt_crt = bpy.context.object
pt_crt.name = "Amber_CRT_Spill"
pt_crt.data.energy = 18.0
pt_crt.data.color = (1.0, 0.58, 0.14)
pt_crt.data.shadow_soft_size = 0.35

bpy.ops.object.light_add(type='POINT', location=(0.05, -0.25, 1.45))
pt_arc = bpy.context.object
pt_arc.name = "Arc_Glass_Caustic_Glow"
pt_arc.data.energy = 24.0
pt_arc.data.color = (0.55, 0.88, 0.95)
pt_arc.data.shadow_soft_size = 0.65

# Camera Setup: Balanced 3/4 Elevated Tabletop Framing
bpy.ops.object.camera_add(location=(0.22, -6.35, 3.15))
cam = bpy.context.object
cam.name = "Editorial_Camera"
cam_target = Vector((0.02, -0.38, 0.92))
cam.rotation_euler = (cam_target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 47.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.05, -0.75, 1.15)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

# Render & Save
png_path = TMP / ('preview.png' if WIDTH < 1600 else 'final.png')
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get('OUTPUT', str(ROOT / 'concierge-of-the-curved-arc.webp')))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert('RGB').save(webp_out, 'WEBP', quality=92, method=6)
print(f"FINISHED {webp_out} ({WIDTH}x{HEIGHT}, samples={SAMPLES})", flush=True)
