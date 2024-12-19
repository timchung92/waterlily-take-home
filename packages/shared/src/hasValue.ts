import { isNumber } from 'lodash';

export function hasValue<T>(value: T | undefined | null): value is NonNullable<T> {
  return value !== undefined &&
    value !== null &&
    value !== '' &&
    !(Array.isArray(value) && value.length === 0) &&
    !(isNumber(value) && Number.isNaN(value));
}
