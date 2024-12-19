declare type CostAndRatePeriod = {
  rateAmount: number;
  ratePeriod: string;
};

declare type CostAndRatePeriod = {
  rateAmount: number;
  ratePeriod: 'hourly' | 'monthly';
};

declare type CareEnvironmentData = {
  [careEnvironment: string]: CostAndRatePeriod;
};
