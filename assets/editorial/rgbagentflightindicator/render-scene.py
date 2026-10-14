"""Peripheral-Vision Control Tower — original editorial exaggeration for RGBAgentFlightIndicator.
Run with the cached bpy 5.2.2 module and Pillow. All geometry and shaders are original/procedural.
"""
import os
import math
import random
from pathlib import Path
from math import sin, cos, pi
import bpy
from mathutils import Vector
from PIL import Image

random.seed(107)

OUT_DIR = Path(__file__).resolve().parent
TMP_DIR = Path("/tmp/opencode/rgbagentflightindicator-blender")
TMP_DIR.mkdir(parents=True, exist_ok=True)

SAMPLES = int(os.environ.get("SAMPLES", "64"))
WIDTH = int(os.environ.get("WIDTH", "1600"))
HEIGHT = int(round(WIDTH * 0.75))

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.render.threads_mode = "FIXED"
scene.render.threads = 2
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x = WIDTH
scene.render.resolution_y = HEIGHT
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "AgX"

bg = scene.world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.018, 0.014, 0.024, 1.0)
bg.inputs[1].default_value = 0.35


def make_mat(
    name,
    color,
    metal=0.0,
    rough=0.35,
    coat=0.15,
    noise_scale=160.0,
    bump_strength=0.12,
    voronoi_scale=0.0,
    subsurface=0.0,
    transmission=0.0,
    ior=1.48,
    emission=None,
    emission_strength=0.0,
):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    nodes = m.node_tree.nodes
    links = m.node_tree.links
    p = nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["IOR"].default_value = ior
    if subsurface > 0:
        p.inputs["Subsurface Weight"].default_value = subsurface
    if transmission > 0:
        p.inputs["Transmission Weight"].default_value = transmission
    if emission is not None and emission_strength > 0:
        p.inputs["Emission Color"].default_value = (*emission, 1.0)
        p.inputs["Emission Strength"].default_value = emission_strength

    if bump_strength > 0:
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = noise_scale
        noise.inputs["Detail"].default_value = 4.0
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = bump_strength
        bump.inputs["Distance"].default_value = 0.012
        if voronoi_scale > 0:
            vor = nodes.new("ShaderNodeTexVoronoi")
            vor.inputs["Scale"].default_value = voronoi_scale
            mix = nodes.new("ShaderNodeMix")
            mix.data_type = "FLOAT"
            mix.inputs["Factor"].default_value = 0.45
            links.new(noise.outputs["Fac"], mix.inputs[2])
            links.new(vor.outputs["Distance"], mix.inputs[3])
            links.new(mix.outputs[0], bump.inputs["Height"])
        else:
            links.new(noise.outputs["Fac"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


# Materials
brass = make_mat(
    "Heavy cast & brushed brass",
    (0.64, 0.43, 0.15),
    metal=0.88,
    rough=0.24,
    coat=0.12,
    noise_scale=210.0,
    bump_strength=0.08,
)
aged_brass = make_mat(
    "Aged dark bezel brass",
    (0.42, 0.27, 0.09),
    metal=0.84,
    rough=0.33,
    coat=0.10,
    noise_scale=140.0,
    bump_strength=0.12,
)
copper = make_mat(
    "Switch contact copper",
    (0.72, 0.31, 0.16),
    metal=0.90,
    rough=0.22,
    noise_scale=180.0,
    bump_strength=0.06,
)
silver = make_mat(
    "Polished silver service bell",
    (0.84, 0.86, 0.89),
    metal=0.95,
    rough=0.14,
    coat=0.2,
    noise_scale=240.0,
    bump_strength=0.04,
)
crinkle_steel = make_mat(
    "Matte black crinkle-enamel steel",
    (0.032, 0.035, 0.042),
    metal=0.28,
    rough=0.52,
    coat=0.18,
    noise_scale=190.0,
    bump_strength=0.28,
    voronoi_scale=165.0,
)
obsidian_key = make_mat(
    "Lane 01 matte obsidian PBT keycap",
    (0.022, 0.024, 0.030),
    metal=0.05,
    rough=0.44,
    coat=0.15,
    noise_scale=220.0,
    bump_strength=0.16,
    voronoi_scale=180.0,
)
emerald_key = make_mat(
    "Lane 02 glowing emerald translucent keycap",
    (0.04, 0.78, 0.28),
    metal=0.0,
    rough=0.18,
    coat=0.65,
    noise_scale=160.0,
    bump_strength=0.05,
    subsurface=0.25,
    transmission=0.62,
    ior=1.52,
    emission=(0.06, 0.95, 0.34),
    emission_strength=3.8,
)
alabaster_key = make_mat(
    "Lane 03 frosted alabaster keycap",
    (0.95, 0.92, 0.84),
    metal=0.0,
    rough=0.22,
    coat=0.45,
    noise_scale=180.0,
    bump_strength=0.06,
    subsurface=0.45,
    transmission=0.42,
    ior=1.49,
    emission=(1.0, 0.94, 0.82),
    emission_strength=3.0,
)
ruby_key = make_mat(
    "Lane 04 urgent ruby-red keycap",
    (0.88, 0.03, 0.04),
    metal=0.0,
    rough=0.16,
    coat=0.72,
    noise_scale=160.0,
    bump_strength=0.05,
    subsurface=0.22,
    transmission=0.64,
    ior=1.54,
    emission=(1.0, 0.05, 0.04),
    emission_strength=5.2,
)
fresnel_glass = make_mat(
    "Fresnel lighthouse ruby lens glass",
    (0.92, 0.04, 0.04),
    metal=0.0,
    rough=0.07,
    coat=0.9,
    bump_strength=0.0,
    transmission=0.86,
    ior=1.56,
    emission=(1.0, 0.06, 0.03),
    emission_strength=3.2,
)
beacon_core = make_mat(
    "Incandescent ruby-amber lighthouse core",
    (1.0, 0.16, 0.05),
    metal=0.0,
    rough=0.1,
    bump_strength=0.0,
    emission=(1.0, 0.10, 0.03),
    emission_strength=18.0,
)
porcelain = make_mat(
    "Articulated ivory porcelain mannequin hand",
    (0.89, 0.83, 0.73),
    metal=0.0,
    rough=0.20,
    coat=0.55,
    noise_scale=140.0,
    bump_strength=0.06,
    voronoi_scale=95.0,
    subsurface=0.18,
)
flag_red = make_mat(
    "Semaphore signal crimson enamel",
    (0.78, 0.05, 0.05),
    metal=0.05,
    rough=0.26,
    coat=0.4,
    noise_scale=150.0,
    bump_strength=0.07,
)
flag_white = make_mat(
    "Semaphore signal cream enamel",
    (0.92, 0.89, 0.81),
    metal=0.0,
    rough=0.26,
    coat=0.4,
    noise_scale=150.0,
    bump_strength=0.07,
)
braid_cloth = make_mat(
    "Braided cloth USB HID sleeve",
    (0.08, 0.06, 0.055),
    metal=0.0,
    rough=0.68,
    coat=0.05,
    noise_scale=320.0,
    bump_strength=0.32,
    voronoi_scale=260.0,
)
clear_switch = make_mat(
    "Polycarbonate switch housing",
    (0.78, 0.86, 0.88),
    metal=0.0,
    rough=0.12,
    coat=0.5,
    bump_strength=0.02,
    transmission=0.82,
    ior=1.58,
)
backdrop_mat = make_mat(
    "Darkroom plum-charcoal backdrop",
    (0.022, 0.018, 0.028),
    metal=0.0,
    rough=0.78,
    coat=0.05,
    noise_scale=90.0,
    bump_strength=0.12,
)

# Oiled walnut with longitudinal wood grain
walnut = make_mat(
    "Oiled dark American walnut",
    (0.14, 0.058, 0.024),
    metal=0.0,
    rough=0.29,
    coat=0.38,
    noise_scale=120.0,
    bump_strength=0.18,
)
wnodes = walnut.node_tree.nodes
wlinks = walnut.node_tree.links
wp = wnodes.get("Principled BSDF")
wcoord = wnodes.new("ShaderNodeTexCoord")
wmap = wnodes.new("ShaderNodeVectorMath")
wmap.operation = "MULTIPLY"
wmap.inputs[1].default_value = (1.8, 42.0, 8.0)
wnoise = wnodes.new("ShaderNodeTexNoise")
wnoise.inputs["Scale"].default_value = 3.6
wnoise.inputs["Detail"].default_value = 6.0
wnoise.inputs["Roughness"].default_value = 0.72
wramp = wnodes.new("ShaderNodeValToRGB")
wramp.color_ramp.elements[0].position = 0.18
wramp.color_ramp.elements[0].color = (0.042, 0.016, 0.007, 1.0)
wramp.color_ramp.elements[1].position = 0.82
wramp.color_ramp.elements[1].color = (0.21, 0.088, 0.036, 1.0)
wlinks.new(wcoord.outputs["Generated"], wmap.inputs[0])
wlinks.new(wmap.outputs[0], wnoise.inputs["Vector"])
wlinks.new(wnoise.outputs["Fac"], wramp.inputs["Fac"])
wlinks.new(wramp.outputs["Color"], wp.inputs["Base Color"])


# Geometry helpers
def finish(obj, name, mat_obj):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = mat_obj
    else:
        obj.data.materials.append(mat_obj)
    if hasattr(obj.data, "polygons"):
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def add_box(name, loc, dims, mat_obj, bevel=0.025, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    o = bpy.context.object
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = o.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
        o.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    return finish(o, name, mat_obj)


def add_cyl(name, a, b, radius, mat_obj, vertices=48, bevel=0.01):
    va, vb = Vector(a), Vector(b)
    diff = vb - va
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=diff.length,
        location=(va + vb) * 0.5,
    )
    o = bpy.context.object
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = diff.to_track_quat("Z", "Y")
    if bevel > 0:
        mod = o.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        o.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    return finish(o, name, mat_obj)


def add_sphere(name, loc, scale, mat_obj, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=48, ring_count=24, radius=1.0, location=loc, rotation=rot
    )
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, mat_obj)


def add_torus(name, loc, major_r, minor_r, mat_obj, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=64,
        minor_segments=16,
        major_radius=major_r,
        minor_radius=minor_r,
        location=loc,
        rotation=rot,
    )
    return finish(bpy.context.object, name, mat_obj)


def add_tube(name, pts, radius, mat_obj):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 20
    curve.bevel_depth = radius
    curve.bevel_resolution = 5
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(pts) - 1)
    for bp, co in zip(spline.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat_obj)


