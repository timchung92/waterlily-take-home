import { isRealNumber } from '.';

export function toStars(count: number): string;
export function toStars(text: string, realLetterCount?: number): string;
export function toStars(textOrLength: string | number, realCount: number = 0) {

  if (isRealNumber(textOrLength)) {
    return '*'.repeat(textOrLength);
  }

  const { length } = textOrLength;
  if (realCount === 0 || realCount >= length) {
    return '*'.repeat(length);
  }

  const starCount = length - realCount;
  const startRealCount = Math.ceil(realCount / 2);
  const endRealCount = realCount - startRealCount;

  return [
    textOrLength.substring(0, startRealCount),
    '*'.repeat(starCount),
    textOrLength.substring(length - endRealCount - 1)
  ].join('');
}
