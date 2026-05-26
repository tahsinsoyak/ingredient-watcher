/**
 * Sanitize user-entered terms.
 */
export function sanitizeTerm(input: string): string {
  // Strip HTML tags
  let cleaned = input.replace(/<[^>]*>/g, '');
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  // Limit length
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 100);
  }
  return cleaned;
}

/**
 * Validate that a term is acceptable for the watchlist.
 */
export function validateTerm(term: string): { valid: boolean; error?: string } {
  if (!term || term.trim().length === 0) {
    return { valid: false, error: 'Term cannot be empty' };
  }
  if (term.trim().length < 1) {
    return { valid: false, error: 'Term must be at least 1 character' };
  }
  if (term.length > 100) {
    return { valid: false, error: 'Term must be 100 characters or less' };
  }
  return { valid: true };
}

/**
 * Sanitize text for safe insertion into the DOM as highlight tooltips.
 */
export function sanitizeForDOM(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
