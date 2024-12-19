import { isTypedArray as _isTypedArray } from 'lodash';
import { TypedArray } from './types/lodash';

/**
 * Type guarded version of LoDash's isTypedArray.
 */
export function isTypedArray(value: unknown): value is TypedArray {
  return _isTypedArray(value);
}
