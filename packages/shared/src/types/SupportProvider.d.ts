declare interface SupportProvider
  extends DbSupportProvider,
  DbSupportProviderDetail {

  supportProviderAllPhaseCareHours: number;
  supportProviderAppliedPhaseOneHours: number;
  supportProviderAppliedPhaseTwoHours: number;
  supportProviderAppliedPhaseThreeHours: number;
}

declare interface DbSupportProvider {
  supportProviderId: string;
  clientId: string;
  supportProviderName: string;
  supportProviderCareLevel: number;
  supportProviderType: SupportProviderType;
  supportProviderContribution: SupportProviderContribution;
}

declare interface DbSupportProviderDetail {
  supportProviderDetailId: string;
  supportProviderDetailSetId: string;
  supportProviderId: string;
  supportProviderPhaseOneHours: number;
  supportProviderPhaseTwoHours: number;
  supportProviderPhaseThreeHours: number;
  supportProviderRateHourly?: number;
  supportProviderRateMonthly?: number;
}
