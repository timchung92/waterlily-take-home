import { isBoolean, isNumber, isString } from 'lodash';

/**
 * Identifies if the argument is one of these scalar value: [string], [number], or [boolean].
 * [isScalarLike] servers more use cases. [isTrueScalar] still excludes [undefined], [null],
 * and [Symbol].
 */
export function isTrueScalar(value: unknown): value is string | number | boolean {
  return isString(value) || isNumber(value) || isBoolean(value);
}
