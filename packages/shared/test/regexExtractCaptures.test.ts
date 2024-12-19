import {
  RegexExtractCapturesResult,
  regexExtractCaptures,
} from '@shared';
import { expect, test } from 'vitest';

const testText = 'text 1, text 2, text 3';
const testRegex = /(\w+) (\d)/;

function doTest(resultType: RegexExtractCapturesResult, expected: string | string[] | string[][]) {
  test(
    `${ RegexExtractCapturesResult[ resultType ] }`,
    () => {
      const actual = regexExtractCaptures(
        testText,
        testRegex,
        resultType
      );
      expect(actual).toEqual(expected);
    }
  );
}

doTest(RegexExtractCapturesResult.singleFromOne, 'text');
doTest(RegexExtractCapturesResult.manyFromOne, [ 'text', '1', 'text', '2', 'text', '3' ]);
doTest(RegexExtractCapturesResult.singleFromMany, [ 'text', 'text', 'text' ]);
doTest(RegexExtractCapturesResult.manyFromMany, [ [ 'text', '1' ], [ 'text', '2' ], [ 'text', '3' ] ]);
doTest(RegexExtractCapturesResult.flattenedFromMany, [ 'text', '1', 'text', '2', 'text', '3' ]);

test('null', () => {
  const actual = regexExtractCaptures(testText, /nope/);
  expect(actual).toBeNull();
});

test('RegExp already global', () => {
  const actual = regexExtractCaptures(
    testText,
    / (\d)(,)/g,
    RegexExtractCapturesResult.manyFromMany,
  );
  const expected = [
    ['1', ','],
    ['2', ','],
  ];
  expect(actual).toEqual(expected);
});
