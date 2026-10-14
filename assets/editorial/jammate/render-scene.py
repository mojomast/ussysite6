"""Waiting for the Downbeat — original procedural editorial exaggeration for JamMate.
Run with Blender 5.2.2 (bpy) and Pillow; all geometry, shaders, and dial graphics are procedural.
"""
import os
import math
import random
from pathlib import Path
from math import sin, cos, pi
import bpy
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

random.seed(103)

ROOT = Path(__file__).resolve().parent
TMP = Path('/tmp/opencode/jammate-blender')
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
scene.view_settings.exposure = 0.18

scene.world.use_nodes = True
bg = scene.world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.026, 0.018, 0.014, 1.0)
bg.inputs[1].default_value = 0.32


def load_font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono' + ('-Bold' if bold else '') + '.ttf'
    if not os.path.exists(path):
        path = '/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if bold else '') + '.ttf'
    return ImageFont.truetype(path, size)


def make_clock_dial_texture():
    im = Image.new('RGB', (1024, 1024), (18, 22, 24))
    dr = ImageDraw.Draw(im)
    cx, cy = 512, 512
    brass_c = (232, 188, 108)
    cream_c = (238, 228, 198)
    amber_c = (255, 164, 48)
    teal_c = (118, 178, 166)

    # Concentric dial rings
    dr.ellipse((36, 36, 988, 988), fill=(16, 20, 22), outline=brass_c, width=10)
    dr.ellipse((74, 74, 950, 950), outline=teal_c, width=3)
    dr.ellipse((145, 145, 879, 879), outline=(92, 118, 112), width=3)

    # 64 sample/subdivision ticks & 4 primary 4/4 beat markers
    for i in range(64):
        ang = -pi / 2 + i * 2 * pi / 64
        r_outer = 432
        r_inner = 382 if i % 16 == 0 else (404 if i % 4 == 0 else 416)
        w = 8 if i % 16 == 0 else (4 if i % 4 == 0 else 2)
        col = amber_c if i == 0 else (brass_c if i % 16 == 0 else teal_c)
        x0 = cx + r_inner * cos(ang)
        y0 = cy + r_inner * sin(ang)
        x1 = cx + r_outer * cos(ang)
        y1 = cy + r_outer * sin(ang)
        dr.line((x0, y0, x1, y1), fill=col, width=w)

    # Top Dead Center Downbeat Highlight Arc (approaching Bar 02)
    dr.pieslice((96, 96, 928, 928), start=242, end=270, fill=(75, 42, 12))
    dr.arc((96, 96, 928, 928), start=242, end=270, fill=amber_c, width=12)

    # Beat labels (1, 2, 3, 4)
    dr.text((cx - 115, 152), "DOWNBEAT · 1", font=load_font(32, True), fill=amber_c)
    dr.text((755, cy - 18), "BEAT 2", font=load_font(28, True), fill=cream_c)
    dr.text((cx - 58, 816), "BEAT 3", font=load_font(28, True), fill=cream_c)
    dr.text((155, cy - 18), "BEAT 4", font=load_font(28, True), fill=cream_c)

    # Center typography
    dr.text((cx - 178, cy - 135), "MUSICAL CLOCK", font=load_font(44, True), fill=cream_c)
    dr.text((cx - 210, cy - 75), "4/4 BAR BOUNDARY · LOCK-FREE", font=load_font(25, True), fill=teal_c)
    dr.rectangle((cx - 195, cy + 52, cx + 195, cy + 128), fill=(36, 22, 10), outline=amber_c, width=4)
    dr.text((cx - 170, cy + 72), "NEXT: BAR 02 JOIN", font=load_font(33, True), fill=amber_c)

    p = TMP / "musical_clock_dial.png"
    im.save(p)
    return p


def make_gate_sign_texture():
    im = Image.new('RGB', (960, 320), (234, 218, 184))
    dr = ImageDraw.Draw(im)
    # Warning / Railway-style striped top & bottom border
    for i in range(-4, 24):
        x0 = i * 56
        poly = [(x0, 0), (x0 + 28, 0), (x0 - 12, 42), (x0 - 40, 42)]
        dr.polygon(poly, fill=(168, 28, 22))
        poly_b = [(x0, 278), (x0 + 28, 278), (x0 - 12, 320), (x0 - 40, 320)]
        dr.polygon(poly_b, fill=(168, 28, 22))
    dr.rectangle((10, 44, 949, 275), outline=(35, 28, 22), width=5)
    dr.text((48, 66), "BAR-BOUNDARY GATE · HOLD FOR BAR 02", font=load_font(36, True), fill=(158, 24, 18))
    dr.line((48, 122, 912, 122), fill=(45, 36, 28), width=3)
    dr.text((48, 140), "WAIT: nextDownbeatSample", font=load_font(46, True), fill=(28, 24, 20))
    dr.text((48, 212), "JAM DIRECTOR: ARMED · 4/4 PATTERN READY", font=load_font(27, True), fill=(72, 56, 40))
    p = TMP / "gate_bar02.png"
    im.save(p)
    return p


def make_snare_head_texture():
    im = Image.new('RGB', (1024, 1024), (228, 216, 192))
    dr = ImageDraw.Draw(im)
    cx, cy = 512, 512
    # Subtle coated batter ring & strike target
    dr.ellipse((90, 90, 934, 934), outline=(186, 172, 145), width=6)
    dr.ellipse((240, 240, 784, 784), outline=(168, 152, 126), width=4)
    dr.ellipse((390, 390, 634, 634), fill=(214, 198, 170), outline=(145, 128, 102), width=3)
    dr.text((cx - 135, 285), "COATED BATTER · 4/4", font=load_font(26, True), fill=(95, 82, 65))
    dr.text((cx - 115, 705), "JOIN ON NEXT BAR", font=load_font(25, True), fill=(115, 96, 74))
    p = TMP / "snare_batter.png"
    im.save(p)
    return p


clock_tex_path = make_clock_dial_texture()
gate_tex_path = make_gate_sign_texture()
snare_tex_path = make_snare_head_texture()


def mat(name, color, metal=0.0, rough=0.32, bump_strength=0.10, bump_scale=160.0, coat=0.0):
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


