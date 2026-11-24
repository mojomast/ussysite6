<script lang="ts">
  import { carbonSynth } from '../../lib/carbon-synth';

  interface StudyStep {
    code: string;
    label: string;
    summary: string;
    badge: string;
    tone: 'pass' | 'warn' | 'fail' | 'info';
  }

  interface StudySpec {
    title: string;
    subtitle: string;
    steps: StudyStep[];
  }

  let {
    studyId,
    caption = '',
    title = ''
  }: {
    studyId: string;
    caption?: string;
    title?: string;
  } = $props();

  const STUDIES: Record<string, StudySpec> = {
    rizzstack: {
      title: 'ACDD Verifier & Cheating-Worker Gate',
      subtitle: 'workflow/reference/run_demo.py — RED -> GREEN -> bwrap integration',
      steps: [
        {
          code: 'W1',
          label: 'W1-PRICING · PASS',
          badge: 'ACCEPTED',
          tone: 'pass',
          summary:
            'Leased files respected. Baseline test fails RED, patch passes GREEN inside bwrap (--unshare-net), and combined integration emits a signed tdd-evidence/1 receipt.'
        },
        {
          code: 'W2',
          label: 'W2-LABELS · PASS',
          badge: 'ACCEPTED',
          tone: 'pass',
          summary:
            'Receipt label patch stays inside its assigned lease, transitions cleanly from RED to GREEN, and merges cleanly with W1 in the combined verification tree.'
        },
        {
          code: 'W3',
          label: 'W3 · SCOPE_VIOLATION',
          badge: 'QUARANTINED',
          tone: 'warn',
          summary:
            'Worker Three edited a file outside its signed file lease. The verifier catches the unleased path before integration and shunts W3 onto the quarantine rail.'
        },
        {
          code: 'W4',
          label: 'W4 · TESTS_TAMPERED',
          badge: 'REJECTED',
          tone: 'fail',
          summary:
            'Worker Four tried to pass the suite by weakening an approved test assertion. Frozen contract hashes catch the tampering immediately; GREEN is never run and never counted as passed.'
        }
      ]
    },
    uirizz: {
      title: 'A2UI Approval Gate — A Click Is Never Approval',
      subtitle: 'uirizz/dashboard/plugin_api.py — fail-closed petition flow',
      steps: [
        {
          code: '01',
          label: 'a2ui_render',
          badge: 'SURFACE MOUNTED',
          tone: 'info',
          summary:
            'Agent emits an official A2UI v1.0 Basic Catalog card (with unique surface_id and mandatory CLI fallback_text) into Hermes Desktop & Webapp chat.'
        },
        {
          code: '02',
          label: 'USER CLICKS BUTTON',
          badge: 'APPROVED: FALSE',
          tone: 'warn',
          summary:
            'Clicking an action inside the card sends POST /actions, which logs a pending petition with redacted args and returns approved: false. Nothing executes on click.'
        },
        {
          code: '03',
          label: 'AUDIT FAILURE PATH',
          badge: 'FAIL-CLOSED',
          tone: 'fail',
          summary:
            'If writing the audit log throws any exception, post_action catches it and returns code: record_failed with approved: false—the action is refused rather than silently run.'
        },
        {
          code: '04',
          label: 'TYPED "YES" IN CHAT',
          badge: 'AUTHORIZED',
          tone: 'pass',
          summary:
            'Only after the human types an explicit yes in the conversation stream does the gate authorize execution and update the card in place via op=update.'
        }
      ]
    },
    doppler: {
      title: 'Acoustic Flyover Doppler & ADS-B Match Pipeline',
      subtitle: 'dopplergeo/detect.py — 4 kHz mono STFT to candid 2/18 reality check',
      steps: [
        {
          code: '01',
          label: '4 kHz STFT',
          badge: 'RAW AUDIO',
          tone: 'info',
          summary:
            'Shell-free ffmpeg decodes any recording to 4,000 Hz mono float. Wind, traffic roar, and broadband background initially bury faint propeller harmonics.'
        },
        {
          code: '02',
          label: 'MAD WHITENING',
          badge: 'Z-SCORE MASK',
          tone: 'info',
          summary:
            'A running median across frequency bins strips the smooth noise floor; robust MAD scaling (Z = (W - med) / mad) isolates narrowband harmonic ridges.'
        },
        {
          code: '03',
          label: 'VITERBI S-CURVE',
          badge: 't_CPA FIT',
          tone: 'pass',
          summary:
            'Up to 6 harmonics sum jointly into a multi-ridge Viterbi tracker (with off-states), fitting aircraft speed v, slant range, and closest approach t_CPA.'
        },
        {
          code: '04',
          label: 'ADS-B MATCH (2/18)',
          badge: 'HONEST SCORE',
          tone: 'warn',
          summary:
            'Clean multi-pass recordings land within ~1 km, while unseen held-out clips hit <3 km only 2 out of 18 times—disclosed right at the top of the README.'
        }
      ]
    },
    photopart: {
      title: 'Involute Bouncer & Metric Calibration Loop',
      subtitle: 'plugin/photopart/gear_steer.py — empirical steering from runs r17 & r18',
      steps: [
        {
          code: '01',
          label: 'COIN SCALE',
          badge: 'PX / MM',
          tone: 'info',
          summary:
            'photo_part_measure calibrates millimetres per pixel from a coin, ruler, or ArUco tag with 4-point perspective rectification and explicit uncertainty_mm.'
        },
        {
          code: '02',
          label: 'GEAR_STEER BLOCK',
          badge: 'PRE_TOOL_CALL',
          tone: 'fail',
          summary:
            'If a coding model tries to write_file a hand-rolled involute/trochoid script (as deepseek-v4.1-flash did for 40 turns in r17/r18), gear_steer.py blocks the call.'
        },
        {
          code: '03',
          label: 'SPUR_GEAR TEMPLATE',
          badge: 'WATERTIGHT STL',
          tone: 'pass',
          summary:
            'Steered onto photo_part_template(shape="spur_gear"), trimesh + manifold3d emit a watertight mesh with exact module, pressure angle, and root/tip geometry.'
        },
        {
          code: '04',
          label: 'IOU & BUDGET GATE',
          badge: 'DELIVER NOW',
          tone: 'warn',
          summary:
            'photo_part_validate verifies wall thickness & ISO fasteners; past 80% of the 40-call budget, hooks refuse vanity re-renders and force final STL delivery.'
        }
      ]
    },
    jackpot: {
      title: 'Deterministic Arcade Pipeline & Midas Lip Sensor',
      subtitle: 'jackpotsyndicate — zero-network physics with 226 tests & golden replay',
      steps: [
        {
          code: '01',
          label: '3x3 SLOT REELS',
          badge: 'SEEDED RNG',
          tone: 'info',
          summary:
            'Deterministic slot spins resolve against AC-7 hit-rate contracts and release weighted pachinko spheres into the upper chamber.'
        },
        {
          code: '02',
          label: 'PACHINKO PINFIELD',
          badge: 'COLLISION SIM',
          tone: 'info',
          summary:
            'Orbs bounce across golden pegs and trinket triggers (quantum-splitter-coil, gold-peg-alchemist), spawning tokens onto the moving coin-pusher deck.'
        },
        {
          code: '03',
          label: 'DOZER SHELF',
          badge: 'UNBANKED',
          tone: 'warn',
          summary:
            'Tokens pushed along the reciprocating hydraulic shelf remain strictly unbanked while teetering—gutter rake is audited independently by pnpm sim:rake (AC-5).'
        },
        {
          code: '04',
          label: 'MIDAS LIP SENSOR',
          badge: 'BANKED CASH',
          tone: 'pass',
          summary:
            'Only when a token physically crosses the front lip threshold does bankroll increment—asserted on every announced change (b8cd1fe) and locked by golden replay.'
        }
      ]
    },
    cocs: {
      title: '60 Hz Client Prediction & Reconciliation Comparator',
      subtitle: 'cocs/game/net.mjs — authoritative 30 Hz JSON delta snapshots',
      steps: [
        {
          code: '01',
          label: 'PREDICT',
          badge: 'LOCAL SHADOW',
          tone: 'info',
          summary:
            'Your browser steps a local shadow Match at 60 Hz immediately on input so movement and aim feel instant before a round-trip completes.'
        },
        {
          code: '02',
          label: 'COMPARE',
          badge: '30 Hz SNAPSHOT',
          tone: 'warn',
          summary:
            'An authoritative quantized snapshot arrives from server/game-server.mjs with the latest acknowledged sequence number (msg.acks[actorId]).'
        },
        {
          code: '03',
          label: 'RECONCILE',
          badge: 'REPLAY PENDING',
          tone: 'info',
          summary:
            'The client drops acknowledged inputs and deterministically replays all remaining unacknowledged inputs forward over the server state—no historical hitbox rewind.'
        },
        {
          code: '04',
          label: 'ALIGNED',
          badge: 'CONVERGED',
          tone: 'pass',
          summary:
            'Predicted and authoritative positions agree while remote operators interpolate smoothly at an adaptive ~100 ms render delay.'
        }
      ]
    },
    rgbagentflightindicator: {
      title: 'Bounded Keyboard LED Session States',
      subtitle: 'rgi/appearance.py — one physical key per autonomous agent lane',
      steps: [
        {
          code: '01',
          label: 'WORKING',
          badge: 'STEADY GREEN',
          tone: 'pass',
          summary:
            'Default palette lights the claimed lane green while the agent session is actively computing or running tool calls.'
        },
        {
          code: '02',
          label: 'ATTENTION',
          badge: 'BLINKING RED',
          tone: 'fail',
          summary:
            'When an agent blocks on approval or hits an error, the key pulses red in your peripheral vision so you notice without alt-tabbing.'
        },
        {
          code: '03',
          label: 'DONE',
          badge: 'CRISP WHITE',
          tone: 'info',
          summary:
            'Completed runs settle into steady alabaster white; the daemon repaints hardware only when a device frame actually changes (0.12 s tick).'
        },
        {
          code: '04',
          label: 'IDLE',
          badge: 'DARK LANE',
          tone: 'warn',
          summary:
            'Released or evicted lanes return to dark. Single-color keyboards honestly display the most urgent active lane instead of faking per-key matrices.'
        }
      ]
    },
    warpi: {
      title: 'BYOK Standalone Pi-Agent Stdio Sidecar',
      subtitle: 'warpi/crates/standalone_agent — upstream Warp UI + local model loop',
      steps: [
        {
          code: '01',
          label: 'PROVIDER PROFILE',
          badge: 'BYOK CONFIG',
          tone: 'info',
          summary:
            'Choose any local or hosted OpenAI-compatible Chat Completions endpoint; Warp cloud sign-in and credits stay hidden in standalone mode.'
        },
        {
          code: '02',
          label: 'CREDENTIAL REF',
          badge: 'OS SECRET STORE',
          tone: 'pass',
          summary:
            'provider.rs stores only a CredentialRef key name—never the plaintext API secret—resolved from the OS keychain when a session opens.'
        },
        {
          code: '03',
          label: 'PI STDIO HELPER',
          badge: 'NO OPEN PORT',
          tone: 'info',
          summary:
            'Rust supervises standalone/pi-helper (Pi SDK 0.84.2) strictly over private stdio pipes with no listening TCP socket.'
        },
        {
          code: '04',
          label: 'WARP APPROVAL UI',
          badge: 'UPSTREAM GATE',
          tone: 'warn',
          summary:
            'Model proposals render as Warp’s native approval cards and diffs—upstream Warp still governs every workspace side effect.'
        }
      ]
    },
    hermesdashboard: {
      title: 'Hermes Session & Resource Topology',
      subtitle: 'hermesdashboard — Starlette SSE console & live delegate_task drawer',
      steps: [
        {
          code: '01',
          label: 'FILES',
          badge: 'TOUCHED PATHS',
          tone: 'info',
          summary:
            'Maps parent and delegated subagent sessions to the exact repository files read or modified inside an existing Hermes home.'
        },
        {
          code: '02',
          label: 'TOOLS',
          badge: 'SSE STREAM',
          tone: 'pass',
          summary:
            'Normalizes tool call_id events over sse-starlette into compact single-line rows that expand on demand without drowning the transcript.'
        },
        {
          code: '03',
          label: 'MODELS & COST',
          badge: 'TOKEN LEDGER',
          tone: 'warn',
          summary:
            'Attaches read-only per-session usage and token economics straight from Hermes state.db.'
        },
        {
          code: '04',
          label: 'SUBAGENT DRAWER',
          badge: 'LIVE CHILD SSE',
          tone: 'info',
          summary:
            'When delegate_task emits child_session_started, a floating drawer attaches live to /api/sessions/{id}/stream.'
        }
      ]
    },
    becomussy: {
      title: 'Five Typed Memory Strata & Revision Governance',
      subtitle: 'becomussy — provenanced memory & risk-classified self-model diffs',
      steps: [
        {
          code: '01',
          label: 'AUTOBIOGRAPHICAL',
          badge: 'HIGH RISK GATE',
          tone: 'fail',
          summary:
            'Constrained/value self-model revisions classify as high risk and require explicit human approval—with an emergency freeze switch.'
        },
        {
          code: '02',
          label: 'RELATIONAL',
          badge: 'PROVENANCED',
          tone: 'info',
          summary:
            'Tracks durable commitments and collaborators across sessions with reinforce, contradict, and salience scores.'
        },
        {
          code: '03',
          label: 'SEMANTIC',
          badge: 'KEYWORD SEARCH',
          tone: 'warn',
          summary:
            'Structured knowledge facts are searchable by keyword today; vector/hybrid retrieval and drift detection remain explicitly planned.'
        },
        {
          code: '04',
          label: 'EPISODIC',
          badge: 'AUDIT TRAIL',
          tone: 'pass',
          summary:
            'Every durable write records an immutable audit event so continuity carries verifiable provenance rather than raw context dumps.'
        },
        {
          code: '05',
          label: 'WORKING',
          badge: 'RESUME BUNDLE',
          tone: 'info',
          summary:
            'At session start, the context compiler assembles active threads, projects, and recent memories into a compact resume bundle.'
        }
      ]
    }
  };

  const spec = $derived(STUDIES[studyId] || STUDIES.rizzstack);
  let activeIndex = $state(0);

  const activeStep = $derived(spec.steps[activeIndex] || spec.steps[0]);

  function setStep(idx: number) {
    const total = spec.steps.length;
    activeIndex = ((idx % total) + total) % total;
    carbonSynth.click(580 + activeIndex * 55);
  }

  function onStageKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setStep(activeIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setStep(activeIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setStep(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setStep(spec.steps.length - 1);
    }
  }

  function toneColor(tone: StudyStep['tone']): string {
    if (tone === 'pass') return '#b8ff3c';
    if (tone === 'fail') return '#ff4422';
    if (tone === 'warn') return '#f5a623';
    return '#22f3e6';
  }
</script>

<section
  class="neon-study-bench"
  aria-label={`Interactive conceptual study: ${title || spec.title}`}
>
  <div class="neon-study-header">
    <div class="press-controls-bar">
      <span class="neon-pill">
        <span class="neon-pulse-dot" aria-hidden="true"></span>
        NEON INTERACTIVE STUDY
      </span>
      <strong>{spec.title}</strong>
    </div>
    <span class="datum-tag">
      STEP {String(activeIndex + 1).padStart(2, '0')} / {String(spec.steps.length).padStart(2, '0')} · {activeStep.badge}
    </span>
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="neon-study-stage"
    role="region"
    tabindex="0"
    aria-label={`${spec.title} — ${activeStep.label}. Use Left and Right arrow keys to step.`}
    onkeydown={onStageKeyDown}
    onclick={() => setStep(activeIndex + 1)}
  >
    <svg
      class="neon-study-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 450"
      width="800"
      height="450"
      role="img"
      aria-label={`${spec.title}: ${activeStep.label}`}
    >
      <defs>
        <pattern id={`n-grid-${studyId}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#18202c" stroke-width="0.9" />
        </pattern>
      </defs>

      <rect width="800" height="450" fill="#070a0f" />
      <rect width="800" height="450" fill={`url(#n-grid-${studyId})`} />
      <rect x="16" y="16" width="768" height="418" fill="none" stroke="#252f3f" stroke-width="1.2" />
      <path d="M16 36V16H36M764 16H784V36M16 414V434H36M764 434H784V414" fill="none" stroke="#22f3e6" stroke-width="2" />

      <text x="34" y="42" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="11">
        Si. Ne·10 INSTRUMENT // {spec.subtitle.toUpperCase()}
      </text>
      <text x="766" y="42" fill={toneColor(activeStep.tone)} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="end">
        STATE: {activeStep.badge}
      </text>

      {#if studyId === 'rizzstack'}
        <!-- 4 worker tracks -> bwrap gate -> integrated or quarantine -->
        {#each [0, 1, 2, 3] as row}
          {@const y = 110 + row * 68}
          {@const isActive = row === activeIndex}
          {@const col = row < 2 ? '#b8ff3c' : row === 2 ? '#f5a623' : '#ff4422'}
          <rect
            x="48"
            y={y - 22}
            width="180"
            height="44"
            fill={isActive ? '#121c24' : '#0c1017'}
            stroke={isActive ? col : '#2a3342'}
            stroke-width={isActive ? '2.4' : '1.2'}
          />
          <text x="138" y={y + 4} fill={isActive ? col : '#9aa4b4'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
            {['W1-PRICING', 'W2-LABELS', 'W3-OUT-OF-SCOPE', 'W4-WEAK-TESTS'][row]}
          </text>
          <path
            d={`M228 ${y}H342`}
            fill="none"
            stroke={isActive ? col : '#263040'}
            stroke-width={isActive ? '3' : '1.4'}
          />
        {/each}

        <circle
          cx="412"
          cy="212"
          r="72"
          fill="#0d141d"
          stroke={toneColor(activeStep.tone)}
          stroke-width="2.5"
        />
        <circle cx="412" cy="212" r="54" fill="none" stroke="#22f3e6" stroke-width="1.2" stroke-dasharray="5 4" />
        <text x="412" y="206" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="13" text-anchor="middle">
          BWRAP GATE
        </text>
        <text x="412" y="226" fill={toneColor(activeStep.tone)} font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          {activeIndex < 2 ? 'RED -> GREEN OK' : activeIndex === 2 ? 'LEASE VIOLATION' : 'HASH MISMATCH'}
        </text>

        <!-- Pass rail -->
        <path
          d="M484 192H565"
          fill="none"
          stroke={activeIndex < 2 ? '#b8ff3c' : '#263040'}
          stroke-width={activeIndex < 2 ? '3.5' : '1.4'}
        />
        <rect
          x="565"
          y="156"
          width="186"
          height="68"
          fill={activeIndex < 2 ? '#11261a' : '#0c1017'}
          stroke={activeIndex < 2 ? '#b8ff3c' : '#263040'}
          stroke-width={activeIndex < 2 ? '2.4' : '1.2'}
        />
        <text x="658" y="186" fill={activeIndex < 2 ? '#b8ff3c' : '#737d8c'} font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          INTEGRATION PASS
        </text>
        <text x="658" y="206" fill="#c2bdb0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          tdd-evidence/1 SIGNED
        </text>

        <!-- Quarantine rail -->
        <path
          d="M472 252L565 316"
          fill="none"
          stroke={activeIndex >= 2 ? toneColor(activeStep.tone) : '#263040'}
          stroke-width={activeIndex >= 2 ? '3.5' : '1.4'}
          stroke-dasharray="7 4"
        />
        <rect
          x="565"
          y="282"
          width="186"
          height="68"
          fill={activeIndex >= 2 ? '#291210' : '#0c1017'}
          stroke={activeIndex >= 2 ? toneColor(activeStep.tone) : '#263040'}
          stroke-width={activeIndex >= 2 ? '2.4' : '1.2'}
        />
        <text x="658" y="312" fill={activeIndex >= 2 ? toneColor(activeStep.tone) : '#737d8c'} font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          QUARANTINE RAIL
        </text>
        <text x="658" y="332" fill="#c2bdb0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          NEVER MERGED TO TREE
        </text>
      {:else if studyId === 'uirizz'}
        <!-- A2UI card -> POST /actions -> Audit log -> Typed YES gate -->
        <rect
          x="52"
          y="96"
          width="210"
          height="248"
          fill="#0e141f"
          stroke={activeIndex === 0 ? '#22f3e6' : '#324056'}
          stroke-width={activeIndex === 0 ? '2.4' : '1.4'}
        />
        <text x="70" y="126" fill="#22f3e6" font-family="JetBrains Mono, monospace" font-size="11">
          A2UI v1.0 CARD
        </text>
        <rect x="70" y="144" width="174" height="106" fill="#131c2b" stroke="#2a3548" />
        <text x="157" y="190" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
          surface_id: unique
        </text>
        <text x="157" y="210" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          + fallback_text (CLI)
        </text>
        <rect
          x="70"
          y="272"
          width="174"
          height="46"
          fill={activeIndex === 1 ? '#2c1e0e' : '#161b26'}
          stroke={activeIndex === 1 ? '#f5a623' : '#4a5568'}
          stroke-width={activeIndex === 1 ? '2.4' : '1.4'}
        />
        <text x="157" y="299" fill={activeIndex === 1 ? '#f5a623' : '#f3efe6'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
          [ CLICK ACTION ]
        </text>

        <path
          d="M262 295H354"
          fill="none"
          stroke={activeIndex >= 1 ? '#f5a623' : '#2c3648'}
          stroke-width={activeIndex >= 1 ? '3' : '1.4'}
          stroke-dasharray="6 4"
        />

        <rect
          x="354"
          y="136"
          width="166"
          height="196"
          fill={activeIndex === 2 ? '#291114' : '#0f1622'}
          stroke={activeIndex === 2 ? '#ff4422' : activeIndex === 1 ? '#f5a623' : '#324056'}
          stroke-width={activeIndex === 1 || activeIndex === 2 ? '2.4' : '1.4'}
        />
        <text x="437" y="176" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          POST /actions
        </text>
        <text x="437" y="214" fill={activeIndex === 2 ? '#ff4422' : '#f5a623'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
          {activeIndex === 2 ? 'EXCEPTION!' : 'approved: false'}
        </text>
        <text x="437" y="242" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          {activeIndex === 2 ? 'FAIL-CLOSED REFUSAL' : 'REDACTED ARGS LOGGED'}
        </text>

        <path
          d="M520 234H582"
          fill="none"
          stroke={activeIndex === 3 ? '#b8ff3c' : '#2c3648'}
          stroke-width={activeIndex === 3 ? '3.5' : '1.4'}
        />

        <rect
          x="582"
          y="148"
          width="172"
          height="172"
          fill={activeIndex === 3 ? '#11251a' : '#0d121a'}
          stroke={activeIndex === 3 ? '#b8ff3c' : '#324056'}
          stroke-width={activeIndex === 3 ? '2.6' : '1.4'}
        />
        <text x="668" y="210" fill={activeIndex === 3 ? '#b8ff3c' : '#8b96a8'} font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          CHAT GATE
        </text>
        <text x="668" y="242" fill={activeIndex === 3 ? '#f3efe6' : '#586274'} font-family="JetBrains Mono, monospace" font-size="16" text-anchor="middle">
          &gt; yes
        </text>
        <text x="668" y="274" fill={activeIndex === 3 ? '#22f3e6' : '#586274'} font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          {activeIndex === 3 ? 'APPROVED · op=update' : 'LOCKED UNTIL TYPED'}
        </text>
      {:else if studyId === 'doppler'}
        <!-- Spectrogram + Doppler S-curves -->
        <rect x="52" y="76" width="696" height="290" fill="#060e16" stroke="#22f3e6" stroke-width="1.5" />
        {#if activeIndex === 0}
          {#each [0, 1, 2, 3, 4, 5, 6] as n}
            <line x1="64" y1={108 + n * 38} x2="736" y2={108 + n * 38} stroke="#2a3b4d" stroke-width="14" opacity="0.32" />
          {/each}
        {/if}
        {#each [0, 1, 2, 3, 4] as h}
          <path
            d={`M 82 ${114 + h * 40} C 280 ${118 + h * 40}, 410 ${178 + h * 40}, 714 ${184 + h * 40}`}
            fill="none"
            stroke={activeIndex >= 2 && h === 0 ? '#22f3e6' : activeIndex >= 1 ? '#b8ff3c' : '#566b7d'}
            stroke-width={activeIndex >= 2 && h === 0 ? '3.4' : activeIndex >= 1 ? '1.8' : '1.2'}
            opacity={activeIndex === 0 ? '0.4' : String(1 - h * 0.14)}
          />
        {/each}
        {#if activeIndex >= 2}
          <line x1="398" y1="76" x2="398" y2="366" stroke="#ff4422" stroke-width="2" stroke-dasharray="6 4" />
          <circle cx="398" cy="148" r="9" fill="none" stroke="#ff4422" stroke-width="2.4" />
          <text x="414" y="102" fill="#ff4422" font-family="JetBrains Mono, monospace" font-size="11">
            t_CPA · VITERBI JOINT FIT
          </text>
        {/if}
        {#if activeIndex === 3}
          <rect x="492" y="246" width="236" height="102" fill="#18120c" stroke="#f5a623" stroke-width="2" />
          <text x="610" y="276" fill="#f5a623" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
            HELD-OUT BENCHMARK
          </text>
          <text x="610" y="302" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="15" text-anchor="middle">
            2 / 18 &lt; 3 KM
          </text>
          <text x="610" y="326" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
            CLEAN MULTI-PASS: ~1 KM
          </text>
        {/if}
      {:else if studyId === 'photopart'}
        <!-- Coin -> gear_steer bouncer -> spur_gear template -> IoU -->
        <circle
          cx="150"
          cy="225"
          r="62"
          fill={activeIndex === 0 ? '#261f12' : '#10141c'}
          stroke={activeIndex === 0 ? '#22f3e6' : '#3a4458'}
          stroke-width={activeIndex === 0 ? '2.6' : '1.4'}
        />
        <text x="150" y="220" fill="#f5a623" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          COIN REF
        </text>
        <text x="150" y="240" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          PX / MM
        </text>

        <rect
          x="265"
          y="132"
          width="190"
          height="186"
          fill={activeIndex === 1 ? '#2b1210' : '#0f141e'}
          stroke={activeIndex === 1 ? '#ff4422' : '#334054'}
          stroke-width={activeIndex === 1 ? '2.6' : '1.4'}
        />
        <text x="360" y="176" fill={activeIndex === 1 ? '#ff4422' : '#9aa4b4'} font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          gear_steer.py
        </text>
        <text x="360" y="214" fill="#f3efe6" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
          {activeIndex === 1 ? 'BLOCKED WRITE_FILE' : 'PRE_TOOL_CALL HOOK'}
        </text>
        <text x="360" y="244" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">
          {activeIndex === 1 ? 'USE spur_gear FIRST' : 'r17 / r18 GUARD'}
        </text>

        <circle
          cx="615"
          cy="225"
          r="92"
          fill={activeIndex >= 2 ? '#0f211c' : '#0d121a'}
          stroke={activeIndex === 2 ? '#b8ff3c' : activeIndex === 3 ? '#22f3e6' : '#334054'}
          stroke-width={activeIndex >= 2 ? '3' : '1.5'}
          stroke-dasharray="14 7"
        />
        <circle cx="615" cy="225" r="64" fill="#070a0f" stroke={activeIndex === 3 ? '#f5a623' : '#22f3e6'} stroke-width="1.8" />
        <circle cx="615" cy="225" r="24" fill="#070a0f" stroke="#f3efe6" stroke-width="1.8" />
        <text x="615" y="348" fill={activeIndex >= 2 ? '#b8ff3c' : '#8b96a8'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
          {activeIndex === 3 ? 'IOU OVERLAY + BUDGET GATE' : 'WATERTIGHT spur_gear STL'}
        </text>
      {:else if studyId === 'jackpot'}
        <!-- Reels -> Pinfield -> Dozer -> Lip Sensor -->
        <rect
          x="140"
          y="78"
          width="520"
          height="66"
          fill={activeIndex === 0 ? '#12222c' : '#0e131b'}
          stroke={activeIndex === 0 ? '#22f3e6' : '#303b4d'}
          stroke-width={activeIndex === 0 ? '2.4' : '1.4'}
        />
        <text x="400" y="118" fill={activeIndex === 0 ? '#22f3e6' : '#c2bdb0'} font-family="JetBrains Mono, monospace" font-size="16" text-anchor="middle">
          [ 7 ]    [ BULLION ]    [ 7 ]
        </text>

        {#each [0, 1, 2, 3, 4] as col}
          <circle cx={230 + col * 85} cy="184" r="7" fill={activeIndex === 1 ? '#22f3e6' : '#4a5568'} />
          <circle cx={272 + col * 64} cy="226" r="7" fill={activeIndex === 1 ? '#b8ff3c' : '#4a5568'} />
        {/each}

        <rect
          x="185"
          y="264"
          width="430"
          height="50"
          fill={activeIndex === 2 ? '#261e10' : '#0f141e'}
          stroke={activeIndex === 2 ? '#f5a623' : '#303b4d'}
          stroke-width={activeIndex === 2 ? '2.4' : '1.4'}
        />
        <text x="400" y="294" fill={activeIndex === 2 ? '#f5a623' : '#c2bdb0'} font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">
          DOZER SHELF — {activeIndex === 2 ? 'TOKENS UNBANKED' : 'RECIPROCATING DECK'}
        </text>

        <line
          x1="140"
          y1="348"
          x2="660"
          y2="348"
          stroke={activeIndex === 3 ? '#b8ff3c' : '#ff4422'}
          stroke-width={activeIndex === 3 ? '3.6' : '2'}
          stroke-dasharray="10 6"
        />
        <text x="400" y="378" fill={activeIndex === 3 ? '#b8ff3c' : '#ff4422'} font-family="JetBrains Mono, monospace" font-size="13" text-anchor="middle">
          MIDAS LIP SENSOR · {activeIndex === 3 ? '+BANKROLL COMMITTED' : 'THRESHOLD LINE'}
        </text>
      {:else}
        <!-- Generic multi-node state pipeline for all 5 Issue 01 classics -->
        {#each spec.steps as st, idx}
          {@const count = spec.steps.length}
          {@const boxW = Math.floor(660 / count) - 16}
          {@const x = 70 + idx * (boxW + 16)}
          {@const isActive = idx === activeIndex}
          {@const col = toneColor(st.tone)}
          {#if idx > 0}
            <line
              x1={x - 16}
              y1="222"
              x2={x}
              y2="222"
              stroke={idx <= activeIndex ? '#22f3e6' : '#2a3342'}
              stroke-width={idx <= activeIndex ? '2.6' : '1.4'}
            />
          {/if}
          <rect
            x={x}
            y="148"
            width={boxW}
            height="148"
            fill={isActive ? '#102028' : '#0c1017'}
            stroke={isActive ? col : '#2d3748'}
            stroke-width={isActive ? '2.6' : '1.3'}
          />
          <text x={x + boxW / 2} y="182" fill={isActive ? col : '#7b8798'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
            STEP {st.code}
          </text>
          <text x={x + boxW / 2} y="224" fill={isActive ? '#f3efe6' : '#9aa4b4'} font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
            {st.label}
          </text>
          <text x={x + boxW / 2} y="264" fill={isActive ? col : '#596578'} font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">
            {st.badge}
          </text>
        {/each}
      {/if}

      <text x="34" y="418" fill="#8b96a8" font-family="JetBrains Mono, monospace" font-size="10">
        CONCEPTUAL INTERACTIVE STUDY · CLICK STAGE OR USE ← / → KEYS
      </text>
      <text x="766" y="418" fill="#22f3e6" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">
        {activeStep.code} // {activeStep.label}
      </text>
    </svg>
  </div>

  <div class="neon-study-tabs" role="tablist" aria-label={`Steps for ${spec.title}`}>
    {#each spec.steps as step, idx (step.code)}
      <button
        type="button"
        role="tab"
        aria-selected={idx === activeIndex}
        class="neon-step-tab"
        onclick={() => setStep(idx)}
      >
        <span class="neon-step-index">STEP {step.code} · {step.badge}</span>
        <span class="neon-step-label">{step.label}</span>
      </button>
    {/each}
  </div>

  <div class="neon-study-footer">
    <p class="neon-study-readout" role="status" aria-live="polite">
      <strong>{activeStep.label}:</strong>
      {activeStep.summary}
      {#if caption}
        <span class="datum-tag"> — {caption}</span>
      {/if}
    </p>

    <div class="neon-study-controls">
      <button type="button" class="ctrl-btn" onclick={() => setStep(activeIndex - 1)}>
        ← Prev
      </button>
      <button type="button" class="ctrl-btn neon-btn-accent" onclick={() => setStep(activeIndex + 1)}>
        Next Step →
      </button>
    </div>
  </div>
</section>
