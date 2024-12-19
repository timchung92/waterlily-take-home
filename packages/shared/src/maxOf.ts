import { identity } from 'lodash';
import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

export function maxOf(items: number[]): number;
export function maxOf<T>(items: T[], selector: (item: T) => number): number;
export function maxOf<T>(items: T[], selector: (item: T) => number, defaultValue: number): number;
export function maxOf<T>(
  items: T[],
  selector: (item: T) => number = identity,
  defaultValue: number = 0
) {
  if (isNullUndefinedOrEmpty(items)) {
    return defaultValue;
  }

  return items.reduce(
    (acc, item) => Math.max(acc, selector(item)),
    0
  );
}
