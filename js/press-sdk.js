/**
 * USSYSITE6 // THE USSY COMPUTING ANNUAL
 * PRESS ROOM & READER SERVICE CARD ("BINGO CARD") SDK
 *
 * Exposes `window.PressSDK` (and `window.AnomalySDK` compatibility alias)
 * to persist circled Reader Service Inquiry numbers (#101-#111), active
 * paper stock mode, and reader margin dispatches.
 */

const STORAGE_KEY = 'ussysite6.press.state.v1';

export class PressSDK {
  constructor() {
    this.state = {
      v: 1,
      printMode: 'cream-press',
      circledServiceNos: [101, 104, 111],
      readerNotes: [
        {
          id: 'dispatch-1',
          text: 'Spread XI (Becomussy): The 5-layer geological memory diagram is pure classic BYTE.',
          createdAt: Date.now() - 1800_000
        }
      ],
      unlocked: [],
      counters: {
        articlesRead: 0,
        flexiPlays: 0,
        bingoSubmissions: 1
      },
      flags: {},
      updatedAt: Date.now()
    };

    this.listeners = new Set();
    this._loadLocal();
  }

  _loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.state = {
          ...this.state,
          ...parsed,
          circledServiceNos: Array.isArray(parsed.circledServiceNos)
            ? parsed.circledServiceNos
            : this.state.circledServiceNos,
          readerNotes: Array.isArray(parsed.readerNotes) && parsed.readerNotes.length > 0
            ? parsed.readerNotes
            : this.state.readerNotes
        };
      }
    } catch {
      // Ignore storage access errors
    }
  }

  _persist() {
    this.state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota errors
    }

    for (const fn of this.listeners) {
      try {
        fn(this.state);
      } catch {
        // Ignore listener error
      }
    }

    if (typeof fetch === 'function') {
      fetch('/api/press/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: this.state })
      }).catch(() => {});
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  setPrintMode(mode) {
    this.state.printMode = mode;
    this._persist();
  }

  toggleServiceNumber(serviceNo) {
    const num = Number(serviceNo);
    if (!num) return false;
    const idx = this.state.circledServiceNos.indexOf(num);
    let isCircled = false;
    if (idx === -1) {
      this.state.circledServiceNos.push(num);
      this.state.circledServiceNos.sort((a, b) => a - b);
      isCircled = true;
    } else {
      this.state.circledServiceNos.splice(idx, 1);
      isCircled = false;
    }
    if (this.state.circledServiceNos.length === 11 && !this.state.unlocked.includes('full-annual-subscriber')) {
      this.state.unlocked.push('full-annual-subscriber');
    }
    this._persist();
    return isCircled;
  }

  circleAllServiceNumbers(allNos) {
    this.state.circledServiceNos = [...new Set(allNos.map(Number))].sort((a, b) => a - b);
    this._persist();
  }

  addReaderNote(text) {
    const clean = String(text || '').trim().slice(0, 160);
    if (!clean) return null;
    const item = {
      id: `dispatch-${Date.now()}`,
      text: clean,
      createdAt: Date.now()
    };
    this.state.readerNotes = [item, ...this.state.readerNotes].slice(0, 16);
    this.state.counters.bingoSubmissions = (this.state.counters.bingoSubmissions || 0) + 1;
    this._persist();
    return item;
  }

  getState() {
    return structuredClone ? structuredClone(this.state) : JSON.parse(JSON.stringify(this.state));
  }
}
