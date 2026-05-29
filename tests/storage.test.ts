import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome.storage.local for tests
const mockStorage: Record<string, unknown> = {};

const chromeMock = {
  storage: {
    local: {
      get: vi.fn((key: string, callback: (result: Record<string, unknown>) => void) => {
        callback({ [key]: mockStorage[key] });
      }),
      set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
        Object.assign(mockStorage, items);
        callback?.();
      }),
      clear: vi.fn((callback?: () => void) => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        callback?.();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// Install mock
vi.stubGlobal('chrome', chromeMock);

// Now import storage module
import {
  getWatchlist,
  saveWatchlist,
  addTerm,
  updateTerm,
  deleteTerm,
  getSettings,
  saveSettings,
  exportData,
  importData,
  clearAllData,
} from '../src/shared/lib/storage';
import type { WatchlistTerm, ExtensionSettings } from '../src/shared/types/ingredients';
import { DEFAULT_SETTINGS } from '../src/shared/types/ingredients';

describe('storage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  it('getWatchlist returns empty array when no data', async () => {
    const result = await getWatchlist();
    expect(result).toEqual([]);
  });

  it('saveWatchlist and getWatchlist roundtrip', async () => {
    const terms: WatchlistTerm[] = [
      {
        id: 'test-1',
        label: 'Gluten',
        aliases: [],
        category: 'allergen',
        severity: 'warning',
        enabled: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    await saveWatchlist(terms);
    const result = await getWatchlist();
    expect(result).toEqual(terms);
  });

  it('addTerm adds to existing watchlist', async () => {
    const term: WatchlistTerm = {
      id: 'test-2',
      label: 'SLS',
      aliases: ['sodium lauryl sulfate'],
      category: 'cosmetics',
      severity: 'warning',
      enabled: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    await addTerm(term);
    const result = await getWatchlist();
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('SLS');
  });

  it('updateTerm modifies a term', async () => {
    const term: WatchlistTerm = {
      id: 'test-3',
      label: 'Paraben',
      aliases: [],
      category: 'cosmetics',
      severity: 'warning',
      enabled: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    await addTerm(term);
    await updateTerm('test-3', { label: 'Updated Paraben', enabled: false });
    const result = await getWatchlist();
    expect(result[0].label).toBe('Updated Paraben');
    expect(result[0].enabled).toBe(false);
  });

  it('deleteTerm removes a term', async () => {
    const term: WatchlistTerm = {
      id: 'test-4',
      label: 'Fragrance',
      aliases: [],
      category: 'cosmetics',
      severity: 'warning',
      enabled: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    await addTerm(term);
    await deleteTerm('test-4');
    const result = await getWatchlist();
    expect(result.length).toBe(0);
  });

  it('getSettings returns defaults when no settings stored', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saveSettings persists settings', async () => {
    const newSettings: ExtensionSettings = {
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      strictMode: true,
    };
    await saveSettings(newSettings);
    const result = await getSettings();
    expect(result.theme).toBe('dark');
    expect(result.strictMode).toBe(true);
  });

  it('exportData produces valid JSON', async () => {
    const term: WatchlistTerm = {
      id: 'export-1',
      label: 'Test',
      aliases: [],
      category: 'custom',
      severity: 'info',
      enabled: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    await addTerm(term);
    const json = await exportData();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.watchlist.length).toBe(1);
    expect(parsed.exportedAt).toBeTruthy();
  });

  it('importData restores data from JSON', async () => {
    const exportJSON = JSON.stringify({
      version: 1,
      exportedAt: '2024-01-01',
      watchlist: [
        {
          id: 'import-1',
          label: 'Imported',
          aliases: [],
          category: 'food',
          severity: 'warning',
          enabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
      settings: { ...DEFAULT_SETTINGS, theme: 'dark' },
      domainSettings: [],
      falsePositives: [],
    });
    await importData(exportJSON);
    const watchlist = await getWatchlist();
    expect(watchlist.length).toBe(1);
    expect(watchlist[0].label).toBe('Imported');
  });

  it('importData rejects invalid version', async () => {
    const badJSON = JSON.stringify({ version: 99 });
    await expect(importData(badJSON)).rejects.toThrow(
      'Unsupported export format version'
    );
  });

  it('clearAllData removes everything', async () => {
    await addTerm({
      id: 'clear-1',
      label: 'Test',
      aliases: [],
      category: 'custom',
      severity: 'info',
      enabled: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    await clearAllData();
    expect(chromeMock.storage.local.clear).toHaveBeenCalled();
  });
});
