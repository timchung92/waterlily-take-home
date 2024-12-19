import { isInteger } from './isInteger';

export function isIntegerOrNull(value: unknown): value is (number | null) {
  return value === null || isInteger(value);
}
