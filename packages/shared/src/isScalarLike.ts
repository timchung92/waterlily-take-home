import { isBoolean, isNumber, isString } from 'lodash';

/**
 * Identifies if the argument is generally considered scalar: [string], [number], [boolean], or [Date].
 * Includes [Date], excludes [undefined], [null], [NaN], and [Symbol]. @See [isTrueScalar] for more
 * specific use cases.
 */
export function isScalarLike(value: unknown): value is string | number | boolean | Date {
  return isString(value) ||
    isBoolean(value) ||
    (isNumber(value) && !Number.isNaN(value)) ||
    (value instanceof Date);
}
