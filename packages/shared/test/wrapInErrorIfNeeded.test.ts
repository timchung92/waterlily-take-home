import { expect, test } from 'vitest';
import { ExError, wrapInErrorIfNeeded } from '@shared';

test('Error is returned as is', () => {
  const expected = new Error('This is the error');
  const actual = wrapInErrorIfNeeded(expected);
  expect(actual).toBe(expected);
});

test('ExError is returned as is', () => {
  const expected = new ExError('This is the ex error', {});
  const actual = wrapInErrorIfNeeded(expected);
  expect(actual).toBe(expected);
});

test('String is wrapped', () => {
  const message = 'This is the error';
  const actual = wrapInErrorIfNeeded(message);
  expect(actual).not.toBe(message);
  expect(actual).toBeTypeOf('object');
  expect(actual.message).toBe(message);
  expect(actual).toBeInstanceOf(Error);
});

