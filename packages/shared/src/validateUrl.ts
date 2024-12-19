export function isValidUrl(url: string): boolean {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // optional scheme (http or https)
      '((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})' + // domain name
      '|(([0-9]{1,3}\\.){3}[0-9]{1,3}))' + // OR IPv4 address
      '(\\:[0-9]{1,5})?' + // optional port
      '(\\/[-a-zA-Z0-9%_.~+]*)*' + // path
      '(\\?[;&a-zA-Z0-9%_.~+=-]*)?' + // query string
      '(\\#[-a-zA-Z0-9_]*)?$', // fragment identifier
    'i',
  );
  return !!urlPattern.test(url);
}

export function addHttpsIfNoScheme(url: string): string {
  // Regular expression to check if the URL already has a scheme (http or https)
  const schemePattern = /^(https?:\/\/)/i;

  // If the URL already has a scheme, return it as is
  if (schemePattern.test(url)) {
    return url;
  }

  // Otherwise, add https:// at the beginning
  return `https://${url}`;
}
