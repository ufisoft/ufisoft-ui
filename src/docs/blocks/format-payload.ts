/** Formats a payload for reading in the docs: Dates and Files stay recognisable, unlike JSON. */
export function formatPayload(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (value instanceof Date) {
    const iso = Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
    return `Date(${iso})`;
  }
  if (typeof File !== 'undefined' && value instanceof File) {
    return `File(${JSON.stringify(value.name)}, ${value.size} B)`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((item) => inner + formatPayload(item, indent + 1)).join(',\n')}\n${pad}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    const lines = entries.map(
      ([key, item]) => `${inner}${key}: ${formatPayload(item, indent + 1)}`,
    );
    return `{\n${lines.join(',\n')}\n${pad}}`;
  }
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}
