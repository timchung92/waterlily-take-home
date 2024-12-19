import { compareKeys } from './compareKeys';
import { ExError } from './ExError';

export function assertSameKeys<T extends {}>(
  expected: T,
  actual: T,
  staticMessage: string = "Key mismatch; some keys are missing and/or some were unexpected.",
  extraMetadata: ObjectMap<unknown> = {}
) {
  const comparison = compareKeys(expected, actual);
  if (comparison.missing.length === 0 && comparison.extra.length === 0) {
    return;
  }

  throw new ExError(
    staticMessage,
    {
      ...extraMetadata,
      ...comparison,
    }
  );
}
