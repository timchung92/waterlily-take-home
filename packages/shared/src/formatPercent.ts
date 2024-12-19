import { formatThousands } from '.';
import { isNullOrUndefined } from './isNullOrUndefined';

export function formatPercent(
  value: number | undefined | null,
  roundToNearestDecimalPlace: number = 4,
) {
  if (isNullOrUndefined(value)) {
    return '';
  }
  // value is a number between 0 and 1
  // Multiply by 100 to get percentage
  const roundedNumber = Number(
    (value * 100).toFixed(roundToNearestDecimalPlace),
  );

  // Remove trailing zeros
  const roundedString = roundedNumber.toFixed(roundToNearestDecimalPlace);
  return (
    formatThousands(parseFloat(roundedString), '', roundToNearestDecimalPlace) +
    '%'
  );
}
