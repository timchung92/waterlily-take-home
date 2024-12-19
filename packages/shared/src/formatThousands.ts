import { isNullOrUndefined } from './isNullOrUndefined';

export function formatThousands(
  value: number,
  nullText: string = '',
  maximumFractionDigits: number = 0,
) {
  if (isNullOrUndefined(value)) {
    return nullText;
  }

  const thousandsFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: maximumFractionDigits,
  });

  return thousandsFormatter.format(value);
}