def add_text(name, body, loc, size, mat_obj, rot=(0, 0, 0), align="CENTER", extrude=0.004):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = 0.001
    o.data.align_x = align
    o.data.align_y = "CENTER"
    return finish(o, name, mat_obj)


def add_keycap(name, cx, cy, cz, mat_obj, tilt=0.0):
    """High-profile sculpted SA/MT3 mechanical keycap with spherical top dish."""
    nx = 24
    w_bot, d_bot = 0.94, 0.94
    w_top, d_top = 0.68, 0.68
    h = 0.54
    verts = []
    faces = []
    rings = 10
    for r_idx in range(rings):
        t = r_idx / (rings - 1)
        s = t ** 0.85
        wx = (w_bot * (1 - s) + w_top * s) * 0.5
        dy = (d_bot * (1 - s) + d_top * s) * 0.5
        z_ring = t * h
        for i in range(nx):
            ang = 2.0 * pi * i / nx
            ca, sa = cos(ang), sin(ang)
            rx = math.copysign(abs(ca) ** 0.55, ca) * wx
            ry = math.copysign(abs(sa) ** 0.55, sa) * dy
            dish = 0.0
            if r_idx == rings - 1:
                dish = -0.045 * (1.0 - 0.5 * ((rx / wx) ** 2 + (ry / dy) ** 2))
            verts.append((rx, ry, z_ring + dish))
    for r_idx in range(rings - 1):
        for i in range(nx):
            i_next = (i + 1) % nx
            a = r_idx * nx + i
            b = r_idx * nx + i_next
            c = (r_idx + 1) * nx + i_next
            d = (r_idx + 1) * nx + i
            faces.append((a, b, c, d))
    top_center_idx = len(verts)
    verts.append((0.0, 0.0, h - 0.062))
    top_ring_start = (rings - 1) * nx
    for i in range(nx):
        i_next = (i + 1) % nx
        faces.append((top_ring_start + i, top_ring_start + i_next, top_center_idx))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = (cx, cy, cz)
    obj.rotation_euler = (tilt, 0.0, 0.0)
    mod = obj.modifiers.new("SmoothSubd", "SUBSURF")
    mod.levels = 2
    mod.render_levels = 2
    return finish(obj, name, mat_obj)


