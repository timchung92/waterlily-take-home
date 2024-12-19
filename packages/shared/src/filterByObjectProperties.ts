import { hasOwnProperty } from './hasOwnProperty';

export function filterArrayByObjectProperties<T>(array: string[], item: T)  {
  return array.filter(key => hasOwnProperty(item, key)) as (keyof T)[];
}
