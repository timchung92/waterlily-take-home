import { isRealNumber } from './isRealNumber';

export function isInteger(value: unknown): value is number {
  return isRealNumber(value) && value === Math.floor(value);
}
