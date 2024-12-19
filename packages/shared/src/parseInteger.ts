import { isDefined } from '.';

export function parseInteger(value: string | null | undefined) {
  return isDefined(value) && /^\d+$/.test(value)
    ? Number.parseInt(value)
    : null;
}
