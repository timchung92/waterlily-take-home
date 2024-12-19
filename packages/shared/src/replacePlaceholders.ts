import { escapeRegExp } from 'lodash';

export function replacePlaceholers(
  text: string,
  placeholders: ObjectMap<unknown>,
  markerPrefix = '$',
  markerSuffix = '',
) {
  const placeholderKeysAsPattern = Object.keys(placeholders)
    .map(escapeRegExp)
    .join('|');

  const placeholderRegExp = new RegExp(
    `${escapeRegExp(markerPrefix)}(${placeholderKeysAsPattern})\\b${escapeRegExp(markerSuffix)}`,
    'g',
  );
  return text.replaceAll(placeholderRegExp, replaceOnePlaceholder);

  function replaceOnePlaceholder(_: string, placeholder: string) {
    return String(placeholders[placeholder] ?? '');
  }
}
