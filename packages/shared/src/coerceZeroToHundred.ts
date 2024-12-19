import { coercePositiveDecimal } from './coercePositiveDecimal';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * Returns the parsed percent if value is valid, null if value is empty, and undefined if not valid.
 */
export function coerceZeroToHundred(value: string) {

  const decimal = coercePositiveDecimal(value);

  if (isNullOrUndefined(decimal)) {
    return decimal;
  }

  if (decimal < 0 || decimal > 100) {
    return undefined;
  }

  return decimal;
}
