import type {
  WatchlistTerm,
  DomainSetting,
  FalsePositiveRule,
  ExtensionSettings,
} from '../types/ingredients';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../types/ingredients';

// ─── Generic Helpers ─────────────────────────────────────────────
async function getFromStorage<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? fallback);
    });
  });
}

async function setToStorage<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

// ─── Watchlist ───────────────────────────────────────────────────
export async function getWatchlist(): Promise<WatchlistTerm[]> {
  return getFromStorage<WatchlistTerm[]>(STORAGE_KEYS.WATCHLIST, []);
}

export async function saveWatchlist(terms: WatchlistTerm[]): Promise<void> {
  return setToStorage(STORAGE_KEYS.WATCHLIST, terms);
}

export async function addTerm(term: WatchlistTerm): Promise<void> {
  const terms = await getWatchlist();
  terms.push(term);
  return saveWatchlist(terms);
}

export async function updateTerm(
  id: string,
  updates: Partial<WatchlistTerm>
): Promise<void> {
  const terms = await getWatchlist();
  const index = terms.findIndex((t) => t.id === id);
  if (index >= 0) {
    terms[index] = { ...terms[index], ...updates, updatedAt: new Date().toISOString() };
    return saveWatchlist(terms);
  }
}

export async function deleteTerm(id: string): Promise<void> {
  const terms = await getWatchlist();
  return saveWatchlist(terms.filter((t) => t.id !== id));
}

// ─── Settings ────────────────────────────────────────────────────
export async function getSettings(): Promise<ExtensionSettings> {
  return getFromStorage<ExtensionSettings>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS
  );
}

export async function saveSettings(
  settings: ExtensionSettings
): Promise<void> {
  return setToStorage(STORAGE_KEYS.SETTINGS, settings);
}

// ─── Domain Settings ─────────────────────────────────────────────
export async function getDomainSettings(): Promise<DomainSetting[]> {
  return getFromStorage<DomainSetting[]>(STORAGE_KEYS.DOMAIN_SETTINGS, []);
}

export async function saveDomainSetting(
  setting: DomainSetting
): Promise<void> {
  const settings = await getDomainSettings();
  const index = settings.findIndex((s) => s.domain === setting.domain);
  if (index >= 0) {
    settings[index] = setting;
  } else {
    settings.push(setting);
  }
  return setToStorage(STORAGE_KEYS.DOMAIN_SETTINGS, settings);
}

export async function deleteDomainSetting(domain: string): Promise<void> {
  const settings = await getDomainSettings();
  return setToStorage(
    STORAGE_KEYS.DOMAIN_SETTINGS,
    settings.filter((s) => s.domain !== domain)
  );
}

// ─── False Positives ─────────────────────────────────────────────
export async function getFalsePositives(): Promise<FalsePositiveRule[]> {
  return getFromStorage<FalsePositiveRule[]>(STORAGE_KEYS.FALSE_POSITIVES, []);
}

export async function addFalsePositive(
  rule: FalsePositiveRule
): Promise<void> {
  const rules = await getFalsePositives();
  rules.push(rule);
  return setToStorage(STORAGE_KEYS.FALSE_POSITIVES, rules);
}

export async function deleteFalsePositive(id: string): Promise<void> {
  const rules = await getFalsePositives();
  return setToStorage(
    STORAGE_KEYS.FALSE_POSITIVES,
    rules.filter((r) => r.id !== id)
  );
}

export async function clearFalsePositives(): Promise<void> {
  return setToStorage(STORAGE_KEYS.FALSE_POSITIVES, []);
}

// ─── Export / Import ─────────────────────────────────────────────
export interface ExportData {
  version: 1;
  exportedAt: string;
  watchlist: WatchlistTerm[];
  settings: ExtensionSettings;
  domainSettings: DomainSetting[];
  falsePositives: FalsePositiveRule[];
}

export async function exportData(): Promise<string> {
  const [watchlist, settings, domainSettings, falsePositives] =
    await Promise.all([
      getWatchlist(),
      getSettings(),
      getDomainSettings(),
      getFalsePositives(),
    ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    watchlist,
    settings,
    domainSettings,
    falsePositives,
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json) as ExportData;

  if (!data.version || data.version !== 1) {
    throw new Error('Unsupported export format version');
  }

  if (!Array.isArray(data.watchlist)) {
    throw new Error('Invalid watchlist data');
  }

  await Promise.all([
    saveWatchlist(data.watchlist),
    saveSettings({ ...DEFAULT_SETTINGS, ...data.settings }),
    setToStorage(STORAGE_KEYS.DOMAIN_SETTINGS, data.domainSettings ?? []),
    setToStorage(STORAGE_KEYS.FALSE_POSITIVES, data.falsePositives ?? []),
  ]);
}

// ─── Clear All ───────────────────────────────────────────────────
export async function clearAllData(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
}

// ─── Storage Change Listener ─────────────────────────────────────
export function onStorageChange(
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local') {
      callback(changes);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
