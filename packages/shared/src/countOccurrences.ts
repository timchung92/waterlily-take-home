import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

export function countOccurrences(source: string | undefined | null, countText: string) {
  if (isNullUndefinedOrEmpty(source)) {
    return 0;
  }
  if (isNullUndefinedOrEmpty(countText)) {
    return source.length;
  }

  let count = 0;

  for (let i = -2; i < source.length; i++) {
    i = source.indexOf(countText, i);
    if (i === -1) {
      return count;
    }
    count++;
  }

  return count;
}