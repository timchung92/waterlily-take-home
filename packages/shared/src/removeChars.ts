import { replaceChars } from './replaceChars';

/**
 * Given a source string and string of characters, remove any of the characters in the source string.
 *
 * Alias for `replaceChars(source, chars, '')`.
 */
export function removeChars(source: string, chars: string): string {
  return replaceChars(source, chars, '');
}
