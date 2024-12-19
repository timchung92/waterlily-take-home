export function camelToCapitalized(str: string): string {
  // Split the string at uppercase letters and lowercase the whole thing
  const words = str.split(/(?=[A-Z])/).map(word => word.toLowerCase());

  // Capitalize first letter of each word and join with spaces
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
