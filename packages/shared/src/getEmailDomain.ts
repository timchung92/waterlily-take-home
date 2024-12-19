export function getDomainFromEmail(email: string): string | null {
  const emailParts = email.split('@');

  if (emailParts.length === 2 && emailParts[1].length > 0) {
    return emailParts[1];
  }

  return null;
}
