import { isNumber } from 'lodash';
import { SupportProviderType } from './appModel';

export const familySupportProviderTypes = new Set([
  SupportProviderType.spouse,
  SupportProviderType.child,
  SupportProviderType.other
]);

export function isFamily(supportProviderType: SupportProviderType): boolean;
export function isFamily(supportProvider: SupportProvider): boolean;
export function isFamily(supportProviderOrType: SupportProvider | SupportProviderType): boolean {

  const supportProviderType = isNumber(supportProviderOrType)
    ? supportProviderOrType
    : supportProviderOrType.supportProviderType;

  return familySupportProviderTypes.has(supportProviderType);
}
