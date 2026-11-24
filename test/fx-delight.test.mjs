import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSequenceDetector,
  isEditableTarget,
  KONAMI_SEQUENCE
} from '../src/scripts/fx/delight/sequences.ts';
import {
  getSeasonalState,
  isFrontPagePath
} from '../src/scripts/fx/delight/calendar.ts';

function feed(detector, keys, startTs = 1000, stepMs = 80, extra = {}) {
  let result = null;
  let ts = startTs;
  for (const key of keys) {
    result = detector.push({ key, ...extra }, ts);
    ts += stepMs;
  }
  return result;
}

test('Konami code triggers rizz action', () => {
  const detector = createSequenceDetector();
  const keys = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];
  assert.equal(keys.length, KONAMI_SEQUENCE.length);
  assert.equal(feed(detector, keys.slice(0, -1)), null);
  assert.equal(detector.push({ key: 'a' }, 2000), 'rizz');
});

test('Konami code matches even with leading extra ArrowUp and uppercase B/A', () => {
  const detector = createSequenceDetector();
  const keys = [
    'ArrowUp',
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'A'
  ];
  assert.equal(feed(detector, keys), 'rizz');
});

test('typing "rizz" triggers rizz and clears buffer', () => {
  const detector = createSequenceDetector();
  assert.equal(feed(detector, ['r', 'i', 'z']), null);
  assert.equal(detector.push({ key: 'z' }, 1300), 'rizz');
  assert.equal(detector.push({ key: 'z' }, 1350), null);
});

test('typing "proof" triggers proof overlay action', () => {
  const detector = createSequenceDetector();
  assert.equal(feed(detector, ['p', 'r', 'o', 'o']), null);
  assert.equal(detector.push({ key: 'f' }, 1400), 'proof');
});

test('existing PressControls keys (j, k, [, ], ?, /, u-s-s-y) never trigger delight actions', () => {
  const detector = createSequenceDetector();
  for (const key of ['j', 'k', '[', ']', '?', '/', 'u', 's', 's', 'y']) {
    assert.equal(detector.push({ key }, 1000), null);
  }
});

test('sequence expires after inactivity timeout', () => {
  const detector = createSequenceDetector({ timeoutMs: 1000 });
  assert.equal(detector.push({ key: 'r' }, 1000), null);
  assert.equal(detector.push({ key: 'i' }, 1100), null);
  assert.equal(detector.push({ key: 'z' }, 1200), null);
  // Pause longer than timeout before the final key
  assert.equal(detector.push({ key: 'z' }, 3000), null);
});

test('modifier chords and key repeats are ignored', () => {
  const detector = createSequenceDetector();
  assert.equal(feed(detector, ['r', 'i', 'z']), null);
  assert.equal(detector.push({ key: 'z', ctrlKey: true }, 1300), null);
  assert.equal(detector.push({ key: 'z', metaKey: true }, 1350), null);
  assert.equal(detector.push({ key: 'z', altKey: true }, 1400), null);
  assert.equal(detector.push({ key: 'z', repeat: true }, 1450), null);
  // Shift key alone should not break an in-progress sequence
  assert.equal(detector.push({ key: 'Shift' }, 1480), null);
  assert.equal(detector.push({ key: 'Z' }, 1500), 'rizz');
});

test('editable targets (input, textarea, select, contenteditable) are always ignored', () => {
  const targets = [
    { tagName: 'INPUT' },
    { tagName: 'textarea' },
    { tagName: 'SELECT' },
    { tagName: 'DIV', isContentEditable: true },
    { tagName: 'DIV', getAttribute: (name) => (name === 'contenteditable' ? 'true' : null) },
    { tagName: 'DIV', getAttribute: (name) => (name === 'contenteditable' ? '' : null) },
    { tagName: 'SPAN', closest: () => ({ tagName: 'DIV' }) }
  ];

  for (const target of targets) {
    assert.equal(isEditableTarget(target), true);
    const detector = createSequenceDetector();
    assert.equal(feed(detector, ['r', 'i', 'z', 'z'], 1000, 50, { target }), null);
    assert.equal(feed(detector, ['p', 'r', 'o', 'o', 'f'], 2000, 50, { target }), null);
  }

  assert.equal(isEditableTarget({ tagName: 'BODY', isContentEditable: false }), false);
  assert.equal(isEditableTarget(null), false);
});

test('getSeasonalState detects late night (22:00 to 05:00 local)', () => {
  assert.equal(getSeasonalState(new Date(2026, 5, 10, 21, 59)).lateNight, false);
  assert.equal(getSeasonalState(new Date(2026, 5, 10, 22, 0)).lateNight, true);
  assert.equal(getSeasonalState(new Date(2026, 5, 10, 23, 45)).lateNight, true);
  assert.equal(getSeasonalState(new Date(2026, 5, 11, 0, 0)).lateNight, true);
  assert.equal(getSeasonalState(new Date(2026, 5, 11, 4, 59)).lateNight, true);
  assert.equal(getSeasonalState(new Date(2026, 5, 11, 5, 0)).lateNight, false);
  assert.equal(getSeasonalState(new Date(2026, 5, 11, 14, 30)).lateNight, false);
});

test('getSeasonalState detects December and Press Day (23rd of any month)', () => {
  const dec1 = getSeasonalState(new Date(2026, 11, 1, 12, 0));
  assert.deepEqual(dec1, { lateNight: false, december: true, pressDay: false });

  const nov23 = getSeasonalState(new Date(2026, 10, 23, 15, 0));
  assert.deepEqual(nov23, { lateNight: false, december: false, pressDay: true });

  const dec23Night = getSeasonalState(new Date(2026, 11, 23, 23, 15));
  assert.deepEqual(dec23Night, { lateNight: true, december: true, pressDay: true });

  const apr24 = getSeasonalState(new Date(2026, 3, 24, 9, 0));
  assert.deepEqual(apr24, { lateNight: false, december: false, pressDay: false });
});

test('isFrontPagePath handles root and subpath deployments', () => {
  assert.equal(isFrontPagePath('/', '/'), true);
  assert.equal(isFrontPagePath('/index.html', '/'), true);
  assert.equal(isFrontPagePath('/issues/02/', '/'), false);
  assert.equal(isFrontPagePath('/ussysite6/', '/ussysite6/'), true);
  assert.equal(isFrontPagePath('/ussysite6', '/ussysite6/'), true);
  assert.equal(isFrontPagePath('/ussysite6/index.html', '/ussysite6/'), true);
  assert.equal(isFrontPagePath('/ussysite6/issues/02/', '/ussysite6/'), false);
});
