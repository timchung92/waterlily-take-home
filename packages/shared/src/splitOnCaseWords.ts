
const capitalLetterSplitter = /(?=[A-Z])/;

export function splitOnCaseWords(text: string) {
  return text.split(capitalLetterSplitter);
}
