import { normalizeIngredient } from './normalizeIngredient';

/**
 * Build a word-boundary-aware regex for a term and its aliases.
 * Supports hyphen/space variants and simple plural forms.
 */
export function buildTermRegex(label: string, aliases: string[]): RegExp {
  const allTerms = [label, ...aliases];
  const patterns = allTerms.map((term) => {
    const normalized = normalizeIngredient(term);
    // Escape special regex characters
    let escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow hyphen/space variants: "sodium lauryl sulfate" also matches "sodium-lauryl-sulfate"
    escaped = escaped.replace(/[\s-]+/g, '[\\s\\-]+');
    // Simple plural: add optional trailing 's' if not already ending in 's'
    if (!escaped.endsWith('s')) {
      escaped += 's?';
    }
    return escaped;
  });

  // Sort by length descending so longer aliases match first
  patterns.sort((a, b) => b.length - a.length);

  // Word boundary that works with Unicode
  // Using (?<![a-z]) and (?![a-z]) instead of \b for better control
  const combined = patterns.join('|');
  return new RegExp(`(?<![a-zA-Z])(${combined})(?![a-zA-Z])`, 'gi');
}

/**
 * Build a single combined regex for all terms (for performance).
 */
export function buildCombinedRegex(
  terms: Array<{ label: string; aliases: string[] }>
): RegExp {
  const allPatterns: string[] = [];

  for (const term of terms) {
    const allTermLabels = [term.label, ...term.aliases];
    for (const t of allTermLabels) {
      const normalized = normalizeIngredient(t);
      let escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      escaped = escaped.replace(/[\s-]+/g, '[\\s\\-]+');
      if (!escaped.endsWith('s')) {
        escaped += 's?';
      }
      allPatterns.push(escaped);
    }
  }

  // Sort by length descending
  allPatterns.sort((a, b) => b.length - a.length);
  const combined = allPatterns.join('|');
  return new RegExp(`(?<![a-zA-Z])(${combined})(?![a-zA-Z])`, 'gi');
}
