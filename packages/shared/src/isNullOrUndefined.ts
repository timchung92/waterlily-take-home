/**
 * Tests whether an object is null or undefined.
 */
export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === null || value === undefined;
}
