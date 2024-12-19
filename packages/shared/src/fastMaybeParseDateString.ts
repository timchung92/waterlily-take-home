import { dateTimeRegex } from './constants';

/**
 * Given an unknown value, it returns a Date object if that value is an ISO-8601
 * date string, or the input value otherwise.
 *
 * Labeled "fast" because it's used in JSON parsing against every value and testing
 * showed this double-testing method is faster than directly parsing or other
 * preliminary checks.
 */
export function fastMaybeParseDateString<T>(value: T): T | Date {
  if (typeof value === 'string' && dateTimeRegex.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf)) {
      return date;
    }
  }

  return value;
}
