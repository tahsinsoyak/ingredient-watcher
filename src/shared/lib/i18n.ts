import { useLocaleStore } from '../store/useLocaleStore';
import { useMemo } from 'react';
import type { Locale } from '../types/ingredients';

// ─── English Strings ─────────────────────────────────────────────

const enStrings = {
  app: {
    name: 'Ingredient Watchlist',
    tagline: 'Spot ingredients you want to avoid.',
    altTagline: "Know what's inside before you buy.",
  },
  popup: {
    scanButton: 'Scan this page',
    scanning: 'Checking visible ingredients\u2026',
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
    title: 'Ingredient Watchlist \u2014 Settings',
    watchlist: 'Watchlist',
    presetPacks: 'Preset Packs',
    domainSettings: 'Domain Settings',
    matching: 'Matching Behavior',
    falsePositives: 'False Positives',
    privacyData: 'Privacy & Data',
    appearance: 'Appearance',
    language: 'Language',
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
    disclaimer: 'These are convenient keyword lists only \u2014 not medical, safety, or dietary advice.',
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
  common: {
    settings: 'Settings',
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    search: 'Search',
    close: 'Close',
    open: 'Open',
  },
} as const;

// ─── Turkish Strings ─────────────────────────────────────────────

const trStrings: Record<keyof typeof enStrings, unknown> = {
  app: {
    name: '\u0130\u00E7erik Takibi',
    tagline: 'Ka\u00E7\u0131nmak istedi\u011Fin i\u00E7erikleri g\u00F6r.',
    altTagline: 'Sat\u0131n almadan \u00F6nce i\u00E7inde ne oldu\u011Funu bil.',
  },
  popup: {
    scanButton: 'Bu sayfay\u0131 tara',
    scanning: 'G\u00F6r\u00FCnen i\u00E7erikler kontrol ediliyor\u2026',
    matchesFound: (count: number) =>
      `${count} e\u015Fle\u015Fen i\u00E7erik bulundu`,
    noMatches: 'G\u00F6r\u00FCnen metinde e\u015Fle\u015Fen i\u00E7erik bulunamad\u0131.',
    notScanned: 'Sayfay\u0131 taramak i\u00E7in "Bu sayfay\u0131 tara" butonuna t\u0131klay\u0131n.',
    highlightOnPage: 'Sayfada vurgula',
    ignoreOnSite: 'Bu sitede g\u00F6rmezden gel',
    markFalsePositive: 'Yanl\u0131\u015F e\u015Fle\u015Fme olarak i\u015Faretle',
    addIngredient: '\u0130\u00E7erik ekle',
    openSettings: 'Ayarlar\u0131 a\u00E7',
    activeTerms: (count: number) =>
      `${count} aktif terim`,
    localOnly: 'Yerel',
    quickAdd: 'H\u0131zl\u0131 ekle',
    category: 'Kategori',
    save: 'Kaydet',
  },
  options: {
    title: '\u0130\u00E7erik Takibi \u2014 Ayarlar',
    watchlist: '\u0130zleme Listesi',
    presetPacks: 'Haz\u0131r Paketler',
    domainSettings: 'Alan Ad\u0131 Ayarlar\u0131',
    matching: 'E\u015Fle\u015Fme Davran\u0131\u015F\u0131',
    falsePositives: 'Yanl\u0131\u015F E\u015Fle\u015Fmeler',
    privacyData: 'Gizlilik & Veri',
    appearance: 'G\u00F6r\u00FCn\u00FCm',
    language: 'Dil',
    addTerm: 'Terim ekle',
    editTerm: 'Terimi d\u00FCzenle',
    deleteTerm: 'Terimi sil',
    exportData: 'Veriyi d\u0131\u015Fa aktar',
    importData: 'Veriyi i\u00E7e aktar',
    clearAllData: 'T\u00FCm verileri temizle',
    clearConfirm: 'T\u00FCm verileri silmek istedi\u011Finize emin misiniz? Bu i\u015Flem geri al\u0131namaz.',
    strictMode: 'Kat\u0131 mod',
    strictModeDesc: 'Serbest (\u201C-i\u00E7ermez\u201D) ifadelerini do\u011Fruda e\u015Fle\u015Fmeyle ayn\u0131 kabul et.',
    freeFromDetection: '\u201C-\u0130\u00E7ermez\u201D tespiti',
    freeFromDesc: '"Free from" / i\u00E7ermez ifadelerini ayr\u0131 olarak i\u015Faretle.',
    accentInsensitive: 'Aksan duyars\u0131z e\u015Fle\u015Fme',
    accentDesc: 'E\u015Fle\u015Fme yaparken aksanlar\u0131 ve aksan i\u015Faretlerini yok say.',
    highlightIntensity: 'Vurgulama yo\u011Funlu\u011Fu',
  },
  scan: {
    freeFromLabel: '\u0130\u00E7ermedi\u011Fi belirtilmi\u015F / serbest oldu\u011Fu beyan edilmi\u015F',
    directMatch: 'Do\u011Fruda i\u00E7erik e\u015Fle\u015Fmesi',
    ambiguousMatch: 'Belirsiz i\u00E7erik',
  },
  disclaimer: {
    short: 'Tavsiye niteli\u011Fi ta\u015F\u0131maz',
    full: '\u0130\u00E7erik Takibi bilgilendirme ama\u00E7l\u0131 bir vurgulama arac\u0131d\u0131r. T\u0131bbi, beslenme, dermatolojik, alerji, dini, vegan veya g\u00FCvenlik tavsiyesi sa\u011Flamaz. Her zaman \u00FCr\u00FCn etiketlerini kontrol edin ve t\u0131bbi veya alerjiyle ilgili endi\u015Feleriniz i\u00E7in kalifiye bir profesyonele dan\u0131\u015F\u0131n.',
  },
  privacy: {
    badge: 'Yerel',
    explanation:
      '\u0130\u00E7erik Takibi tamamen taray\u0131c\u0131n\u0131zda yerel olarak \u00E7al\u0131\u015F\u0131r. \u0130zleme listeniz cihaz\u0131n\u0131zda kal\u0131r. Sayfa metni yaln\u0131zca tarama butonuna t\u0131klad\u0131\u011F\u0131n\u0131zda veya bir alan ad\u0131 i\u00E7in otomatik taramay\u0131 etkinle\u015Ftirdi\u011Finizde taran\u0131r.',
    stored: [
      '\u0130zleme listesi terimleri ve takma adlar\u0131',
      'Kategoriler ve ayarlar',
      'Yanl\u0131\u015F e\u015Fle\u015Fme kurallar\u0131',
      'Alan ad\u0131 tercihleri',
      'Son tarama meta verileri (iste\u011Fe ba\u011Fl\u0131)',
    ],
    notStored: [
      'Tam \u00FCr\u00FCn sayfalar\u0131',
      'Gezinme ge\u00E7mi\u015Fi',
      'Sat\u0131n alma ge\u00E7mi\u015Fi',
      'Sepet i\u00E7eri\u011Fi',
      'T\u0131bbi bilgiler',
      'Kullan\u0131c\u0131 kimli\u011Fi veya hesap verileri',
    ],
  },
  presetPacks: {
    disclaimer: 'Bunlar yaln\u0131zca kullan\u0131\u015Fl\u0131 anahtar kelime listeleridir \u2014 t\u0131bbi, g\u00FCvenlik veya diyet tavsiyesi de\u011Fildir.',
    addAll: '\u0130zleme listesine ekle',
    removeAll: '\u0130zleme listesinden \u00E7\u0131kar',
    preview: 'Terimleri g\u00F6ster',
    added: '\u0130zleme listesine eklendi',
    removed: '\u0130zleme listesinden \u00E7\u0131kar\u0131ld\u0131',
  },
  theme: {
    light: 'A\u00E7\u0131k',
    dark: 'Koyu',
    system: 'Sistem',
  },
  common: {
    settings: 'Ayarlar',
    cancel: '\u0130ptal',
    delete: 'Sil',
    save: 'Kaydet',
    search: 'Ara',
    close: 'Kapat',
    open: 'A\u00E7',
  },
} satisfies Record<keyof typeof enStrings, unknown>;

// ─── Get Strings by Locale ───────────────────────────────────────

export type Strings = typeof enStrings;

export function getStrings(locale: Locale): Strings {
  return locale === 'tr' ? (trStrings as unknown as Strings) : enStrings;
}

// ─── React Hook ──────────────────────────────────────────────────

export function useStrings(): Strings {
  const locale = useLocaleStore((s) => s.locale);
  return useMemo(() => getStrings(locale), [locale]);
}
