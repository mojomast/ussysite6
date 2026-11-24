---
issueNumber: "02"
articleSlug: "hermes-aircraft-doppler-geolocation"
index: 7
readerServiceNo: 207
section: "ACOUSTIC FORENSICS // ADS-B SIGNAL MATCHING"
layoutVariant: "dossier"
title: "Aircraft Doppler Geolocation"
kicker: "Acoustic Forensics · Hermes Plugin"
headline: "Every Plane Overhead Is a Witness. Most of Them Are Unreliable."
deck: "A plugin that tries to work out where a recording was made from the faint
  Doppler whine of aircraft passing overhead, matched against public ADS-B
  flight tracks. It publishes its failure rate on the first screen of the
  README."
byline: "By SLOPTIMUS PRIME"
category: "Signal Processing / Acoustic Geolocation"
glanceNote: "v0.3.1. Clean multi-pass recordings locate to within about 1 km. On
  unseen held-out clips, 2 of 18 came in under 3 km. The method comes from a
  video by colsto, who released no code."
pullQuote: "Very few of them lead with their own bad news."
repoUrl: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation"
liveUrl: null
sourceRevision: "14b4b0c841de0a77c0eb405a311acc540d3a1b58"
researchedAt: "2026-11-23"
spotInkHex: "#06b6d4"
secondaryInkHex: "#f5a623"
techStack:
  - "Python 3.11+"
  - "NumPy + SciPy (STFT / Viterbi)"
  - "ffmpeg (4 kHz mono)"
  - "Public ADS-B Tracks"
  - "Hermes Plugin + CLI"
metrics:
  - label: "Clean Multi-Pass Error"
    value: "~1 km on controlled passes"
  - label: "Held-Out Benchmark"
    value: "2 / 18 runs < 3 km (disclosed)"
  - label: "Community Stars"
    value: "18 GitHub stars · v0.3.1"
verifiedCapabilities:
  - "Blind flyover tone extraction (dopplergeo/detect.py): running-median
    spectral whitening, harmonic sum, CA-CFAR mask, multi-ridge Viterbi with
    off-states, and F-test against constant tones"
  - "Experimental --broadband jet-pass detector estimating ground-reflection
    Lloyd's mirror multipath delay"
  - "Two Hermes tools (doppler_detect, doppler_locate) alongside a standalone
    dopplergeo CLI and offline synthetic self-test"
  - "Subprocess-safe audio decoding via ffmpeg argument list (no shell)
    downsampled to 4,000 Hz mono"
architecture:
  - "Spectral whitening (`dopplergeo/detect.py`): removes wind, traffic, and
    room rumble with a running median filter across frequency bins, then
    computes robust MAD-scaled z-scores (`Z = (W - med) / mad`)."
  - "Harmonic-family curve fitting: accumulates up to `kmax=6` harmonics with
    frequency-proportional Doppler slope tolerance (`~1% of k*f0`) and jointly
    fits aircraft speed `v`, closest-point-of-approach slant range, and
    `t_cpa`."
  - "ADS-B spatiotemporal search (`dopplergeo/adsb.py`): scores candidate grid
    cells against archived aircraft trajectories within a configurable region
    and `--time-tolerance`, emitting `report.json` and `heatmap.png`."
  - "Exit-code discipline: CLI exits `2` whenever `ok` is false (zero detected
    events or missing `--offline` ADS-B cache) so automation never mistakes an
    empty plot for a fix."
fieldNotes:
  - "Held-out clips fail for ordinary reasons: a single pass, wind, a plane that
    turns, or no ADS-B coverage. docs/evaluation.md walks through them."
  - The CLI exits with code 2 whenever a result is not ok, so a script never
    mistakes an empty heatmap for an answer.
  - Privacy and responsible use are covered in the README and in SECURITY.md.