# 1. Studio Walnut Surface & Darkroom Backdrop
add_box("Oiled walnut control desk", (0.0, 0.0, -0.18), (18.0, 12.0, 0.36), walnut, bevel=0.04)
add_box("Darkroom studio backdrop", (0.0, 3.8, 3.2), (18.0, 0.25, 8.0), backdrop_mat, bevel=0.02)
for k in range(-4, 5):
    add_box(
        f"Backdrop acoustic rib {k}",
        (k * 1.4, 3.65, 3.2),
        (0.08, 0.08, 7.5),
        crinkle_steel,
        bevel=0.01,
    )

# 2. Over-Built Aviation / Nuclear Control-Desk Annunciator Housing
add_box("Walnut annunciator plinth", (0.0, 0.12, 0.16), (6.50, 2.75, 0.32), walnut, bevel=0.045)
add_box("Cast brass base frame", (0.0, 0.12, 0.34), (6.26, 2.52, 0.10), aged_brass, bevel=0.025)

for sx in [-1, 1]:
    for sy in [-1, 1]:
        bx, by = sx * 3.00, 0.12 + sy * 1.15
        add_box("Corner brass gusset", (bx, by, 0.36), (0.34, 0.34, 0.14), brass, bevel=0.02)
        add_cyl("Corner machine bolt", (bx, by, 0.38), (bx, by, 0.47), 0.065, brass, vertices=6)
        add_box("Bolt slot", (bx, by, 0.472), (0.08, 0.016, 0.012), crinkle_steel, bevel=0.002)

add_box(
    "Crinkle-enamel steel console hull",
    (0.0, 0.13, 0.66),
    (6.00, 2.30, 0.62),
    crinkle_steel,
    bevel=0.055,
    rot=(0.08, 0.0, 0.0),
)

