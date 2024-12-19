import { ExError } from './ExError';
import { fastMaybeParseDateString } from './fastMaybeParseDateString';
import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

/**
 * Wrapper for JSON.parse() that deserializes dates when strings match
 * ISO date format and provides some improved error messaging.
 */
export function jsonParseBetter<T = unknown>(json: string | null | undefined): T | null {

  if (isNullUndefinedOrEmpty(json)) {
    return null;
  }

  try {
    return JSON.parse(json, jsonParseBetterReviver);
  } catch (ex: unknown) {
    //
    // All JSON error messages, from v8 source:
    // https://github.com/v8/v8/blob/1db97e57290873fbe50b6115ea38f7ef2ee1854c/src/common/message-template.h#L507
    //
    //  Unexpected end of JSON input
    //  Unexpected number in JSON at position % (line % column %)
    //  Unexpected string in JSON at position % (line % column %)
    //  Unterminated string in JSON at position % (line % column %)
    //  Expected property name or '}' in JSON at position % (line % column %)
    //  Expected ',' or ']' after array element in JSON at position % (line % " "column %)
    //  Expected ',' or '}' after property value in JSON at position " "% (line % column %)
    //  Expected double-quoted property name in JSON at position % (line % " "column %)
    //  Exponent part is missing a number in JSON at position % (line % column " "%)
    //  Expected ':' after property name in JSON at position % (line % column " "%)
    //  Unterminated fractional number in JSON at position % (line % column %)
    //  Unexpected non-whitespace character after JSON at position " "% (line % column %)
    //  Bad escaped character in JSON at position % (line % column %)
    //  Bad control character in string literal in JSON at position % (line % " "column %)
    //  Bad Unicode escape in JSON at position % (line % column %)
    //  No number after minus sign in JSON at position % (line % column %)
    //  \"%\" is not valid JSON
    //  Unexpected token '%', \"%\" is not valid JSON
    //  Unexpected token '%', ...\"%\"... is not valid JSON
    //  Unexpected token '%', ...\"%\" is not valid JSON
    //  Unexpected token '%', \"%\"... is not valid JSON

    const metadata: ObjectMap<unknown> = {
      jsonLength: json.length,
      jsonStart: json.substring(0, 15),
      jsonEnd: json.substring(json.length - 15),
    };

    const posMatch = ex instanceof Error
      ? ex.message.match(/JSON at position (\d+)/)
      : undefined;

    if (posMatch) {
      const pos = Number.parseInt(posMatch[ 1 ]);

      const jsonAtPos = json.substring(pos, pos + 1);
      const jsonBefore = json.substring(pos - 15, pos);
      const jsonAfter = json.substring(pos + 1, pos + 15);

      Object.assign(
        metadata,
        {
          errorPos: pos,
          jsonAroundPos: `${ jsonBefore } >>> ${ jsonAtPos } <<< ${ jsonAfter }`,
          jsonAtPos,
          jsonBefore,
          jsonAfter,
        }
      );
    }

    throw new ExError('Error parsing JSON.', metadata, ex);
  }
}

function jsonParseBetterReviver(_key: string | number, value: unknown): any {
  return fastMaybeParseDateString(value);
}
