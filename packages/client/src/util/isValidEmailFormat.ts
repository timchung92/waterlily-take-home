import * as EmailValidator from 'email-validator';

export function isValidEmailFormat(email: string): boolean {
  return EmailValidator.validate(email);
}
