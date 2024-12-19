export function calcFutureValue(
  principal: number,
  rate: number,
  periodYears: number,
): number {
  return principal * Math.pow(1 + rate, periodYears);
}
