"""Specimen Under Checksum Glass — original conceptual still life for MothBake.
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

random.seed(108)

OUT_DIR = Path(__file__).resolve().parent
TMP_DIR = Path("/tmp/opencode/mothbake-blender")
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
bg.inputs[0].default_value = (0.024, 0.017, 0.014, 1.0)
bg.inputs[1].default_value = 0.32


def make_mat(
    name,
    color,
    metal=0.0,
    rough=0.35,
    coat=0.15,
    noise_scale=150.0,
    bump_strength=0.12,
    voronoi_scale=0.0,
    subsurface=0.0,
    transmission=0.0,
    ior=1.49,
    sheen=0.0,
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
    if sheen > 0:
        p.inputs["Sheen Weight"].default_value = sheen
    if emission is not None and emission_strength > 0:
        p.inputs["Emission Color"].default_value = (*emission, 1.0)
        p.inputs["Emission Strength"].default_value = emission_strength

    if bump_strength > 0:
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = noise_scale
        noise.inputs["Detail"].default_value = 4.0
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = bump_strength
        bump.inputs["Distance"].default_value = 0.015
        if voronoi_scale > 0:
            vor = nodes.new("ShaderNodeTexVoronoi")
            vor.inputs["Scale"].default_value = voronoi_scale
            mix = nodes.new("ShaderNodeMix")
            mix.data_type = "FLOAT"
            mix.inputs["Factor"].default_value = 0.55
            links.new(noise.outputs["Fac"], mix.inputs[2])
            links.new(vor.outputs["Distance"], mix.inputs[3])
            links.new(mix.outputs[0], bump.inputs["Height"])
        else:
            links.new(noise.outputs["Fac"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


# Materials
hammered_copper = make_mat(
    "Hammered artisan copper",
    (0.76, 0.33, 0.16),
    metal=0.92,
    rough=0.23,
    coat=0.15,
    noise_scale=95.0,
    bump_strength=0.22,
    voronoi_scale=28.0,
)
assay_brass = make_mat(
    "Stamped assay medallion brass",
    (0.68, 0.47, 0.16),
    metal=0.89,
    rough=0.23,
    coat=0.12,
    noise_scale=180.0,
    bump_strength=0.09,
)
aged_bronze = make_mat(
    "Aged dark cabinet bronze",
    (0.32, 0.19, 0.07),
    metal=0.84,
    rough=0.34,
    coat=0.10,
    noise_scale=140.0,
    bump_strength=0.12,
)
swatch_gold = make_mat(
    "Wing Swatch 1 — Brushed assay gold",
    (0.90, 0.66, 0.21),
    metal=0.96,
    rough=0.17,
    coat=0.20,
    noise_scale=260.0,
    bump_strength=0.08,
)
swatch_normal_blue = make_mat(
    "Wing Swatch 2 — Normal-map blue-violet matte ceramic",
    (0.33, 0.39, 0.95),
    metal=0.08,
    rough=0.24,
    coat=0.85,
    noise_scale=140.0,
    bump_strength=0.16,
    voronoi_scale=42.0,
    subsurface=0.12,
)
nb_nodes = swatch_normal_blue.node_tree.nodes
nb_links = swatch_normal_blue.node_tree.links
nb_p = nb_nodes.get("Principled BSDF")
nb_vor = nb_nodes.new("ShaderNodeTexVoronoi")
nb_vor.inputs["Scale"].default_value = 14.0
nb_ramp = nb_nodes.new("ShaderNodeValToRGB")
nb_ramp.color_ramp.elements[0].position = 0.15
nb_ramp.color_ramp.elements[0].color = (0.48, 0.28, 0.92, 1.0)
nb_ramp.color_ramp.elements[1].position = 0.85
nb_ramp.color_ramp.elements[1].color = (0.24, 0.56, 0.98, 1.0)
nb_links.new(nb_vor.outputs["Distance"], nb_ramp.inputs["Fac"])
nb_links.new(nb_ramp.outputs["Color"], nb_p.inputs["Base Color"])

swatch_terracotta = make_mat(
    "Wing Swatch 3 — Fired terracotta clay",
    (0.72, 0.26, 0.13),
    metal=0.0,
    rough=0.52,
    coat=0.08,
    noise_scale=190.0,
    bump_strength=0.20,
)
swatch_cream_tile = make_mat(
    "Wing Swatch 3B — Cream ceramic checker tile",
    (0.88, 0.80, 0.66),
    metal=0.0,
    rough=0.28,
    coat=0.35,
    noise_scale=170.0,
    bump_strength=0.10,
)

swatch_linen = make_mat(
    "Wing Swatch 4 — Natural woven ecru linen",
    (0.80, 0.71, 0.54),
    metal=0.0,
    rough=0.76,
    coat=0.0,
    noise_scale=280.0,
    bump_strength=0.28,
    sheen=0.45,
)
ln_nodes = swatch_linen.node_tree.nodes
ln_links = swatch_linen.node_tree.links
ln_p = ln_nodes.get("Principled BSDF")
ln_check = ln_nodes.new("ShaderNodeTexChecker")
ln_check.inputs["Scale"].default_value = 64.0
ln_check.inputs["Color1"].default_value = (0.83, 0.74, 0.57, 1.0)
ln_check.inputs["Color2"].default_value = (0.64, 0.54, 0.39, 1.0)
ln_links.new(ln_check.outputs["Color"], ln_p.inputs["Base Color"])

porcelain = make_mat(
    "Glazed ivory porcelain moth body",
    (0.91, 0.85, 0.74),
    metal=0.0,
    rough=0.18,
    coat=0.65,
    noise_scale=150.0,
    bump_strength=0.06,
    voronoi_scale=90.0,
    subsurface=0.20,
)
crimson_wax = make_mat(
    "Crimson sealing wax",
    (0.64, 0.032, 0.042),
    metal=0.0,
    rough=0.22,
    coat=0.55,
    noise_scale=120.0,
    bump_strength=0.14,
    subsurface=0.22,
)
forged_iron = make_mat(
    "Heavy forged padlock iron",
    (0.055, 0.058, 0.065),
    metal=0.82,
    rough=0.40,
    coat=0.12,
    noise_scale=170.0,
    bump_strength=0.22,
    voronoi_scale=110.0,
)
steel_shackle = make_mat(
    "Hardened steel padlock shackle",
    (0.68, 0.71, 0.75),
    metal=0.93,
    rough=0.18,
    coat=0.15,
    noise_scale=200.0,
    bump_strength=0.06,
)
apothecary_glass = make_mat(
    "Heavy optical apothecary glass",
    (0.88, 0.95, 0.94),
    metal=0.0,
    rough=0.05,
    coat=0.90,
    bump_strength=0.0,
    transmission=0.92,
    ior=1.51,
)
amber_crystal = make_mat(
    "Preserved glowing amber raw-result crystal",
    (1.0, 0.48, 0.06),
    metal=0.0,
    rough=0.12,
    coat=0.80,
    bump_strength=0.04,
    transmission=0.72,
    ior=1.55,
    emission=(1.0, 0.46, 0.06),
    emission_strength=5.6,
)
velvet = make_mat(
    "Deep museum emerald-charcoal velvet",
    (0.020, 0.048, 0.042),
    metal=0.0,
    rough=0.88,
    coat=0.0,
    noise_scale=240.0,
    bump_strength=0.22,
    sheen=0.65,
)
parchment = make_mat(
    "Archival cotton specimen label",
    (0.84, 0.76, 0.60),
    metal=0.0,
    rough=0.72,
    coat=0.05,
    noise_scale=180.0,
    bump_strength=0.15,
)
ink_dark = make_mat(
    "Archival iron-gall ink",
    (0.03, 0.025, 0.022),
    metal=0.1,
    rough=0.55,
    bump_strength=0.04,
)

mahogany = make_mat(
    "Polished Victorian Honduras mahogany",
    (0.18, 0.048, 0.022),
    metal=0.0,
    rough=0.25,
    coat=0.48,
    noise_scale=130.0,
    bump_strength=0.15,
)
mnodes = mahogany.node_tree.nodes
mlinks = mahogany.node_tree.links
mp = mnodes.get("Principled BSDF")
mcoord = mnodes.new("ShaderNodeTexCoord")
mmap = mnodes.new("ShaderNodeVectorMath")
mmap.operation = "MULTIPLY"
mmap.inputs[1].default_value = (2.2, 38.0, 10.0)
mnoise = mnodes.new("ShaderNodeTexNoise")
mnoise.inputs["Scale"].default_value = 4.0
mnoise.inputs["Detail"].default_value = 5.0
mramp = mnodes.new("ShaderNodeValToRGB")
mramp.color_ramp.elements[0].position = 0.2
mramp.color_ramp.elements[0].color = (0.065, 0.015, 0.008, 1.0)
mramp.color_ramp.elements[1].position = 0.82
mramp.color_ramp.elements[1].color = (0.28, 0.075, 0.032, 1.0)
mlinks.new(mcoord.outputs["Generated"], mmap.inputs[0])
mlinks.new(mmap.outputs[0], mnoise.inputs["Vector"])
mlinks.new(mnoise.outputs["Fac"], mramp.inputs["Fac"])
mlinks.new(mramp.outputs["Color"], mp.inputs["Base Color"])

table_wood = make_mat(
    "Dark smoked oak laboratory bench",
    (0.055, 0.032, 0.018),
    metal=0.0,
    rough=0.42,
    coat=0.22,
    noise_scale=110.0,
    bump_strength=0.18,
)


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


def add_box(name, loc, dims, mat_obj, bevel=0.02, rot=(0, 0, 0)):
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


def add_cyl(name, a, b, radius, mat_obj, vertices=48, bevel=0.008):
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


def add_extruded_poly(name, outline_2d, z_base, thickness, mat_obj, bevel=0.012):
    n = len(outline_2d)
    verts = [(x, y, z_base) for x, y in outline_2d] + [
        (x, y, z_base + thickness) for x, y in outline_2d
    ]
    faces = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))]
    faces += [(i, (i + 1) % n, (i + 1) % n + n, i + n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if bevel > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    return finish(obj, name, mat_obj)


# 1. Museum Worktable & Open Velvet-Lined Mahogany Specimen Tray
add_box("Museum oak bench", (0.0, 0.0, -0.16), (18.0, 14.0, 0.32), table_wood, bevel=0.04)

tray_cx, tray_cy = -0.35, 0.22
tray_w, tray_d = 4.45, 3.30
add_box("Mahogany tray floor", (tray_cx, tray_cy, 0.08), (tray_w, tray_d, 0.14), mahogany, bevel=0.025)
add_box("Velvet specimen cushion", (tray_cx, tray_cy, 0.18), (tray_w - 0.36, tray_d - 0.36, 0.09), velvet, bevel=0.035)
wall_h = 0.36
add_box("Mahogany north wall", (tray_cx, tray_cy + tray_d * 0.5 - 0.09, wall_h * 0.5), (tray_w, 0.18, wall_h), mahogany, bevel=0.02)
add_box("Mahogany south wall", (tray_cx, tray_cy - tray_d * 0.5 + 0.09, wall_h * 0.5), (tray_w, 0.18, wall_h), mahogany, bevel=0.02)
add_box("Mahogany west wall", (tray_cx - tray_w * 0.5 + 0.09, tray_cy, wall_h * 0.5), (0.18, tray_d - 0.32, wall_h), mahogany, bevel=0.02)
add_box("Mahogany east wall", (tray_cx + tray_w * 0.5 - 0.09, tray_cy, wall_h * 0.5), (0.18, tray_d - 0.32, wall_h), mahogany, bevel=0.02)

for sx in [-1, 1]:
    for sy in [-1, 1]:
        cx = tray_cx + sx * (tray_w * 0.5 - 0.11)
        cy = tray_cy + sy * (tray_d * 0.5 - 0.11)
        add_box(f"Tray corner brass bracket {sx}_{sy}", (cx, cy, wall_h + 0.01), (0.26, 0.26, 0.04), assay_brass, bevel=0.008)
        add_sphere(f"Corner screw {sx}_{sy}", (cx, cy, wall_h + 0.035), (0.022, 0.022, 0.012), aged_bronze)

# Front brass cabinet nameplate on the south mahogany wall
add_box("Cabinet front brass plaque", (tray_cx + 0.25, tray_cy - tray_d * 0.5 - 0.01, 0.20), (2.15, 0.04, 0.18), assay_brass, bevel=0.008)
add_text(
    "Cabinet plaque text",
    "MOTHBAKE  ·  SHA-256 SPECIMEN ASSAY",
    (tray_cx + 0.25, tray_cy - tray_d * 0.5 - 0.032, 0.20),
    0.082,
    ink_dark,
    rot=(pi / 2, 0.0, 0.0),
    extrude=0.003,
)

# Hinged Brass-Framed "Checksum Glass" Inspection Loupe hovering over the inner right forewing
# Positioned so it magnifies part of the blue-violet normal-map wing while keeping all 5 medallions unobstructed
loupe_x, loupe_y, loupe_z = tray_cx + 0.82, tray_cy + 0.38, 0.62
add_torus("Checksum glass brass bezel", (loupe_x, loupe_y, loupe_z), 0.44, 0.028, assay_brass, rot=(0.14, -0.12, 0.0))
add_cyl(
    "Checksum glass optical lens",
    (loupe_x, loupe_y, loupe_z - 0.01),
    (loupe_x, loupe_y, loupe_z + 0.01),
    0.42,
    apothecary_glass,
    bevel=0.004,
)
add_cyl(
    "Checksum glass articulated brass arm",
    (tray_cx + 0.15, tray_cy + tray_d * 0.5 - 0.08, 0.38),
    (loupe_x - 0.22, loupe_y + 0.36, loupe_z + 0.02),
    0.026,
    assay_brass,
)


# 2. The Clockwork Atlas Moth Specimen (Center Stage inside the Velvet Tray)
mx, my, mz = tray_cx, tray_cy + 0.08, 0.28


def mirror_pts(pts, sign_x):
    return [(mx + sign_x * x, my + y) for x, y in pts]


forewing_local = [
    (0.15, 0.16),
    (0.52, 0.50),
    (1.06, 0.82),
    (1.50, 0.90),
    (1.68, 0.78),
    (1.58, 0.55),
    (1.40, 0.38),
    (1.45, 0.14),
    (1.22, -0.05),
    (0.70, -0.07),
    (0.16, -0.02),
]

forewing_swatch_local = [
    (0.22, 0.14),
    (0.56, 0.43),
    (1.04, 0.72),
    (1.42, 0.78),
    (1.50, 0.69),
    (1.34, 0.40),
    (1.32, 0.18),
    (1.12, 0.02),
    (0.68, 0.00),
    (0.24, 0.03),
]

hindwing_local = [
    (0.14, -0.05),
    (0.65, -0.09),
    (1.14, -0.20),
    (1.24, -0.46),
    (1.02, -0.76),
    (0.76, -0.96),
    (0.58, -0.85),
    (0.41, -0.60),
    (0.20, -0.34),
]

hindwing_swatch_local = [
    (0.22, -0.10),
    (0.63, -0.14),
    (1.02, -0.25),
    (1.10, -0.44),
    (0.92, -0.69),
    (0.73, -0.82),
    (0.60, -0.73),
    (0.43, -0.52),
    (0.25, -0.28),
]

for sign_x, side_name in [(-1, "Left"), (1, "Right")]:
    fw_pts = mirror_pts(forewing_local, sign_x)
    if sign_x < 0:
        fw_pts = list(reversed(fw_pts))
    add_extruded_poly(f"{side_name} Forewing hammered copper frame", fw_pts, mz, 0.045, hammered_copper, bevel=0.01)

    fsw_pts = mirror_pts(forewing_swatch_local, sign_x)
    if sign_x < 0:
        fsw_pts = list(reversed(fsw_pts))
    fw_mat = swatch_gold if sign_x < 0 else swatch_normal_blue
    add_extruded_poly(f"{side_name} Forewing PBR swatch", fsw_pts, mz + 0.025, 0.038, fw_mat, bevel=0.008)

    for v_target in [(1.42, 0.78), (1.34, 0.40), (1.12, 0.02), (0.76, 0.55)]:
        add_tube(
            f"{side_name} Forewing copper vein",
            [
                (mx + sign_x * 0.18, my + 0.07, mz + 0.068),
                (mx + sign_x * (v_target[0] * 0.55), my + v_target[1] * 0.62, mz + 0.074),
                (mx + sign_x * v_target[0], my + v_target[1], mz + 0.066),
            ],
            0.015,
            hammered_copper,
        )
    ex, ey = mx + sign_x * 0.94, my + 0.37
    add_torus(f"{side_name} Forewing eyespot ring", (ex, ey, mz + 0.072), 0.145, 0.016, assay_brass)
    if sign_x < 0:
        add_cyl("Brushed gold bullion disc", (ex, ey, mz + 0.055), (ex, ey, mz + 0.078), 0.125, swatch_gold)
        add_torus("Gold inner ring", (ex, ey, mz + 0.078), 0.072, 0.011, hammered_copper)
    else:
        add_sphere("Normal-map calibration dome", (ex, ey, mz + 0.065), (0.12, 0.12, 0.052), swatch_normal_blue)
        add_torus("Normal-map outer ring", (ex, ey, mz + 0.076), 0.08, 0.010, porcelain)

    hw_pts = mirror_pts(hindwing_local, sign_x)
    if sign_x < 0:
        hw_pts = list(reversed(hw_pts))
    add_extruded_poly(f"{side_name} Hindwing hammered copper frame", hw_pts, mz - 0.01, 0.042, hammered_copper, bevel=0.01)

    hsw_pts = mirror_pts(hindwing_swatch_local, sign_x)
    if sign_x < 0:
        hsw_pts = list(reversed(hsw_pts))
    hw_mat = swatch_terracotta if sign_x < 0 else swatch_linen
    add_extruded_poly(f"{side_name} Hindwing PBR swatch", hsw_pts, mz + 0.012, 0.035, hw_mat, bevel=0.008)

    if sign_x < 0:
        for gx in range(6):
            for gy in range(6):
                tx = mx - (0.30 + gx * 0.12)
                ty = my - (0.18 + gy * 0.102)
                if (gx + gy) <= 8 and not (gx >= 4 and gy >= 4):
                    tmat = swatch_terracotta if (gx + gy) % 2 == 0 else swatch_cream_tile
                    add_box(
                        f"Checkerboard inlay tile {gx}_{gy}",
                        (tx, ty, mz + 0.046),
                        (0.108, 0.092, 0.018),
                        tmat,
                        bevel=0.004,
                    )
    else:
        for wi in range(7):
            wy = my - 0.20 - wi * 0.08
            add_cyl(
                f"Linen weft thread {wi}",
                (mx + 0.28, wy, mz + 0.052),
                (mx + 0.94 - wi * 0.035, wy, mz + 0.052),
                0.010,
                swatch_linen,
            )
        for wj in range(6):
            wx = mx + 0.32 + wj * 0.108
            add_cyl(
                f"Linen warp thread {wj}",
                (wx, my - 0.16, mz + 0.055),
                (wx, my - 0.68 + wj * 0.035, mz + 0.055),
                0.010,
                parchment,
            )

    add_cyl(
        f"{side_name} Forewing brass hinge",
        (mx + sign_x * 0.16, my + 0.02, mz + 0.065),
        (mx + sign_x * 0.16, my + 0.16, mz + 0.065),
        0.030,
        assay_brass,
    )
    add_cyl(
        f"{side_name} Hindwing brass hinge",
        (mx + sign_x * 0.15, my - 0.20, mz + 0.055),
        (mx + sign_x * 0.15, my - 0.07, mz + 0.055),
        0.026,
        assay_brass,
    )


# --- Moth Head, Hammered Copper Thorax, Clockwork Escapement & Porcelain Abdomen ---
add_sphere("Moth copper head capsule", (mx, my + 0.40, mz + 0.11), (0.13, 0.11, 0.10), hammered_copper)
for sx in [-1, 1]:
    add_sphere(f"Moth compound eye {sx}", (mx + sx * 0.10, my + 0.46, mz + 0.12), (0.048, 0.048, 0.048), forged_iron)
    ant_pts = [
        (mx + sx * 0.07, my + 0.48, mz + 0.14),
        (mx + sx * 0.25, my + 0.72, mz + 0.19),
        (mx + sx * 0.52, my + 0.88, mz + 0.21),
    ]
    add_tube(f"Moth antenna stem {sx}", ant_pts, 0.013, assay_brass)
    for barb in range(10):
        bt = (barb + 1) / 11.0
        bx = mx + sx * (0.09 + 0.41 * bt)
        by = my + 0.50 + 0.36 * bt
        bz = mz + 0.15 + 0.05 * bt
        blen = 0.08 * sin(bt * pi)
        add_cyl(
            f"Antenna pectinate barb {sx}_{barb}",
            (bx, by, bz),
            (bx + sx * blen * 0.6, by - blen, bz),
            0.0045,
            hammered_copper,
            bevel=0.0,
        )

add_sphere("Hammered copper prothorax", (mx, my + 0.23, mz + 0.14), (0.20, 0.15, 0.13), hammered_copper)
add_sphere("Porcelain thorax carapace", (mx, my + 0.01, mz + 0.15), (0.22, 0.26, 0.16), porcelain)
add_torus("Thorax clockwork escapement bezel", (mx, my + 0.03, mz + 0.29), 0.12, 0.019, assay_brass)
add_cyl("Thorax escapement center jewel", (mx, my + 0.03, mz + 0.28), (mx, my + 0.03, mz + 0.32), 0.050, crimson_wax)
for spoke in range(6):
    sang = spoke * pi / 3.0
    add_box(
        f"Clockwork gear tooth {spoke}",
        (mx + 0.13 * cos(sang), my + 0.03 + 0.13 * sin(sang), mz + 0.29),
        (0.030, 0.070, 0.020),
        assay_brass,
        bevel=0.003,
        rot=(0.0, 0.0, sang),
    )

for seg_i in range(6):
    sy = my - 0.22 - seg_i * 0.115
    srx = 0.18 * (1.0 - seg_i * 0.11)
    srz = 0.12 * (1.0 - seg_i * 0.10)
    seg_mat = porcelain if seg_i % 2 == 0 else hammered_copper
    add_sphere(f"Abdomen ring {seg_i}", (mx, sy, mz + 0.09), (srx, 0.080, srz), seg_mat)
    add_torus(f"Abdomen brass seam {seg_i}", (mx, sy + 0.045, mz + 0.09), srx * 0.92, 0.009, assay_brass, rot=(pi / 2, 0.0, 0.0))


# 3. The Five Provenance Tags (All 5 Clearly Visible Around the Moth Inside the Velvet Tray)
# (`01 RECIPE`, `02 INSTANCE`, `03 RAW`, `04 BAKE`, `05 EXPORT`)
tags = [
    ("01 RECIPE", (tray_cx - 1.54, tray_cy + 1.04), (mx - 0.88, my + 0.62)),
    ("02 INSTANCE", (tray_cx - 1.56, tray_cy - 0.84), (mx - 0.72, my - 0.42)),
    ("03 RAW", (tray_cx + 0.00, tray_cy - 1.20), (mx + 0.00, my - 0.78)),
    ("04 BAKE", (tray_cx + 1.54, tray_cy - 0.84), (mx + 0.72, my - 0.42)),
    ("05 EXPORT", (tray_cx + 1.52, tray_cy + 1.04), (mx + 0.88, my + 0.62)),
]

for t_idx, (t_label, (tx, ty), (wx, wy)) in enumerate(tags):
    tz = 0.25
    add_tube(
        f"Provenance copper wire {t_label}",
        [
            (tx, ty, tz + 0.02),
            ((tx + wx) * 0.5, (ty + wy) * 0.5, tz + 0.07),
            (wx, wy, mz + 0.04),
        ],
        0.009,
        hammered_copper,
    )
    add_box(
        f"Assay medallion {t_label}",
        (tx, ty, tz),
        (0.86, 0.36, 0.048),
        assay_brass,
        bevel=0.012,
        rot=(0.14, 0.0, 0.0),
    )
    add_box(
        f"Assay medallion recess {t_label}",
        (tx + 0.07, ty, tz + 0.018),
        (0.64, 0.26, 0.022),
        aged_bronze,
        bevel=0.005,
        rot=(0.14, 0.0, 0.0),
    )
    add_text(
        f"Medallion stamped text {t_label}",
        t_label,
        (tx + 0.08, ty, tz + 0.034),
        0.088,
        assay_brass,
        rot=(0.14, 0.0, 0.0),
        extrude=0.005,
    )
    wax_x, wax_y = tx - 0.29, ty
    add_cyl(
        f"Crimson wax seal pool {t_label}",
        (wax_x, wax_y, tz + 0.016),
        (wax_x, wax_y, tz + 0.054),
        0.105,
        crimson_wax,
        bevel=0.014,
    )
    add_torus(
        f"Crimson wax outer ridge {t_label}",
        (wax_x, wax_y, tz + 0.052),
        0.085,
        0.020,
        crimson_wax,
        rot=(0.14, 0.0, 0.0),
    )
    add_cyl(
        f"Entomological pin shaft {t_label}",
        (wax_x, wax_y, tz + 0.02),
        (wax_x, wax_y, tz + 0.36),
        0.010,
        assay_brass,
        bevel=0.0,
    )
    add_sphere(
        f"Entomological pin head {t_label}",
        (wax_x, wax_y, tz + 0.37),
        (0.032, 0.032, 0.032),
        assay_brass,
    )


# 4. Foreground Left: The Padlocked Brass Coin-Slot Box ("Spend Gate" — Live Spend Locked by Default)
bx, by, bz = -2.25, -1.52, 0.32
b_rot = (0.0, 0.0, 0.26)
add_box("Spend-gate brass strongbox", (bx, by, bz), (1.12, 0.84, 0.64), assay_brass, bevel=0.028, rot=b_rot)
add_box("Strongbox top lid rim", (bx, by, bz + 0.31), (1.16, 0.88, 0.09), aged_bronze, bevel=0.018, rot=b_rot)
add_box("Strongbox coin slot", (bx, by, bz + 0.355), (0.48, 0.075, 0.045), ink_dark, bevel=0.005, rot=b_rot)
# Heavy copper & iron locking bar clamped right across the coin slot
add_box("Coin-slot locking hasp bar", (bx + 0.14, by + 0.04, bz + 0.375), (0.20, 0.92, 0.052), hammered_copper, bevel=0.010, rot=b_rot)
# Large, unmistakable Heavy Forged Iron Padlock clamped on the front/top of the coin box
px, py, pz = bx + 0.22, by - 0.42, bz + 0.04
add_torus("Padlock hardened steel shackle", (px, py, pz + 0.22), 0.135, 0.034, steel_shackle, rot=(pi / 2 - 0.25, 0.0, 0.26))
add_box("Heavy forged iron padlock body", (px, py - 0.03, pz - 0.02), (0.42, 0.18, 0.44), forged_iron, bevel=0.032, rot=b_rot)
add_box("Padlock brass keyhole escutcheon", (px, py - 0.115, pz - 0.02), (0.14, 0.025, 0.20), assay_brass, bevel=0.006, rot=b_rot)
add_sphere("Padlock keyhole top", (px, py - 0.125, pz + 0.02), (0.030, 0.012, 0.030), ink_dark)
add_box("Padlock keyhole slot", (px, py - 0.125, pz - 0.04), (0.022, 0.012, 0.075), ink_dark, bevel=0.001, rot=b_rot)
add_text(
    "Spend gate top label",
    "SPEND LOCKED",
    (bx - 0.22, by - 0.18, bz + 0.362),
    0.068,
    ink_dark,
    rot=(0.0, 0.0, 0.26),
    extrude=0.003,
)


# 5. Right Side: Heavy Glass Apothecary Jar Holding Preserved Glowing Amber "Raw Result" Crystals
jx, jy, jz = 2.48, -0.12, 0.0
add_cyl("Apothecary jar brass foot", (jx, jy, 0.02), (jx, jy, 0.09), 0.58, aged_bronze, bevel=0.012)
add_cyl("Apothecary glass body", (jx, jy, 0.08), (jx, jy, 1.18), 0.54, apothecary_glass, vertices=64, bevel=0.02)
add_sphere("Apothecary glass shoulder", (jx, jy, 1.16), (0.54, 0.54, 0.22), apothecary_glass)
add_cyl("Apothecary glass neck", (jx, jy, 1.28), (jx, jy, 1.48), 0.35, apothecary_glass, vertices=64, bevel=0.015)
add_torus("Apothecary glass lip", (jx, jy, 1.48), 0.36, 0.032, apothecary_glass)
add_cyl("Apothecary brass stopper collar", (jx, jy, 1.46), (jx, jy, 1.58), 0.39, assay_brass, bevel=0.015)
add_sphere("Apothecary glass stopper finial", (jx, jy, 1.66), (0.23, 0.23, 0.16), apothecary_glass)
add_torus("Stopper wax & copper wire collar", (jx, jy, 1.42), 0.37, 0.018, hammered_copper)

crystal_specs = [
    ((jx - 0.14, jy - 0.08, 0.14), (jx - 0.06, jy - 0.02, 0.94), 0.15),
    ((jx + 0.15, jy - 0.06, 0.14), (jx + 0.08, jy + 0.02, 0.84), 0.14),
    ((jx + 0.02, jy + 0.16, 0.14), (jx - 0.02, jy + 0.08, 1.04), 0.16),
    ((jx - 0.22, jy + 0.10, 0.14), (jx - 0.28, jy + 0.14, 0.70), 0.12),
    ((jx + 0.20, jy + 0.12, 0.14), (jx + 0.26, jy + 0.16, 0.74), 0.12),
    ((jx - 0.02, jy - 0.20, 0.14), (jx + 0.04, jy - 0.24, 0.66), 0.13),
]
for c_idx, (ca, cb, cr) in enumerate(crystal_specs):
    add_cyl(
        f"Glowing amber raw-result crystal {c_idx}",
        ca,
        cb,
        cr,
        amber_crystal,
        vertices=6,
        bevel=0.012,
    )

add_box("Apothecary jar brass label", (jx - 0.08, jy - 0.55, 0.58), (0.72, 0.04, 0.26), assay_brass, bevel=0.008, rot=(0.0, 0.0, -0.16))
add_text(
    "Apothecary jar label text",
    "RAW CACHE",
    (jx - 0.08, jy - 0.575, 0.58),
    0.090,
    ink_dark,
    rot=(pi / 2, 0.0, -0.16),
    extrude=0.004,
)


# 6. Warm Museum Spotlighting, Blue-Violet Iridescent Rim & Amber Cache Glow
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


def add_point_light(name, loc, energy, color, radius=0.20):
    bpy.ops.object.light_add(type="POINT", location=loc)
    lt = bpy.context.object
    lt.name = name
    lt.data.energy = energy
    lt.data.color = color
    lt.data.shadow_soft_size = radius
    return lt


add_area_light(
    "Warm museum gallery key",
    (-3.8, -3.8, 6.2),
    650.0,
    (1.0, 0.85, 0.66),
    3.6,
    (-0.2, 0.0, 0.3),
)
add_area_light(
    "Iridescent blue-violet wing sheen",
    (3.4, 2.8, 5.4),
    500.0,
    (0.62, 0.72, 1.0),
    3.0,
    (0.1, 0.1, 0.35),
)
add_area_light(
    "Warm copper & gold specular strip",
    (-1.4, -4.8, 4.6),
    320.0,
    (1.0, 0.78, 0.52),
    2.0,
    (-0.2, -0.2, 0.3),
    shape="RECTANGLE",
    size_y=4.2,
)
add_point_light("Apothecary amber crystal core glow", (jx, jy, 0.65), 45.0, (1.0, 0.52, 0.10), radius=0.25)
add_point_light("Padlock & coin-box foreground spotlight", (-2.2, -2.5, 1.4), 32.0, (1.0, 0.84, 0.64), radius=0.30)


# 7. Camera & Macro Depth of Field (wider museum vitrine angle so tray, 5 tags, padlocked coin box, and jar are all framed)
bpy.ops.object.camera_add(location=(0.05, -5.65, 5.75))
cam = bpy.context.object
cam.name = "Museum Vitrine Camera"
cam_target = Vector((0.02, -0.16, 0.28))
cam.rotation_euler = (cam_target - cam.location).to_track_quat("-Z", "Y").to_euler()
cam.data.type = "PERSP"
cam.data.lens = 45.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((-0.20, 0.00, 0.35)) - cam.location).length
cam.data.dof.aperture_fstop = 9.0
scene.camera = cam

# 8. Render & Encode WebP
png_path = TMP_DIR / ("preview.png" if WIDTH < 1600 else "final.png")
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get("OUTPUT", str(OUT_DIR / "specimen-under-checksum-glass.webp")))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert("RGB").save(webp_out, "WEBP", quality=92, method=6)
print(f"FINISHED {webp_out} ({WIDTH}x{HEIGHT})", flush=True)
