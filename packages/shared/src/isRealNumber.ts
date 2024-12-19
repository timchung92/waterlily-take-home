import { isNumber } from 'lodash';

export function isRealNumber(value: unknown): value is number {
  return isNumber(value) && !Number.isNaN(value);
};
