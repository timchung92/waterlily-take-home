import { ExError } from './ExError';

export function firstValidNumber(...maybeNumbers: (number | unknown)[]): number {
  const num = maybeNumbers.find(maybeNumber =>
    isFinite(maybeNumber as number),
  ) as number | undefined;
  if (num !== undefined) {
    return num;
  }

  throw new ExError(
    'No numbers found in inputs.',
    {
      maybeNumbers
    }
  );
}
