import { expect, test } from 'vitest';
import { clonePlus } from '@shared';

test('deep with nested objects, array, and date', () => {
  const source = {
    a: 'A',
    n1: {
      n2: {
        b: 'B',
      },
      array: [
        1,
        2,
        3,
      ],
      date: new Date()
    }
  };

  const actual = clonePlus(source, { isDeep: true });
  expect(actual).toBeDefined();
  expect(actual).not.toBe(source);
  expect(actual).toEqual(source);
  expect(actual.n1).not.toBe(source.n1);
  expect(actual.n1.n2).not.toBe(source.n1.n2);
  expect(actual.n1.array).not.toBe(source.n1.array);
  expect(actual.n1.date).not.toBe(source.n1.date);
});

test('shallow (not deep, default) with nested objects, array, and date', () => {
  const source = {
    a: 'A',
    n1: {
      n2: {
        b: 'B',
      },
      array: [1, 2, 3],
      date: new Date(),
    },
  };

  const actual = clonePlus(source);
  expect(actual).toBeDefined();
  expect(actual).not.toBe(source);
  expect(actual).toEqual(source);
  expect(actual.n1).toBe(source.n1);
  expect(actual.n1.n2).toBe(source.n1.n2);
  expect(actual.n1.array).toBe(source.n1.array);
  expect(actual.n1.date).toBe(source.n1.date);
  expect(Object.prototype.toString.call(actual.n1.date)).toBe('[object Date]');
});

test('maxArrayLength top-level limiting to 3 items', () => {
  const source = [ 1, 2, 3, 4, 5, 6 ];
  const actual = clonePlus(source, { maxArrayLength: 3 });
  expect(actual).toEqual([ 1, 2, 3, ]);
});

test('maxArrayLength top-level when count is less than max', () => {
  const source = [1, 2, ];
  const actual = clonePlus(source, { maxArrayLength: 3 });
  expect(actual).toEqual([1, 2, ]);
});

test('maxArrayLength with deep nested arrays', () => {
  const source = [
    [ 1, 2, 3, 4, 5, ],
    [
      [ 6, 7, 8, 9, ]
    ],
    [ 10, ],
    []
  ];

  const expected = [
    [ 1, 2, 3, ],
    [
      [ 6, 7, 8, ]
    ],
    [ 10, ],
  ];

  const actual = clonePlus(
    source,
    {
      isDeep: true,
      maxArrayLength: 3
    }
  );

  expect(actual).toEqual(expected);
});

test('maxDepth 2', () => {

  const source = {
    a: {
      b: {
        c: 'C',
      },
      d: {
        e: {
          f: 'F',
        }
      },
      g: 'G'
    },
    h: 'H'
  };

  const expected = {
    a: {
      b: {},
      d: {},
      g: 'G',
    },
    h: 'H',
  };

  const actual = clonePlus(source, { isDeep: true, maxDepth: 2 });
  expect(actual).toBeDefined();
  expect(actual).not.toBe(source);
  expect(actual).toEqual(expected);
  expect(actual.a).not.toBe(source.a);
  expect(actual.a.d).not.toBe(source.a.d);
});

