import { create } from 'zustand';
import type { ScanResult } from '@shared/types/ingredients';
import { STORAGE_KEYS } from '@shared/types/ingredients';
import { addFalsePositive } from '@shared/lib/storage';

function generateId(): string {
  return `iw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
}

interface ScanState {
  scanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
  lastScanUrl: string;

  startScan: () => void;
  setScanResult: (result: ScanResult) => void;
  clearScan: () => void;
  loadLastScanResult: () => Promise<void>;
  markFalsePositive: (matchId: string, domain: string) => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
  scanning: false,
  scanResult: null,
  error: null,
  lastScanUrl: '',

  startScan: () => {
    set({ scanning: true, scanResult: null, error: null });
  },

  setScanResult: (result) => {
    set({
      scanning: false,
      scanResult: result,
      lastScanUrl: result.url,
      error: null,
    });
  },

  clearScan: () => {
    set({ scanning: false, scanResult: null, error: null });
  },

  loadLastScanResult: async () => {
    try {
      if (!hasChromeStorage()) return;

      const tabQuery = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabQuery[0];
      if (!activeTab?.url) return;

      const data = await chrome.storage.local.get(STORAGE_KEYS.LAST_SCAN);
      const lastScan = data[STORAGE_KEYS.LAST_SCAN] as ScanResult | undefined;
      if (!lastScan) return;

      const currentDomain = new URL(activeTab.url).hostname;
      const scanDomain = new URL(lastScan.url).hostname;

      if (currentDomain === scanDomain && activeTab.url === lastScan.url) {
        set({ scanResult: lastScan, lastScanUrl: lastScan.url });
      }
    } catch {
      // Not in extension context
    }
  },

  markFalsePositive: async (matchId, domain) => {
    const { scanResult } = get();
    if (!scanResult) return;

    const match = scanResult.matches.find((m) => m.id === matchId);
    if (!match) return;

    const updatedMatches = scanResult.matches.filter((m) => m.id !== matchId);
    set({
      scanResult: { ...scanResult, matches: updatedMatches },
      error: null,
    });

    try {
      if (hasChromeStorage()) {
        await addFalsePositive({
          id: generateId(),
          term: match.normalizedText,
          domain,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to mark false positive';
      set({ error: message });
    }
  },
}));
