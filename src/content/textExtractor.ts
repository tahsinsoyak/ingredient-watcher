import { getExtractorForDomain } from './siteExtractors';

// ─── Constants ───────────────────────────────────────────────────
const MAX_TEXT_LENGTH = 50_000;
const MIN_TEXT_LENGTH = 10;

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NAV', 'FOOTER', 'HEADER', 'ASIDE', 'IFRAME',
  'NOSCRIPT', 'SVG', 'CANVAS', 'OBJECT', 'EMBED',
]);

const GENERIC_TARGET_SELECTORS: string[] = [
  '[itemprop="ingredients"]',
  '.ingredients',
  '#ingredients',
  '[itemprop="description"]',
  '.product-description',
  '.description',
  '#description',
  'h1',
  'h2',
  '[itemprop="name"]',
  '.product-title',
  '.product-name',
  'table',
  'dl',
  '.specifications',
  '.product-specs',
  '.product-details',
  '.product-info',
  '.product-content',
  'article',
  'main',
];

const GENERIC_INGREDIENT_KEYWORDS = /\b(ingredient|contains|composition|içerik|bileşen)\b/i;

// ─── Utility ─────────────────────────────────────────────────────

function generateSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const tag = el.tagName.toLowerCase();
  const itemprop = el.getAttribute('itemprop');
  if (itemprop) return `${tag}[itemprop="${itemprop}"]`;
  if (el.classList.length > 0) {
    for (let i = 0; i < el.classList.length; i++) {
      const cls = el.classList[i];
      if (cls && !cls.startsWith('iw-')) return `${tag}.${CSS.escape(cls)}`;
    }
  }
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
    const idx = siblings.indexOf(el) + 1;
    return `${generateSelector(parent)} > ${tag}:nth-of-type(${idx})`;
  }
  return tag;
}

function isHidden(el: HTMLElement): boolean {
  if (el.offsetParent === null) {
    const style = getComputedStyle(el);
    if (style.position !== 'fixed' && style.position !== 'sticky') return true;
  }
  return false;
}

function shouldSkipElement(el: Element): boolean {
  let current: Element | null = el;
  while (current) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    current = current.parentElement;
  }
  return false;
}

// ─── Main Export ─────────────────────────────────────────────────

export interface ExtractedTextBlock {
  text: string;
  selector: string;
}

export function extractPageText(): ExtractedTextBlock[] {
  const results: ExtractedTextBlock[] = [];
  const seenTexts = new Set<string>();
  let totalLength = 0;

  function addBlock(text: string, selector: string): boolean {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length < MIN_TEXT_LENGTH) return true;
    if (seenTexts.has(trimmed)) return true;
    if (totalLength + trimmed.length > MAX_TEXT_LENGTH) return false;
    seenTexts.add(trimmed);
    results.push({ text: trimmed, selector });
    totalLength += trimmed.length;
    return true;
  }

  const domain = window.location.hostname;
  const siteExtractor = getExtractorForDomain(domain);

  // ① Site-specific selectors (fast path)
  if (siteExtractor) {
    for (const selector of siteExtractor.selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (shouldSkipElement(el)) continue;
          if (el instanceof HTMLElement && isHidden(el)) continue;
          const text = el.textContent ?? '';
          const elSelector = generateSelector(el);
          if (!addBlock(text, elSelector)) return results;
        }
      } catch {
        // Invalid selector
      }
    }
  }

  // ② Generic priority selectors
  for (const selector of GENERIC_TARGET_SELECTORS) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (shouldSkipElement(el)) continue;
        if (el instanceof HTMLElement && isHidden(el)) continue;
        const text = el.textContent ?? '';
        const elSelector = generateSelector(el);
        if (!addBlock(text, elSelector)) return results;
      }
    } catch {
      // Invalid selector
    }
  }

  // ③ Paragraph scan for ingredient-related keywords
  const keywordRegex = siteExtractor?.extraParagraphKeywords ?? GENERIC_INGREDIENT_KEYWORDS;
  try {
    const paragraphs = document.querySelectorAll('p, li, span, td, dd');
    for (const p of paragraphs) {
      if (shouldSkipElement(p)) continue;
      if (p instanceof HTMLElement && isHidden(p)) continue;
      const text = p.textContent ?? '';
      if (keywordRegex.test(text)) {
        const selector = generateSelector(p);
        if (!addBlock(text, selector)) return results;
      }
    }
  } catch {
    // Skip
  }

  return results;
}
