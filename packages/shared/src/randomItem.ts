import { randomInt } from './randomInt';

/**
 * Returns one random item from the array.
 */
export function randomItem<T>(array: T[]): T | undefined {
  switch (array.length) {
    case 0:
      return undefined;

    case 1:
      return array[0];

    default:
      const index = randomInt(array.length - 1);
      return array[index];
  }
}
