import { describe, expect, test } from 'vitest';

import { randomIntBetween } from '@shared';
import { mockRandom } from './testUtils';

describe('randomIntBetween', () => {
  test('Between 1 and 10', () => {
    mockRandom(0.095);
    const actual = randomIntBetween(1, 10);
    expect(actual).toBe(1);
  });

  test('Between 3 and 7', () => {
    mockRandom(0.3);
    const actual = randomIntBetween(3, 7);
    expect(actual).toBe(4);
  });

  test('Between 0 and 0', () => {
    mockRandom(0.3);
    const actual = randomIntBetween(0, 0);
    expect(actual).toBe(0);
  });

  test('Between -5 and 4', () => {
    mockRandom(0.6);
    const actual = randomIntBetween(-5, 4);
    expect(actual).toBe(1);
  });
});
