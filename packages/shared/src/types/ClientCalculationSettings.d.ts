declare type ClientCalculationSettings = {
  discountRate?: number | null;
  returnOnInvestmentCalculationType: ReturnOnInvestmentCalculationType;
};

declare type ClientCalculationSettingsDbRecord = {
  clientCalculationSettingsId: string;
  clientId: string;
  settingLabel: string;
  settingValue: string;
  settingType: string;
};
