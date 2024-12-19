import { isNullOrUndefined } from './isNullOrUndefined';

export function formatInteger(value: number | null): string {
  if (isNullOrUndefined(value)) {
    return '';
  }

  return Math.round(value).toString();
}
