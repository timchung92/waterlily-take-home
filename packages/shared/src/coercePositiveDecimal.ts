import { coerceDecimal } from './coerceDecimal';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * Returns the parsed positive decimal/float if value is valid, null if value is empty, and undefined if not valid.
 */
export function coercePositiveDecimal(value: string) {
  const decimal = coerceDecimal(value);
  if (isNullOrUndefined(decimal)) {
    return decimal;
  }

  if (decimal < 0) {
    return undefined;
  }

  return decimal;
}