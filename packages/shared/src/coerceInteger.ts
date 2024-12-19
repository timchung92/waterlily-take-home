import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

/**
 * Returns an integer if value is a valid percent, null if value is empty, and undefined if not valid.
 */
export function coerceInteger(value: string) {
  if (isNullUndefinedOrEmpty(value)) {
    return null;
  }

  const i = Number.parseInt(value);

  if (Number.isNaN(i)) {
    return undefined;
  }

  return i;
}