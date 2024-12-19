import { isRealNumber } from '.';

export interface FixedNumberValidator {
  (value: unknown): boolean;
}

const fixedNumberValidators = {} as Record<string, FixedNumberValidator>;

export function createFixedNumberValidator(decimalPlaces: number, allowNulls: boolean = false): FixedNumberValidator {
  const multiplier = Math.pow(10, decimalPlaces);
  const key = `${ decimalPlaces } ${ allowNulls }`;

  return fixedNumberValidators[ key ] ??
    (fixedNumberValidators[ key ] = fixedNumberValidatorImpl);

  function fixedNumberValidatorImpl(value: unknown): boolean {
    if (value === null) {
      return allowNulls;
    }

    if (!isRealNumber(value)) {
      return false;
    }

    return Math.round(value * multiplier) / multiplier === value;
  }
}
