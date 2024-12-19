import { isNumber } from 'lodash';

export function isPercentOrNull(value: unknown): value is number | null {
  return value === null || (isNumber(value) && value >= 0 && value <= 1.0);
}