for sx in [-1, 1]:
    for lv in range(5):
        add_box(
            f"Side louver {sx}_{lv}",
            (sx * 3.01, -0.18 + lv * 0.22, 0.66 + lv * 0.015),
            (0.06, 0.12, 0.32),
            aged_brass,
            bevel=0.008,
        )
    hx = sx * 3.05
    add_tube(
        f"Side brass grab handle {sx}",
        [(hx, -0.45, 0.62), (hx + sx * 0.22, -0.45, 0.62), (hx + sx * 0.22, 0.58, 0.68), (hx, 0.58, 0.68)],
        0.046,
        brass,
    )

add_box(
    "Machined cast brass switchboard deck",
    (0.0, 0.11, 0.98),
    (5.72, 2.02, 0.14),
    brass,
    bevel=0.03,
    rot=(0.08, 0.0, 0.0),
)

add_box(
    "Rear avionics caution hood",
    (0.0, 0.84, 1.34),
    (5.68, 0.56, 0.62),
    crinkle_steel,
    bevel=0.04,
    rot=(0.08, 0.0, 0.0),
)
add_box(
    "Caution hood brass faceplate",
    (0.0, 0.56, 1.36),
    (5.48, 0.08, 0.48),
    aged_brass,
    bevel=0.015,
    rot=(0.08, 0.0, 0.0),
)
add_text(
    "Master header text",
    "PERIPHERAL-VISION CONTROL TOWER  ·  AGENT ANNUNCIATOR",
    (0.0, 0.505, 1.50),
    0.105,
    crinkle_steel,
    rot=(pi / 2 - 0.08, 0.0, 0.0),
    extrude=0.006,
)

# 3. The Four Monumental Keycap Lanes
lane_xs = [-2.02, -0.67, 0.67, 2.02]
lane_specs = [
    ("01 · IDLE", "DARK / OFF", obsidian_key),
    ("02 · WORKING", "GREEN / ACTIVE", emerald_key),
    ("03 · DONE", "WHITE / REVIEW", alabaster_key),
    ("04 · BLOCKED", "RED / INPUT", ruby_key),
]

for idx, (lx, (label_top, label_sub, kmat)) in enumerate(zip(lane_xs, lane_specs)):
    add_box(
        f"Lane {idx+1} brass bezel collar",
        (lx, 0.02, 1.05),
        (1.18, 1.18, 0.12),
        aged_brass,
        bevel=0.025,
        rot=(0.08, 0.0, 0.0),
    )
    add_box(
        f"Lane {idx+1} dark switch well recess",
        (lx, 0.02, 1.07),
        (1.02, 1.02, 0.10),
        crinkle_steel,
        bevel=0.015,
        rot=(0.08, 0.0, 0.0),
    )
    for rx in [-0.48, 0.48]:
        for ry in [-0.48, 0.48]:
            add_sphere(
                f"Bezel rivet {idx}_{rx}_{ry}",
                (lx + rx, 0.02 + ry, 1.11 + ry * 0.08),
                (0.028, 0.028, 0.018),
                brass,
            )

    add_box(
        f"Switch lower housing {idx+1}",
        (lx, 0.02, 1.16),
        (0.76, 0.76, 0.18),
        clear_switch,
        bevel=0.015,
        rot=(0.08, 0.0, 0.0),
    )
    for sp in range(4):
        add_torus(
            f"Switch coil spring {idx+1}_{sp}",
            (lx, 0.02, 1.14 + sp * 0.035),
            0.18,
            0.014,
            brass,
            rot=(0.08, 0.0, 0.0),
        )
    add_box(
        f"Copper contact leaf {idx+1}",
        (lx - 0.28, -0.16, 1.18),
        (0.04, 0.22, 0.16),
        copper,
        bevel=0.005,
        rot=(0.08, 0.0, 0.0),
    )

    add_box(
        f"Lane {idx+1} front plaque",
        (lx, -0.75, 0.99),
        (1.12, 0.28, 0.06),
        crinkle_steel,
        bevel=0.01,
        rot=(0.24, 0.0, 0.0),
    )
    add_text(
        f"Lane {idx+1} plaque text",
        label_top,
        (lx, -0.76, 1.028),
        0.105,
        brass,
        rot=(0.24, 0.0, 0.0),
        extrude=0.004,
    )

    add_box(
        f"Lane {idx+1} hood plaque",
        (lx, 0.51, 1.24),
        (1.10, 0.04, 0.18),
        crinkle_steel,
        bevel=0.008,
        rot=(pi / 2 - 0.08, 0.0, 0.0),
    )
    add_text(
        f"Lane {idx+1} hood text",
        label_sub,
        (lx, 0.485, 1.24),
        0.082,
        brass,
        rot=(pi / 2 - 0.08, 0.0, 0.0),
        extrude=0.003,
    )

    kz = 1.16 if idx != 3 else 1.12
    add_keycap(f"Monumental Keycap {idx+1}", lx, 0.02, kz, kmat, tilt=0.08)


