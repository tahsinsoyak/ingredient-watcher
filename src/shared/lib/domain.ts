/**
 * Extract the domain from a URL.
 */
export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return '';
  }
}

/**
 * Check if a domain has auto-scan enabled.
 */
export function isDomainAutoScanEnabled(
  domain: string,
  settings: Array<{ domain: string; autoScanEnabled: boolean; ignored: boolean }>
): boolean {
  const setting = settings.find((s) => s.domain === domain);
  return setting?.autoScanEnabled ?? false;
}

/**
 * Check if a domain is ignored.
 */
export function isDomainIgnored(
  domain: string,
  settings: Array<{ domain: string; ignored: boolean }>
): boolean {
  const setting = settings.find((s) => s.domain === domain);
  return setting?.ignored ?? false;
}
