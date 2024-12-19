declare interface SupportProviderSet {
  supportProviderDetailSetId: string;
  supportProviderDetailSetSource: SupportProviderDetailSetSource;
  clientId: string;
  removeFamilyBurden: boolean;

  supportProviders: SupportProvider[];
}
