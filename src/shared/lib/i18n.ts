/**
 * Centralized UI copy — English.
 * All user-facing strings in one place for easy localization.
 */
export const strings = {
  app: {
    name: 'Ingredient Watchlist',
    tagline: 'Spot ingredients you want to avoid.',
    altTagline: 'Know what\'s inside before you buy.',
  },
  popup: {
    scanButton: 'Scan this page',
    scanning: 'Checking visible ingredients…',
    matchesFound: (count: number) =>
      `${count} watchlist match${count !== 1 ? 'es' : ''} found`,
    noMatches: 'No watchlist matches found on visible text.',
    notScanned: 'Click "Scan this page" to check for watchlist ingredients.',
    highlightOnPage: 'Highlight on page',
    ignoreOnSite: 'Ignore on this site',
    markFalsePositive: 'Mark false positive',
    addIngredient: 'Add ingredient to watchlist',
    openSettings: 'Open settings',
    activeTerms: (count: number) =>
      `${count} active term${count !== 1 ? 's' : ''}`,
    localOnly: 'Local-only',
    quickAdd: 'Quick add',
    category: 'Category',
    save: 'Save',
  },
  options: {
    title: 'Ingredient Watchlist — Settings',
    watchlist: 'Watchlist',
    presetPacks: 'Preset Packs',
    domainSettings: 'Domain Settings',
    matching: 'Matching Behavior',
    falsePositives: 'False Positives',
    privacyData: 'Privacy & Data',
    appearance: 'Appearance',
    addTerm: 'Add term',
    editTerm: 'Edit term',
    deleteTerm: 'Delete term',
    exportData: 'Export data',
    importData: 'Import data',
    clearAllData: 'Clear all data',
    clearConfirm: 'Are you sure you want to clear all data? This cannot be undone.',
    strictMode: 'Strict mode',
    strictModeDesc: 'Treat free-from mentions the same as direct matches.',
    freeFromDetection: 'Free-from detection',
    freeFromDesc: 'Detect and label "free from" claims separately.',
    accentInsensitive: 'Accent-insensitive matching',
    accentDesc: 'Ignore accents and diacritics when matching.',
    highlightIntensity: 'Highlight intensity',
  },
  scan: {
    freeFromLabel: 'Mentioned as absent / free-from claim',
    directMatch: 'Direct ingredient match',
    ambiguousMatch: 'Ambiguous context',
  },
  disclaimer: {
    short: 'Not medical advice',
    full: 'Ingredient Watchlist is an informational highlighting tool. It does not provide medical, nutritional, dermatological, allergy, religious, vegan, or safety advice. Always verify product labels and consult a qualified professional for medical or allergy-related concerns.',
  },
  privacy: {
    badge: 'Local-only',
    explanation:
      'Ingredient Watchlist works locally in your browser. Your watchlist stays on your device. Page text is scanned only after you click scan unless you enable auto-scan for a domain.',
    stored: [
      'Watchlist terms and aliases',
      'Categories and settings',
      'False positive rules',
      'Domain preferences',
      'Recent scan metadata (optional)',
    ],
    notStored: [
      'Full product pages',
      'Browsing history',
      'Purchase history',
      'Cart content',
      'Medical information',
      'User identity or account data',
    ],
  },
  presetPacks: {
    disclaimer: 'These are convenient keyword lists only — not medical, safety, or dietary advice.',
    addAll: 'Add to watchlist',
    removeAll: 'Remove from watchlist',
    preview: 'Preview terms',
    added: 'Added to watchlist',
    removed: 'Removed from watchlist',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
} as const;
