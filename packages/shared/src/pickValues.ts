export function pickValues<T>(item: T, keys: (keyof T)[]): T[keyof T][];
export function pickValues(item: unknown, keys: string[]): unknown[];
export function pickValues(item: any, keys: any[]) {
  return keys.map(key => item[key]);
}
