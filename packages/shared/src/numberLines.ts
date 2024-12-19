/**
 * Given an array of strings, return a new array with each string prefixed by the one-based
 * index of that string in the array, unless there is only one line in which no prefix
 * is applied.
 */
export function numberLines(strings: string[]) {
  return strings.length <= 1
    ? strings
    : strings.map((s, i) => `${i + 1}> ${s}`);
}
