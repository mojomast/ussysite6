import test from 'node:test';
import assert from 'node:assert/strict';
import { isSoftwareRenderer } from '../src/scripts/fx/capability.ts';

test('software rasterizers drop the full tier; real GPUs keep it', () => {
  for (const r of [
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver',
    'Google SwiftShader'
  ]) assert.equal(isSoftwareRenderer(r), true, r);
  for (const r of [
    'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Adreno (TM) 730',
    'Mali-G78'
  ]) assert.equal(isSoftwareRenderer(r), false, r);
});
