import { ParseableToFullName, parseFullName } from './parseFullName';

/**
 * Given an object with one of the first/last name fields supported or two strings of first and last names, returns the
 * names concatenated together. Handles either or both of the names missing.
 */
export function fullName(_: null): string;
export function fullName(advisor: Advisor): string;
export function fullName(client: Client): string;
export function fullName(session: Session): string;
export function fullName(survey: Survey): string;
export function fullName(
  firstName: string | undefined,
  lastName: string | undefined,
): string;
export function fullName(...args: ParseableToFullName): string {
  const [firstName, lastName] = parseFullName(...args);
  return !firstName
    ? lastName ?? ''
    : !lastName
      ? firstName ?? ''
      : `${firstName} ${lastName}`;
}


