// ─── Site-Specific Extractors ────────────────────────────────────
// Targeted selectors for popular e-commerce sites to extract
// ingredient/description text much faster than generic DOM walking.

export interface SiteExtractor {
  domainPatterns: RegExp[];
  selectors: string[];
  extraParagraphKeywords?: RegExp;
}

const SITE_EXTRACTORS: SiteExtractor[] = [
  {
    domainPatterns: [/amazon\.(com|co\.uk|de|fr|com\.tr|com\.br|ca|com\.mx|in|co\.jp|com\.au|es|it|nl|sg|ae|sa)/i],
    selectors: [
      '#productTitle',
      '#feature-bullets',
      '#productDescription',
      '#ingredients',
      '#importantInformation',
      '[data-feature-name="productDescription"]',
      '.a-expander-content',
      '#detailBullets_feature_div',
      '#prodDetails',
      '.productDescription',
      '#aplus',
      '#aplus_feature_div',
    ],
    extraParagraphKeywords: /\b(ingredient|contains|composition|allergen|nutrition|made with|free from)\b/i,
  },
  {
    domainPatterns: [/trendyol\.com/i],
    selectors: [
      '.product-name',
      '.pr-new-br',
      '.pr-in-w',
      '.product-desc',
      '.detail-desc',
      '[data-testid="product-detail-description"]',
      '.ingredients-list',
      '.product-info-container',
      '.pr-dt',
    ],
    extraParagraphKeywords: /\b(içerik|bileşen|içerir|malzeme|içermez|ingredients?|contains?)\b/i,
  },
  {
    domainPatterns: [/sephora\.(com|co\.uk|com\.tr|fr|de|it|es|se|pl|cz|ro)/i],
    selectors: [
      '[data-at="product_name"]',
      '[data-at="product_description"]',
      '[data-at="product_ingredients"]',
      '[data-at="product_details"]',
      '.css-1ueq15r',
      '.product-description',
      '#ingredients',
    ],
    extraParagraphKeywords: /\b(ingredient|contains|composition|inci|formula)\b/i,
  },
  {
    domainPatterns: [/etsy\.com/i],
    selectors: [
      '#listing-page-cart h1',
      '[data-product-details-container]',
      '#description',
      '.wt-text-body-01',
      '#item-overview',
    ],
    extraParagraphKeywords: /\b(ingredient|contains|made with|materials|composition)\b/i,
  },
  {
    domainPatterns: [/\.ebay\./i],
    selectors: [
      '.x-item-title__mainTitle',
      '#desc_ifr',
      '#viTabs_0_is',
      '.ux-layout-section__textual-display',
      '[data-testid="x-about-this-item"]',
      '#vi-desc-maincntr',
    ],
    extraParagraphKeywords: /\b(ingredient|contains|composition|made with|includes)\b/i,
  },
  {
    domainPatterns: [/walmart\.com/i],
    selectors: [
      '[data-automation-id="product-title"]',
      '[data-automation-id="product-description"]',
      '#product-about',
      '#product-features',
      '.product-description',
      '[data-testid="product-description"]',
    ],
    extraParagraphKeywords: /\b(ingredient|contains|nutrition|composition|allergen)\b/i,
  },
  {
    domainPatterns: [/hepsiburada\.com/i],
    selectors: [
      '.product-name',
      '[data-test-id="product-title"]',
      '#productDescription',
      '.product-description',
      '.detail-spec-container',
      '[data-test-id="product-detail-description"]',
    ],
    extraParagraphKeywords: /\b(içerik|bileşen|içerir|malzeme|içermez|ingredients?|contains?)\b/i,
  },
  {
    domainPatterns: [/flo\.com\.tr/i, /sportive\.com\.tr/i, /watsons\.com\.tr/i, /gratis\.com/i],
    selectors: [
      '.product-name',
      '.product-title',
      '#product-detail',
      '.product-description',
      '#productDescription',
    ],
    extraParagraphKeywords: /\b(içerik|bileşen|içerir|ingredients?|contains?|composition)\b/i,
  },
  {
    domainPatterns: [/iherb\.com/i],
    selectors: [
      '#product-name',
      '#product-description',
      '#supplement-facts',
      '#ingredients',
      '.product-about',
      '[data-testid="product-title"]',
    ],
    extraParagraphKeywords: /\b(ingredient|supplement facts|nutrition|contains|allergen|other ingredients)\b/i,
  },
  {
    domainPatterns: [/coupang\.com/i],
    selectors: [
      '.prod-buy-header',
      '.prod-description',
      '#productDescription',
      '.product-info',
    ],
    extraParagraphKeywords: /\b(성분|원료|포함|ingredients?|contains?)\b/i,
  },
];

export function getExtractorForDomain(domain: string): SiteExtractor | null {
  for (const extractor of SITE_EXTRACTORS) {
    for (const pattern of extractor.domainPatterns) {
      if (pattern.test(domain)) {
        return extractor;
      }
    }
  }
  return null;
}

export { SITE_EXTRACTORS };
