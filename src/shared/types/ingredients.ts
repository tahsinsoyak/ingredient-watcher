// ─── Category Type ───────────────────────────────────────────────
export type IngredientCategory =
  | 'food'
  | 'cosmetics'
  | 'cleaning'
  | 'allergen'
  | 'vegan'
  | 'sensitive_skin'
  | 'custom';

// ─── Severity ────────────────────────────────────────────────────
export type MatchSeverity = 'info' | 'notice' | 'warning';

// ─── Scan Mode ───────────────────────────────────────────────────
export type ScanMode = 'manual' | 'selected_text' | 'auto_allowed_domain';

// ─── Theme ───────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Watchlist Term ──────────────────────────────────────────────
export interface WatchlistTerm {
  id: string;
  label: string;
  aliases: string[];
  category: IngredientCategory;
  severity: MatchSeverity;
  enabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Ingredient Match ────────────────────────────────────────────
export interface IngredientMatch {
  id: string;
  termId: string;
  matchedText: string;
  normalizedText: string;
  category: IngredientCategory;
  severity: MatchSeverity;
  contextSnippet: string;
  elementSelector?: string;
  index: number;
}

// ─── Scan Result ─────────────────────────────────────────────────
export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  pageTitle: string;
  matches: IngredientMatch[];
  scannedAt: string;
  scanMode: ScanMode;
}

// ─── Domain Setting ──────────────────────────────────────────────
export interface DomainSetting {
  domain: string;
  autoScanEnabled: boolean;
  ignored: boolean;
  createdAt: string;
}

// ─── False Positive Rule ─────────────────────────────────────────
export interface FalsePositiveRule {
  id: string;
  term: string;
  domain?: string;
  pattern?: string;
  createdAt: string;
}

// ─── Preset Pack ─────────────────────────────────────────────────
export interface PresetPack {
  id: string;
  name: string;
  description: string;
  category: IngredientCategory;
  terms: Omit<WatchlistTerm, 'id' | 'createdAt' | 'updatedAt'>[];
}

// ─── Extension Settings ──────────────────────────────────────────
export interface ExtensionSettings {
  theme: ThemeMode;
  strictMode: boolean;
  freeFromDetection: boolean;
  accentInsensitive: boolean;
  highlightIntensity: 'subtle' | 'medium' | 'strong';
  showOverlayAlerts: boolean;
  enabledPresetPacks: string[];
}

// ─── Messages ────────────────────────────────────────────────────
export type MessageType =
  | 'SCAN_PAGE'
  | 'SCAN_RESULT'
  | 'HIGHLIGHT_MATCH'
  | 'CLEAR_HIGHLIGHTS'
  | 'SCROLL_TO_MATCH'
  | 'GET_WATCHLIST'
  | 'GET_SETTINGS'
  | 'AUTO_SCAN'
  | 'PING'
  | 'CONTENT_SCRIPT_READY';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface ScanPageMessage extends ExtensionMessage {
  type: 'SCAN_PAGE' | 'AUTO_SCAN';
  payload: {
    terms: WatchlistTerm[];
    falsePositives: FalsePositiveRule[];
    settings: ExtensionSettings;
  };
}

export interface ScanResultMessage extends ExtensionMessage {
  type: 'SCAN_RESULT';
  payload: ScanResult;
}

export interface HighlightMatchMessage extends ExtensionMessage {
  type: 'HIGHLIGHT_MATCH';
  payload: { matchId: string; matchedText?: string };
}

export interface ClearHighlightsMessage extends ExtensionMessage {
  type: 'CLEAR_HIGHLIGHTS';
}

// ─── Extracted Text Block ────────────────────────────────────────
export interface TextBlock {
  text: string;
  element: Element;
  selector: string;
}

// ─── Storage Keys ────────────────────────────────────────────────
export const STORAGE_KEYS = {
  WATCHLIST: 'iw_watchlist',
  SETTINGS: 'iw_settings',
  DOMAIN_SETTINGS: 'iw_domain_settings',
  FALSE_POSITIVES: 'iw_false_positives',
  LAST_SCAN: 'iw_last_scan',
} as const;

// ─── Default Settings ────────────────────────────────────────────
export const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'system',
  strictMode: false,
  freeFromDetection: true,
  accentInsensitive: true,
  highlightIntensity: 'medium',
  showOverlayAlerts: false,
  enabledPresetPacks: [],
};
