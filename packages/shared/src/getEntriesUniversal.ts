
export function getEntriesUniversal(obj: unknown): [ unknown, unknown ][] {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }

  if (obj instanceof Map) {
    return [ ...obj.entries() ];
  }

  if (obj instanceof Set) {
    const entries = [] as [unknown, unknown][];
    for (const item of obj) {
      entries.push([ item, item ]);
    }
    return entries;
  }

  try {
    return Object.entries(obj);
  } catch {
    return [];
  }
}
