import { create } from 'zustand';
import type { WatchlistTerm } from '@shared/types/ingredients';
import { STORAGE_KEYS } from '@shared/types/ingredients';
import { PRESET_PACKS } from '@shared/constants/presetIngredients';
import {
  getWatchlist,
  saveWatchlist,
  addTerm as storageAddTerm,
  updateTerm as storageUpdateTerm,
  deleteTerm as storageDeleteTerm,
} from '@shared/lib/storage';

// ─── Helpers ─────────────────────────────────────────────────────

function generateId(): string {
  return `iw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

// ─── Store Types ─────────────────────────────────────────────────

interface WatchlistState {
  terms: WatchlistTerm[];
  loading: boolean;
  error: string | null;

  loadTerms: () => Promise<void>;
  addTerm: (
    term: Omit<WatchlistTerm, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateTerm: (id: string, updates: Partial<WatchlistTerm>) => Promise<void>;
  deleteTerm: (id: string) => Promise<void>;
  toggleTerm: (id: string) => Promise<void>;
  importPresetPack: (packId: string) => Promise<void>;
  removePresetPack: (packId: string) => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────────

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  terms: [],
  loading: false,
  error: null,

  loadTerms: async () => {
    set({ loading: true, error: null });
    try {
      if (!hasChromeStorage()) {
        set({ terms: [], loading: false });
        return;
      }
      const terms = await getWatchlist();
      set({ terms, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load watchlist';
      set({ error: message, loading: false });
    }
  },

  addTerm: async (term) => {
    const now = new Date().toISOString();
    const fullTerm: WatchlistTerm = {
      ...term,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({ terms: [...state.terms, fullTerm], error: null }));

    try {
      if (hasChromeStorage()) {
        await storageAddTerm(fullTerm);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add term';
      set({ error: message });
    }
  },

  updateTerm: async (id, updates) => {
    const now = new Date().toISOString();

    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: now } : t
      ),
      error: null,
    }));

    try {
      if (hasChromeStorage()) {
        await storageUpdateTerm(id, { ...updates, updatedAt: now });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update term';
      set({ error: message });
    }
  },

  deleteTerm: async (id) => {
    set((state) => ({
      terms: state.terms.filter((t) => t.id !== id),
      error: null,
    }));

    try {
      if (hasChromeStorage()) {
        await storageDeleteTerm(id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete term';
      set({ error: message });
    }
  },

  toggleTerm: async (id) => {
    const term = get().terms.find((t) => t.id === id);
    if (!term) return;
    await get().updateTerm(id, { enabled: !term.enabled });
  },

  importPresetPack: async (packId) => {
    const pack = PRESET_PACKS.find((p) => p.id === packId);
    if (!pack) {
      set({ error: `Preset pack "${packId}" not found` });
      return;
    }

    const now = new Date().toISOString();
    const newTerms: WatchlistTerm[] = pack.terms.map((t) => ({
      ...t,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    const merged = [...get().terms, ...newTerms];
    set({ terms: merged, error: null });

    try {
      if (hasChromeStorage()) {
        await saveWatchlist(merged);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to import preset pack';
      set({ error: message });
    }
  },

  removePresetPack: async (packId) => {
    const pack = PRESET_PACKS.find((p) => p.id === packId);
    if (!pack) {
      set({ error: `Preset pack "${packId}" not found` });
      return;
    }

    const packLabels = new Set(pack.terms.map((t) => t.label.toLowerCase()));
    const filtered = get().terms.filter(
      (t) => !packLabels.has(t.label.toLowerCase()) || t.category !== pack.category
    );

    set({ terms: filtered, error: null });

    try {
      if (hasChromeStorage()) {
        await saveWatchlist(filtered);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove preset pack';
      set({ error: message });
    }
  },
}));

// ─── Cross-context Sync ──────────────────────────────────────────

if (hasChromeStorage()) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes[STORAGE_KEYS.WATCHLIST]) {
      const newTerms = changes[STORAGE_KEYS.WATCHLIST].newValue as
        | WatchlistTerm[]
        | undefined;
      if (newTerms) {
        useWatchlistStore.setState({ terms: newTerms });
      }
    }
  });
}
