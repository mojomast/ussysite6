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
      title: 'The Gate Where Worker Four Gets Caught',
      subtitle: 'workflow/reference/run_demo.py · RED, then GREEN, then integration',
      steps: [
        {
          code: 'W1',
          label: 'W1-PRICING · PASS',
          badge: 'ACCEPTED',
          tone: 'pass',
          summary: 'Stayed inside its lease. The test failed before the patch and passed after it, and the combined tree passed too. It gets a signed receipt and goes through.'
        },
        {
          code: 'W2',
          label: 'W2-LABELS · PASS',
          badge: 'ACCEPTED',
          tone: 'pass',
          summary: 'A different file, a different lease, the same honest route: RED, GREEN, and a clean merge alongside W1. Two out of four. So far, so good.'
        },
        {
          code: 'W3',
          label: 'W3 · SCOPE_VIOLATION',
          badge: 'QUARANTINED',
          tone: 'warn',
          summary: 'Edited a file it was never leased. Maybe it was trying to help. The gate does not ask why. It rejects the patch for scope_violation before integration.'
        },
        {
          code: 'W4',
          label: 'W4 · TESTS_TAMPERED',
          badge: 'REJECTED',
          tone: 'fail',
          summary: 'Made the suite pass by weakening an approved test. The contract was frozen by hash before work began, so the change is obvious. Rejected for tests_tampered. Never merged.'
        }
      ]
    },
    uirizz: {
      title: 'A Click Is Not a Yes',
      subtitle: 'uirizz/dashboard/plugin_api.py · how a button press becomes, at most, a request',
      steps: [
        {
          code: '01',
          label: 'a2ui_render',
          badge: 'CARD DRAWN',
          tone: 'info',
          summary: 'The agent draws an official A2UI card in chat, with its own surface_id and plain fallback text for places that cannot show cards.'
        },
        {
          code: '02',
          label: 'YOU CLICK',
          badge: 'APPROVED: FALSE',
          tone: 'warn',
          summary: 'The button sends POST /actions. The plugin writes down what you asked for, with the arguments redacted, and answers approved: false. Nothing has happened yet.'
        },
        {
          code: '03',
          label: 'IF LOGGING FAILS',
          badge: 'FAILS CLOSED',
          tone: 'fail',
          summary: 'If the audit log cannot record the click, the handler refuses the action and asks you to try again. A request it cannot remember is a request it will not run.'
        },
        {
          code: '04',
          label: 'YOU TYPE YES',
          badge: 'APPROVED',
          tone: 'pass',
          summary: 'Only a typed yes in the chat turns the request into an action. The card then updates in place, under the same surface_id.'
        }
      ]
    },
    doppler: {
      title: 'Finding a Microphone by Listening to the Sky',
      subtitle: 'dopplergeo/detect.py · from a buried engine tone to an honest scoreboard',
      steps: [
        {
          code: '01',
          label: '4 kHz MONO',
          badge: 'RAW AUDIO',
          tone: 'info',
          summary: 'Any recording is decoded to 4,000 samples a second, mono, by ffmpeg called without a shell. The engine tone is in there somewhere, under the wind and the traffic.'
        },
        {
          code: '02',
          label: 'WHITENING',
          badge: 'NOISE OUT',
          tone: 'info',
          summary: 'A running median across frequency removes the smooth background, and what is left is scored as robust z-scores. Narrow tones stand up out of the noise.'
        },
        {
          code: '03',
          label: 'THE S-CURVE',
          badge: 'FIT',
          tone: 'pass',
          summary: 'Up to six harmonics are tracked together by a Viterbi decoder and fitted as one Doppler curve, which gives speed, closest approach and the moment it happened.'
        },
        {
          code: '04',
          label: '2 OF 18',
          badge: 'PRINTED ANYWAY',
          tone: 'warn',
          summary: 'Clean multi-pass recordings land within about 1 km. Unseen clips came in under 3 km only 2 times out of 18. The README says so before it tells you how to install it.'
        }
      ]
    },
    photopart: {
      title: 'The Involute Bouncer',
      subtitle: 'plugin/photopart/gear_steer.py · shaped by runs r17 and r18',
      steps: [
        {
          code: '01',
          label: 'COIN FOR SCALE',
          badge: 'PX / MM',
          tone: 'info',
          summary: 'Put a coin, a ruler or an ArUco marker in the photo. photo_part_measure turns pixels into millimetres and says how sure it is about each one.'
        },
        {
          code: '02',
          label: 'THE BOUNCER',
          badge: 'BLOCKED',
          tone: 'fail',
          summary: 'The model reaches for a hand-written involute script, as one did for forty turns in r17 and r18. The pre_tool_call hook stops it and points at the template.'
        },
        {
          code: '03',
          label: 'SPUR_GEAR',
          badge: 'WATERTIGHT',
          tone: 'pass',
          summary: 'The spur_gear template takes module, tooth count and pressure angle and produces one watertight body. Trying it once, even unsuccessfully, lifts the block.'
        },
        {
          code: '04',
          label: 'DELIVER',
          badge: 'BUDGET GATE',
          tone: 'warn',
          summary: 'Validation checks the mesh and the fasteners. Past 80 percent of the 40-call budget, extra renders are refused and the model is told to hand over the file.'
        }
      ]
    },
    jackpot: {
      title: 'It Isn’t Yours Until It Falls',
      subtitle: 'jackpotsyndicate · play money, no network, one very important edge',
      steps: [
        {
          code: '01',
          label: 'THE REELS',
          badge: 'SPIN',
          tone: 'info',
          summary: 'Three by three slot reels spin and release orbs into the machine. Their hit rate has its own report and its own acceptance criterion.'
        },
        {
          code: '02',
          label: 'THE PINS',
          badge: 'BOUNCE',
          tone: 'info',
          summary: 'The orbs fall through a pachinko field of pegs and trinkets, and the ones that make it become tokens on the shelf below.'
        },
        {
          code: '03',
          label: 'THE SHELF',
          badge: 'NOT YET',
          tone: 'warn',
          summary: 'The pusher slides back and forth. Your tokens are right there, crowding the edge. None of them count. You have stood at this machine before.'
        },
        {
          code: '04',
          label: 'THE LIP',
          badge: 'BANKED',
          tone: 'pass',
          summary: 'A token tips over the lip and only then does the bankroll move. The latest commit checks the bankroll against every announced change, so it cannot cheat you either.'
        }
      ]
    },
    cocs: {
      title: 'The Polite Fiction of Online Shooting',
      subtitle: 'cocs/game/net.mjs · a 60 Hz server and a client that guesses well',
      steps: [
        {
          code: '01',
          label: 'PREDICT',
          badge: 'YOUR GUESS',
          tone: 'info',
          summary: 'You press a key and your browser moves you at once, using its own copy of the simulation. It is a guess, and a good one.'
        },
        {
          code: '02',
          label: 'COMPARE',
          badge: 'THE TRUTH',
          tone: 'warn',
          summary: 'A snapshot arrives from the server, which runs the real match at 60 Hz, saying which of your inputs it has seen.'
        },
        {
          code: '03',
          label: 'RECONCILE',
          badge: 'REPLAY',
          tone: 'info',
          summary: 'The client drops the inputs the server confirmed and replays the rest on top of the server’s state. No rewinding of old hitboxes.'
        },
        {
          code: '04',
          label: 'ALIGNED',
          badge: 'AGREED',
          tone: 'pass',
          summary: 'Your screen and the server agree again. Everyone else is drawn about 100 ms in the past, which is why they glide instead of teleport.'
        }
      ]
    },
    rgbagentflightindicator: {
      title: 'Four Colours, No Alt-Tab',
      subtitle: 'rgi/appearance.py · one key per agent session',
      steps: [
        {
          code: '01',
          label: 'WORKING',
          badge: 'GREEN',
          tone: 'pass',
          summary: 'The agent is busy. Its key glows green. You can keep typing; nobody needs you yet.'
        },
        {
          code: '02',
          label: 'NEEDS YOU',
          badge: 'BLINKING RED',
          tone: 'fail',
          summary: 'Blocked on an approval or an error, the key blinks red in the corner of your eye. This is the one worth looking up for.'
        },
        {
          code: '03',
          label: 'DONE',
          badge: 'WHITE',
          tone: 'info',
          summary: 'Finished. The key settles to white. The daemon repaints only when a frame actually changes.'
        },
        {
          code: '04',
          label: 'IDLE',
          badge: 'DARK',
          tone: 'warn',
          summary: 'Released lanes go dark. Keyboards that can’t light single keys show the most urgent lane instead of pretending.'
        }
      ]
    },
    warpi: {
      title: 'One Request, Through Somebody Else’s Terminal',
      subtitle: 'warpi/crates/standalone_agent · Warp’s interface, your endpoint',
      steps: [
        {
          code: '01',
          label: 'YOUR PROVIDER',
          badge: 'BYO KEY',
          tone: 'info',
          summary: 'You choose an OpenAI-compatible endpoint, local or hosted. Warp’s sign-in and cloud agent surfaces stay hidden in this mode.'
        },
        {
          code: '02',
          label: 'A REFERENCE',
          badge: 'NOT THE KEY',
          tone: 'pass',
          summary: 'The profile stores the name of a credential, never the credential. The key itself is read from your OS secret store when a session opens.'
        },
        {
          code: '03',
          label: 'THE PI HELPER',
          badge: 'STDIO ONLY',
          tone: 'info',
          summary: 'Rust supervises a private Node helper running the Pi SDK over stdio. It opens no listening port.'
        },
        {
          code: '04',
          label: 'WARP ASKS',
          badge: 'UPSTREAM GATE',
          tone: 'warn',
          summary: 'Proposals arrive as Warp’s own approval cards and diffs. Warp still decides what runs on your machine.'
        }
      ]
    },
    hermesdashboard: {
      title: 'What the Subagents Touched',
      subtitle: 'hermesdashboard · a Starlette console for an existing Hermes',
      steps: [
        {
          code: '01',
          label: 'FILES',
          badge: 'WHAT CHANGED',
          tone: 'info',
          summary: 'Sessions link to the files they read and wrote, parent and child alike.'
        },
        {
          code: '02',
          label: 'TOOLS',
          badge: 'ONE LINE EACH',
          tone: 'pass',
          summary: 'Tool calls stream in over Server-Sent Events and fold into single lines that open when you care.'
        },
        {
          code: '03',
          label: 'MODELS & COST',
          badge: 'THE BILL',
          tone: 'warn',
          summary: 'Per-session token and cost badges, read from the Hermes install you already have.'
        },
        {
          code: '04',
          label: 'THE DRAWER',
          badge: 'LIVE CHILD',
          tone: 'info',
          summary: 'When delegate_task starts a child session, a drawer slides out and follows it as it works.'
        }
      ]
    },
    becomussy: {
      title: 'Five Ways to Remember',
      subtitle: 'becomussy · typed memories, and a self-model that needs a person to change',
      steps: [
        {
          code: '01',
          label: 'EPISODIC',
          badge: 'WHAT HAPPENED',
          tone: 'info',
          summary: 'Events and experiences, each with where it came from and how much it matters.'
        },
        {
          code: '02',
          label: 'SEMANTIC',
          badge: 'WHAT IS TRUE',
          tone: 'warn',
          summary: 'Knowledge. Searchable by keyword today; vector and hybrid search are planned, and say so.'
        },
        {
          code: '03',
          label: 'AUTOBIOGRAPHICAL',
          badge: 'WHO I WAS',
          tone: 'info',
          summary: 'The agent’s own history. A memory can be reinforced or contradicted, and the contradiction is recorded too.'
        },
        {
          code: '04',
          label: 'RELATIONAL',
          badge: 'WHO MATTERS',
          tone: 'pass',
          summary: 'People and relationships. Separately, any change to the agent’s values or constraints needs a human to approve it.'
        },
        {
          code: '05',
          label: 'WORKING',
          badge: 'WHERE I WAS',
          tone: 'info',
          summary: 'Active context. At the start of each session it becomes a resume bundle, so the agent wakes up mid-sentence instead of from scratch.'
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
    carbonSynth.tick(1000 + activeIndex * 120);
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
        INTERACTIVE STUDY
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
    aria-label={`${spec.title}, step ${activeIndex + 1} of ${spec.steps.length}: ${activeStep.label}. Use the left and right arrow keys to step.`}
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
        Si. STUDY // {spec.subtitle.toUpperCase()}
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
        A DRAWING OF THE IDEA, NOT LIVE DATA · CLICK OR USE ← →
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
        ← Back
      </button>
      <button type="button" class="ctrl-btn neon-btn-accent" onclick={() => setStep(activeIndex + 1)}>
        Next →
      </button>
    </div>
  </div>
</section>
