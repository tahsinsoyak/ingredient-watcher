# 🔍 Ingredient Watchlist

**Spot ingredients you want to avoid.**

A free, privacy-friendly Chrome extension that highlights user-defined ingredient watchlist matches on product pages. Works locally in your browser — no account, no backend, no tracking.

---

## ✨ Features

- **Personal Watchlist** — Add ingredients and terms you want to avoid
- **Smart Matching** — Case-insensitive, alias-aware, INCI-compatible matching
- **Free-From Detection** — Distinguishes "contains gluten" from "gluten-free"
- **Page Highlighting** — Visual highlights on matched ingredients with severity colors
- **Preset Packs** — Quick-start packs for allergens, vegan, cosmetics, and cleaning products
- **Category Organization** — Food, Cosmetics, Cleaning, Allergens, Vegan, Sensitive Skin, Custom
- **False Positive Controls** — Mark and manage false positive matches
- **Domain Settings** — Configure per-site auto-scan preferences
- **Dark/Light Mode** — System-aware theme with manual override
- **Export/Import** — Backup and restore your watchlist as JSON
- **Privacy-First** — Everything runs locally, nothing leaves your browser
- **Minimal Permissions** — Only `storage`, `activeTab`, and `scripting`

---

## 🛡️ Privacy

**Ingredient Watchlist works entirely locally in your browser.**

| ✅ What we store locally | ❌ What we never store |
|---|---|
| Watchlist terms & aliases | Full product pages |
| Categories & settings | Browsing history |
| False positive rules | Purchase history |
| Domain preferences | Cart content |
| | Medical information |
| | User identity |

- No backend
- No account
- No analytics
- No cloud sync
- No tracking

---

## ⚠️ Disclaimer

> Ingredient Watchlist is an informational highlighting tool. It does not provide medical, nutritional, dermatological, allergy, religious, vegan, or safety advice. Always verify product labels and consult a qualified professional for medical or allergy-related concerns.

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| Chrome Extension Manifest V3 | Extension platform |
| React 18 | Popup & Options UI |
| TypeScript | Type safety |
| Vite 6 | Build toolchain |
| Tailwind CSS 3 | Styling |
| Zustand | State management |
| Vitest | Testing |
| `chrome.storage.local` | Local data persistence |
| `chrome.scripting` | On-demand content script injection |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Google Chrome (or Chromium-based browser)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ingredient-watchlist.git
cd ingredient-watchlist

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project
5. The Ingredient Watchlist icon should appear in your toolbar

---

## 💻 Development

```bash
# Watch mode (rebuilds on file changes)
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Production build
npm run build

# Package for Chrome Web Store
npm run zip
```

### Project Structure

```
ingredient-watchlist/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── background/            # Service worker & badge manager
│   ├── content/               # Content scripts (scanner, highlighter)
│   ├── popup/                 # Popup UI (React)
│   ├── options/               # Options/Settings page (React)
│   └── shared/                # Shared types, libs, components, stores
├── tests/                     # Unit tests
├── vite.config.ts             # Multi-entry Vite config
├── tailwind.config.ts         # Tailwind with custom theme
└── package.json
```

---

## 🧪 Testing

```bash
npm run test
```

### Test Coverage

- **Normalization** — Case, accents, Turkish characters, whitespace, hyphens
- **Regex Builder** — Word boundaries, aliases, hyphen/space variants, plurals
- **Matching Engine** — All 12 critical test cases:
  1. `"contains gluten"` → warning match
  2. `"gluten-free"` → info (free-from), not warning
  3. `"sodium lauryl sulfate"` → matches SLS
  4. `"parfum"` → matches fragrance
  5. `"milk protein"` → matches milk pack
  6. `"alcohol-free"` → does not trigger warning
  7. `"benzalkonium chloride"` → matches cleaning watchlist
  8. Turkish `"laktoz içermez"` → free-from info
  9. Duplicate matches are deduplicated
  10. Disabled terms do not match
  11. False positive rules prevent matching
  12. Substring prevention (`"palm"` ≠ `"napalm"`)
- **Storage** — CRUD, settings, export/import, clear all

---

## 🎨 Preset Packs

| Pack | Category | Terms |
|---|---|---|
| Common Food Allergens | 🍎 Allergens | Milk, Egg, Fish, Shellfish, Tree Nuts, Peanuts, Wheat, Gluten, Soy, Sesame |
| Vegan / Animal-Derived | 🌱 Vegan | Gelatin, Collagen, Carmine, Lanolin, Beeswax, Casein, Whey, Shellac, Tallow |
| Cosmetics Watchlist | 💄 Cosmetics | Paraben, Fragrance, Alcohol Denat, SLS, SLES, Phthalate, Formaldehyde, Triclosan |
| Cleaning Products | 🧴 Cleaning | Chlorine, Ammonia, Bleach, Fragrance, Quats, Phosphates, Optical Brighteners |

> These are convenient keyword lists only — not medical, safety, or dietary advice.

---

## 🔐 Chrome Permissions

| Permission | Why |
|---|---|
| `storage` | Saves your local watchlist, preferences, and false-positive rules |
| `activeTab` | Allows scanning the current page only after user action |
| `scripting` | Injects the scanner/highlighter into the current page after user action |
| `contextMenus` (optional) | Right-click "Check selected text" feature |

---

## 📦 Chrome Web Store

### Listing Copy

**Name:** Ingredient Watchlist

**Short Description:** Highlight ingredients you want to avoid while shopping online.

**Long Description:**
Ingredient Watchlist is a privacy-friendly Chrome extension that helps you spot ingredients you personally want to avoid while browsing food, cosmetic, skincare, cleaning, and household product pages. Create your own watchlist, scan visible product text, highlight matches, and get simple alerts like "fragrance and SLS appear on this page." The extension works locally and does not require an account.

**Single Purpose:** Highlight user-defined ingredient watchlist matches on product pages.

### Pre-Submit Checklist

- [x] Manifest V3
- [x] Single clear purpose
- [x] No medical claims
- [x] No backend
- [x] No account required
- [x] No hidden tracking
- [x] No unnecessary permissions
- [x] No product recommendations
- [x] No fear-based copy
- [x] Permission justifications documented
- [x] Disclaimer included

---

## 🗺️ Roadmap

### Phase 1 — MVP ✅
Manifest V3, popup UI, options page, local watchlist editor, manual scan, ingredient matching engine, page highlighting, match list, false-positive marking, local storage, dark/light mode, tests

### Phase 2 — Product Page Polish
Better text extraction, selected text context menu, preset packs, domain settings, auto-scan allowed domains, badge match count

### Phase 3 — Advanced (Optional)
Barcode/manual product search, OCR from product images, AI ingredient simplification, shared community packs, optional cloud sync, mobile companion app

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Ingredient Watchlist</strong> — Know what's inside before you buy.
  <br/>
  <em>Not medical advice. Always verify product labels.</em>
</p>
