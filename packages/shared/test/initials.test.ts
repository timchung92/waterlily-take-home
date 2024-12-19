import { initials } from "@shared";
import { expect, test } from "vitest";

test("takes two strings and compose the initials", () => {
  const expected = "JD";

  const actual = initials("John", "Doe");

  expect(actual).toEqual(expected);
});

test('takes undefined first name and returns only the second initial', () => {
  const expected = 'D';

  const actual = initials(undefined, 'Doe');

  expect(actual).toEqual(expected);
});

test('takes undefined last name and returns only the first initial', () => {
  const expected = 'J';

  const actual = initials('John', undefined);

  expect(actual).toEqual(expected);
});

test("takes null first name and returns only the second initial", () => {
  const expected = "D";

  const actual = initials("", "Doe");

  expect(actual).toEqual(expected);
});

test('takes undefined last name and returns only the first initial', () => {
  const expected = 'J';

  const actual = initials('John', '');

  expect(actual).toEqual(expected);
});
