import { create } from 'zustand';
import type { ThemeMode, ExtensionSettings } from '@shared/types/ingredients';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@shared/types/ingredients';

// ─── Helpers ─────────────────────────────────────────────────────

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyThemeClass(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// ─── Store Types ─────────────────────────────────────────────────

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';

  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  _init: () => void;
}

// ─── Store ───────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DEFAULT_SETTINGS.theme,
  resolvedTheme: resolveTheme(DEFAULT_SETTINGS.theme),

  setTheme: (mode) => {
    const resolved = resolveTheme(mode);
    applyThemeClass(resolved);
    set({ theme: mode, resolvedTheme: resolved });

    // Persist to chrome.storage.local
    if (hasChromeStorage()) {
      chrome.storage.local.get(STORAGE_KEYS.SETTINGS, (result) => {
        const current: ExtensionSettings =
          result[STORAGE_KEYS.SETTINGS] ?? DEFAULT_SETTINGS;
        chrome.storage.local.set({
          [STORAGE_KEYS.SETTINGS]: { ...current, theme: mode },
        });
      });
    }
  },

  toggleTheme: () => {
    const { theme } = get();
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const nextIndex = (order.indexOf(theme) + 1) % order.length;
    get().setTheme(order[nextIndex]);
  },

  _init: () => {
    // Load persisted theme from storage
    if (hasChromeStorage()) {
      chrome.storage.local.get(STORAGE_KEYS.SETTINGS, (result) => {
        const settings: ExtensionSettings =
          result[STORAGE_KEYS.SETTINGS] ?? DEFAULT_SETTINGS;
        const resolved = resolveTheme(settings.theme);
        applyThemeClass(resolved);
        set({ theme: settings.theme, resolvedTheme: resolved });
      });
    } else {
      const resolved = resolveTheme(get().theme);
      applyThemeClass(resolved);
    }

    // Listen for OS-level dark mode changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        const { theme } = get();
        if (theme === 'system') {
          const resolved = resolveTheme('system');
          applyThemeClass(resolved);
          set({ resolvedTheme: resolved });
        }
      };
      mediaQuery.addEventListener('change', handler);
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
      if (newSettings?.theme) {
        const resolved = resolveTheme(newSettings.theme);
        applyThemeClass(resolved);
        useThemeStore.setState({
          theme: newSettings.theme,
          resolvedTheme: resolved,
        });
      }
    }
  });
}

// Initialize on module load
useThemeStore.getState()._init();
