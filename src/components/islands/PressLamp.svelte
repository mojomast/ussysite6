<script lang="ts">
  import { onMount } from 'svelte';
  import { carbonSynth } from '../../lib/carbon-synth';

  const KEY = 'si.lamp.v1';

  let leftOn = $state(false);
  let mounted = $state(false);
  let message = $state('');

  onMount(() => {
    mounted = true;
    try {
      leftOn = localStorage.getItem(KEY) === 'on';
    } catch {
      leftOn = false;
    }
    if (leftOn) message = 'You left it on last time. It’s still on.';
  });

  function toggle() {
    leftOn = !leftOn;
    try {
      localStorage.setItem(KEY, leftOn ? 'on' : 'off');
    } catch {
      // The lamp still works, it just won't remember.
    }
    carbonSynth.lamp(leftOn);
    message = leftOn ? 'Okay. We’ll leave it on for you.' : 'Lights out. Goodnight.';
  }
</script>

<figure class={`opus-lamp ${leftOn ? 'is-left-on' : ''}`} aria-label="The press-room reading lamp">
  <svg class="opus-lamp-svg" viewBox="0 0 240 260" width="240" height="260" aria-hidden="true">
    <defs>
      <radialGradient id="opus-lamp-pool" cx="50%" cy="10%" r="80%">
        <stop offset="0%" stop-color="#f2d38a" stop-opacity="0.85" />
        <stop offset="55%" stop-color="#e8b85c" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#e8b85c" stop-opacity="0" />
      </radialGradient>
    </defs>
    <path class="opus-lamp-glow" d="M58 92 L182 92 L236 250 L4 250 Z" fill="url(#opus-lamp-pool)" />
    <path d="M120 8 V40" stroke="#6b6352" stroke-width="2" />
    <path d="M70 92 Q120 34 170 92 Z" fill="#1a1d24" stroke="#c9a24a" stroke-width="2" />
    <ellipse class="opus-lamp-bulb" cx="120" cy="92" rx="22" ry="6" fill="#f6dfa0" />
    <rect x="40" y="246" width="160" height="4" fill="#3a3a40" />
  </svg>
  <figcaption class="opus-lamp-caption">
    {#if mounted}
      <button type="button" class="ctrl-btn opus-lamp-btn" aria-pressed={leftOn} onclick={toggle}>
        {leftOn ? 'Turn the light off' : 'Leave the light on'}
      </button>
    {/if}
    <span class="datum-tag" role="status" aria-live="polite">{message}</span>
  </figcaption>
</figure>
