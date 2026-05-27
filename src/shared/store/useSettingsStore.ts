import { create } from 'zustand';
import type { ExtensionSettings } from '@shared/types/ingredients';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@shared/types/ingredients';
import { getSettings, saveSettings } from '@shared/lib/storage';

// ─── Helpers ─────────────────────────────────────────────────────

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

// ─── Store Types ─────────────────────────────────────────────────

interface SettingsState extends ExtensionSettings {
  loading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<ExtensionSettings>) => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      if (!hasChromeStorage()) {
        set({ loading: false });
        return;
      }
      const settings = await getSettings();
      set({ ...settings, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load settings';
      set({ error: message, loading: false });
    }
  },

  updateSettings: async (partial) => {
    const {
      loading: _loading,
      error: _error,
      loadSettings: _loadSettings,
      updateSettings: _updateSettings,
      ...currentSettings
    } = get();

    const merged: ExtensionSettings = { ...currentSettings, ...partial };
    set({ ...partial, error: null });

    try {
      if (hasChromeStorage()) {
        await saveSettings(merged);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save settings';
      set({ error: message });
    }
  },
}));

// ─── Cross-context Sync ──────────────────────────────────────────

if (hasChromeStorage()) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes[STORAGE_KEYS.SETTINGS]) {
      const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue as
        | ExtensionSettings
        | undefined;
      if (newSettings) {
        useSettingsStore.setState({ ...newSettings });
      }
    }
  });
}
