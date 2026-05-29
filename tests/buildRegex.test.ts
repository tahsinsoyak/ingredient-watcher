import { describe, it, expect } from 'vitest';
import { buildTermRegex, buildCombinedRegex } from '../src/shared/lib/buildRegex';

describe('buildTermRegex', () => {
  it('matches the label case-insensitively', () => {
    expect(buildTermRegex('Paraben', []).test('contains paraben')).toBe(true);
    expect(buildTermRegex('Paraben', []).test('contains PARABEN')).toBe(true);
    expect(buildTermRegex('Paraben', []).test('contains Paraben')).toBe(true);
  });

  it('matches aliases', () => {
    const makeRegex = () => buildTermRegex('SLS', [
      'sodium lauryl sulfate',
      'sodium dodecyl sulfate',
    ]);
    expect(makeRegex().test('contains SLS')).toBe(true);
    expect(makeRegex().test('sodium lauryl sulfate listed')).toBe(true);
    expect(makeRegex().test('sodium dodecyl sulfate listed')).toBe(true);
  });

  it('supports hyphen/space variants', () => {
    expect(buildTermRegex('sodium lauryl sulfate', []).test('sodium lauryl sulfate')).toBe(true);
    expect(buildTermRegex('sodium lauryl sulfate', []).test('sodium-lauryl-sulfate')).toBe(true);
  });

  it('respects word boundaries — does not match substrings', () => {
    expect(buildTermRegex('palm', ['palm oil']).test('napalm')).toBe(false);
    expect(buildTermRegex('palm', ['palm oil']).test('palm oil')).toBe(true);
    expect(buildTermRegex('palm', ['palm oil']).test('palm')).toBe(true);
  });

  it('handles simple plurals', () => {
    expect(buildTermRegex('paraben', []).test('parabens')).toBe(true);
  });

  it('escapes special regex characters in user terms', () => {
    expect(buildTermRegex('test (chemical)', []).test('test (chemical)')).toBe(true);
  });

  it('handles Turkish terms', () => {
    expect(buildTermRegex('laktoz', []).test('laktoz')).toBe(true);
  });
});

describe('buildCombinedRegex', () => {
  it('combines multiple terms into one regex', () => {
    const makeRegex = () => buildCombinedRegex([
      { label: 'SLS', aliases: ['sodium lauryl sulfate'] },
      { label: 'Paraben', aliases: ['methylparaben'] },
    ]);
    expect(makeRegex().test('contains SLS')).toBe(true);
    expect(makeRegex().test('methylparaben present')).toBe(true);
    expect(makeRegex().test('no matches here')).toBe(false);
  });
});
