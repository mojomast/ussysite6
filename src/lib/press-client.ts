/**
 * LIVING EDITION READER STATE & SOURCE ROOM CLIENT
 *
 * Isolates each reader via a persistent local `readerId` token (fixing Issue 01's
 * global state clobbering) while syncing bookmarks, paper stock, and public margin
 * dispatches with the Hono + Drizzle + SQLite API (`/api/press/state`).
 * Degrades cleanly to `localStorage` when running as pure static HTML without the API.
 */

import { API_ENABLED, withBase } from './paths';

export type PaperStock = 'graphite' | 'rag' | 'oxide';

export interface MarginNote {
  id: string;
  text: string;
  articleSlug?: string;
  issueNumber?: string;
  createdAt: number;
}

export interface ReaderPressState {
  v: number;
  readerId: string;
  printMode: PaperStock;
  gridOverlay: boolean;
  circledServiceNos: number[];
  readerNotes: MarginNote[];
  unlocked: string[];
  counters: {
    articlesRead: number;
    flexiPlays: number;
    bingoSubmissions: number;
  };
  updatedAt: number;
}

export interface CommunityPressStats {
  totalReaders: number;
  saveCountsByServiceNo: Record<string, number>;
  recentDispatches: MarginNote[];
}

const STORAGE_KEY = 'ussysite6.living.press.v2';
const LEGACY_KEY = 'ussysite6.press.state.v1';

function mintReaderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `rdr_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  }
  return `rdr_${Math.random().toString(36).slice(2, 14)}${Date.now().toString(36)}`;
}

function mapLegacyMode(mode?: string): PaperStock {
  if (mode === 'rag' || mode === 'cream-press') return 'rag';
  if (mode === 'oxide' || mode === 'blueprint') return 'oxide';
  return 'graphite';
}

class PressClient {
  private state: ReaderPressState;
  private community: CommunityPressStats = {
    totalReaders: 0,
    saveCountsByServiceNo: {},
    recentDispatches: []
  };
  private listeners = new Set<(state: ReaderPressState, community: CommunityPressStats) => void>();
  private hydrated = false;

  constructor() {
    this.state = {
      v: 2,
      readerId: mintReaderId(),
      printMode: 'graphite',
      gridOverlay: false,
      circledServiceNos: [],
      readerNotes: [],
      unlocked: [],
      counters: {
        articlesRead: 0,
        flexiPlays: 0,
        bingoSubmissions: 0
      },
      updatedAt: Date.now()
    };
  }

  init(): void {
    if (typeof window === 'undefined') return;
    if (!this.hydrated) {
      this.hydrated = true;
      this.loadFromStorage();
      this.applyDomAttributes();
      void this.pullRemote();
    } else {
      this.applyDomAttributes();
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.state = {
          ...this.state,
          readerId: typeof parsed.readerId === 'string' && parsed.readerId.length >= 8 ? parsed.readerId : this.state.readerId,
          printMode: mapLegacyMode(parsed.printMode),
          gridOverlay: Boolean(parsed.gridOverlay),
          circledServiceNos: Array.isArray(parsed.circledServiceNos)
            ? [...new Set<number>(parsed.circledServiceNos.map(Number).filter((n: number) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b)
            : [],
          readerNotes: Array.isArray(parsed.readerNotes) ? parsed.readerNotes.slice(0, 24) : [],
          unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked.map(String) : []
        };
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }

  private applyDomAttributes(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-stock', this.state.printMode);
    document.documentElement.setAttribute('data-grid', this.state.gridOverlay ? 'on' : 'off');
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn(this.getState(), this.getCommunity());
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  private persist(syncServer = true): void {
    this.state.updatedAt = Date.now();
    this.applyDomAttributes();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota errors
    }
    this.notify();

    if (syncServer && API_ENABLED && typeof fetch === 'function') {
      fetch(withBase('/api/press/state'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Reader-Id': this.state.readerId
        },
        body: JSON.stringify({ state: this.state })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.community) {
            this.community = data.community;
            this.notify();
          }
        })
        .catch(() => {});
    }
  }

  async pullRemote(): Promise<void> {
    if (!API_ENABLED || typeof fetch !== 'function') return;
    try {
      const res = await fetch(withBase('/api/press/state'), {
        headers: { 'X-Reader-Id': this.state.readerId }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.community) {
        this.community = data.community;
      }
      if (data?.state && Array.isArray(data.state.circledServiceNos) && this.state.circledServiceNos.length === 0 && data.state.circledServiceNos.length > 0) {
        this.state.circledServiceNos = data.state.circledServiceNos;
      }
      this.notify();
    } catch {
      // Static-only preview without backend API is fully supported
    }
  }

  subscribe(fn: (state: ReaderPressState, community: CommunityPressStats) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getState(): ReaderPressState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getCommunity(): CommunityPressStats {
    return JSON.parse(JSON.stringify(this.community));
  }

  setStock(stock: PaperStock): void {
    this.state.printMode = stock;
    this.persist(true);
  }

  toggleGrid(): boolean {
    this.state.gridOverlay = !this.state.gridOverlay;
    this.persist(false);
    return this.state.gridOverlay;
  }

  toggleServiceNo(serviceNo: number): boolean {
    const num = Number(serviceNo);
    if (!Number.isInteger(num) || num <= 0) return false;
    const idx = this.state.circledServiceNos.indexOf(num);
    let saved = false;
    if (idx === -1) {
      this.state.circledServiceNos.push(num);
      this.state.circledServiceNos.sort((a, b) => a - b);
      saved = true;
    } else {
      this.state.circledServiceNos.splice(idx, 1);
      saved = false;
    }
    this.persist(true);
    return saved;
  }

  setAllServiceNos(nos: number[]): void {
    this.state.circledServiceNos = [...new Set(nos.map(Number).filter((n) => Number.isInteger(n) && n > 0))].sort(
      (a, b) => a - b
    );
    this.persist(true);
  }

  async addDispatch(text: string, meta?: { articleSlug?: string; issueNumber?: string }): Promise<MarginNote | null> {
    const clean = String(text || '').trim().slice(0, 180);
    if (!clean) return null;
    const note: MarginNote = {
      id: `dsp_${Date.now().toString(36)}`,
      text: clean,
      articleSlug: meta?.articleSlug,
      issueNumber: meta?.issueNumber,
      createdAt: Date.now()
    };
    this.state.readerNotes = [note, ...this.state.readerNotes].slice(0, 24);
    this.state.counters.bingoSubmissions = (this.state.counters.bingoSubmissions || 0) + 1;
    this.persist(true);

    if (API_ENABLED && typeof fetch === 'function') {
      try {
        const res = await fetch(withBase('/api/source-room/dispatch'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Reader-Id': this.state.readerId
          },
          body: JSON.stringify(note)
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.community) {
            this.community = data.community;
            this.notify();
          }
        }
      } catch {
        // Offline / static fallback already persisted in localStorage
      }
    }
    return note;
  }
}

export const pressClient = new PressClient();
