import { expect, test } from 'vitest';

import { splitOnCaseWords } from '@shared';

test('Simple word', () => {
  const actual = splitOnCaseWords('thisIsATest');
  const expected = [
    'this',
    'Is',
    'A',
    'Test'
  ];
  expect(actual).toEqual(expected);
});
