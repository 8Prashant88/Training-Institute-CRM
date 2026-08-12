/*
 * Minimal RFC 4180 CSV writer. No dependency pulled in for this — the
 * current stack already solves it with a handful of pure functions.
 */

/*
 * A field that starts with one of these characters can be interpreted
 * as a spreadsheet formula by Excel/Sheets when the CSV is opened
 * (e.g. a lead name of "=cmd|' /C calc'!A0" is a real, known CSV
 * injection vector). Prefixing with a leading apostrophe forces the
 * cell to be read as literal text instead of evaluated.
 */
const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function escapeCsvField(value: string): string {
  let field = value;

  if (FORMULA_PREFIXES.some((prefix) => field.startsWith(prefix))) {
    field = `'${field}`;
  }

  const needsQuoting = /[",\r\n]/.test(field);

  if (!needsQuoting) {
    return field;
  }

  return `"${field.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsvField).join(","),
  );

  /*
   * RFC 4180 specifies CRLF line endings, and it's what spreadsheet
   * software (Excel in particular) expects without guessing.
   */
  return lines.join("\r\n") + "\r\n";
}
