// ─── Types ───────────────────────────────────────────────────────

export interface ProductPageResult {
  isProduct: boolean;
  confidence: number;
  signals: string[];
}

// ─── Detection Helpers ───────────────────────────────────────────

/**
 * Check for JSON-LD structured data with Product type.
 */
function checkJsonLd(): { score: number; signal: string } | null {
  try {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    for (const script of scripts) {
      const text = script.textContent;
      if (!text) continue;

      try {
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          const type = item['@type'];
          if (!type) continue;

          const types = Array.isArray(type) ? type : [type];
          for (const t of types) {
            if (
              t === 'Product' ||
              t === 'IndividualProduct' ||
              t === 'ProductGroup'
            ) {
              return { score: 0.4, signal: `JSON-LD @type: ${t}` };
            }
          }

          // Check @graph array
          if (Array.isArray(item['@graph'])) {
            for (const node of item['@graph']) {
              const nodeType = node['@type'];
              if (
                nodeType === 'Product' ||
                nodeType === 'IndividualProduct' ||
                nodeType === 'ProductGroup'
              ) {
                return {
                  score: 0.4,
                  signal: `JSON-LD @graph @type: ${nodeType}`,
                };
              }
            }
          }
        }
      } catch {
        // Malformed JSON — skip
      }
    }
  } catch {
    // DOM error — skip
  }
  return null;
}

/**
 * Check for Open Graph product type.
 */
function checkOpenGraph(): { score: number; signal: string } | null {
  try {
    const ogType = document.querySelector<HTMLMetaElement>(
      'meta[property="og:type"]'
    );
    if (ogType) {
      const content = ogType.content?.toLowerCase() ?? '';
      if (content === 'product' || content.startsWith('product')) {
        return { score: 0.3, signal: `og:type = ${ogType.content}` };
      }
    }
  } catch {
    // Skip
  }
  return null;
}

/**
 * Check for Schema.org microdata with price.
 */
function checkMicrodata(): { score: number; signal: string } | null {
  try {
    const priceEl = document.querySelector('[itemprop="price"]');
    if (priceEl) {
      return { score: 0.2, signal: 'Schema.org microdata: itemprop=price' };
    }
  } catch {
    // Skip
  }
  return null;
}

/**
 * Check for add-to-cart buttons.
 */
function checkAddToCart(): { score: number; signal: string } | null {
  try {
    const selectors = [
      'button[name*="add"]',
      'button[class*="add-to-cart"]',
      'button[class*="addToCart"]',
      'button[class*="add_to_cart"]',
      'input[value*="Add to Cart"]',
      'input[value*="Add to Basket"]',
      '[data-action="add-to-cart"]',
      '.add-to-cart',
      '.addToCart',
      '#add-to-cart',
      '#addToCart',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        return { score: 0.1, signal: `Add-to-cart element: ${sel}` };
      }
    }

    // Text content fallback
    const buttons = document.querySelectorAll('button, [role="button"]');
    for (const btn of buttons) {
      const text = (btn.textContent ?? '').toLowerCase().trim();
      if (
        text.includes('add to cart') ||
        text.includes('add to basket') ||
        text.includes('buy now') ||
        text.includes('sepete ekle')
      ) {
        return { score: 0.1, signal: `Add-to-cart button text: "${text.substring(0, 30)}"` };
      }
    }
  } catch {
    // Skip
  }
  return null;
}

/**
 * Check for product-related CSS classes on the page.
 */
function checkProductClasses(): { score: number; signal: string } | null {
  try {
    const selectors = [
      '.product-page',
      '.product-detail',
      '.product-details',
      '.pdp',
      '[class*="product-page"]',
      '[class*="productPage"]',
      '[class*="product-detail"]',
      '[class*="productDetail"]',
      '[itemtype*="schema.org/Product"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        return { score: 0.1, signal: `Product CSS class: ${sel}` };
      }
    }
  } catch {
    // Skip
  }
  return null;
}

/**
 * Check for ingredient-related text on the page.
 */
function checkIngredientText(): { score: number; signal: string } | null {
  try {
    const bodyText = (document.body.textContent ?? '').toLowerCase();
    const keywords = [
      'ingredient',
      'ingredients',
      'composition',
      'contains',
      'içerik',
      'bileşen',
      'inci list',
    ];

    for (const keyword of keywords) {
      if (bodyText.includes(keyword)) {
        return {
          score: 0.2,
          signal: `Ingredient-related text: "${keyword}"`,
        };
      }
    }
  } catch {
    // Skip
  }
  return null;
}

// ─── Main Export ─────────────────────────────────────────────────

/**
 * Heuristic product page detection.
 *
 * Returns a confidence score (0–1), whether the page is likely a product page,
 * and an array of signal descriptions.
 */
export function detectProductPage(): ProductPageResult {
  const signals: string[] = [];
  let confidence = 0;

  const checks = [
    checkJsonLd,
    checkOpenGraph,
    checkMicrodata,
    checkAddToCart,
    checkProductClasses,
    checkIngredientText,
  ];

  for (const check of checks) {
    const result = check();
    if (result) {
      confidence += result.score;
      signals.push(result.signal);
    }
  }

  // Clamp to 0–1
  confidence = Math.min(1, Math.max(0, confidence));

  return {
    isProduct: confidence >= 0.3,
    confidence,
    signals,
  };
}
