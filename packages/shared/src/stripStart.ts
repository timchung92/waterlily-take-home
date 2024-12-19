/**
 * Strips the start of a string if it starts with the specified substring.
 */
export function stripStart(text: string, substringToStrip: string): string {
  return text?.startsWith(substringToStrip) && text.length
    ? text.substring(substringToStrip.length)
    : text;
}
