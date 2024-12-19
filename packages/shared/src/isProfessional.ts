import { isNumber } from 'lodash';
import { SupportProviderType } from './appModel';

export function isProfessional(supportProviderType: SupportProviderType): boolean;
export function isProfessional(supportProvider: SupportProvider): boolean;
export function isProfessional(supportProviderOrType: SupportProvider | SupportProviderType): boolean {

  const supportProviderType = isNumber(supportProviderOrType)
    ? supportProviderOrType
    : supportProviderOrType.supportProviderType;

  return supportProviderType === SupportProviderType.professional;
}
