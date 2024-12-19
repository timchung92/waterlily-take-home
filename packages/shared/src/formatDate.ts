import { format } from "date-fns";

export function formatDate(date: Date): string {
  return format(
    new Date(
      date.valueOf() + date.getTimezoneOffset() * 60 * 1000
    ),
    'MMM d, yyyy'
  );
}
