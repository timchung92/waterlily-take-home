import { unambiguousLettersAndNumbers } from './constants';
import { randomString } from './randomString';

/**
 * Returns a string of specified length consiting of unambiguous characters.
 */
export function randomUnambiguousString(length: number) {
  return randomString(unambiguousLettersAndNumbers, length);
}