# --- LANE 01 (IDLE, x = -2.02): Sleeping brass shutter over its top lens ---
l1x, l1y, l1z = -2.02, 0.02, 1.66
add_torus("Lane 01 brass shutter bezel", (l1x, l1y, l1z), 0.25, 0.032, brass, rot=(0.08, 0.0, 0.0))
for side in [-1, 1]:
    add_box(
        f"Sleeping brass shutter leaf {side}",
        (l1x, l1y + side * 0.105, l1z + 0.015),
        (0.42, 0.195, 0.032),
        aged_brass,
        bevel=0.008,
        rot=(0.08 + side * 0.04, 0.0, 0.0),
    )
    add_cyl(
        f"Shutter hinge pin {side}",
        (l1x - 0.24, l1y + side * 0.105, l1z + 0.02),
        (l1x + 0.24, l1y + side * 0.105, l1z + 0.02),
        0.014,
        brass,
    )
add_torus("Shutter pull ring", (l1x, l1y - 0.05, l1z + 0.045), 0.045, 0.009, brass, rot=(0.4, 0.0, 0.0))


# --- LANE 02 (WORKING, x = -0.67): Spinning brass fly-ball governor & pressure gauge ---
l2x, l2y, l2z = -0.67, 0.02, 1.66
add_cyl("Governor base boss", (l2x - 0.08, l2y, l2z - 0.04), (l2x - 0.08, l2y, l2z + 0.08), 0.13, brass)
add_cyl("Governor central spindle", (l2x - 0.08, l2y, l2z + 0.06), (l2x - 0.08, l2y, l2z + 0.68), 0.028, silver)
add_sphere("Governor spindle finial", (l2x - 0.08, l2y, l2z + 0.71), (0.055, 0.055, 0.065), brass)
add_cyl("Governor sliding sleeve", (l2x - 0.08, l2y, l2z + 0.25), (l2x - 0.08, l2y, l2z + 0.34), 0.052, brass)
for side in [-1, 1]:
    gx = l2x - 0.08 + side * 0.26
    gy = l2y + side * 0.04
    gz = l2z + 0.44
    add_cyl("Governor upper arm", (l2x - 0.08, l2y, l2z + 0.64), (gx, gy, gz), 0.015, brass)
    add_cyl("Governor lower link", (l2x - 0.08, l2y, l2z + 0.29), (gx * 0.6 + (l2x - 0.08) * 0.4, gy, gz - 0.08), 0.012, silver)
    add_sphere(f"Spinning brass fly-ball {side}", (gx, gy, gz), (0.095, 0.095, 0.095), brass)

px, py, pz = l2x + 0.22, l2y - 0.12, l2z + 0.24
add_cyl("Gauge stem", (px, py, l2z - 0.02), (px, py, pz - 0.12), 0.026, brass)
add_cyl("Pressure gauge brass case", (px, py - 0.03, pz), (px, py + 0.04, pz), 0.145, brass)
add_cyl("Pressure gauge porcelain dial", (px, py - 0.036, pz), (px, py - 0.025, pz), 0.122, porcelain)
add_torus("Pressure gauge bezel", (px, py - 0.035, pz), 0.135, 0.016, aged_brass, rot=(pi / 2, 0.0, 0.0))
add_box("Pressure gauge needle", (px + 0.025, py - 0.042, pz + 0.025), (0.09, 0.008, 0.014), flag_red, bevel=0.002, rot=(0.0, -0.65, 0.0))
for tk in range(7):
    ang = -0.75 * pi + tk * (1.5 * pi / 6)
    add_box(
        f"Gauge tick {tk}",
        (px + 0.095 * sin(ang), py - 0.039, pz + 0.095 * cos(ang)),
        (0.012, 0.006, 0.024),
        crinkle_steel,
        bevel=0.001,
        rot=(0.0, ang, 0.0),
    )


# --- LANE 03 (DONE, x = 0.67): Calm ivory keycap + Silver Service Bell ---
l3x, l3y, l3z = 0.67, 0.02, 1.66
add_torus("Lane 03 ivory crown ring", (l3x, l3y, l3z + 0.01), 0.19, 0.022, silver, rot=(0.08, 0.0, 0.0))
add_sphere("Lane 03 calm pearl dome", (l3x, l3y, l3z + 0.02), (0.14, 0.14, 0.06), alabaster_key)

bell_x, bell_y, bell_z = 0.91, -0.54, 1.07
add_cyl("Service bell brass base", (bell_x, bell_y, bell_z), (bell_x, bell_y, bell_z + 0.045), 0.24, aged_brass)
add_torus("Service bell base moulding", (bell_x, bell_y, bell_z + 0.045), 0.22, 0.018, brass)
bell_dome = add_sphere("Silver service bell dome", (bell_x, bell_y, bell_z + 0.06), (0.21, 0.21, 0.165), silver)
for v in bell_dome.data.vertices:
    if v.co.z < 0.0:
        v.co.z = 0.0
