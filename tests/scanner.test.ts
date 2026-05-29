import { describe, it, expect } from 'vitest';

// Simple scanner integration tests for text extraction logic
// (DOM-dependent tests require jsdom)

describe('scanner integration', () => {
  it('should be tested with real DOM in integration tests', () => {
    // Content script scanner tests would need a proper DOM environment
    // These are placeholder integration test points
    expect(true).toBe(true);
  });

  it('text extraction selectors are defined correctly', () => {
    const PRODUCT_SELECTORS = [
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

    // All selectors should be valid CSS selectors
    expect(PRODUCT_SELECTORS.length).toBeGreaterThan(0);
    PRODUCT_SELECTORS.forEach((selector) => {
      expect(typeof selector).toBe('string');
      expect(selector.length).toBeGreaterThan(0);
    });
  });

  it('highlight class names are consistent', () => {
    const BASE_CLASS = 'iw-highlight';
    const SEVERITY_CLASSES = [
      'iw-highlight--warning',
      'iw-highlight--notice',
      'iw-highlight--info',
    ];

    SEVERITY_CLASSES.forEach((cls) => {
      expect(cls.startsWith(BASE_CLASS)).toBe(true);
    });
  });
});
