import { describe, expect, test } from 'vitest';

import { numbers } from '@shared';
import { randomChar } from '@shared';
import { mockRandom } from './testUtils';

describe('randomChar', () => {
  test('no arguments', () => {
    mockRandom(0.5);
    const actual = randomChar();
    expect(actual).toBe('r');
  });

  test('empty args'),
    () => {
      mockRandom(0.3);
      const actual = randomChar('');
      expect(actual).toBe('l');
    };

  test('number'),
    () => {
      mockRandom(0.7);
      const actual = randomChar(numbers);
      expect(actual).toBe('7');
    };
});
