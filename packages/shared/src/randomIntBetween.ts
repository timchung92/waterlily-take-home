/**
 * Returns a random integer between min and max, inclusive of max.
 */
export function randomIntBetween(min: number, max: number): number {
  if (min > max) {
    const i = min;
    max = min;
    min = i;
  }

  min = Math.ceil(min);
  max = Math.floor(max);

  const range = max - min + 1;
  const rand = Math.random();
  const choice = Math.floor(rand * range) + min;

  // in the very rare case that `rand` is exactly 1,
  // the selected value can end up to be bigger than `max`,
  // so protect agaisnt that.
  return Math.min(choice, max);
}
