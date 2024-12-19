import { isString } from 'lodash';
import { isNullOrUndefined, isRealNumber } from '.';

export function numberOrUndefined(value: number | string | undefined): number | undefined {
  if (isRealNumber(value) || isNullOrUndefined(value)) {
    return value;
  }
  if (!isString(value)) {
    return undefined;
  }

  const digits = value.replaceAll(/[^0-9]/g, '');

  return digits.length === 0 ? undefined : Number.parseInt(digits);
}
