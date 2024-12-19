import { ExError } from './ExError';
import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';
import { regexExtractCaptures } from './regexExtractCaptures';

const parseWeightRegex = /^(\d+)' ?(\d+)"$/g;

export function parseHeight(heightText: string | null | undefined) {
  if (isNullUndefinedOrEmpty(heightText)) {
    return undefined;
  }

  const parts = regexExtractCaptures(heightText, parseWeightRegex);
  if (parts !== null) {
    return Number.parseInt(parts[0]) * 12 + Number.parseInt(parts[1]);
  }

  throw new ExError('Unable to convert text to height in inches.', {
    heightText,
    parseHeightRegex: String(parseWeightRegex),
  });
}
