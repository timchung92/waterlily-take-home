export function maskEmail(email: string | undefined): string {
  if (!email) {
    return '';
  }
  // Split the email into username and domain
  const [username, domain] = email.split('@');

  // If the username has exactly 3 characters, mask the middle one
  if (username.length === 3) {
    return `${username.charAt(0)}*${username.charAt(2)}@${domain}`;
  }

  // For usernames longer than 3 characters, show only the first 50% of characters and mask the rest
  if (username.length > 3) {
    const visibleCount = Math.ceil(username.length / 2); // First 50% of the username, rounded up

    const maskedUsername =
      username.substring(0, visibleCount) +
      '*'.repeat(username.length - visibleCount);

    return `${maskedUsername}@${domain}`;
  }

  // For usernames shorter than 3 characters, handle as needed (no masking in this case)
  return `${username}@${domain}`;
}
