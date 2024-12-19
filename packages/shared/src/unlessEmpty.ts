import { isNullOrUndefined } from './isNullOrUndefined';
import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

/**
 * Template formatter that returns the formatted string if the interpolated values have content
 * but returns an empty string if the interpolated values are all empty, null, or undefined.
 */
export function unlessEmpty(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  return values.length === 0 || values.every(isNullUndefinedOrEmpty)
    ? ''
    : String.raw(
      strings,
      ...(
        values.map(
          value => isNullOrUndefined(value) ? '' : value
        )
      )
    );
}
