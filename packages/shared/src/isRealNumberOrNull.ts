import { isRealNumber } from './isRealNumber';

export function isRealNumberOrNull(value: unknown) {
  return value === null || isRealNumber(value);
}
