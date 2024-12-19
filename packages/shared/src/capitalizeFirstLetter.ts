export function capitalizeFirstLetter(input: string): string {
  if (!input) return input;

  // Capitalize the first letter and lower case the rest of the string
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}
