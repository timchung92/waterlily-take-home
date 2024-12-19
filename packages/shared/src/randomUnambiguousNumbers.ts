import { unambiguousNumbers } from './constants';
import { randomString } from './randomString';

/**
 * Returns a string of specified length consiting of unambiguous numbers.
 */
export function randomUnambiguousNumbers(length: number) {
  return randomString(unambiguousNumbers, length);
}
