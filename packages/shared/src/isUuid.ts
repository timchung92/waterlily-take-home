import { validate } from 'uuid';

export function isUuid(text: string | unknown) {
  // this function only exists to make usage clearer since 'validate' is not
  // clearly related to uuid.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return  validate(text as string) || uuidRegex.test(text as string);
}
