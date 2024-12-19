import { compareArrays } from './compareArrays';

export type ObjectComparisonResult<T> = {
  expected: T;
  actual: T;
  missing: string[];
  extra: string[];
}

export function compareKeys<T extends {}>(expected: T, actual: T): ObjectComparisonResult<T> {
  const arrayComparison = compareArrays(Object.keys(expected), Object.keys(actual));
  return {
    ...arrayComparison,
    expected,
    actual,
  };
}
