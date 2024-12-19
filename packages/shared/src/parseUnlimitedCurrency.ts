import { isNullOrUndefined } from './isNullOrUndefined';

export function parseUnlimitedCurrency(value: string): number | null {
  return value === 'Unlimited' || isNullOrUndefined(value)
    ? null
    : Number.parseFloat(value);
}
