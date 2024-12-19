import { toObjectMap } from './toObjectMap';

/**
 * Replaces a string based on a regex with groups supporting group substitution (backreferences, $1, $2, etc.)
 * within the replacement string.
 */
export function regexReplaceWithBackreferences(source: string, regex: RegExp, replacement?: string): string {

  const replacer = replacement === undefined
    ? backReferenceReplacerWithDefaults
    : backReferenceReplacerWithReplacement;

  return source.replace(regex, replacer);

  function backReferenceReplacerWithReplacement(_found: string, ...backrefs: string[]): string {
    const backrefLookup = toObjectMap(
      backrefs,
      (_, index) => (index + 1).toString()
    );

    return replacement!.replace(/\$(\d+)/g, backReferenceLookupReplacer);

    function backReferenceLookupReplacer(_backref: string, index: string) {
      return backrefLookup[ index ] ?? '';
    }
  }
}

function backReferenceReplacerWithDefaults(
  _found: string,
  backrefs: string
): string {
  return backrefs;
}
