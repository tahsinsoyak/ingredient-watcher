import type { MatchSeverity } from '../shared/types/ingredients';

// ─── Badge Colors by Severity ────────────────────────────────────
const BADGE_COLORS: Record<MatchSeverity, string> = {
  warning: '#F59E0B',
  notice: '#2563EB',
  info: '#16A34A',
};

const BADGE_COLOR_CLEAR = '#64748B';

/**
 * Update the extension badge for a specific tab.
 *
 * - Shows the match count when > 0, coloured by highest severity.
 * - Clears the badge when matchCount is 0.
 */
export function updateBadge(
  tabId: number,
  matchCount: number,
  highestSeverity: MatchSeverity
): void {
  try {
    const text = matchCount > 0 ? String(matchCount) : '';
    const color = matchCount > 0
      ? (BADGE_COLORS[highestSeverity] ?? BADGE_COLOR_CLEAR)
      : BADGE_COLOR_CLEAR;

    chrome.action.setBadgeText({ text, tabId }).catch(noop);
    chrome.action.setBadgeBackgroundColor({ color, tabId }).catch(noop);
  } catch {
    // Tab may have been closed — safe to ignore
  }
}

/**
 * Clear the extension badge for a specific tab.
 */
export function clearBadge(tabId: number): void {
  try {
    chrome.action.setBadgeText({ text: '', tabId }).catch(noop);
  } catch {
    // Tab may have been closed — safe to ignore
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
