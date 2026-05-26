/**
 * Normalize ingredient text for matching.
 * Handles case, accents, Turkish characters, whitespace, and hyphens.
 */
export function normalizeIngredient(text: string): string {
  let result = text;

  // Lowercase (handle Turkish İ and I specially)
  result = result
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .toLowerCase();

  // Turkish lowercase specials
  result = result
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  // Unicode NFD normalization — strip combining marks (accents)
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Normalize hyphens (en-dash, em-dash → standard hyphen)
  result = result.replace(/[\u2013\u2014\u2015]/g, '-');

  // Collapse whitespace
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Strip surrounding punctuation from a term for cleaner matching.
 */
export function stripPunctuation(text: string): string {
  return text.replace(/^[^\w]+|[^\w]+$/g, '');
}