add_cyl("Bell striker post", (bell_x, bell_y, bell_z + 0.21), (bell_x, bell_y, bell_z + 0.275), 0.022, brass)
add_cyl("Bell top button", (bell_x, bell_y, bell_z + 0.275), (bell_x, bell_y, bell_z + 0.30), 0.052, silver)


# --- LANE 04 (BLOCKED / HUMAN NEEDED, x = 2.02):
# Ruby-red keycap + Lighthouse Fresnel Beacon + Striped Semaphore Flag + Poised Porcelain Hand ---
l4x, l4y, l4z = 2.02, 0.02, 1.62
add_cyl("Beacon brass gallery base", (l4x, l4y, l4z - 0.03), (l4x, l4y, l4z + 0.05), 0.26, brass)
add_torus("Beacon gallery railing", (l4x, l4y, l4z + 0.06), 0.25, 0.016, aged_brass)
add_sphere("Lighthouse incandescent core", (l4x, l4y, l4z + 0.24), (0.11, 0.11, 0.15), beacon_core)

for fr_idx, (rz, rr, mr) in enumerate([
    (0.11, 0.19, 0.032),
    (0.18, 0.21, 0.034),
    (0.25, 0.22, 0.036),
    (0.32, 0.21, 0.034),
    (0.39, 0.18, 0.030),
]):
    add_torus(f"Fresnel lens ring {fr_idx}", (l4x, l4y, l4z + rz), rr, mr, fresnel_glass)
add_sphere("Fresnel upper dome lens", (l4x, l4y, l4z + 0.41), (0.17, 0.17, 0.12), fresnel_glass)

for st in range(6):
    ang = st * 2.0 * pi / 6.0
    sx, sy = l4x + 0.225 * cos(ang), l4y + 0.225 * sin(ang)
    add_cyl(f"Lantern cage strut {st}", (sx, sy, l4z + 0.05), (sx * 0.98 + l4x * 0.02, sy * 0.98 + l4y * 0.02, l4z + 0.45), 0.012, brass)
add_cyl("Lighthouse cupola rim", (l4x, l4y, l4z + 0.45), (l4x, l4y, l4z + 0.48), 0.22, aged_brass)
cupola = add_sphere("Lighthouse brass cupola", (l4x, l4y, l4z + 0.47), (0.20, 0.20, 0.11), brass)
for v in cupola.data.vertices:
    if v.co.z < 0.0:
        v.co.z = 0.0
add_cyl("Lighthouse lightning finial", (l4x, l4y, l4z + 0.57), (l4x, l4y, l4z + 0.69), 0.014, brass)
add_sphere("Lighthouse finial ball", (l4x, l4y, l4z + 0.63), (0.032, 0.032, 0.032), brass)

# Raised Red-and-White Striped Semaphore Flag on Lane 04's right shoulder
mast_x, mast_y, mast_z = l4x + 0.44, l4y + 0.22, 1.12
add_cyl("Semaphore mast bracket", (mast_x, mast_y, mast_z), (mast_x, mast_y, mast_z + 0.12), 0.065, aged_brass)
add_cyl("Semaphore brass mast", (mast_x, mast_y, mast_z + 0.08), (mast_x, mast_y, mast_z + 0.98), 0.024, brass)
add_sphere("Semaphore pivot hub", (mast_x, mast_y, mast_z + 0.92), (0.05, 0.05, 0.05), brass)
add_cyl("Semaphore counterweight", (mast_x, mast_y, mast_z + 0.92), (mast_x - 0.16, mast_y, mast_z + 0.82), 0.022, aged_brass)
add_sphere("Counterweight ball", (mast_x - 0.17, mast_y, mast_z + 0.81), (0.048, 0.048, 0.048), brass)

blade_angle = -0.42
for st_idx in range(6):
    dist = 0.10 + st_idx * 0.115
    bx = mast_x + dist * cos(blade_angle)
    bz = mast_z + 0.92 - dist * sin(blade_angle)
    smat = flag_red if st_idx % 2 == 0 else flag_white
    add_box(
        f"Semaphore stripe {st_idx}",
        (bx, mast_y - 0.02, bz),
        (0.112, 0.026, 0.145),
        smat,
        bevel=0.005,
        rot=(0.0, blade_angle, 0.0),
    )
add_cyl(
    "Semaphore upper spine",
    (mast_x, mast_y - 0.02, mast_z + 0.99),
    (mast_x + 0.74 * cos(blade_angle), mast_y - 0.02, mast_z + 0.99 - 0.74 * sin(blade_angle)),
    0.014,
    brass,
)


# --- Articulated Porcelain Mannequin Hand Poised Dramatically Above Lane 04 ---
palm_center = Vector((2.66, -0.12, 2.98))
add_cyl("Articulated forearm porcelain cuff", (3.42, 0.20, 3.65), (2.96, 0.00, 3.24), 0.25, porcelain, bevel=0.02)
add_torus("Forearm brass collar ring", (3.00, 0.02, 3.27), 0.26, 0.032, brass, rot=(0.45, -0.65, 0.2))
add_sphere("Brass wrist ball joint", (2.86, -0.04, 3.14), (0.20, 0.20, 0.20), brass)