# Studio Materials
walnut = mat('Oiled Studio Walnut Bench', (0.12, 0.048, 0.020), metal=0.0, rough=0.28, bump_strength=0.20, bump_scale=20.0, coat=0.38)
wn = walnut.node_tree.nodes
wl = walnut.node_tree.links
wp = wn.get('Principled BSDF')
wcoord = wn.new('ShaderNodeTexCoord')
wmap = wn.new('ShaderNodeVectorMath')
wmap.operation = 'MULTIPLY'
wmap.inputs[1].default_value = (1.5, 65.0, 12.0)
wnoise = wn.new('ShaderNodeTexNoise')
wnoise.inputs['Scale'].default_value = 3.5
wnoise.inputs['Detail'].default_value = 5.0
wramp = wn.new('ShaderNodeValToRGB')
wramp.color_ramp.elements[0].position = 0.22
wramp.color_ramp.elements[0].color = (0.048, 0.018, 0.008, 1.0)
wramp.color_ramp.elements[1].position = 0.78
wramp.color_ramp.elements[1].color = (0.22, 0.088, 0.034, 1.0)
wl.new(wcoord.outputs['Generated'], wmap.inputs[0])
wl.new(wmap.outputs[0], wnoise.inputs['Vector'])
wl.new(wnoise.outputs['Fac'], wramp.inputs[0])
wl.new(wramp.outputs[0], wp.inputs['Base Color'])

chrome = mat('Polished Snare Chrome', (0.76, 0.80, 0.84), metal=0.98, rough=0.11, bump_strength=0.03, bump_scale=280.0)
brushed_steel = mat('Brushed Mechanical Arm Steel', (0.58, 0.62, 0.66), metal=0.94, rough=0.22, bump_strength=0.08, bump_scale=240.0)
brass = mat('Vintage Snare Shell Brass', (0.68, 0.45, 0.14), metal=0.93, rough=0.20, bump_strength=0.07, bump_scale=220.0)
cymbal_bronze = mat('Spun B20 Cymbal Bronze', (0.62, 0.39, 0.13), metal=0.95, rough=0.23, bump_strength=0.14, bump_scale=380.0)
copper = mat('Polished Toroidal Ring Copper', (0.72, 0.31, 0.14), metal=0.95, rough=0.18, bump_strength=0.07, bump_scale=210.0)
bakelite = mat('Gloss Black Vintage Bakelite', (0.025, 0.028, 0.032), metal=0.08, rough=0.18, bump_strength=0.06, bump_scale=180.0, coat=0.75)
cast_iron = mat('Heavy Studio Mount Iron', (0.042, 0.045, 0.050), metal=0.65, rough=0.46, bump_strength=0.24, bump_scale=150.0)
hickory = mat('Turned Hickory Drumstick', (0.68, 0.49, 0.28), metal=0.0, rough=0.34, bump_strength=0.14, bump_scale=120.0, coat=0.25)
velvet_rope = mat('Plush Theatre Barrier Velvet', (0.26, 0.008, 0.015), metal=0.0, rough=0.88, bump_strength=0.35, bump_scale=300.0)
velvet_rope.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value = 0.65
velvet_rope.node_tree.nodes['Principled BSDF'].inputs['Sheen Tint'].default_value = (0.85, 0.12, 0.15, 1.0)
tweed = mat('Braided Vintage Tweed Cable', (0.56, 0.43, 0.22), metal=0.0, rough=0.78, bump_strength=0.42, bump_scale=420.0)
red_enamel = mat('Crimson Gate Enamel', (0.62, 0.045, 0.032), metal=0.05, rough=0.20, bump_strength=0.06, coat=0.6)
cream_enamel = mat('Warm Cream Gate Enamel', (0.86, 0.79, 0.64), metal=0.0, rough=0.28, bump_strength=0.08, coat=0.4)

# Coated Snare Batter Head Material with Texture + Fine Sandblasted Bump
batter_mat = mat('Coated Snare Batter Head', (0.88, 0.83, 0.73), metal=0.0, rough=0.68, bump_strength=0.26, bump_scale=350.0)
bn = batter_mat.node_tree.nodes
bl = batter_mat.node_tree.links
bp = bn.get('Principled BSDF')
btex = bn.new('ShaderNodeTexImage')
btex.image = bpy.data.images.load(str(snare_tex_path))
bl.new(btex.outputs['Color'], bp.inputs['Base Color'])

# Optical Glass for Toroidal Ring Channel & Clock Crystal
ring_glass = mat('Crystal Ring Buffer Glass', (0.88, 0.95, 0.96), metal=0.0, rough=0.04, bump_strength=0.0, coat=0.85)
rgp = ring_glass.node_tree.nodes['Principled BSDF']
rgp.inputs['Transmission Weight'].default_value = 0.92
rgp.inputs['IOR'].default_value = 1.50
rgp.inputs['Alpha'].default_value = 0.38


def emissive_mat(name, rgb, strength=5.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*rgb, 1.0)
    p.inputs['Emission Color'].default_value = (*rgb, 1.0)
    p.inputs['Emission Strength'].default_value = strength
    p.inputs['Roughness'].default_value = 0.08
    p.inputs['Transmission Weight'].default_value = 0.65
    p.inputs['Coat Weight'].default_value = 0.85
    return m


amber_sphere_glow = emissive_mat('Amber Sample Sphere', (1.0, 0.34, 0.02), 2.8)
downbeat_jewel_glow = emissive_mat('Downbeat Amber Jewel', (1.0, 0.45, 0.04), 4.2)
pilot_jewel_glow = emissive_mat('Preamp Amber Pilot Light', (1.0, 0.35, 0.02), 4.5)


def tex_plane_mat(name, img_path, emission_strength=0.35):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    l = m.node_tree.links
    p = n.get('Principled BSDF')
    p.inputs['Roughness'].default_value = 0.22
    p.inputs['Coat Weight'].default_value = 0.55
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


def cone(name, a, b, r1, r2, material, vertices=40):
    va, vb = Vector(a), Vector(b)
    d = vb - va
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=d.length, location=(va + vb) / 2.0)
    o = bpy.context.object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    return finish(o, name, material)


def tor(name, loc, major_r, minor_r, material, rot=(0, 0, 0), scale=None):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=72, minor_segments=20,
        major_radius=major_r, minor_radius=minor_r,
        location=loc, rotation=rot
    )
    o = bpy.context.object
    if scale is not None:
        o.scale = scale
    return finish(o, name, material)


def sphere(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=24, location=loc)
    o = bpy.context.object
    o.scale = scale
    return finish(o, name, material)


def tube(name, pts, r, material, bevel_res=5):
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


