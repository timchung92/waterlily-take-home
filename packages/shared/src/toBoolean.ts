import { isBoolean, isString } from 'lodash';
import { isNullOrUndefined } from './isNullOrUndefined';
import { isRealNumber } from './isRealNumber';

const booleanStrings: ObjectMap<boolean | undefined> = {
  true: true,
  True: true,
  TRUE: true,
  t: true,
  T: true,


  false: false,
  False: false,
  FALSE: false,
  f: false,
  F: false,
  '': false,
  '0': false,
};

export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) {
    return value;
  }

  if (isRealNumber(value)) {
    return Boolean(value);
  }

  if (isNullOrUndefined(value)) {
    return false;
  }

  if (isString(value)) {
    const maybeBoolean = booleanStrings[ value ];
    if (maybeBoolean !== undefined) {
      return maybeBoolean;
    }

    return /-?\d+(\.\d+)/.test(value);
  }

  return false;
}
