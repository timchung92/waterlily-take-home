import { mapFirst } from '@shared';
import { expect, test } from 'vitest';

test('Second of three', () => {

  const itemsMapped = [] as string[];
  const items = [ 'a', 'b', 'c' ];
  const actual = mapFirst(
    items,
    item => {
      itemsMapped.push(item);
      return item === 'b' ? 2 : null;
    });

  expect(actual).toBe(2);
  expect(itemsMapped).toEqual([ 'a', 'b' ]);
});