def text3d(body, loc, size, material, rot=(0, 0, 0), extrude=0.003, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.extrude = extrude
    o.data.align_x = align
    return finish(o, f"Text_{body}", material)


# ==============================================================================
# 1. RECORDING STUDIO WALNUT BENCH & ACOUSTIC SLAT BACKDROP
# ==============================================================================
box('Recording Studio Walnut Bench', (0, 0.2, -0.18), (11.5, 6.8, 0.36), walnut, bevel=0.06)
studio_wall = mat('Dark Charcoal Studio Felt Wall', (0.022, 0.020, 0.018), metal=0.0, rough=0.92, bump_strength=0.18)
box('Studio Acoustic Back Wall', (0, 3.2, 2.4), (16.0, 0.2, 8.0), studio_wall, bevel=0.02)
# Warm walnut acoustic studio slats in deep background
for sx in range(-12, 13):
    box(f"Acoustic_Slat_{sx}", (sx * 0.44, 3.04, 2.4), (0.18, 0.08, 7.5), walnut, bevel=0.012)


# ==============================================================================
# 2. CENTER-LEFT HERO: VINTAGE BRASS & CHROME SNARE DRUM + SPUN BRONZE HI-HAT
# ==============================================================================
SNARE_POS = Vector((-1.42, -0.25, 0.0))
SNARE_R = 1.02
SNARE_H = 0.78
SNARE_Z0 = 0.22

# Heavy Chrome Snare Basket Stand Beneath the Drum
cyl('Snare Stand Base Collar', (SNARE_POS.x, SNARE_POS.y, 0.0), (SNARE_POS.x, SNARE_POS.y, 0.22), 0.20, chrome)
tor('Snare Stand Knurled Ring', (SNARE_POS.x, SNARE_POS.y, 0.14), 0.22, 0.028, brass)
for b_i in range(3):
    ang = b_i * 2 * pi / 3 + 0.4
    bx = SNARE_POS.x + (SNARE_R + 0.04) * cos(ang)
    by = SNARE_POS.y + (SNARE_R + 0.04) * sin(ang)
    cyl(f"Basket_Arm_{b_i}", (SNARE_POS.x, SNARE_POS.y, 0.16), (bx, by, SNARE_Z0 + 0.04), 0.036, chrome)
    box(f"Basket_Rubber_Grip_{b_i}", (bx, by, SNARE_Z0 + 0.08), (0.09, 0.09, 0.12), bakelite, bevel=0.015, rot=(0, 0, ang))

# Vintage Brushed Brass Snare Shell + Center Bead
cyl('Vintage Brass Snare Shell', (SNARE_POS.x, SNARE_POS.y, SNARE_Z0), (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + SNARE_H), SNARE_R, brass, vertices=72)
tor('Snare Shell Center Bead', (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + SNARE_H * 0.5), SNARE_R + 0.008, 0.024, brass)

# Coated Warm Batter Head on Top of Snare
cyl('Coated Batter Drumhead', (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + SNARE_H - 0.02),
    (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + SNARE_H + 0.015), SNARE_R - 0.015, batter_mat, vertices=72, bevel=0.004)

# Die-Cast Chrome Top & Bottom Counterhoops
tor('Top Die-Cast Chrome Hoop', (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + SNARE_H + 0.015), SNARE_R + 0.022, 0.042, chrome, scale=(1, 1, 1.35))
tor('Bottom Die-Cast Chrome Hoop', (SNARE_POS.x, SNARE_POS.y, SNARE_Z0 + 0.01), SNARE_R + 0.022, 0.040, chrome, scale=(1, 1, 1.30))

# 10 Polished Chrome Double-Ended Tube Lugs & Tension Rods around the Shell
for i in range(10):
    ang = i * 2 * pi / 10 + 0.15
    lx = SNARE_POS.x + (SNARE_R + 0.055) * cos(ang)
    ly = SNARE_POS.y + (SNARE_R + 0.055) * sin(ang)
    # Center tube lug body
    cyl(f"Chrome_Tube_Lug_{i}", (lx, ly, SNARE_Z0 + 0.16), (lx, ly, SNARE_Z0 + SNARE_H - 0.16), 0.036, chrome)
    sphere(f"Lug_Top_End_{i}", (lx, ly, SNARE_Z0 + SNARE_H - 0.16), (0.046, 0.046, 0.046), chrome)
    sphere(f"Lug_Bot_End_{i}", (lx, ly, SNARE_Z0 + 0.16), (0.046, 0.046, 0.046), chrome)
    # Tension rods & hoop claws
    cyl(f"Tension_Rod_Top_{i}", (lx, ly, SNARE_Z0 + SNARE_H - 0.16), (lx, ly, SNARE_Z0 + SNARE_H + 0.09), 0.018, brushed_steel)
    cyl(f"Tension_Rod_Head_{i}", (lx, ly, SNARE_Z0 + SNARE_H + 0.07), (lx, ly, SNARE_Z0 + SNARE_H + 0.115), 0.028, brass, vertices=4)
    cyl(f"Tension_Rod_Bot_{i}", (lx, ly, SNARE_Z0 + 0.16), (lx, ly, SNARE_Z0 - 0.06), 0.018, brushed_steel)

# Front Brass Vent Badge & Side Snare Throw-Off Strainer
badge_ang = -pi / 2 + 0.08
bx = SNARE_POS.x + (SNARE_R + 0.012) * cos(badge_ang)
by = SNARE_POS.y + (SNARE_R + 0.012) * sin(badge_ang)
box('Snare Brass Maker Badge', (bx, by, SNARE_Z0 + SNARE_H * 0.5), (0.34, 0.025, 0.16), bakelite, bevel=0.005, rot=(0, 0, badge_ang + pi / 2))
tor('Snare Vent Grommet', (bx, by - 0.01, SNARE_Z0 + SNARE_H * 0.5), 0.028, 0.009, brass, rot=(pi / 2, 0, 0))

# Spun-Bronze Hi-Hat Cymbal Pair on Left-Rear of the Snare
HIHAT_POS = Vector((-2.28, 0.42, 0.0))
cyl('HiHat Stand Base Tube', (HIHAT_POS.x, HIHAT_POS.y, 0.0), (HIHAT_POS.x, HIHAT_POS.y, 1.48), 0.055, chrome)
cyl('HiHat Upper Pull Rod', (HIHAT_POS.x, HIHAT_POS.y, 1.48), (HIHAT_POS.x, HIHAT_POS.y, 2.38), 0.022, brushed_steel)


def make_cymbal(name, center, z_pos, radius, invert=False):
    # Revolved profile with dome bell, bow, and concentric lathing rings
    prof = [
        (0.025, z_pos + (0.12 if not invert else -0.10)),
        (0.19, z_pos + (0.11 if not invert else -0.095)),
        (0.25, z_pos + (0.062 if not invert else -0.055)),
        (0.52, z_pos + (0.038 if not invert else -0.032)),
        (radius * 0.80, z_pos + (0.016 if not invert else -0.014)),
        (radius, z_pos),
    ]
    segs = 72
    vs = [(center.x + r * cos(i * 2 * pi / segs), center.y + r * sin(i * 2 * pi / segs), z) for r, z in prof for i in range(segs)]
    fs = [(j * segs + i, j * segs + (i + 1) % segs, (j + 1) * segs + (i + 1) % segs, (j + 1) * segs + i)
          for j in range(len(prof) - 1) for i in range(segs)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(vs, [], fs)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    finish(ob, name, cymbal_bronze)
    sol = ob.modifiers.new('Thickness', 'SOLIDIFY')
    sol.thickness = 0.014
    # Add fine concentric spun-bronze tonal grooves on top cymbal
    if not invert:
        for gr in (0.28, 0.39, 0.50, 0.61, 0.72, 0.81):
            gz = z_pos + 0.052 * (1.0 - gr / radius)
            tor(f"Cymbal_Lathe_Groove_{gr}", (center.x, center.y, gz), gr, 0.0045, brass)
    return ob


make_cymbal('Bottom HiHat Cymbal', HIHAT_POS, 1.72, 0.88, invert=True)
make_cymbal('Top Spun-Bronze HiHat Cymbal', HIHAT_POS, 1.79, 0.88, invert=False)
cyl('HiHat Felt Washer', (HIHAT_POS.x, HIHAT_POS.y, 1.90), (HIHAT_POS.x, HIHAT_POS.y, 1.96), 0.068, velvet_rope)
cyl('HiHat Brass Clutch Nut', (HIHAT_POS.x, HIHAT_POS.y, 1.96), (HIHAT_POS.x, HIHAT_POS.y, 2.08), 0.055, brass)
for w_side in (-1, 1):
    box(f"Clutch_Wing_{w_side}", (HIHAT_POS.x + w_side * 0.068, HIHAT_POS.y, 2.03), (0.075, 0.020, 0.048), brass, bevel=0.005)


# ==============================================================================
# 3. THE POLITE MECHANICAL ARMS & HICKORY DRUMSTICKS HELD BEHIND
#    THE VELVET BARRIER + "BAR 02" RAILWAY CROSSING GATE
# ==============================================================================
# Heavy Articulated Drummer Actuator Rig Behind the Snare
RIG_BASE = Vector((-1.38, 0.92, 0.0))
box('Drummer Actuator Cast-Iron Plinth', (RIG_BASE.x, RIG_BASE.y, 0.14), (1.42, 0.78, 0.28), cast_iron, bevel=0.035)
box('Actuator Brass Cap Plate', (RIG_BASE.x, RIG_BASE.y, 0.30), (1.28, 0.64, 0.06), brass, bevel=0.015)

# Two Articulated Brushed-Steel & Brass Mechanical Arms (Left & Right Drumsticks)
arm_configs = [
    ("Left", -0.44, Vector((-1.82, 0.88, 0.32)), Vector((-1.96, 0.56, 1.78)), Vector((-1.72, -0.02, 1.56)), Vector((-1.24, -0.44, 1.42))),
    ("Right", 0.44, Vector((-0.94, 0.88, 0.32)), Vector((-0.80, 0.56, 1.84)), Vector((-1.12, -0.02, 1.58)), Vector((-1.58, -0.44, 1.44))),
]

for side_name, x_off, base_pt, elbow_pt, wrist_pt, tip_pt in arm_configs:
    # Base turret & brass harmonic drive housing
    cyl(f"{side_name}_Base_Turret", base_pt, base_pt + Vector((0, 0, 0.28)), 0.16, brass)
    sphere(f"{side_name}_Shoulder_Ball", base_pt + Vector((0, 0, 0.32)), (0.14, 0.14, 0.14), cast_iron)
    tor(f"{side_name}_Shoulder_Collar", base_pt + Vector((0, 0, 0.32)), 0.15, 0.025, brass, rot=(0.4, 0, 0))

    # Dual parallel brushed-steel upper boom struts + hydraulic damper cylinder
    sh_pt = base_pt + Vector((0, 0, 0.32))
    for s_dx in (-0.045, 0.045):
        cyl(f"{side_name}_Upper_Strut_{s_dx}", sh_pt + Vector((s_dx, 0, 0)), elbow_pt + Vector((s_dx, 0, 0)), 0.032, brushed_steel)
    # Brass damper piston
    damper_mid = (sh_pt + elbow_pt) * 0.5 + Vector((0, -0.07, 0))
    cyl(f"{side_name}_Damper_Barrel", sh_pt + Vector((0, -0.07, 0)), damper_mid, 0.042, brass)
    cyl(f"{side_name}_Damper_Rod", damper_mid, elbow_pt + Vector((0, -0.07, 0)), 0.022, chrome)

    # Elbow precision bearing joint
    cyl(f"{side_name}_Elbow_Drum", elbow_pt + Vector((-0.11, 0, 0)), elbow_pt + Vector((0.11, 0, 0)), 0.115, brass)
    cyl(f"{side_name}_Elbow_Cap", elbow_pt + Vector((-0.13, 0, 0)), elbow_pt + Vector((0.13, 0, 0)), 0.075, chrome)

    # Forearm linkage reaching forward toward the snare—physically stopped at the barrier!
    cyl(f"{side_name}_Forearm_Tube", elbow_pt, wrist_pt, 0.046, brushed_steel)
    tor(f"{side_name}_Forearm_Ring", (elbow_pt + wrist_pt) * 0.5, 0.062, 0.015, brass, rot=(pi / 2, 0, 0))

    # Articulated Brass Wrist Gimbal & Velvet-Lined Drumstick Chuck
    sphere(f"{side_name}_Wrist_Sphere", wrist_pt, (0.095, 0.095, 0.095), brass)
    box(f"{side_name}_Stick_Clamp_Cradle", wrist_pt + Vector((0, -0.05, -0.04)), (0.14, 0.18, 0.11), chrome, bevel=0.015)
    cyl(f"{side_name}_Clamp_Thumbscrew", wrist_pt + Vector((0, -0.05, 0.02)), wrist_pt + Vector((0, -0.05, 0.11)), 0.035, brass)

    # Turned Hickory Drumstick Held Poised in the Mechanical Grip (butt end to acorn tip)
    stick_vec = (tip_pt - wrist_pt).normalized()
    butt_pt = wrist_pt - stick_vec * 0.42
    neck_pt = tip_pt - stick_vec * 0.08
    cone(f"{side_name}_Hickory_Drumstick_Shaft", butt_pt, neck_pt, 0.038, 0.020, hickory)
    sphere(f"{side_name}_Drumstick_Butt", butt_pt, (0.037, 0.037, 0.037), hickory)
    # Turned hickory acorn bead tip hovering politely above the snare & behind the barrier
    sphere(f"{side_name}_Drumstick_Acorn_Tip", tip_pt, (0.034, 0.044, 0.034), hickory)


# THE BARRIER: Miniature Velvet Theatre Rope + Striped Brass "BAR 02" Crossing Gate
# Left & Right Turned Brass Stanchion Posts Flanking the Snare Drum
STANCHION_L = Vector((-2.36, -0.18, 0.0))
STANCHION_R = Vector((-0.44, -0.18, 0.0))

for s_tag, s_pos in (("Left", STANCHION_L), ("Right", STANCHION_R)):
    cyl(f"Stanchion_Base_{s_tag}", s_pos, s_pos + Vector((0, 0, 0.08)), 0.22, brass)
    tor(f"Stanchion_Base_Torus_{s_tag}", s_pos + Vector((0, 0, 0.08)), 0.18, 0.028, chrome)
    cyl(f"Stanchion_Post_{s_tag}", s_pos + Vector((0, 0, 0.08)), s_pos + Vector((0, 0, 1.48)), 0.044, brass)
    sphere(f"Stanchion_Crown_Ball_{s_tag}", s_pos + Vector((0, 0, 1.54)), (0.085, 0.085, 0.085), brass)
    tor(f"Stanchion_Rope_Loop_{s_tag}", s_pos + Vector((0, 0, 1.38)), 0.065, 0.014, chrome)

# Plush Crimson Velvet Theatre Rope Draped Between the Stanchions (Holding Back the Sticks)
rope_pts = [
    STANCHION_L + Vector((0.08, 0, 1.38)),
    Vector((-1.92, -0.22, 1.30)),
    Vector((-1.40, -0.25, 1.25)),
    Vector((-0.88, -0.22, 1.30)),
    STANCHION_R + Vector((-0.08, 0, 1.38)),
]
tube('Plush Crimson Velvet Barrier Rope', rope_pts, 0.048, velvet_rope)
# Polished Brass Snap Hooks on Both Ends of the Velvet Rope
for end_pt in (rope_pts[0], rope_pts[-1]):
    cyl('Velvet Rope Brass Thimble', end_pt, end_pt + Vector((0, -0.01, -0.04)), 0.056, brass)

# Striped Brass & Enamel Railway Crossing Gate Arm + "WAIT: BAR 02" Placard Above the Rope
GATE_PIVOT = STANCHION_R + Vector((0, 0.06, 1.44))
box('Crossing Gate Pivot Housing', GATE_PIVOT, (0.18, 0.16, 0.20), cast_iron, bevel=0.02)
cyl('Crossing Gate Pivot Bolt', GATE_PIVOT + Vector((0, -0.10, 0)), GATE_PIVOT + Vector((0, 0.10, 0)), 0.045, brass)
# Counterweight arm on right of pivot
box('Gate Counterweight Arm', GATE_PIVOT + Vector((0.20, 0, 0)), (0.36, 0.05, 0.07), brass, bevel=0.01)
cyl('Gate Cast-Iron Counterweight', GATE_PIVOT + Vector((0.34, -0.06, 0)), GATE_PIVOT + Vector((0.34, 0.06, 0)), 0.12, cast_iron)

# Striped Gate Boom Arm Spanning Across the Snare Drum
for seg_i in range(8):
    gx = GATE_PIVOT.x - 0.18 - seg_i * 0.22
    seg_mat = red_enamel if seg_i % 2 == 0 else cream_enamel
    box(f"Gate_Stripe_Segment_{seg_i}", (gx, GATE_PIVOT.y, GATE_PIVOT.z), (0.222, 0.042, 0.078), seg_mat, bevel=0.008)
# Brass upper and lower edge rails on the crossing gate boom
box('Gate Boom Top Brass Trim', (-1.40, GATE_PIVOT.y, GATE_PIVOT.z + 0.044), (1.92, 0.050, 0.016), brass, bevel=0.004)
box('Gate Boom Bottom Brass Trim', (-1.40, GATE_PIVOT.y, GATE_PIVOT.z - 0.044), (1.92, 0.050, 0.016), brass, bevel=0.004)

# Hanging Brass-Framed Placard on the Crossing Gate: "BAR-BOUNDARY GATE · HOLD FOR BAR 02"
gate_sign_mat = tex_plane_mat('Gate_Sign_Mat', gate_tex_path, emission_strength=0.18)
SIGN_POS = Vector((-1.40, GATE_PIVOT.y - 0.03, 1.15))
box('Gate Placard Brass Frame', SIGN_POS, (1.12, 0.035, 0.36), brass, bevel=0.01)
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(SIGN_POS.x, SIGN_POS.y - 0.020, SIGN_POS.z), rotation=(pi / 2, 0, 0))
sign_plane = bpy.context.object
sign_plane.scale = (1.06, 0.31, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
finish(sign_plane, 'Gate Placard Printed Face', gate_sign_mat)


# ==============================================================================
# 4. CENTER-RIGHT HERO: LOCK-FREE TOROIDAL COPPER & GLASS "AnalysisAudioRing"
#    + PRECISION BLACK-BAKELITE & BRASS "MUSICAL CLOCK" CHRONOMETER
# ==============================================================================
RING_POS = Vector((1.55, -0.52, 0.42))
RING_MAJOR = 0.88
RING_MINOR = 0.17

# Heavy Cast-Iron & Brass Pedestal Supporting the Toroidal Ring Buffer
box('Ring Buffer Base Plinth', (RING_POS.x, RING_POS.y, 0.10), (1.96, 1.88, 0.20), cast_iron, bevel=0.035)
box('Ring Buffer Brass Plaque', (RING_POS.x, RING_POS.y - 0.95, 0.10), (1.36, 0.03, 0.12), brass, bevel=0.006)
text3d('ANALYSIS AUDIO RING · LOCK-FREE SPSC', (RING_POS.x, RING_POS.y - 0.97, 0.075), 0.052, bakelite, rot=(pi / 2, 0, 0), extrude=0.002)

for p_deg in (45, 135, 225, 315):
    pr = math.radians(p_deg)
    px = RING_POS.x + RING_MAJOR * cos(pr)
    py = RING_POS.y + RING_MAJOR * sin(pr)
    cyl(f"Ring_Support_Pillar_{p_deg}", (px, py, 0.18), (px, py, RING_POS.z - 0.10), 0.065, brass)

# Lower Machined Copper Torus Cradle + Upper Crystal-Clear Glass Torus Cover
tor('Copper Toroidal Channel Lower', (RING_POS.x, RING_POS.y, RING_POS.z - 0.03), RING_MAJOR, RING_MINOR * 0.92, copper, scale=(1, 1, 0.65))
tor('Inner Brass Guide Rail', (RING_POS.x, RING_POS.y, RING_POS.z), RING_MAJOR - RING_MINOR + 0.02, 0.028, brass)
tor('Outer Brass Guide Rail', (RING_POS.x, RING_POS.y, RING_POS.z), RING_MAJOR + RING_MINOR - 0.02, 0.028, brass)
tor('Glass Torus Buffer Enclosure', RING_POS, RING_MAJOR, RING_MINOR, ring_glass)

# 8 Brass Clamping Rings Around the Glass-and-Copper Torus
for c_i in range(8):
    c_ang = c_i * 2 * pi / 8 + 0.2
    cx = RING_POS.x + RING_MAJOR * cos(c_ang)
    cy = RING_POS.y + RING_MAJOR * sin(c_ang)
    tor(f"Torus_Brass_Clamp_{c_i}", (cx, cy, RING_POS.z), RING_MINOR + 0.012, 0.018, brass, rot=(pi / 2, 0, c_ang + pi / 2))

# 14 Glowing Warm-Amber Audio Sample Spheres Circulating in Single File Inside the Torus!
for s_i in range(14):
    s_ang = s_i * 2 * pi / 14 + 0.12
    sx = RING_POS.x + RING_MAJOR * cos(s_ang)
    sy = RING_POS.y + RING_MAJOR * sin(s_ang)
    sz = RING_POS.z + 0.01
    sphere(f"Audio_Sample_Sphere_{s_i}", (sx, sy, sz), (0.088, 0.088, 0.088), amber_sphere_glow)
    # Delicate brass ring collar around every 2nd sample sphere
    if s_i % 2 == 0:
        tor(f"Sample_Harmonic_Ring_{s_i}", (sx, sy, sz), 0.092, 0.010, brass, rot=(0.4, 0.2, s_ang))

# Producer ("WRITE") and Consumer ("READ -> RtSignal") Brass Nozzles on the Torus
cyl('Producer Write Nozzle', (RING_POS.x - RING_MAJOR - 0.26, RING_POS.y, RING_POS.z),
    (RING_POS.x - RING_MAJOR + 0.05, RING_POS.y, RING_POS.z), 0.085, brass)
cyl('Consumer Read Nozzle', (RING_POS.x, RING_POS.y + RING_MAJOR - 0.05, RING_POS.z),
    (RING_POS.x, RING_POS.y + RING_MAJOR + 0.28, RING_POS.z), 0.085, copper)


# PRECISION BLACK-BAKELITE & BRASS "MUSICAL CLOCK" CHRONOMETER (Standing Behind/Above the Ring)
CLOCK_POS = Vector((1.72, 0.85, 1.58))
CLOCK_R = 1.04
CLOCK_YAW = -0.26

bpy.ops.object.empty_add(location=CLOCK_POS, rotation=(0.10, 0.0, CLOCK_YAW))
clock_root = bpy.context.object
clock_root.name = "Musical_Clock_Chronometer"

# Heavy Cast-Iron & Brass Twin Pedestal Legs Supporting the Chronometer
for lx in (-0.52, 0.52):
    cyl(f"Clock_Pedestal_Col_{lx}", (lx, 0.08, -1.52), (lx, 0.08, -0.78), 0.095, brass).parent = clock_root
    tor(f"Clock_Pedestal_Base_{lx}", (lx, 0.08, -1.50), 0.15, 0.032, cast_iron).parent = clock_root
box('Clock Lower Yoke Bar', (0, 0.08, -0.92), (1.32, 0.22, 0.14), cast_iron, bevel=0.02).parent = clock_root

# Gloss Black Bakelite Drum Housing & Stepped Polished-Brass Bezel
cyl('Clock Bakelite Drum Case', (0, 0.26, 0), (0, -0.06, 0), CLOCK_R + 0.08, bakelite, vertices=72).parent = clock_root
tor('Clock Outer Brass Bezel', (0, -0.06, 0), CLOCK_R + 0.03, 0.068, brass, rot=(pi / 2, 0, 0)).parent = clock_root
tor('Clock Inner Chrome Rehaut', (0, -0.10, 0), CLOCK_R - 0.04, 0.032, chrome, rot=(pi / 2, 0, 0)).parent = clock_root

# 12 Machined Brass Perimeter Screws around the Chronometer Bezel
for b_i in range(12):
    ba = b_i * 2 * pi / 12
    bx = (CLOCK_R + 0.03) * cos(ba)
    bz = (CLOCK_R + 0.03) * sin(ba)
    cyl(f"Bezel_Screw_{b_i}", (bx, -0.11, bz), (bx, -0.145, bz), 0.022, chrome).parent = clock_root

# High-Contrast Dial Face Inside the Chronometer
dial_mat = tex_plane_mat('Musical_Clock_Dial_Mat', clock_tex_path, emission_strength=0.45)
bpy.ops.mesh.primitive_cylinder_add(vertices=72, radius=CLOCK_R - 0.05, depth=0.02, location=(0, -0.08, 0), rotation=(pi / 2, 0, 0))
dial_disc = bpy.context.object
finish(dial_disc, 'Musical Clock Dial Face', dial_mat)
dial_disc.parent = clock_root
# Planar UV projection on front face of dial cylinder
uv_layer = dial_disc.data.uv_layers.active or dial_disc.data.uv_layers.new()
for poly in dial_disc.data.polygons:
    for li in poly.loop_indices:
        vi = dial_disc.data.loops[li].vertex_index
        vco = dial_disc.data.vertices[vi].co
        u = 0.5 + vco.x / (2.0 * (CLOCK_R - 0.05))
        v = 0.5 + vco.y / (2.0 * (CLOCK_R - 0.05))
        uv_layer.data[li].uv = (u, v)

# 3D Raised Brass Beat Markers & Glowing Top-Dead-Center Downbeat Jewel (12 o'clock)
for q_i in range(4):
    qa = pi / 2 - q_i * pi / 2
    qx = (CLOCK_R - 0.16) * cos(qa)
    qz = (CLOCK_R - 0.16) * sin(qa)
    if q_i == 0:
        sphere('Top_Dead_Center_Downbeat_Jewel', (qx, -0.12, qz), (0.075, 0.045, 0.075), downbeat_jewel_glow).parent = clock_root
        tor('Downbeat_Jewel_Rim', (qx, -0.11, qz), 0.082, 0.018, brass, rot=(pi / 2, 0, 0)).parent = clock_root
    else:
        sphere(f"Beat_Marker_Stud_{q_i}", (qx, -0.11, qz), (0.045, 0.025, 0.045), brass).parent = clock_root

# 3D Swept Brass Chronometer Needle Approaching Top Dead-Center (at ~11:25 -> -20 deg from TDC!)
needle_ang = math.radians(110)  # Just 20 degrees shy of 90 deg (Top Dead Center)
nx_tip = 0.76 * cos(needle_ang)
nz_tip = 0.76 * sin(needle_ang)
nx_tail = -0.22 * cos(needle_ang)
nz_tail = -0.22 * sin(needle_ang)
cone('Clock_Main_Bar_Needle', (0, -0.125, 0), (nx_tip, -0.125, nz_tip), 0.042, 0.008, brass).parent = clock_root
cyl('Clock_Needle_Countertail', (0, -0.125, 0), (nx_tail, -0.125, nz_tail), 0.022, brass).parent = clock_root
sphere('Clock_Needle_Tail_Ring', (nx_tail, -0.125, nz_tail), (0.048, 0.018, 0.048), brass).parent = clock_root
# Secondary tempo subdivision hand
sub_ang = math.radians(25)
cyl('Clock_Sub_Hand', (0, -0.115, 0), (0.54 * cos(sub_ang), -0.115, 0.54 * sin(sub_ang)), 0.016, chrome).parent = clock_root
# Center brass cap nut
cyl('Clock_Center_Pinion_Cap', (0, -0.09, 0), (0, -0.15, 0), 0.085, brass).parent = clock_root
cyl('Clock_Center_Pinion_Nut', (0, -0.15, 0), (0, -0.17, 0), 0.042, chrome).parent = clock_root

# Top Chronometer Winding Crown / Metronome Bell & Clear Beveled Glass Crystal
cyl('Clock Top Crown Stem', (0, 0.05, CLOCK_R + 0.08), (0, 0.05, CLOCK_R + 0.22), 0.075, brass).parent = clock_root
cyl('Clock Knurled Crown', (0, 0.05, CLOCK_R + 0.22), (0, 0.05, CLOCK_R + 0.32), 0.14, brass).parent = clock_root
tor('Clock Crown Bail', (0, 0.05, CLOCK_R + 0.34), 0.16, 0.024, chrome, rot=(pi / 2, 0, 0)).parent = clock_root
cyl('Clock Protective Glass Crystal', (0, -0.155, 0), (0, -0.175, 0), CLOCK_R - 0.03, ring_glass, vertices=72, bevel=0.004).parent = clock_root

# Copper & Braided Signal Conduits Wiring the Toroidal Ring to the Clock AND to the Barrier Gate
tube(
    'Ring_To_Clock_Conduit',
    [(RING_POS.x, RING_POS.y + RING_MAJOR + 0.18, RING_POS.z),
     (1.62, 0.58, 0.65),
     (1.68, 0.76, 1.05)],
    0.034, copper
)
tube(
    'Clock_To_Gate_Sync_Cable',
    [(0.82, 0.72, 1.25),
     (0.18, 0.32, 0.92),
     (-0.44, -0.12, 1.38)],
    0.028, brass
)


# ==============================================================================
# 5. FOREGROUND: GUITAR INPUT — 1/4" CHROME TRS JACK, BRAIDED TWEED CABLE &
#    NAM CAPTURE / IR RIG INPUT PREAMP BLOCK WITH AMBER JEWEL PILOT LIGHT
# ==============================================================================
PREAMP_POS = Vector((-0.05, -1.58, 0.0))
PREAMP_ROT = (0, 0, 0.14)

bpy.ops.object.empty_add(location=PREAMP_POS, rotation=PREAMP_ROT)
preamp = bpy.context.object
preamp.name = "NAM_Capture_Preamp_Block"

# Compact Machined Walnut, Bakelite & Brushed-Brass NAM / IR Rig Input Box
box('Preamp Walnut Side Cheeks', (0, 0, 0.20), (1.58, 0.88, 0.40), walnut, bevel=0.03).parent = preamp
box('Preamp Bakelite Chassis', (0, 0, 0.22), (1.44, 0.82, 0.42), bakelite, bevel=0.025).parent = preamp
box('Preamp Brushed Brass Faceplate', (0, -0.415, 0.22), (1.36, 0.025, 0.34), brass, bevel=0.008).parent = preamp
box('Preamp Top Brass Deck', (0, 0, 0.435), (1.34, 0.72, 0.025), brass, bevel=0.008).parent = preamp

text3d('GUITAR COMPANION · NAM / IR', (0, -0.432, 0.30), 0.058, bakelite, rot=(pi / 2, 0, 0), extrude=0.002).parent = preamp
text3d('JUCE 8 · 3-RIG INPUT STAGE', (0, -0.432, 0.09), 0.044, bakelite, rot=(pi / 2, 0, 0), extrude=0.002).parent = preamp

# Glowing Amber Faceted Jewel Pilot Light on the Preamp Faceplate & Top
sphere('Preamp Amber Pilot Jewel', (-0.48, -0.44, 0.21), (0.058, 0.048, 0.058), pilot_jewel_glow).parent = preamp
tor('Preamp Pilot Chrome Bezel', (-0.48, -0.43, 0.21), 0.068, 0.016, chrome, rot=(pi / 2, 0, 0)).parent = preamp

# Two Knurled Brass / Bakelite Gain & IR Blend Knobs on Top of the Input Block
for kx in (-0.36, 0.36):
    cyl(f"Preamp_Knob_Skirt_{kx}", (kx, 0.02, 0.44), (kx, 0.02, 0.50), 0.14, brass).parent = preamp
    cyl(f"Preamp_Knob_Body_{kx}", (kx, 0.02, 0.50), (kx, 0.02, 0.62), 0.11, bakelite).parent = preamp
    box(f"Preamp_Knob_Pointer_{kx}", (kx, -0.04, 0.625), (0.022, 0.11, 0.015), cream_enamel, bevel=0.003).parent = preamp

# Heavy Chrome 1/4" TRS Guitar Input Jack Plugged into the Front-Right of the Preamp Block
JACK_SOCKET = Vector((0.46, -0.43, 0.20))
cyl('Input Jack Hex Nut', JACK_SOCKET, JACK_SOCKET + Vector((0, -0.04, 0)), 0.085, chrome, vertices=6).parent = preamp
# Protruding heavy knurled chrome 1/4" plug barrel + brass collar + strain-relief spring
cyl('TRS Plug Chrome Collar', JACK_SOCKET + Vector((0, -0.04, 0)), JACK_SOCKET + Vector((0, -0.14, 0)), 0.062, brass).parent = preamp
cyl('TRS Plug Knurled Barrel', JACK_SOCKET + Vector((0, -0.14, 0)), JACK_SOCKET + Vector((0, -0.52, 0)), 0.082, chrome).parent = preamp
for gr_y in (-0.20, -0.28, -0.36, -0.44):
    tor(f"Plug_Knurl_Ring_{gr_y}", JACK_SOCKET + Vector((0, gr_y, 0)), 0.084, 0.008, brushed_steel, rot=(pi / 2, 0, 0)).parent = preamp
for sp_i in range(7):
    tor(f"Strain_Relief_Spring_{sp_i}", JACK_SOCKET + Vector((0, -0.54 - sp_i * 0.028, 0)),
        0.056 - sp_i * 0.002, 0.012, chrome, rot=(pi / 2, 0, 0)).parent = preamp

# Braided Vintage Tweed Guitar Cable Sweeping Across the Foreground & Second Unplugged TRS Plug for Detail
tweed_pts = [
    Vector((-2.85, -1.95, 0.06)),
    Vector((-1.95, -2.08, 0.06)),
    Vector((-1.05, -1.88, 0.07)),
    Vector((-0.35, -2.18, 0.06)),
    Vector((0.36, -2.22, 0.14)),
    Vector((0.48, -1.96, 0.20)),
]
tube('Braided Vintage Tweed Guitar Cable', tweed_pts, 0.052, tweed)

# Cable linking Preamp Output into the Producer ("WRITE") Nozzle of the Lock-Free Copper Ring
tube(
    'Preamp_To_Ring_Buffer_Cable',
    [(0.68, -1.48, 0.22),
     (0.88, -1.08, 0.16),
     (RING_POS.x - RING_MAJOR - 0.22, RING_POS.y, RING_POS.z)],
    0.036, tweed
)


# ==============================================================================
# 6. WARM RECORDING-STUDIO LIGHTING & CAMERA FRAMING
# ==============================================================================
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


# Warm amber/gold key light catching the spun-bronze cymbal, chrome snare lugs, and copper ring
add_area_light('Warm Gold Studio Key', (-4.2, -3.8, 5.0), 680, (1.0, 0.78, 0.50), 3.6, (-0.3, -0.2, 1.0))
# Cool slate studio fill from the right for crisp chrome/copper specular separation
add_area_light('Cool Studio Fill', (4.6, -3.2, 4.0), 340, (0.60, 0.78, 1.0), 3.4, (0.4, -0.2, 1.0))
# Warm rim/back light catching the mechanical arms, drumsticks, velvet rope, and clock bezel
add_area_light('Warm Bronze Rim', (-0.2, 2.8, 4.8), 580, (1.0, 0.72, 0.42), 4.0, (0.0, -0.3, 1.2), shape='RECTANGLE', size_y=1.6)
# Overhead strip reflection for the snare head, copper torus, and walnut bench
add_area_light('Overhead Studio Softbox', (0.0, -1.0, 5.8), 280, (1.0, 0.90, 0.76), 4.4, (0.0, -0.4, 0.9), shape='RECTANGLE', size_y=1.4)
# Foreground bounce for the 1/4" TRS guitar plug, tweed cable, and gate placard
add_area_light('Foreground Warm Bounce', (0.2, -4.6, 1.8), 125, (1.0, 0.84, 0.64), 2.8, (0.0, -1.2, 0.6))

# Point lights inside the copper ring buffer & preamp jewel for warm studio glow
bpy.ops.object.light_add(type='POINT', location=(RING_POS.x, RING_POS.y, RING_POS.z + 0.25))
pt_ring = bpy.context.object
pt_ring.name = "Ring_Buffer_Warm_Glow"
pt_ring.data.energy = 26.0
pt_ring.data.color = (1.0, 0.60, 0.16)
pt_ring.data.shadow_soft_size = 0.55

bpy.ops.object.light_add(type='POINT', location=(-0.52, -1.95, 0.35))
pt_pilot = bpy.context.object
pt_pilot.name = "Pilot_Jewel_Spill"
pt_pilot.data.energy = 12.0
pt_pilot.data.color = (1.0, 0.50, 0.10)
pt_pilot.data.shadow_soft_size = 0.25

# Camera Setup: Tightly Framed 3/4 Elevated Studio Still Life
bpy.ops.object.camera_add(location=(0.18, -6.25, 3.05))
cam = bpy.context.object
cam.name = "Jammate_Editorial_Camera"
cam_target = Vector((0.02, -0.32, 0.96))
cam.rotation_euler = (cam_target - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'PERSP'
cam.data.lens = 47.0
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = (Vector((-0.25, -0.55, 1.05)) - cam.location).length
cam.data.dof.aperture_fstop = 8.0
scene.camera = cam

# Render & Save
png_path = TMP / ('preview.png' if WIDTH < 1600 else 'final.png')
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(png_path)
bpy.ops.render.render(write_still=True)

webp_out = Path(os.environ.get('OUTPUT', str(ROOT / 'waiting-for-the-downbeat.webp')))
webp_out.parent.mkdir(parents=True, exist_ok=True)
Image.open(png_path).convert('RGB').save(webp_out, 'WEBP', quality=92, method=6)
print(f"FINISHED {webp_out} ({WIDTH}x{HEIGHT}, samples={SAMPLES})", flush=True)
