import { describe, expect, test } from 'vitest';

import { randomString } from '@shared';
import { mockRandom } from './testUtils';

describe('randomString', () => {
  test('by length', () => {
    mockRandom(0.2, 0.47, 0.98);
    const actual = randomString(3);
    expect(actual).toBe('hq9');
  });

  test('by length with custom character set', () => {
    mockRandom(0.6);
    const actual = randomString('abcdef', 1);
    expect(actual).toBe('d');
  });

  test('by length range', () => {
    mockRandom(0.8, 0.2, 0.47, 0.98, 0, 0.97);
    const actual = randomString(2, 5);
    expect(actual).toBe('hq9a8');
  });

  test('custom character set and random range', () => {
    mockRandom(0.3, 0.3, 0.8);
    const actual = randomString('abcdef', 1, 4);
    expect(actual).toBe('be');
  });
});
