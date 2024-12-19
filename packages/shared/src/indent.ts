/**
 * Adds specified indentation (spaces) to the start of each line. Blank lines
 * do not get indentation.
 */
export function indent(source: string[], indentation?: number): string[]
export function indent(source: string, indentation?: number): string;
export function indent(source: string[] | string, indentation = 2) {
  let sourceLines: string[];
  let sourceTypeIsArray: boolean;

  if (Array.isArray(source)) {
    sourceLines = source;
    sourceTypeIsArray = true;
  } else {
    sourceLines = source.split('\n');
    sourceTypeIsArray = false;
  }
  const spaces = ' '.repeat(indentation);
  const result = sourceLines.map(
    line =>
      line.length === 0
        ? ''
        : spaces + line
  );

  return sourceTypeIsArray ? result : result.join('\n');
}