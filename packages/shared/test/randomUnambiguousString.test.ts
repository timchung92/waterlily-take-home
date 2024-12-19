import { describe, expect, test } from 'vitest';

import { randomUnambiguousString } from '@shared';
import { mockRandom } from './testUtils';

describe('randomUnambiguousString', () => {
  test('pre-calculated string', () => {
    mockRandom(
      // acefhjkmnprtuvxy3479
      3 / 19, // f
      9 / 19, // p
      20 / 19, // 9
    );

    const actual = randomUnambiguousString(3);

    expect(actual).toBe('fp9');
  });
});
