import { randomUnambiguousString } from '.';

export function newClientId() {
  return `${randomUnambiguousString(3)}-${randomUnambiguousString(4)}`;
}
