import { isNullOrUndefined } from './isNullOrUndefined';

export function formatCurrency(
  value: number | undefined | null,
  minimumFractionDigits: number = 0,
) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });

  if (isNullOrUndefined(value)) {
    return '';
  }

  return currencyFormatter.format(value);
}
