/**
 * Normalizes academic term values into official Nigerian academic conventions.
 * E.g., 'FIRST' -> 'First Term', 'SECOND' -> 'Second Term', 'THIRD' -> 'Third Term'.
 */
export function formatAcademicTerm(rawTerm?: string | null): string {
  if (!rawTerm) return "First Term";
  const normalized = String(rawTerm).trim().toUpperCase();

  switch (normalized) {
    case "FIRST":
    case "FIRST TERM":
    case "1ST":
    case "1ST TERM":
      return "First Term";
    case "SECOND":
    case "SECOND TERM":
    case "2ND":
    case "2ND TERM":
      return "Second Term";
    case "THIRD":
    case "THIRD TERM":
    case "3RD":
    case "3RD TERM":
      return "Third Term";
    default:
      if (normalized.endsWith("TERM")) {
        return rawTerm.trim();
      }
      return `${rawTerm.trim()} Term`;
  }
}

