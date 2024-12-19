
const replaceCharsRegexCache = {} as ObjectMap<RegExp>;

/**
 * Given a source string and string of characters, replace any one of the characters in the source string
 * with the entire replacement string.
 */
export function replaceChars(
  source: string,
  chars: string,
  replacement: string,
) {
  const regex =
    replaceCharsRegexCache[chars] ||
    (replaceCharsRegexCache[chars] = new RegExp(`[${chars}]`, 'g'));
  return source.replaceAll(regex, replacement);
}
