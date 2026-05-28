import type {
  ExtensionMessage,
  ScanPageMessage,
  ScanResultMessage,
  HighlightMatchMessage,
  ClearHighlightsMessage,
  WatchlistTerm,
  FalsePositiveRule,
  ExtensionSettings,
  DomainSetting,
  MatchSeverity,
} from '../shared/types/ingredients';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../shared/types/ingredients';
import { createMessageRouter } from './messageRouter';
import { updateBadge, clearBadge } from './badgeManager';

// ─── In-Memory Cache ─────────────────────────────────────────────

interface ScanDataCache {
  terms: WatchlistTerm[];
  falsePositives: FalsePositiveRule[];
  settings: ExtensionSettings;
  domainSettings: DomainSetting[];
  lastUpdated: number;
}

let cache: ScanDataCache = {
  terms: [],
  falsePositives: [],
  settings: DEFAULT_SETTINGS,
  domainSettings: [],
  lastUpdated: 0,
};

const CACHE_TTL_MS = 30_000;

async function loadScanData(): Promise<ScanDataCache> {
  const now = Date.now();
  if (now - cache.lastUpdated < CACHE_TTL_MS) return cache;

  const data = await chrome.storage.local.get([
    STORAGE_KEYS.WATCHLIST,
    STORAGE_KEYS.FALSE_POSITIVES,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.DOMAIN_SETTINGS,
  ]);

  cache = {
    terms: (data[STORAGE_KEYS.WATCHLIST] as WatchlistTerm[]) ?? [],
    falsePositives: (data[STORAGE_KEYS.FALSE_POSITIVES] as FalsePositiveRule[]) ?? [],
    settings: (data[STORAGE_KEYS.SETTINGS] as ExtensionSettings) ?? DEFAULT_SETTINGS,
    domainSettings: (data[STORAGE_KEYS.DOMAIN_SETTINGS] as DomainSetting[]) ?? [],
    lastUpdated: now,
  };

  return cache;
}

function invalidateCache(): void {
  cache.lastUpdated = 0;
}

// ─── Helpers ─────────────────────────────────────────────────────

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

function highestSeverity(matches: Array<{ severity: MatchSeverity }>): MatchSeverity {
  const priority: Record<MatchSeverity, number> = { warning: 3, notice: 2, info: 1 };
  let max: MatchSeverity = 'info';
  for (const m of matches) {
    if (priority[m.severity] > priority[max]) max = m.severity;
  }
  return max;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isAutoScanDomain(domain: string, domainSettings: DomainSetting[]): boolean {
  const setting = domainSettings.find((s) => s.domain === domain);
  return setting?.autoScanEnabled ?? false;
}

function isIgnoredDomain(domain: string, domainSettings: DomainSetting[]): boolean {
  const setting = domainSettings.find((s) => s.domain === domain);
  return setting?.ignored ?? false;
}

// ─── Content Script Injection ────────────────────────────────────

const injectedTabs = new Set<number>();

async function injectContentScript(tabId: number): Promise<void> {
  if (injectedTabs.has(tabId)) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      return;
    } catch {
      injectedTabs.delete(tabId);
    }
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/scanner.js'],
  });

  injectedTabs.add(tabId);
}

// ─── Auto-Scan on Page Load ──────────────────────────────────────

async function triggerAutoScan(tabId: number, url: string): Promise<void> {
  const domain = extractDomain(url);
  if (!domain) return;

  const data = await loadScanData();

  if (isIgnoredDomain(domain, data.domainSettings)) return;
  if (data.terms.length === 0) return;

  const shouldAutoScan = isAutoScanDomain(domain, data.domainSettings);

  try {
    await injectContentScript(tabId);
  } catch {
    return;
  }

  if (shouldAutoScan) {
    const scanMessage: ScanPageMessage = {
      type: 'AUTO_SCAN',
      payload: {
        terms: data.terms,
        falsePositives: data.falsePositives,
        settings: data.settings,
      },
    };

    try {
      const response = await chrome.tabs.sendMessage(tabId, scanMessage);
      if (response?.result) {
        const matchCount = response.result.matches?.length ?? 0;
        const severity = matchCount > 0 ? highestSeverity(response.result.matches) : 'info';
        updateBadge(tabId, matchCount, severity);
        await chrome.storage.local.set({ [STORAGE_KEYS.LAST_SCAN]: response.result });
      }
    } catch {
      // Content script not ready
    }
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url) return;
  if (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('about:') ||
    tab.url.startsWith('devtools://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('brave://')
  ) return;

  invalidateCache();
  void triggerAutoScan(tabId, tab.url);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

// ─── Storage Change Listener ─────────────────────────────────────

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (
    changes[STORAGE_KEYS.WATCHLIST] ||
    changes[STORAGE_KEYS.FALSE_POSITIVES] ||
    changes[STORAGE_KEYS.SETTINGS] ||
    changes[STORAGE_KEYS.DOMAIN_SETTINGS]
  ) {
    invalidateCache();
  }
});

