import { isNullOrUndefined } from '.';

/**
 * Returns the start of the string through and including the search string, or the whole
 * string if the search string was not found.
 */
export function stripAfter(text: string, substringToKeep: string): string {
  const index = text?.indexOf(substringToKeep);
  return isNullOrUndefined(index) || index === -1
    ? text
    : text.substring(0, index + substringToKeep.length);
}