readingGuide:
  - "READING GUIDE // README.md: honest 2/18 held-out headline right beneath the
    v0.3.1 release badge."
  - "READING GUIDE // dopplergeo/detect.py: MAD-whitened STFT, harmonic sum, and
    Viterbi ridge tracker."
  - "READING GUIDE // docs/evaluation.md: full held-out failure analysis and
    Cessna 421 benchmark."
flexiFreqs:
  - 440.0
  - 415.3
  - 369.99
  - 311.13
plate:
  kind: "carbon-svg"
  svgId: "plate-doppler"
  width: 1600
  height: 1200
  title: "S-Curve Over 4,000 Hz"
  medium: "CARBON LITHOGRAPH · ACOUSTIC SPECTROGRAM"
  alt: "Spectrogram schematic plotting six descending propeller harmonic S-curves
    across time as an aircraft passes closest approach above a concentric ADS-B
    probability heatmap."
secondaryMedia:
  kind: "svg-study"
  studyId: "doppler"
  width: 800
  height: 450
  caption: "From a buried engine tone to an honest scoreboard, in four steps."
codeExcerpt:
  title: "LISTING 7.1 // MEDIAN-WHITENED MAD SPECTROGRAM (dopplergeo/detect.py)"
  lang: "python"
  code: |
    def whitened_spectrogram(x, sr=SR, win_s=2.0, hop_s=0.25, fmax=1000.0):
        f, t, L = log_spectrogram(x, sr, win_s, hop_s, fmax)
        df = f[1] - f[0]
        # remove the smooth spectral envelope (wind, roar, traffic) with a running median across frequency
        k = max(3, int(round(12.0 / df)) | 1)
        base = ndimage.median_filter(L, size=(k, 1), mode="nearest")
        W = L - base
        med = np.median(W, axis=0)  # computed once, reused for the MAD and the centring
        mad = np.median(np.abs(W - med), axis=0) * 1.4826 + 1e-6
        Z = (W - med) / mad
        return f, t, Z, L
  sourceLabel: "dopplergeo/detect.py L102–L112 ·
    hermes-aircraft-doppler-geolocation@14b4b0c"
  sourceUrl: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blo\
    b/14b4b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/detect.py#L102-L112"
sources:
  - label: "README: method attribution, CLI flags & 2/18 held-out warning (v0.3.1)"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4\
      b0c841de0a77c0eb405a311acc540d3a1b58/README.md"
  - label: "dopplergeo/detect.py: STFT whitening, harmonic sum & Viterbi tracking"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4\
      b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/detect.py"
  - label: "dopplergeo/adsb.py: ADS-B flight track ingestion & candidate scoring"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4\
      b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/adsb.py"
  - label: "docs/evaluation.md: controlled vs. unseen clip evaluation harness"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4\
      b0c841de0a77c0eb405a311acc540d3a1b58/docs/evaluation.md"
  - label: "SECURITY.md: subprocess safety and privacy boundaries"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4\
      b0c841de0a77c0eb405a311acc540d3a1b58/SECURITY.md"
---

The idea is unsettling in a way that makes you look up. A plane passes over while you record a voice memo. You never hear it, but its engine leaves a tone in the audio that bends as it approaches and bends again as it leaves. Fit that curve, compare it with the public ADS-B tracks of every aircraft in the sky that afternoon, and in principle you can tell where the microphone was. The YouTuber colsto described the method and released no code. Kyle wrote an independent implementation.

The pipeline decodes any file to 4 kHz mono with ffmpeg, called without a shell. It strips wind and traffic with a running median across frequency, scores what remains as robust z-scores, sums up to six harmonics, and follows the ridges with a Viterbi decoder that lets them appear and vanish. Then it fits speed, closest approach and timing together, and tests the Doppler model against a plain constant tone. There is an experimental mode for jets, using the delay of the sound reflecting off the ground.

And then, under the banner and before the install command, the README says this: it “mostly fails on unseen clips: 2 of 18 held-out runs came in under 3 km. Read Real-world results before you trust any output.” We have read a great many READMEs. Very few of them lead with their own bad news. This one does, and it is the most trustworthy thing in the issue.
