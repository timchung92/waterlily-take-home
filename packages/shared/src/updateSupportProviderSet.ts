import { SupportProviderDetailSetSource } from './appModel';
import { hasValue } from './hasValue';
import { newUuid } from './newUuid';

export function updateSupportProviderSet(
  supportProviderSet: SupportProviderSet,
  editedSupportProvider?: SupportProvider,
  isAdd?: boolean
) {

  const supportProviderDetailSetId = newUuid();

  const supportProviders: SupportProvider[] = supportProviderSet.supportProviders.map(
    supportProvider => {
      const newSupportProvider = supportProvider.supportProviderId === editedSupportProvider?.supportProviderId
        ? editedSupportProvider
        : supportProvider;
      return {
        ...newSupportProvider,
        supportProviderDetailSetId
      }
    }
  );

  if (isAdd && hasValue(editedSupportProvider)) {
    supportProviders.push(
      {
        ...editedSupportProvider,
        supportProviderId: newUuid(),
        supportProviderDetailSetId,
      }
    );
  }

  const updated: SupportProviderSet = {
    ...supportProviderSet,
    supportProviderDetailSetId,
    supportProviderDetailSetSource: SupportProviderDetailSetSource.client,
    supportProviders,
  };

  return updated;
}
