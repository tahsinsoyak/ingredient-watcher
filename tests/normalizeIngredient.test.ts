import { describe, it, expect } from 'vitest';
import { normalizeIngredient, stripPunctuation } from '../src/shared/lib/normalizeIngredient';

describe('normalizeIngredient', () => {
  it('converts to lowercase', () => {
    expect(normalizeIngredient('PARABEN')).toBe('paraben');
    expect(normalizeIngredient('Fragrance')).toBe('fragrance');
  });

  it('handles Turkish characters', () => {
    expect(normalizeIngredient('İçermez')).toBe('icermez');
    expect(normalizeIngredient('LAKTÖZ')).toBe('laktoz');
    expect(normalizeIngredient('süt')).toBe('sut');
    expect(normalizeIngredient('Şeker')).toBe('seker');
    expect(normalizeIngredient('çikolata')).toBe('cikolata');
    expect(normalizeIngredient('Ğ')).toBe('g');
    expect(normalizeIngredient('ı')).toBe('i');
  });

  it('strips accents / diacritics', () => {
    expect(normalizeIngredient('café')).toBe('cafe');
    expect(normalizeIngredient('naïve')).toBe('naive');
    expect(normalizeIngredient('résumé')).toBe('resume');
  });

  it('normalizes hyphens (en-dash, em-dash)', () => {
    expect(normalizeIngredient('gluten\u2013free')).toBe('gluten-free');
    expect(normalizeIngredient('alcohol\u2014free')).toBe('alcohol-free');
  });

  it('collapses whitespace', () => {
    expect(normalizeIngredient('sodium  lauryl   sulfate')).toBe(
      'sodium lauryl sulfate'
    );
    expect(normalizeIngredient('  trimmed  ')).toBe('trimmed');
  });

  it('handles combined normalization', () => {
    expect(normalizeIngredient('  SODIUM  Lauryl  SULFATE  ')).toBe(
      'sodium lauryl sulfate'
    );
  });
});

describe('stripPunctuation', () => {
  it('strips surrounding punctuation', () => {
    expect(stripPunctuation('(paraben)')).toBe('paraben');
    expect(stripPunctuation('"fragrance"')).toBe('fragrance');
    expect(stripPunctuation('*SLS*')).toBe('SLS');
  });

  it('preserves internal punctuation', () => {
    expect(stripPunctuation('alcohol-free')).toBe('alcohol-free');
  });
});
