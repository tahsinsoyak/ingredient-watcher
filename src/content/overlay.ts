import type { MatchSeverity } from '../shared/types/ingredients';

// ─── Constants ───────────────────────────────────────────────────
const OVERLAY_ID = 'iw-overlay-host';
const AUTO_HIDE_MS = 8000;

const SEVERITY_BORDER: Record<MatchSeverity, string> = {
  warning: '#F59E0B',
  notice: '#2563EB',
  info: '#16A34A',
};

const SEVERITY_BG: Record<MatchSeverity, string> = {
  warning: 'rgba(251, 191, 36, 0.08)',
  notice: 'rgba(59, 130, 246, 0.06)',
  info: 'rgba(34, 197, 94, 0.06)',
};

// ─── Overlay Styles (inside Shadow DOM) ──────────────────────────
function getOverlayCSS(severity: MatchSeverity): string {
  return `
    :host {
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      pointer-events: none;
    }
    .iw-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: ${SEVERITY_BG[severity]};
      backdrop-filter: blur(8px);
      border-left: 4px solid ${SEVERITY_BORDER[severity]};
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: #1e293b;
      font-size: 14px;
      line-height: 1.4;
      pointer-events: auto;
      animation: iw-slide-down 0.35s ease-out;
      transform-origin: top center;
    }
    .iw-banner-text {
      flex: 1;
      margin-right: 12px;
    }
    .iw-banner-text strong {
      font-weight: 600;
    }
    .iw-banner-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      border-radius: 4px;
      font-size: 16px;
      line-height: 1;
      padding: 0;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .iw-banner-close:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #0f172a;
    }
    @keyframes iw-slide-down {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes iw-slide-up {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }
    .iw-banner--hiding {
      animation: iw-slide-up 0.25s ease-in forwards;
    }
  `;
}

// ─── Timer handle ────────────────────────────────────────────────
let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Show Overlay ────────────────────────────────────────────────

/**
 * Show a notification banner at the top of the page.
 *
 * Uses Shadow DOM to fully isolate styles from the host page.
 */
export function showOverlay(
  matchCount: number,
  highestSeverity: MatchSeverity
): void {
  // Remove any existing overlay first
  hideOverlay();

  // Create the host element
  const host = document.createElement('div');
  host.id = OVERLAY_ID;
  host.setAttribute('aria-live', 'polite');

  // Attach shadow root
  const shadow = host.attachShadow({ mode: 'closed' });

  // Inject scoped styles
  const style = document.createElement('style');
  style.textContent = getOverlayCSS(highestSeverity);
  shadow.appendChild(style);

  // Build banner markup
  const banner = document.createElement('div');
  banner.className = 'iw-banner';

  const textEl = document.createElement('span');
  textEl.className = 'iw-banner-text';
  const countText = matchCount === 1 ? '1 watchlist match' : `${matchCount} watchlist matches`;
  textEl.innerHTML = `<strong>⚠ ${countText}</strong> found on this page`;
  banner.appendChild(textEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'iw-banner-close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => {
    dismissWithAnimation(banner, host);
  });
  banner.appendChild(closeBtn);

  shadow.appendChild(banner);
  document.documentElement.appendChild(host);

  // Auto-hide after 8 seconds
  autoHideTimer = setTimeout(() => {
    dismissWithAnimation(banner, host);
  }, AUTO_HIDE_MS);
}

/**
 * Dismiss the overlay with a slide-up animation.
 */
function dismissWithAnimation(banner: HTMLElement, host: HTMLElement): void {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }

  banner.classList.add('iw-banner--hiding');
  banner.addEventListener('animationend', () => {
    try {
      host.remove();
    } catch {
      // Already removed — ignore
    }
  });

  // Safety fallback
  setTimeout(() => {
    try {
      host.remove();
    } catch {
      // Already removed — ignore
    }
  }, 400);
}

// ─── Hide Overlay ────────────────────────────────────────────────

/**
 * Immediately remove the overlay element from the DOM.
 */
export function hideOverlay(): void {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }

  try {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
  } catch {
    // Ignore removal errors
  }
}
