import { describe, expect, test } from 'vitest';

import { randomInt } from '@shared';
import { mockRandom } from './testUtils';

describe('randomInt', () => {
  test('Simple test', () => {
    mockRandom(0.3);
    const actual = randomInt(9);
    expect(actual).toBe(3);
  });
});
