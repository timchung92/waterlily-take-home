import { isNumber } from 'lodash';

import { lowercaseLettersAndNumbers } from './constants';
import { ExError } from './ExError';
import { randomChar } from './randomChar';
import { randomIntBetween } from './randomIntBetween';

/**
 * Returns a random string of all lower case letters and numbers with the specified length.
 */
export function randomString(length: number): string;

/**
 * Returns a random string of all lower case letters and numbers with a length between the specified
 * min and max, inclusive of max.
 */
export function randomString(minLength: number, maxLength: number): string;

/**
 * Returns a random string composed of letters from the provided characters string with the specified length.
 */
export function randomString(chars: string, length: number): string;

/**
 * Returns a random string composed of letters from the provided characters string with with a length between
 * the specified min and max, inclusive of max.
 */
export function randomString(
  chars: string,
  minLength: number,
  maxLength: number,
): string;

export function randomString(...args: any[]): string {
  let chars: string;
  let minLength: number;
  let maxLength: number;

  switch (args.length) {
    case 1:
      chars = lowercaseLettersAndNumbers;
      minLength = maxLength = args[0];
      break;

    case 2:
      if (isNumber(args[0])) {
        chars = lowercaseLettersAndNumbers;
        minLength = args[0];
        maxLength = args[1];
      } else {
        chars = args[0];
        minLength = maxLength = args[1];
      }
      break;

    case 3:
      chars = args[0];
      minLength = args[1];
      maxLength = args[2];
      break;

    default:
      throw new ExError(
        'Invalid arguments for `randomString(...)`. See documentation.',
        { args },
      );
  }

  let result = '';
  const length =
    minLength == maxLength ? minLength : randomIntBetween(minLength, maxLength);

  for (let i = 0; i < length; i++) {
    result += randomChar(chars);
  }
  return result;
}
