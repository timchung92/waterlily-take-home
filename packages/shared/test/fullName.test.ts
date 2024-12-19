import { fullName } from '@shared';
import { expect, test } from 'vitest';

test('takes two strings and compose a full name', () => {
  const expected = 'John Doe';

  const actual = fullName('John', 'Doe');

  expect(actual).toEqual(expected);
});

test('takes undefined first name and returns only the second name', () => {
  const expected = 'Doe';

  const actual = fullName(undefined, 'Doe');

  expect(actual).toEqual(expected);
});

test('takes undefined last name and returns only the first name', () => {
  const expected = 'John';

  const actual = fullName('John', undefined);

  expect(actual).toEqual(expected);
});

test('takes null first name and returns only the second name', () => {
  const expected = 'Doe';

  const actual = fullName('', 'Doe');

  expect(actual).toEqual(expected);
});

test('takes undefined last name and returns only the first name', () => {
  const expected = 'John';

  const actual = fullName('John', '');

  expect(actual).toEqual(expected);
});
