import type { MatchSeverity } from '../shared/types/ingredients';

// ─── Constants ───────────────────────────────────────────────────
const HIGHLIGHT_CLASS = 'iw-highlight';
const STYLE_ID = 'iw-highlight-styles';
const PULSE_CLASS = 'iw-highlight--pulse';

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON',
  'NOSCRIPT', 'SVG', 'CANVAS', 'IFRAME',
]);

// ─── Inject Styles ───────────────────────────────────────────────

/**
 * Inject highlight CSS into the page <head>.
 * No-ops if styles are already injected.
 */
export function injectHighlightStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      border-radius: 3px;
      padding: 1px 4px;
      cursor: help;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      display: inline;
      font: inherit;
      line-height: inherit;
      position: relative;
      font-weight: 600;
    }
    .${HIGHLIGHT_CLASS}--warning {
      background: rgba(251, 191, 36, 0.35);
      border-bottom: 3px solid rgba(239, 68, 68, 0.7);
      color: inherit;
    }
    .${HIGHLIGHT_CLASS}--notice {
      background: rgba(59, 130, 246, 0.22);
      border-bottom: 3px solid rgba(59, 130, 246, 0.6);
      color: inherit;
    }
    .${HIGHLIGHT_CLASS}--info {
      background: rgba(34, 197, 94, 0.22);
      border-bottom: 3px solid rgba(34, 197, 94, 0.6);
      color: inherit;
    }
    .${HIGHLIGHT_CLASS}:hover::after {
      content: attr(data-iw-term);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      color: #f8fafc;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      z-index: 2147483640;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      letter-spacing: 0.3px;
    }
    .${HIGHLIGHT_CLASS}--${PULSE_CLASS.split('--')[1]} {
      animation: iw-spotlight 2s ease-in-out 1;
    }
    @keyframes iw-spotlight {
      0% {
        outline: 0px solid transparent;
        outline-offset: 0px;
        box-shadow: 0 0 0 0 transparent;
      }
      15% {
        outline: 4px solid rgba(34, 197, 94, 0.9);
        outline-offset: 6px;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2);
        background: rgba(34, 197, 94, 0.45) !important;
      }
      50% {
        outline: 4px solid rgba(34, 197, 94, 0.7);
        outline-offset: 6px;
        box-shadow: 0 0 16px rgba(34, 197, 94, 0.35), 0 0 32px rgba(34, 197, 94, 0.15);
      }
      100% {
        outline: 0px solid transparent;
        outline-offset: 0px;
        box-shadow: 0 0 0 0 transparent;
      }
    }
  `;

  (document.head || document.documentElement).appendChild(style);
}

// ─── Text Node Walker ────────────────────────────────────────────

/**
 * Walk all text nodes under a root, skipping elements we should not touch.
 */
function walkTextNodes(root: Node, callback: (node: Text) => void): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node): number {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(`.${HIGHLIGHT_CLASS}`)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    nodes.push(current as Text);
  }
  // Process in a separate loop to avoid mutation during walk
  for (const node of nodes) {
    callback(node);
  }
}

// ─── Highlight Matches ───────────────────────────────────────────

export interface HighlightEntry {
  matchedText: string;
  severity: MatchSeverity;
  termLabel: string;
}

/**
 * Highlight matched ingredient text in the page DOM.
 *
 * For each match, finds text nodes containing the matched text
 * and wraps the occurrence in a `<mark>` element.
 *
 * @param matches  Array of matches to highlight.
 * @param selector Optional CSS selector to scope the search.
 */
export function highlightMatches(
  matches: HighlightEntry[],
  selector?: string
): void {
  if (matches.length === 0) return;

  const root: Element = selector
    ? (document.querySelector(selector) ?? document.body)
    : document.body;

  // Build a lookup for quick case-insensitive matching
  // Process longer texts first to avoid partial overlap issues
  const sorted = [...matches].sort(
    (a, b) => b.matchedText.length - a.matchedText.length
  );

  for (const entry of sorted) {
    const searchText = entry.matchedText.toLowerCase();

    walkTextNodes(root, (textNode) => {
      const nodeText = textNode.textContent ?? '';
      const lowerNodeText = nodeText.toLowerCase();
      const idx = lowerNodeText.indexOf(searchText);

      if (idx === -1) return;

      // Split the text node around the match
      const before = nodeText.substring(0, idx);
      const matched = nodeText.substring(idx, idx + searchText.length);
      const after = nodeText.substring(idx + searchText.length);

      // Create the <mark> wrapper
      const mark = document.createElement('mark');
      mark.className = `${HIGHLIGHT_CLASS} ${HIGHLIGHT_CLASS}--${entry.severity}`;
      mark.setAttribute('data-iw-term', entry.termLabel);
      mark.setAttribute('data-iw-match', entry.matchedText);
      mark.setAttribute('data-iw-severity', entry.severity);
      mark.title = `Watchlist match: ${entry.termLabel}`;
      mark.textContent = matched;

      // Replace the text node with [before, mark, after]
      const parent = textNode.parentNode;
      if (!parent) return;

      const fragment = document.createDocumentFragment();
      if (before) fragment.appendChild(document.createTextNode(before));
      fragment.appendChild(mark);
      if (after) fragment.appendChild(document.createTextNode(after));

      parent.replaceChild(fragment, textNode);
    });
  }
}

// ─── Clear Highlights ────────────────────────────────────────────

/**
 * Remove all highlights, restoring original text nodes.
 */
export function clearHighlights(): void {
  const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

  for (const mark of highlights) {
    const parent = mark.parentNode;
    if (!parent) continue;

    const textNode = document.createTextNode(mark.textContent ?? '');
    parent.replaceChild(textNode, mark);

    // Merge adjacent text nodes to clean up the DOM
    parent.normalize();
  }
}

// ─── Scroll to Highlight ─────────────────────────────────────────

/**
 * Scroll to the nth highlight element (0-indexed by matchId string).
 *
 * @param matchId  The match ID, expected format "match-{N}". Falls back to index 0.
 */
export function scrollToHighlight(matchIdOrText: string, matchedText?: string): void {
  const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

  // If no highlights on the page, try to find the text in the DOM directly
  if (highlights.length === 0) {
    const textToFind = matchedText ?? matchIdOrText;
    if (textToFind) {
      scrollToTextInPage(textToFind);
    }
    return;
  }

  let target: Element | undefined;

  const searchText = (matchedText ?? matchIdOrText).toLowerCase();

  // Try to find by data-iw-match (actual matched text on page)
  for (const h of highlights) {
    const iwMatch = h.getAttribute('data-iw-match');
    if (iwMatch && iwMatch.toLowerCase() === searchText) {
      target = h as Element;
      break;
    }
  }

  // Fallback: try data-iw-term (term label)
  if (!target) {
    for (const h of highlights) {
      const term = h.getAttribute('data-iw-term');
      if (term && term.toLowerCase() === searchText) {
        target = h as Element;
        break;
      }
    }
  }

  // Fallback: match by mark text content
  if (!target) {
    for (const h of highlights) {
      const text = (h.textContent ?? '').toLowerCase();
      if (text.includes(searchText) || searchText.includes(text)) {
        target = h as Element;
        break;
      }
    }
  }

  // Fallback: numeric index from matchId
  if (!target) {
    let index = 0;
    const numericPart = matchIdOrText.replace(/^match-/, '');
    const parsed = parseInt(numericPart, 10);
    if (!isNaN(parsed) && parsed > 0) {
      index = Math.min(parsed - 1, highlights.length - 1);
    }
    target = highlights[index] as Element | undefined;
  }

  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Pulse animation
  target.classList.add(PULSE_CLASS);
  const onEnd = () => {
    target.classList.remove(PULSE_CLASS);
    target.removeEventListener('animationend', onEnd);
  };
  target.addEventListener('animationend', onEnd);

  // Safety fallback: remove class after timeout in case animationend doesn't fire
  setTimeout(() => {
    if (target) target.classList.remove(PULSE_CLASS);
  }, 4000);
}

function scrollToTextInPage(text: string): void {
  const lowerText = text.toLowerCase();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node): number {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const textContent = current.textContent ?? '';
    if (textContent.toLowerCase().includes(lowerText)) {
      nodes.push(current as Text);
    }
  }

  if (nodes.length === 0) return;

  const parentEl = nodes[0].parentElement;
  if (!parentEl) return;

  parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const key = 'iw-scroll-flash';
  parentEl.setAttribute('data-iw-flash', key);
  parentEl.style.outline = '4px solid rgba(34, 197, 94, 0.85)';
  parentEl.style.outlineOffset = '6px';
  parentEl.style.borderRadius = '6px';
  parentEl.style.boxShadow = '0 0 24px rgba(34, 197, 94, 0.35)';
  parentEl.style.transition = 'outline-color 0.8s ease, box-shadow 0.8s ease';

  setTimeout(() => {
    parentEl.style.outlineColor = 'transparent';
    parentEl.style.boxShadow = 'none';
    setTimeout(() => {
      parentEl.style.outline = '';
      parentEl.style.outlineOffset = '';
      parentEl.style.borderRadius = '';
      parentEl.style.boxShadow = '';
      parentEl.style.transition = '';
      parentEl.removeAttribute('data-iw-flash');
    }, 1200);
  }, 3000);
}
