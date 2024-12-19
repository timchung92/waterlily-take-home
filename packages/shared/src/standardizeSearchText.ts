import { nonLatinLettersRegex } from './constants';

export function standardizeSearchText(...text: string[]) {
  return text.join('').replace(nonLatinLettersRegex, '').toLocaleLowerCase();
}
