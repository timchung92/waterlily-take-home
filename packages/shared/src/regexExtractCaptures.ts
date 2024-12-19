export enum RegexExtractCapturesResult {
  singleFromOne,
  manyFromOne,
  singleFromMany,
  manyFromMany,
  flattenedFromMany,
}

export type RegexExtractCapturesResultIsSingle = RegexExtractCapturesResult.singleFromOne;
export type RegexExtractCapturesResultIsFlatMany =
  | RegexExtractCapturesResult.singleFromMany
  | RegexExtractCapturesResult.manyFromOne
  | RegexExtractCapturesResult.flattenedFromMany;
export type RegexExtractCapturesResultIsNestedMany = RegexExtractCapturesResult.manyFromMany;

export function regexExtractCaptures(
  search: string,
  pattern: RegExp,
  resultType: RegexExtractCapturesResultIsSingle
): string | null;

export function regexExtractCaptures(
  search: string,
  pattern: RegExp,
  resultType?: RegexExtractCapturesResultIsFlatMany,
): string[] | null;

export function regexExtractCaptures(
  search: string,
  pattern: RegExp,
  resultType: RegexExtractCapturesResultIsNestedMany,
): string[][] | null;

export function regexExtractCaptures(
  search: string,
  pattern: RegExp,
  resultType: RegexExtractCapturesResult,
): string | string[] | string[][] | null;

export function regexExtractCaptures<T extends RegexExtractCapturesResult | undefined>(
  search: string,
  pattern: RegExp,
  resultType?: T,
): string | string[] | string[][] | null {
  const globalPattern = pattern.global
    ? pattern
    : new RegExp(pattern, `g${pattern.flags}`);

  const matches = [...search.matchAll(globalPattern)];
  if (matches.length === 0) {
    return null;
  }

  const nested = matches.map(
    ([_fullMatch, ...groupMatches]) => groupMatches,
  );

  return (
    resultType === RegexExtractCapturesResult.singleFromOne
      ? nested[0][0]
      : resultType === RegexExtractCapturesResult.manyFromMany
        ? nested
        : resultType === RegexExtractCapturesResult.singleFromMany
          ? nested.map(([firstOfEach]) => firstOfEach)
          : nested.flat()
  );
}
