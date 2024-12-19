import {
  isArrayBuffer,
  isArrayLike,
  isDate,
  isFunction,
  isMap,
  isSet,
} from 'lodash';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * Tests whether an object is null, undefined, or "empty". Strings, arrays, maps, and sets and similar built-in
 * objects are empty when they have zero length. Objects are empty when they don't have any keys.
 */
export function isNullUndefinedOrEmpty(value: unknown): value is null | undefined | '' {
  if (isNullOrUndefined(value)) {
    return true;
  }

  if (isDate(value) || isFunction(value)) {
    return false;
  }

  if (isArrayLike(value)) {
    return value.length === 0;
  }

  if (isMap(value) || isSet(value)) {
    return value.size === 0;
  }

  if (isArrayBuffer(value)) {
    return value.byteLength === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }

  return false;
}
