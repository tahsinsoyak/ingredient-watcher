import { create } from 'zustand';
import type { Locale } from '../types/ingredients';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/ingredients';

// ─── State ───────────────────────────────────────────────────────

interface LocaleState {
  locale: Locale;
  loading: boolean;
  error: string | null;
  setLocale: (locale: Locale) => Promise<void>;
  _init: () => void;
  _ready: boolean;
}

// ─── Detect browser language ────────────────────────────────────

function detectBrowserLocale(): Locale {
  try {
    const lang = navigator.language?.toLowerCase() ?? '';
    if (lang.startsWith('tr')) return 'tr';
    return 'en';
  } catch {
    return 'en';
  }
}

// ─── Store ───────────────────────────────────────────────────────

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',
  loading: true,
  error: null,
  _ready: false,

  _init: () => {
    if (get()._ready) return;

    try {
      chrome.storage.local.get(STORAGE_KEYS.SETTINGS, (result) => {
        const settings = result[STORAGE_KEYS.SETTINGS];
        if (settings?.locale === 'tr' || settings?.locale === 'en') {
          set({ locale: settings.locale, loading: false, _ready: true });
        } else {
          const detected = detectBrowserLocale();
          set({ locale: detected, loading: false, _ready: true });
          // Persist detected locale
          chrome.storage.local.get(STORAGE_KEYS.SETTINGS, (res) => {
            const existing = res[STORAGE_KEYS.SETTINGS] ?? {};
            chrome.storage.local.set({
              [STORAGE_KEYS.SETTINGS]: { ...DEFAULT_SETTINGS, ...existing, locale: detected },
            });
          });
        }
      });
    } catch {
      // Fallback to detect
      set({ locale: detectBrowserLocale(), loading: false, _ready: true });
    }
  },

  setLocale: async (locale: Locale) => {
    set({ locale, error: null });
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      const existing = result[STORAGE_KEYS.SETTINGS] ?? {};
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: { ...DEFAULT_SETTINGS, ...existing, locale },
      });
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));

// ─── Auto-init ───────────────────────────────────────────────────

useLocaleStore.getState()._init();
