declare interface SinglePhaseCalculations {
  phase: CarePhase;
  phaseMonthlyCost: number;
  phaseCostPerDayNeeded: number;
  phaseCareDaysNeeded: number;
  daysWhereLessThanTwoADLs: number;
  applicableWaitingPeriodDays: number;
  phaseEligibleCareDaysAfter2AdlRequirement: number;
  phaseEligibleCareDaysAfterWaitingPeriod: number;
  phaseHomeCareWaitingPeriodDaysRemaining: number;
  phaseFacilityCareWaitingPeriodDaysRemaining: number;
  dailyBenefitAmount: number;
  inflationProtection: number;
  inflationPeriodYears: number;
  inflatedDailyBenefitAmount: number;
  inflatedFaceAmount: number;
  inflatedMaxBenefitAmount: number; // inflated total benefit amount
  maxPayoutAccordingToDailyMaximum: number;
  surplusAppliedToCoverage: number;
  indemnitySurplusForPhase: number;
  phaseCostCoverage: number;
  costCoverageAddedToTotal: number;
  portionOfPhaseCostBenefitEligible: number;
  remainingMaxBenefitBeforePhaseReduction: number;
  remainingMaxBenefitAfterPhaseReduction: number;
  // policyTotalBenefitAmountExhausted: boolean;
  cumulativePolicyPayOut: number;
  indemnityPayout: number;
  dailyBenefitAmountBase: number | null;
  baseBenefitAmountRemaining: number | null;
  baseAmountApplicableDays: number | null;
  riderAmountApplicableDays: number | null;
  indemnitySurplusBeforePhaseReduction: number | null;
  policySharedBenefitPoolRemaining: number | null;
  inflatedDailyBenefitAmountBase: number | null;
  inflatedDailyBenefitAmountRider: number | null;
  sharedPoolUtilized: number | null;
}

declare interface PolicyPhaseCalculations {
  [fundingSourceId: string]: SinglePhaseCalculations[];
}
