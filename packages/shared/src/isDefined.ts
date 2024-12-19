/**
 * Returns true of the provided value is not null or undefined.
 */
export function isDefined<T>(value: T | undefined | null): value is NonNullable<T> {
  return value !== undefined && value !== null;
}
