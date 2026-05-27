import type {
  WatchlistTerm,
  IngredientMatch,
  FalsePositiveRule,
  MatchSeverity,
} from '../types/ingredients';
import { normalizeIngredient } from './normalizeIngredient';
import { buildCombinedRegex } from './buildRegex';

const FREE_FROM_PATTERNS = [
  /\bfree[\s-]?from\b/i,
  /\bfree[\s-]?of\b/i,
  /\bwithout\b/i,
  /\bdoes\s+not\s+contain\b/i,
  /\bno\s+(?:added\s+)?/i,
  /\b0\s*%\s*/i,
  /-free\b/i,
  /\bfree\b/i,
  /\bicermez\b/i,
  /\byoktur\b/i,
  /\bbulunmaz\b/i,
  /\bicermeyen\b/i,
  /\bharic\b/i,
];

function detectContextSeverity(
  fullText: string,
  matchStart: number,
  matchEnd: number,
  _baseSeverity: MatchSeverity
): MatchSeverity {
  const contextBefore = fullText.substring(Math.max(0, matchStart - 60), matchStart);
  const contextAfter = fullText.substring(matchEnd, matchEnd + 30);
  const combined = contextBefore + fullText.substring(matchStart, matchEnd) + contextAfter;

  for (const pattern of FREE_FROM_PATTERNS) {
    if (pattern.test(contextBefore) || pattern.test(combined)) return 'info';
  }

  const afterMatch = fullText.substring(matchEnd, matchEnd + 10).trimStart();
  if (afterMatch.startsWith('-free') || afterMatch.startsWith('free')) return 'info';

  const beforeMatch = fullText.substring(Math.max(0, matchStart - 1), matchStart);
  if (beforeMatch === '-') {
    const furtherBefore = fullText.substring(Math.max(0, matchStart - 10), matchStart);
    if (/free$/i.test(furtherBefore)) return 'info';
  }

  const compoundCheck = fullText.substring(Math.max(0, matchStart - 1), matchEnd + 6);
  if (/[\w]-free/i.test(compoundCheck) && compoundCheck.includes(fullText.substring(matchStart, matchEnd))) return 'info';

  return _baseSeverity;
}

function extractContextSnippet(
  text: string,
  matchStart: number,
  matchEnd: number,
  maxLength: number = 80
): string {
  const halfContext = Math.floor((maxLength - (matchEnd - matchStart)) / 2);
  const start = Math.max(0, matchStart - halfContext);
  const end = Math.min(text.length, matchEnd + halfContext);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';

  return snippet.replace(/\s+/g, ' ');
}

function isFalsePositive(
  matchedText: string,
  domain: string,
  falsePositives: FalsePositiveRule[]
): boolean {
  const normalizedMatch = normalizeIngredient(matchedText);
  return falsePositives.some((rule) => {
    const normalizedRule = normalizeIngredient(rule.term);
    if (normalizedRule !== normalizedMatch) return false;
    if (rule.domain && rule.domain !== domain) return false;
    return true;
  });
}

function findMatchingTerm(
  matchedText: string,
  enabledTerms: WatchlistTerm[]
): WatchlistTerm | undefined {
  const lower = normalizeIngredient(matchedText);
  return enabledTerms.find((term) => {
    const allLabels = [term.label, ...term.aliases].map((l) => normalizeIngredient(l));
    return allLabels.some((l) => l === lower || lower.includes(l) || l.includes(lower));
  });
}

let matchIdCounter = 0;

export function matchIngredients(
  text: string,
  terms: WatchlistTerm[],
  falsePositives: FalsePositiveRule[] = [],
  domain: string = '',
  freeFromDetection: boolean = true
): IngredientMatch[] {
  const normalizedText = normalizeIngredient(text);
  const matches: IngredientMatch[] = [];
  const seenPositions = new Set<string>();
  const enabledTerms = terms.filter((t) => t.enabled);

  if (enabledTerms.length === 0) return matches;

  const combinedRegex = buildCombinedRegex(enabledTerms);
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(normalizedText)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;
    const positionKey = matchStart.toString();

    if (seenPositions.has(positionKey)) continue;
    seenPositions.add(positionKey);

    if (isFalsePositive(match[0], domain, falsePositives)) continue;

    const term = findMatchingTerm(match[0], enabledTerms);
    if (!term) continue;

    const severity = freeFromDetection
      ? detectContextSeverity(normalizedText, matchStart, matchEnd, term.severity)
      : term.severity;

    const contextSnippet = extractContextSnippet(normalizedText, matchStart, matchEnd);

    matches.push({
      id: `match-${++matchIdCounter}`,
      termId: term.id,
      matchedText: match[0],
      normalizedText: normalizeIngredient(match[0]),
      category: term.category,
      severity,
      contextSnippet,
      index: matchStart,
    });
  }

  matches.sort((a, b) => a.index - b.index);
  return matches;
}

export function resetMatchIdCounter(): void {
  matchIdCounter = 0;
}