add_box(
    "Porcelain mannequin palm",
    palm_center,
    (0.56, 0.52, 0.24),
    porcelain,
    bevel=0.075,
    rot=(0.28, 0.62, -0.25),
)
add_box(
    "Palm brass dorsal escutcheon",
    palm_center + Vector((0.06, -0.04, 0.11)),
    (0.32, 0.28, 0.04),
    brass,
    bevel=0.012,
    rot=(0.28, 0.62, -0.25),
)


def build_finger(name, joints, radii):
    for j in range(len(joints)):
        add_sphere(f"{name}_joint_{j}", joints[j], (radii[j], radii[j], radii[j]), brass)
        if j < len(joints) - 1:
            p0, p1 = Vector(joints[j]), Vector(joints[j + 1])
            r_seg = (radii[j] + radii[j + 1]) * 0.52
            add_cyl(f"{name}_phalange_{j}", p0, p1, r_seg, porcelain, bevel=0.012)


build_finger(
    "Index finger",
    [
        (2.40, -0.16, 2.84),
        (2.24, -0.10, 2.66),
        (2.12, -0.04, 2.49),
        (2.04, 0.00, 2.35),
    ],
    [0.078, 0.068, 0.058, 0.048],
)
build_finger(
    "Middle finger",
    [
        (2.46, 0.04, 2.89),
        (2.32, 0.10, 2.75),
        (2.24, 0.12, 2.60),
        (2.22, 0.13, 2.47),
    ],
    [0.080, 0.070, 0.058, 0.048],
)
build_finger(
    "Ring finger",
    [
        (2.56, 0.22, 2.93),
        (2.45, 0.28, 2.80),
        (2.41, 0.28, 2.66),
        (2.43, 0.25, 2.54),
    ],
    [0.075, 0.065, 0.055, 0.045],
)
build_finger(
    "Little finger",
    [
        (2.68, 0.37, 2.96),
        (2.61, 0.44, 2.86),
        (2.59, 0.46, 2.74),
        (2.61, 0.45, 2.64),
    ],
    [0.066, 0.056, 0.048, 0.040],
)
build_finger(
    "Thumb",
    [
        (2.52, -0.32, 2.84),
        (2.36, -0.38, 2.71),
        (2.24, -0.34, 2.59),
    ],
    [0.086, 0.074, 0.060],
)


# 4. Foreground Details:
# (a) Small Brass Nameplate with 12 Numbered Lane Rivets in the front-left foreground
plate_x, plate_y, plate_z = -1.18, -1.48, 0.045
add_box("12-Lane brass nameplate base", (plate_x, plate_y, plate_z), (2.48, 0.58, 0.08), brass, bevel=0.02)
add_box("12-Lane recessed enamel face", (plate_x, plate_y, plate_z + 0.03), (2.32, 0.44, 0.04), crinkle_steel, bevel=0.008)
add_text(
    "12-Lane plate header",
    "12 CONCURRENT AGENT LANES  ·  USB HID",
    (plate_x, plate_y + 0.10, plate_z + 0.052),
    0.078,
    brass,
    extrude=0.003,
)
for r_i in range(12):
    rx = plate_x - 1.00 + r_i * (2.00 / 11.0)
    ry = plate_y - 0.07
    add_cyl(f"Lane rivet collar {r_i+1}", (rx, ry, plate_z + 0.04), (rx, ry, plate_z + 0.065), 0.046, aged_brass)
    add_sphere(f"Domed lane rivet {r_i+1}", (rx, ry, plate_z + 0.068), (0.034, 0.034, 0.022), brass)
    add_text(
        f"Lane number {r_i+1}",
        f"{r_i+1:02d}",
        (rx, ry - 0.09, plate_z + 0.052),
        0.050,
        brass,
        extrude=0.002,
    )

# (b) Braided Cloth USB HID Cable with Gold-Plated Connectors snaking across the foreground
add_cyl("Console front cable gland", (-2.42, -1.04, 0.36), (-2.42, -1.20, 0.36), 0.095, brass)
add_torus("Cable gland hex nut", (-2.42, -1.14, 0.36), 0.105, 0.025, aged_brass, rot=(pi / 2, 0.0, 0.0))

cable_pts = [
    (-2.42, -1.18, 0.36),
    (-2.55, -1.46, 0.12),
    (-2.65, -1.82, 0.08),
    (-0.20, -1.86, 0.08),
    (0.85, -1.48, 0.08),
    (1.72, -1.62, 0.09),
]
add_tube("Braided cloth USB HID cable", cable_pts, 0.068, braid_cloth)
for c_pt, c_rot in [((-2.51, -1.38, 0.19), (0.8, 0.2, 0.3)), ((0.35, -1.68, 0.08), (0.0, pi / 2, -0.45))]:
    add_torus("Cable brass ferrule", c_pt, 0.072, 0.016, brass, rot=c_rot)

