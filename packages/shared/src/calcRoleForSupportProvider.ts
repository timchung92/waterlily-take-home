import { formatOrdinal } from '@shared';

export function calcRoleForSupportProvider(supportProvider: SupportProvider): string {
  const { supportProviderCareLevel } = supportProvider;

  switch (supportProviderCareLevel) {
    case 0:
      return 'CARE RECIPIENT';

    case 1:
      return 'PRIMARY CARE';

    default:
      return `${ formatOrdinal(supportProviderCareLevel).toUpperCase() } CARE SUPPORTER`;
  }
}
