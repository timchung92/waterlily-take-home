import { randomIntBetween } from './randomIntBetween';

/**
 * Returns a random integer between zero and max, inclusive of max.
 */
export function randomInt(max: number): number {
  return randomIntBetween(0, max);
}
