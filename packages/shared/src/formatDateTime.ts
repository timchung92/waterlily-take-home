import { format } from 'date-fns';

const onlyDateEnding = ' at 12:00 AM';
const onlyDateEndingLength = onlyDateEnding.length;

export function formatDateTime(dateTime: Date): string {
  const formatted = format(dateTime, "MMM d, yyyy 'at' h:mm aa");
  if (formatted.endsWith(' at 12:00 AM') && dateTime.getSeconds() === 0) {
    // it's really a date, not date time, so return only date portion
    return formatted.substring(0, formatted.length - onlyDateEndingLength);
  }
  return formatted;
}
