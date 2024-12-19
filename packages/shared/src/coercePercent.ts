import { coercePositiveDecimal } from './coercePositiveDecimal';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * Returns the parsed percent if value is valid, null if value is empty, and undefined if not valid.
 */
export function coercePercent(value: string) {

  const decimal = coercePositiveDecimal(value);

  if (isNullOrUndefined(decimal)) {
    return decimal;
  }

  if (decimal > 1.0) {
    return undefined;
  }

  return decimal;
}
