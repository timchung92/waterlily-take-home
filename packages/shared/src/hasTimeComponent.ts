export function hasTimeComponent(date: Date): boolean {
  return (
    date.getMinutes() !== 0 ||
    date.getHours() !== 0 ||
    date.getSeconds() !== 0 ||
    date.getMilliseconds() !== 0
  );
}