// ─── Install / Startup ──────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const existing = await chrome.storage.local.get([
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.WATCHLIST,
      STORAGE_KEYS.FALSE_POSITIVES,
    ]);

    if (!existing[STORAGE_KEYS.SETTINGS]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
    }
    if (!existing[STORAGE_KEYS.WATCHLIST]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.WATCHLIST]: [] });
    }
    if (!existing[STORAGE_KEYS.FALSE_POSITIVES]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.FALSE_POSITIVES]: [] });
    }
  }

  invalidateCache();
});

// ─── Message Router ──────────────────────────────────────────────

createMessageRouter({
  SCAN_PAGE: async (
    _message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): Promise<void> => {
    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      if (
        !tab.url ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:')
      ) {
        sendResponse({ success: false, error: 'Cannot scan this page (restricted URL)' });
        return;
      }

      const tabId = tab.id;
      const data = await loadScanData();

      if (data.terms.length === 0) {
        sendResponse({ success: false, error: 'No watchlist terms configured' });
        return;
      }

      await injectContentScript(tabId);

      const scanMessage: ScanPageMessage = {
        type: 'SCAN_PAGE',
        payload: {
          terms: data.terms,
          falsePositives: data.falsePositives,
          settings: data.settings,
        },
      };

      const response = await chrome.tabs.sendMessage(tabId, scanMessage);

      if (response?.result) {
        const result = response.result;
        const matchCount = result.matches?.length ?? 0;
        const severity = matchCount > 0 ? highestSeverity(result.matches) : 'info';
        updateBadge(tabId, matchCount, severity);
        await chrome.storage.local.set({ [STORAGE_KEYS.LAST_SCAN]: result });
        sendResponse({ success: true, result });
      } else {
        sendResponse(response ?? { success: false, error: 'No response from content script' });
      }
    } catch (err) {
      console.error('[IW] SCAN_PAGE error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  },

  SCAN_RESULT: async (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    _sendResponse: (response: unknown) => void
  ): Promise<void> => {
    const msg = message as ScanResultMessage;
    const tabId = sender.tab?.id;
    if (tabId && msg.payload) {
      const matchCount = msg.payload.matches?.length ?? 0;
      const severity = matchCount > 0 ? highestSeverity(msg.payload.matches) : 'info';
      updateBadge(tabId, matchCount, severity);
      await chrome.storage.local.set({ [STORAGE_KEYS.LAST_SCAN]: msg.payload });
    }
  },

  GET_WATCHLIST: async (
    _message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): Promise<void> => {
    const data = await loadScanData();
    sendResponse({
      terms: data.terms,
      falsePositives: data.falsePositives,
      settings: data.settings,
    });
  },

  HIGHLIGHT_MATCH: async (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): Promise<void> => {
    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      const response = await chrome.tabs.sendMessage(tab.id, message as HighlightMatchMessage);
      sendResponse(response ?? { success: true });
    } catch (err) {
      console.error('[IW] HIGHLIGHT_MATCH error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  },

  CLEAR_HIGHLIGHTS: async (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): Promise<void> => {
    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      const response = await chrome.tabs.sendMessage(tab.id, message as ClearHighlightsMessage);
      clearBadge(tab.id);
      sendResponse(response ?? { success: true });
    } catch (err) {
      console.error('[IW] CLEAR_HIGHLIGHTS error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  },

  SCROLL_TO_MATCH: async (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): Promise<void> => {
    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      const response = await chrome.tabs.sendMessage(tab.id, message);
      sendResponse(response ?? { success: true });
    } catch (err) {
      console.error('[IW] SCROLL_TO_MATCH error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  },
});
