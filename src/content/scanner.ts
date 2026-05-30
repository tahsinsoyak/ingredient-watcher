import type {
  WatchlistTerm,
  FalsePositiveRule,
  ExtensionSettings,
  IngredientMatch,
  ScanResult,
  MatchSeverity,
  ExtensionMessage,
  ScanPageMessage,
  CheckSelectedTextMessage,
} from '../shared/types/ingredients';
import { matchIngredients } from '../shared/lib/matchIngredients';
import { extractDomain } from '../shared/lib/domain';
import { extractPageText } from './textExtractor';
import { detectProductPage } from './productPageDetector';
import {
  highlightMatches,
  clearHighlights,
  scrollToHighlight,
  injectHighlightStyles,
} from './highlighter';
import { showOverlay, hideOverlay } from './overlay';

function generateId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function highestSeverity(matches: IngredientMatch[]): MatchSeverity {
  const priority: Record<MatchSeverity, number> = { warning: 3, notice: 2, info: 1 };
  let max: MatchSeverity = 'info';
  for (const m of matches) {
    if (priority[m.severity] > priority[max]) max = m.severity;
  }
  return max;
}

function handleScanPage(
  terms: WatchlistTerm[],
  falsePositives: FalsePositiveRule[],
  settings: ExtensionSettings,
  scanMode: ScanResult['scanMode'] = 'manual'
): ScanResult {
  injectHighlightStyles();

  const textBlocks = extractPageText();
  const combinedText = textBlocks.map((b) => b.text).join('\n');

  const domain = extractDomain(window.location.href);
  const matches = matchIngredients(
    combinedText,
    terms,
    falsePositives,
    domain,
    settings.freeFromDetection
  );

  if (matches.length > 0) {
    const highlightEntries = matches.map((m) => {
      const term = terms.find((t) => t.id === m.termId);
      return {
        matchedText: m.matchedText,
        severity: m.severity,
        termLabel: term?.label ?? m.matchedText,
      };
    });
    highlightMatches(highlightEntries);
  }

  if (settings.showOverlayAlerts && matches.length > 0) {
    const severity = highestSeverity(matches);
    showOverlay(matches.length, severity);
  }

  return {
    id: generateId(),
    url: window.location.href,
    domain,
    pageTitle: document.title,
    matches,
    scannedAt: new Date().toISOString(),
    scanMode,
  };
}

// ─── Auto-scan on page load ──────────────────────────────────────

async function autoScan(): Promise<void> {
  try {
    const detection = detectProductPage();
    if (!detection.isProduct) return;

    const response = await chrome.runtime.sendMessage({
      type: 'GET_WATCHLIST',
    });

    if (!response?.terms || response.terms.length === 0) return;

    const result = handleScanPage(
      response.terms,
      response.falsePositives ?? [],
      response.settings ?? {},
      'auto_allowed_domain'
    );

    chrome.runtime.sendMessage({
      type: 'SCAN_RESULT',
      payload: result,
    }).catch(() => {});
  } catch {
    // Background not ready or not in extension context
  }
}

// ─── Message Listener ────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): boolean => {
    if (!message || !message.type) return false;

    try {
      switch (message.type) {
        case 'SCAN_PAGE': {
          const msg = message as ScanPageMessage;
          const { terms, falsePositives, settings } = msg.payload;
          const result = handleScanPage(terms, falsePositives, settings, 'manual');

          chrome.runtime.sendMessage({
            type: 'SCAN_RESULT',
            payload: result,
          }).catch(() => {});

          sendResponse({ success: true, result });
          return false;
        }

        case 'AUTO_SCAN': {
          const msg = message as ScanPageMessage;
          const { terms, falsePositives, settings } = msg.payload;
          const result = handleScanPage(terms, falsePositives, settings, 'auto_allowed_domain');

          chrome.runtime.sendMessage({
            type: 'SCAN_RESULT',
            payload: result,
          }).catch(() => {});

          sendResponse({ success: true, result });
          return false;
        }

        case 'PING': {
          sendResponse({ success: true, alive: true });
          return false;
        }

        case 'HIGHLIGHT_MATCH': {
          const payload = message.payload as { matchId: string; matchedText?: string };
          scrollToHighlight(payload.matchId, payload.matchedText);
          sendResponse({ success: true });
          return false;
        }

        case 'CLEAR_HIGHLIGHTS': {
          clearHighlights();
          hideOverlay();
          sendResponse({ success: true });
          return false;
        }

        case 'SCROLL_TO_MATCH': {
          const payload = message.payload as { matchId: string } | undefined;
          if (payload?.matchId) scrollToHighlight(payload.matchId);
          sendResponse({ success: true });
          return false;
        }

        case 'CHECK_SELECTED_TEXT': {
          const msg = message as CheckSelectedTextMessage;
          const { matches, terms } = msg.payload;

          if (matches.length > 0) {
            const highlightEntries = matches.map((m) => {
              const term = terms.find((t) => t.id === m.termId);
              return {
                matchedText: m.matchedText,
                severity: m.severity,
                termLabel: term?.label ?? m.matchedText,
              };
            });
            highlightMatches(highlightEntries);
          }

          sendResponse({ success: true, matchCount: matches.length });
          return false;
        }

        default:
          return false;
      }
    } catch (err) {
      console.error('[IW] Content script error:', err);
      sendResponse({ success: false, error: String(err) });
      return false;
    }
  }
);

// Run auto-scan after DOM is ready
if (document.readyState === 'complete') {
  setTimeout(autoScan, 300);
} else {
  window.addEventListener('load', () => setTimeout(autoScan, 300));
}

chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }).catch(() => {});
