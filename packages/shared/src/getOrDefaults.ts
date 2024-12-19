import { isNullOrUndefined } from './isNullOrUndefined';

export function getOrDefault<T>(obj: unknown, property: string | number | symbol, defaultValue?: T): T | undefined {
  const value = isNullOrUndefined(obj)
    ? undefined
    : (obj as any)[ property ] ?? undefined;
  return value === undefined ? defaultValue : value as T;
}
