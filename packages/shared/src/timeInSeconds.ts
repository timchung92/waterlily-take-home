import { secondsPerHour, secondsPerMinute } from './constants';

export function timeInSeconds(date?: Date): number {
  const d = date ?? new Date();
  return d.getSeconds() +
    d.getMinutes() * secondsPerMinute +
    d.getHours() * secondsPerHour;
}
