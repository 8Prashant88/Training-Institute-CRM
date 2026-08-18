
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

  return lines.join("\n");
}
