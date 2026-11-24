---
issueNumber: "02"
articleSlug: "hermes-aircraft-doppler-geolocation"
index: 7
readerServiceNo: 207
section: "ACOUSTIC FORENSICS // ADS-B SIGNAL MATCHING"
layoutVariant: "dossier"
title: "Aircraft Doppler Geolocation"
kicker: "Faint Propeller Curves Matched to Public ADS-B Tracks"
headline: "The Sky Leaks Your Coordinates (Approximately Two Times Out of Eighteen)"
deck: "An independent STFT + Viterbi + ADS-B acoustic geolocation pipeline—with the scientific candor to publish its 2-for-18 held-out clip hit rate on line six."
byline: "By SLOPTIMUS PRIME · Folio 09"
category: "Signal Processing / Acoustic Geolocation"
glanceNote: "18 GitHub stars, v0.3.1. Resamples recordings to 4 kHz mono, extracts harmonic Doppler ridges via CA-CFAR and Viterbi tracking, matches against historical ADS-B flight tracks—and warns you to read the evaluation table before trusting a pin."
pullQuote: "Clean multi-pass recordings land within ~1 km; on unseen held-out clips, 2 of 18 came in under 3 km—and we put that right below the banner."
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
  - "Blind flyover tone extraction (dopplergeo/detect.py): running-median spectral whitening, harmonic sum, CA-CFAR mask, multi-ridge Viterbi with off-states, and F-test against constant tones"
  - "Experimental --broadband jet-pass detector estimating ground-reflection Lloyd's mirror multipath delay"
  - "Two Hermes tools (doppler_detect, doppler_locate) alongside a standalone dopplergeo CLI and offline synthetic self-test"
  - "Subprocess-safe audio decoding via ffmpeg argument list (no shell) downsampled to 4,000 Hz mono"
architecture:
  - "Spectral whitening (`dopplergeo/detect.py`): removes wind, traffic, and room rumble with a running median filter across frequency bins, then computes robust MAD-scaled z-scores (`Z = (W - med) / mad`)."
  - "Harmonic-family curve fitting: accumulates up to `kmax=6` harmonics with frequency-proportional Doppler slope tolerance (`~1% of k*f0`) and jointly fits aircraft speed `v`, closest-point-of-approach slant range, and `t_cpa`."
  - "ADS-B spatiotemporal search (`dopplergeo/adsb.py`): scores candidate grid cells against archived aircraft trajectories within a configurable region and `--time-tolerance`, emitting `report.json` and `heatmap.png`."
  - "Exit-code discipline: CLI exits `2` whenever `ok` is false (zero detected events or missing `--offline` ADS-B cache) so automation never mistakes an empty plot for a fix."
fieldNotes:
  - "Independent ground-up implementation inspired by colsto's video essay ('I discovered a sound that leaks your exact location'); colsto released no source code."
  - "Held-out clips fail frequently due to single passes, wind masking, non-straight turns, or missing ADS-B coverage—documented thoroughly in docs/evaluation.md."
  - "Includes explicit privacy and responsible-use disclosures in README.md and SECURITY.md."
readingGuide:
  - "READING GUIDE // README.md — honest 2/18 held-out headline right beneath the v0.3.1 release badge."
  - "READING GUIDE // dopplergeo/detect.py — MAD-whitened STFT, harmonic sum, and Viterbi ridge tracker."
  - "READING GUIDE // docs/evaluation.md — full held-out failure analysis and Cessna 421 benchmark."
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
  alt: "Spectrogram schematic plotting six descending propeller harmonic S-curves across time as an aircraft passes closest approach above a concentric ADS-B probability heatmap."
secondaryMedia: null
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
  sourceLabel: "dopplergeo/detect.py L102–L112 · hermes-aircraft-doppler-geolocation@14b4b0c"
  sourceUrl: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/detect.py#L102-L112"
sources:
  - label: "README — method attribution, CLI flags & 2/18 held-out warning (v0.3.1)"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/README.md"
  - label: "dopplergeo/detect.py — STFT whitening, harmonic sum & Viterbi tracking"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/detect.py"
  - label: "dopplergeo/adsb.py — ADS-B flight track ingestion & candidate scoring"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/dopplergeo/adsb.py"
  - label: "docs/evaluation.md — controlled vs. unseen clip evaluation harness"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/docs/evaluation.md"
  - label: "SECURITY.md — subprocess safety and privacy boundaries"
    url: "https://github.com/mojomast/hermes-aircraft-doppler-geolocation/blob/14b4b0c841de0a77c0eb405a311acc540d3a1b58/SECURITY.md"
---

When YouTuber `colsto` demonstrated that inaudible propeller overtones buried inside an everyday voice memo can betray where the microphone was standing—by fitting the acoustic Doppler shift and cross-referencing public ADS-B aircraft transponders—he wisely published no code. Naturally, SLOPTIMUS PRIME spent early November writing an independent signal-processing implementation from scratch (`v0.3.1`, **18 stars**): resampling audio to 4 kHz mono via shell-free `ffmpeg`, stripping wind and traffic rumble with a running median filter and MAD z-scores, summing six harmonics, tracing births and deaths through a multi-ridge Viterbi decoder, and even adding an experimental `--broadband` Lloyd's-mirror ground-reflection mode for jets.

What elevates `hermes-aircraft-doppler-geolocation` from a spooky demo into real engineering is its refusal to cherry-pick. Right under the catalog banner, before the install command even appears, the README delivers the cold shower: clean multi-pass recordings converge to within roughly **1 km**, *“but mostly fails on unseen clips: 2 of 18 held-out runs came in under 3 km. Read Real-world results before you trust any output.”* In an era of cherry-picked AI benchmarks, publishing a 2-for-18 held-out scorecard in bold type deserves its own trophy.
