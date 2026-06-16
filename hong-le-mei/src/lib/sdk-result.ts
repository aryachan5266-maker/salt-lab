export type LooseRecord = Record<string, unknown>;

export function asRecord(value: unknown): LooseRecord {
  return value !== null && typeof value === 'object' ? (value as LooseRecord) : {};
}

export function stringField(value: unknown, key: string): string {
  const field = asRecord(value)[key];
  return typeof field === 'string' ? field : '';
}

export function arrayField<T = unknown>(value: unknown, key: string): T[] {
  const field = asRecord(value)[key];
  return Array.isArray(field) ? (field as T[]) : [];
}

export function firstArrayField<T = unknown>(value: unknown, keys: string[]): T[] {
  for (const key of keys) {
    const items = arrayField<T>(value, key);
    if (items.length > 0) return items;
  }
  return [];
}

export function textFromResult(value: unknown): string {
  return stringField(value, 'content') || stringField(value, 'text');
}
