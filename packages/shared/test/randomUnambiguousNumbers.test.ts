import { describe, expect, test } from 'vitest';

import { randomUnambiguousNumbers } from '@shared';
import { mockRandom } from './testUtils';

describe('randomUnambiguousNumbers', () => {
  test('pre-calculated string', () => {
    mockRandom(
      // 3479
      0, // 3
      2 / 3, // 7
    );

    const actual = randomUnambiguousNumbers(2);

    expect(actual).toBe('37');
  });
});
