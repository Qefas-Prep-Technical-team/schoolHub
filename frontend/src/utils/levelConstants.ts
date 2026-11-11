/**
 * Standard suggested academic and examination levels for schools.
 * Used when a school has not yet configured custom levels or as supplementary suggestions.
 */
export const SUGGESTED_LEVELS = [
  "KG 1",
  "KG 2",
  "Nursery 1",
  "Nursery 2",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
  "UTME",
  "GCE",
  "NECO",
] as const;

/**
 * Filter suggestions to exclude any level already configured for the school (case-insensitive match).
 */
export function getFilteredLevelSuggestions(configuredLevels: string[]): string[] {
  const normalizedConfigured = new Set(
    (configuredLevels || []).map((l) => l.trim().toLowerCase())
  );
  return SUGGESTED_LEVELS.filter(
    (suggested) => !normalizedConfigured.has(suggested.trim().toLowerCase())
  );
}

