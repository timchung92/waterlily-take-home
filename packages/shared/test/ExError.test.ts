import { test, expect } from "vitest";
import { ExError } from "@shared";

test('toLogString', function completeCrazyTest() {
  let lastEx: ExError;

  try {
    try {
      try {
        try {
          try {
            throw 'This is just a string error';
          } catch (ex) {
            throw new Error('Rethrowing string error as Error', { cause: ex });
          }
        } catch (ex) {
          throw new ExError('Error #3 as ExError', { depth: 5 }, ex);
        }
      } catch (ex) {
        throw new Error('Error #4, rethrow ExError as Error', { cause: ex });
      }
    } catch (ex) {
      throw new ExError('Error #5 as ExError', { depth: 3, a: 'A' }, ex);
    }
  } catch (ex) {
    lastEx = new ExError(
      'ExError #6',
      {
        depth: 2,
        a: 'A2',
        b: 'B',
        nesting: [
          {
            c: {
              d: {
                e: 'E',
              },
            },
          },
          ['One', 'Two', 'Three', 'Four', 'Five'],
        ],
      },
      ex,
    );
  }

  const expectedSummary = `1> string: This is just a string error
2> Error: Rethrowing string error as Error
3> ExError: Error #3 as ExError
4> Error: Error #4, rethrow ExError as Error
5> ExError: Error #5 as ExError
6> ExError: ExError #6
`;
  const expectedMetadata = `  depth: 5
  depth_5: 3
  a: A
  depth_6: 2
  a_6: A2
  b: B
  nesting:
    - c: {}
    - - One
      - Two
      - Three
      - Four
`;

  const actual = lastEx.toString();

  expect(actual).toContain(expectedSummary);
  expectedMetadata.split('\n').forEach(expectedMetadataLine => {
    expect(actual).toContain(expectedMetadataLine);
  });
});
