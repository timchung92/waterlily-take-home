import { format } from 'date-fns';

export function formatDateTimeForFilePath(dateTime: Date = new Date()): string {
  return format(dateTime, "yyyy-MM-dd-'T'-HH-mm-ss-SSS"); // ex. '2023-12-03-T-22-48-21-253'
}
