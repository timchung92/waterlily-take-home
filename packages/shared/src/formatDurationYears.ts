const oneDecimalFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  useGrouping: false,
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatDurationYears(years: number): string {
  return oneDecimalFormatter.format(years);
}
