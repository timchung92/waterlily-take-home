import { describe, expect, test } from 'vitest';

import { mockRandom } from './testUtils';
import { randomItem } from '@shared';

describe('randomItem()', () => {
  test('randomItem() - zero length', () => {
    const actual = randomItem([]);
    expect(actual).toBeUndefined();
  });

  test('randomItem() - single item array', () => {
    const actual = randomItem(['found']);
    expect(actual).toBe('found');
  });

  test('randomItem() - two pick first', () => {
    mockRandom(0.2);
    const actual = randomItem(['first', 'second']);
    expect(actual).toBe('first');
  });

  test('randomItem() - two pick second', () => {
    mockRandom(0.6);
    const actual = randomItem(['first', 'second']);
    expect(actual).toBe('second');
  });

  test('randomItem() - three pick first', () => {
    mockRandom(0.2);
    const actual = randomItem(['first', 'second', 'third']);
    expect(actual).toBe('first');
  });

  test('randomItem() - three pick second', () => {
    mockRandom(0.4);
    const actual = randomItem(['first', 'second', 'third']);
    expect(actual).toBe('second');
  });

  test('randomItem() - three pick third', () => {
    mockRandom(0.8);
    const actual = randomItem(['first', 'second', 'third']);
    expect(actual).toBe('third');
  });
});