ux, uy, uz = 1.96, -1.64, 0.11
u_rot = (0.0, 0.0, -0.18)
add_box("USB connector strain relief", (ux - 0.26, uy + 0.04, uz), (0.22, 0.18, 0.16), crinkle_steel, bevel=0.02, rot=u_rot)
add_box("USB connector brass shell", (ux + 0.04, uy - 0.01, uz), (0.44, 0.28, 0.19), aged_brass, bevel=0.025, rot=u_rot)
add_text("USB HID stamp", "USB HID", (ux + 0.04, uy - 0.01, uz + 0.098), 0.072, brass, rot=u_rot, extrude=0.003)
add_box("Gold-plated USB plug tongue", (ux + 0.38, uy - 0.07, uz), (0.28, 0.21, 0.11), brass, bevel=0.01, rot=u_rot)
for slot_y in [-0.045, 0.045]:
    add_box(
        f"USB plug contact window {slot_y}",
        (ux + 0.40, uy - 0.07 + slot_y, uz + 0.052),
        (0.09, 0.045, 0.016),
        crinkle_steel,
        bevel=0.002,
        rot=u_rot,
    )


# 5. Rich Darkroom Studio Lighting + Vivid Keycap & Beacon Glow
def add_area_light(name, loc, energy, color, size, target, shape="DISK", size_y=None):
    bpy.ops.object.light_add(type="AREA", location=loc)
    lt = bpy.context.object
    lt.name = name
    lt.data.energy = energy
    lt.data.color = color
    lt.data.shape = shape
    lt.data.size = size
    if size_y is not None:
        lt.data.size_y = size_y
    lt.rotation_euler = (Vector(target) - lt.location).to_track_quat("-Z", "Y").to_euler()
    return lt


def add_point_light(name, loc, energy, color, radius=0.18):
    bpy.ops.object.light_add(type="POINT", location=loc)
    lt = bpy.context.object
    lt.name = name
    lt.data.energy = energy
    lt.data.color = color
    lt.data.shadow_soft_size = radius
    return lt


add_area_light(
    "Warm studio key silkbox",
    (-4.2, -5.2, 5.8),
    620.0,
    (1.0, 0.86, 0.70),
    3.6,
    (0.0, 0.0, 1.2),
)
add_area_light(
    "Cool steel & porcelain rim",
    (4.6, 3.2, 5.4),
    540.0,
    (0.66, 0.80, 1.0),
    3.0,
    (0.5, 0.0, 1.5),
)
add_area_light(
    "Warm brass grazing strip",
    (-2.5, -1.8, 4.4),
    260.0,
    (1.0, 0.76, 0.48),
    1.8,
    (0.0, -0.3, 1.0),
    shape="RECTANGLE",
    size_y=4.2,
)
add_area_light(
    "Porcelain hand & beacon spotlight",
    (3.8, -3.6, 4.6),
    310.0,
    (1.0, 0.90, 0.82),
    2.2,
    (2.2, 0.0, 2.3),
)

add_point_light("Emerald working key glow", (-0.67, 0.02, 1.65), 28.0, (0.08, 1.0, 0.36), radius=0.22)
add_point_light("Emerald front spill", (-0.67, -0.56, 1.28), 14.0, (0.08, 1.0, 0.36), radius=0.25)
add_point_light("Alabaster done key glow", (0.67, 0.02, 1.62), 22.0, (1.0, 0.95, 0.82), radius=0.22)
add_point_light("Ruby blocked key & Fresnel beacon glow", (2.02, 0.02, 1.92), 62.0, (1.0, 0.05, 0.04), radius=0.24)
add_point_light("Ruby beacon under-hand spill", (2.16, -0.16, 2.25), 34.0, (1.0, 0.08, 0.05), radius=0.20)


# 6. Camera & Depth of Field (slightly wider framing for comfortable margins around foreground cable & nameplate)
bpy.ops.object.camera_add(location=(0.15, -7.35, 3.98))
cam = bpy.context.object
cam.name = "Editorial Studio Camera"
cam_target = Vector((0.10, -0.18, 1.18))
cam.rotation_euler = (cam_target - cam.location).to_track_quat("-Z", "Y").to_euler()
cam.data.type = "PERSP"
cam.data.lens = 47.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((0.67, -0.10, 1.40)) - cam.location).length
cam.data.dof.aperture_fstop = 8.5
scene.camera = cam

# 7. Render & Encode WebP
png_path = TMP_DIR / ("preview.png" if WIDTH < 1600 else "final.png")
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get("OUTPUT", str(OUT_DIR / "peripheral-vision-control-tower.webp")))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert("RGB").save(webp_out, "WEBP", quality=92, method=6)
print(f"FINISHED {webp_out} ({WIDTH}x{HEIGHT})", flush=True)
