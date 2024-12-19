import { coerceInteger } from './coerceInteger';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * Returns the parsed positive integer if value is valid, null if value is empty, and undefined if not valid.
 */
export function coercePositiveInteger(value: string) {
  const i = coerceInteger(value);
  if (isNullOrUndefined(i)) {
    return i;
  }

  if (i < 0) {
    return undefined;
  }

  return i;
}