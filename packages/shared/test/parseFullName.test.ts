import { parseFullName } from '@shared';
import { expect, test } from 'vitest';

test('takes two strings and composes the full name array', () => {
  const expected = ['John', 'Doe'];
  const actual = parseFullName('John', 'Doe');
  expect(actual).toEqual(expected);
});

test('takes undefined first name and composes the full name array', () => {
  const expected = ['', 'Doe'];
  const actual = parseFullName(undefined, 'Doe');
  expect(actual).toEqual(expected);
});

test('takes undefined last name and composes the full name array', () => {
  const expected = ['John', ''];
  const actual = parseFullName('John', undefined);
  expect(actual).toEqual(expected);
});

test('takes null first name and composes the full name array', () => {
  const expected = ['', 'Doe'];
  const actual = parseFullName('', 'Doe');
  expect(actual).toEqual(expected);
});

test('takes undefined last name and composes the full name array', () => {
  const expected = ['John', ''];
  const actual = parseFullName('John', '');
  expect(actual).toEqual(expected);
});
