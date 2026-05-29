import { describe, it, expect, beforeEach } from 'vitest';
import {
  matchIngredients,
  resetMatchIdCounter,
} from '../src/shared/lib/matchIngredients';
import type { WatchlistTerm, FalsePositiveRule } from '../src/shared/types/ingredients';

function makeTerm(overrides: Partial<WatchlistTerm> = {}): WatchlistTerm {
  return {
    id: `term-${Date.now()}-${Math.random()}`,
    label: 'Test',
    aliases: [],
    category: 'food',
    severity: 'warning',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('matchIngredients', () => {
  beforeEach(() => {
    resetMatchIdCounter();
  });

  it('1. "contains gluten" matches gluten as warning', () => {
    const terms = [makeTerm({ id: 'gluten', label: 'Gluten', aliases: [] })];
    const matches = matchIngredients('This product contains gluten.', terms);
    expect(matches.length).toBe(1);
    expect(matches[0].severity).toBe('warning');
  });

  it('2. "gluten-free" is info (free-from), not warning', () => {
    const terms = [makeTerm({ id: 'gluten', label: 'Gluten', aliases: [] })];
    const matches = matchIngredients(
      'This product is gluten-free.',
      terms,
      [],
      '',
      true
    );
    expect(matches.length).toBe(1);
    expect(matches[0].severity).toBe('info');
  });

  it('3. "sodium lauryl sulfate" matches SLS term', () => {
    const terms = [
      makeTerm({
        id: 'sls',
        label: 'SLS',
        aliases: ['sodium lauryl sulfate', 'sodium dodecyl sulfate'],
      }),
    ];
    const matches = matchIngredients(
      'Ingredients: water, sodium lauryl sulfate, fragrance',
      terms
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const slsMatch = matches.find((m) => m.termId === 'sls');
    expect(slsMatch).toBeDefined();
  });

  it('4. "parfum" matches fragrance term', () => {
    const terms = [
      makeTerm({
        id: 'fragrance',
        label: 'Fragrance',
        aliases: ['parfum', 'perfume', 'aroma'],
      }),
    ];
    const matches = matchIngredients('Ingredients: aqua, parfum, glycerin', terms);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].termId).toBe('fragrance');
  });

  it('5. "milk protein" matches milk if enabled', () => {
    const terms = [
      makeTerm({
        id: 'milk',
        label: 'Milk',
        aliases: ['milk protein', 'lactose'],
      }),
    ];
    const matches = matchIngredients(
      'Contains: milk protein, sugar, salt',
      terms
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('6. "alcohol-free" does NOT trigger alcohol as warning', () => {
    const terms = [
      makeTerm({ id: 'alcohol', label: 'Alcohol', aliases: [] }),
    ];
    const matches = matchIngredients(
      'This product is alcohol-free.',
      terms,
      [],
      '',
      true
    );
    // Should match but as info (free-from), not warning
    if (matches.length > 0) {
      expect(matches[0].severity).toBe('info');
    }
  });

  it('7. "benzalkonium chloride" matches cleaning watchlist', () => {
    const terms = [
      makeTerm({
        id: 'quats',
        label: 'Quats',
        aliases: ['benzalkonium chloride'],
        category: 'cleaning',
      }),
    ];
    const matches = matchIngredients(
      'Active: benzalkonium chloride 0.13%',
      terms
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].category).toBe('cleaning');
  });

  it('8. Turkish "laktoz içermez" becomes free-from info', () => {
    const terms = [
      makeTerm({
        id: 'lactose',
        label: 'Lactose',
        aliases: ['laktoz'],
      }),
    ];
    const matches = matchIngredients(
      'Bu ürün laktoz içermez.',
      terms,
      [],
      '',
      true
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // "içermez" means "does not contain" — should be info
    expect(matches[0].severity).toBe('info');
  });

  it('9. duplicate matches are deduplicated', () => {
    const terms = [
      makeTerm({
        id: 'milk',
        label: 'Milk',
        aliases: ['milk'],
      }),
    ];
    const matches = matchIngredients('milk and more milk', terms);
    // Should have 2 distinct position matches, not duplicates at same position
    const positions = matches.map((m) => m.index);
    const uniquePositions = new Set(positions);
    expect(positions.length).toBe(uniquePositions.size);
  });

  it('10. disabled term does not match', () => {
    const terms = [
      makeTerm({
        id: 'gluten',
        label: 'Gluten',
        aliases: [],
        enabled: false,
      }),
    ];
    const matches = matchIngredients('Contains gluten.', terms);
    expect(matches.length).toBe(0);
  });

  it('11. false positive rules prevent matching', () => {
    const terms = [
      makeTerm({ id: 'fragrance', label: 'Fragrance', aliases: [] }),
    ];
    const falsePositives: FalsePositiveRule[] = [
      {
        id: 'fp1',
        term: 'fragrance',
        createdAt: new Date().toISOString(),
      },
    ];
    const matches = matchIngredients(
      'Contains fragrance.',
      terms,
      falsePositives
    );
    expect(matches.length).toBe(0);
  });

  it('12. avoids matching "palm" inside "napalm"', () => {
    const terms = [
      makeTerm({ id: 'palm', label: 'Palm', aliases: ['palm oil'] }),
    ];
    const matches = matchIngredients(
      'Napalm is a chemical weapon.',
      terms
    );
    // "palm" inside "napalm" should NOT match due to word boundary
    expect(matches.length).toBe(0);
  });

  it('matches are sorted by position', () => {
    const terms = [
      makeTerm({ id: 'sls', label: 'SLS', aliases: [] }),
      makeTerm({ id: 'paraben', label: 'Paraben', aliases: [] }),
    ];
    const matches = matchIngredients(
      'Paraben is listed before SLS in this text.',
      terms
    );
    if (matches.length >= 2) {
      expect(matches[0].index).toBeLessThan(matches[1].index);
    }
  });

  it('extracts context snippets', () => {
    const terms = [
      makeTerm({ id: 'fragrance', label: 'Fragrance', aliases: [] }),
    ];
    const matches = matchIngredients(
      'The product contains fragrance and other ingredients.',
      terms
    );
    expect(matches.length).toBe(1);
    expect(matches[0].contextSnippet).toContain('fragrance');
  });

  it('"free from gluten" detected as info', () => {
    const terms = [
      makeTerm({ id: 'gluten', label: 'Gluten', aliases: [] }),
    ];
    const matches = matchIngredients(
      'This product is free from gluten and dairy.',
      terms,
      [],
      '',
      true
    );
    expect(matches.length).toBe(1);
    expect(matches[0].severity).toBe('info');
  });

  it('"no added fragrance" detected as info', () => {
    const terms = [
      makeTerm({ id: 'fragrance', label: 'Fragrance', aliases: [] }),
    ];
    const matches = matchIngredients(
      'No added fragrance in this formula.',
      terms,
      [],
      '',
      true
    );
    expect(matches.length).toBe(1);
    expect(matches[0].severity).toBe('info');
  });
});
