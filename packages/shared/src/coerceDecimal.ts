import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

/**
 * Returns the parsed decimal/float if value is valid, null if value is empty, and undefined if not valid.
 */
export function coerceDecimal(value: string) {
  if (isNullUndefinedOrEmpty(value)) {
    return null;
  }

  const decimal = Number.parseFloat(value);

  if (Number.isNaN(decimal)) {
    return undefined;
  }

  return decimal;
}