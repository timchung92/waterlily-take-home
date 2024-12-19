declare interface FundingSources extends ObjectMap<{}> {
  selfFunding: SelfFundingSource;
  ltcPolicy: PolicyFundingSource;
  annuity: AnnuitySource;

  // calculated
  combinedFundingTotalCost?: number;
  combinedNonLtcPayout?: number;
  combinedTotalValue?: number;
  combinedProjectedReturnOnInvestment?: number;
  combinedProjectedCompoundAnnualGrowthRate?: number;
  combinedProjectedInternalRateOfReturn?: number;
  combinedInvestmentPeriodYears?: number;
  combinedProjectedCostCoverage?: number;
  combinedProjectedCostCoveragePercent?: number;
}

declare interface BooleanInputSelfFundingSource {
  hasSelfFunding: boolean;
}

declare interface NumberInputSelfFundingSource {
  existingAssetsValue: number | null;
  annualRateOfReturn: number | null;
  contributionStartYear: number;
  contributionEndYear: number;
  monthlyContributionAmount: number | null;
  gainsTaxRate: number | null;
  monthlyIncome: number | null;
}

declare interface CalculatedSelfFundingSource {
  contributionYearCount?: number; // ends at care start year
  contributionMonthCount: number;
  investmentPeriodYears?: number; // ends at care end year
  monthlyIncomeTotal?: number;
  requiredMonthlyContribution?: number;
  futureValueOfInitialInvestment?: number;
  selfFundingTotalCost?: number;
  selfFundingProjectedCostCoverage?: number;
  selfFundingTotalValue?: number;
  selfFundingNonLtcPayout?: number;
  selfFundingProjectedReturnOnInvestment?: number;
  selfFundingProjectedCompoundAnnualGrowthRate?: number;
  selfFundingProjectedInternalRateOfReturn?: number;
}

declare interface StringInputSelfFundingSource {
  addedByAdvisorId?: string;
  addedByAdvisorFullName?: string;
}

declare interface SelfFundingSource
  extends BooleanInputSelfFundingSource,
    NumberInputSelfFundingSource,
    CalculatedSelfFundingSource,
    StringInputSelfFundingSource {}

declare interface BooleanInputPolicyFundingSource {
  hasPolicyFunding: boolean;
  policyBenefitIsUnlimited?: boolean;
  isSimpleInflationProtection: boolean; // compound otherwise
  isIndemnityPolicyPayment: boolean; // reimbursment otherwise
  isPrimaryPolicyHolder?: boolean;
  isDeactivated?: boolean;
  // [key: string]: boolean;
}

declare interface NumberInputPolicyFundingSource {
  policyMaximumBenefitAmount: number | null; // face value for the policy. for traditional ltc, it's the max benefit, for hybrid/life it's the death benefit
  policyPremiumMonthlyCost: number | null;
  policyPremiumStartYear: number | null;
  policyInflationProtection: number | null;
  policyLumpSumPayment: number | null;
  dailyHomeBenefitAmount: number | null;
  dailyHomeInflationProtectionPercent: number | null;
  dailyIndependentLivingBenefitAmount: number | null;
  dailyIndependentLivingInflationProtectionPercent: number | null;
  dailyAssistedLivingBenefitAmount: number | null;
  dailyAssistedLivingInflationProtectionPercent: number | null;
  dailyNursingHomeBenefitAmount: number | null;
  dailyNursingHomeInflationProtectionPercent: number | null;
  policyType: FundingPolicyType | null;
  homeCareWaitingPeriodDays: number | null;
  facilityCareWaitingPeriodDays: number | null;
  policyLimitedPayYears: number | null; // number of years to pay premium
  policyBenefitPeriodMonths: number | null;
  policyContinuationBenefitAmount: number | null; // for hybrid plans
  policyMinimumGuaranteedBenefitAmount: number | null; // min guaranteed death benefit
  policyMonthlyWithdrawalRate: number | null; // % of the benefit that can be withdrawn per month
  policyPremiumIncreaseRate: number | null; // % increase in premium per year
  policyPremiumIncreaseYears: number | null; // number of years for the premium increase
  policyInflationProtectionOnFaceAmount: number | null;
  policyInflationProtectionOnCOBAmount: number | null;
  policyInflationProtectionYears: number | null;
  // on-claim fields
  policyBenefitUtilizedToDate: number | null;

  // calculated
  homeCareWaitingPeriodDaysRemaining?: number | null;
  facilityCareWaitingPeriodDaysRemaining?: number | null;
  policyBenefitPeriodMonthsRemaining?: number | null;
  premiumInvestmentPeriodMonths?: number | null;
  monthlyPremiumTotalCost?: number | null;
  policyInflatedDeathBenefitAmount?: number | null;
  policyRemainingBenefitAmount?: number | null;
  policySharedBenefitPool?: number | null; // used when each partner has thier own benefit pool and a third pool that either partner can use

  [key: string]: number;
}

declare interface StringInputPolicyFundingSource {
  customPolicyId: string | null;
  illustrationOptionName?: string; // used for policy illustration extraction when multiple options exist
  addedByAdvisorId?: string;
  // client side only
  addedByAdvisorFullName?: string;
}

declare interface CalculatedPolicyFundingSource {
  projectedCostCoverage?: number;
  policyTotalCost?: number;
  investmentPeriodYears?: number;
  appliedPolicyPremiumIncreaseYears?: number;
  // on-claim fields
  policyActivationYear?: number;
  policyCoverageOfRemainingLtcCosts?: number;
  policyFundsNeededForRemainingLtcCosts?: number;
  policyNonLtcPayout?: number;
  policyTotalValue?: number;
  policyProjectedReturnOnInvestment?: number;
  policyProjectedCompoundAnnualGrowthRate?: number;
  policyProjectedInternalRateOfReturn?: number;
  policyTotalLTCBenefit?: number;
  investmentCashFlows?: CashFlow[]; // premiums
  returnCashFlows?: CashFlow[]; // benefits
}

declare interface PolicyFundingSource
  extends BooleanInputPolicyFundingSource,
    NumberInputPolicyFundingSource,
    CalculatedPolicyFundingSource,
    StringInputPolicyFundingSource {}

declare interface BooleanInputSource
  extends BooleanInputSelfFundingSource,
    BooleanInputPolicyFundingSource {}

declare interface NumberInputSource
  extends NumberInputSelfFundingSource,
    NumberInputPolicyFundingSource {}

declare interface AllInputSource
  extends BooleanInputSource,
    NumberInputSource {}

declare interface DbFundingSource {
  fundingSourceId: string;
  clientId: string;
  fundingSourceLabel: string;
}

declare interface DbFundingSourceDetail {
  fundingSourceDetailId: string;
  fundingSourceId: string;
  fundingSourceDetailLabel: string;
  fundingSourceDetailValue: string;
}

declare interface AnnuitySource {
  hasAnnuity: boolean;
  annuityPurchasePrice: number | null;
  annuityExpectedPaymentStartAge: number | null;
  annuityExpectedPaymentEndAge: number | null;
  annuityAnnualPayOut: number | null;
  annuityAnnualPayoutForLtc: number | null;
  annuityAnnualPayoutForLtcPeriodYears: number | null;
  addedByAdvisorId?: string;
  // client side only
  addedByAdvisorFullName?: string;

  // calculated
  annuityTotalCost?: number; // for now this just equals the purchase price
  annuityProjectedCostCoverage?: number;
  annuityNonLtcPayout?: number;
  annuityTotalValue?: number;
  annuityProjectedReturnOnInvestment?: number;
  annuityProjectedCompoundAnnualGrowthRate?: number;
  annuityProjectedInternalRateOfReturn?: number;
  investmentPeriodYears?: number;
  annuityLtcPayoutMonths: number;
  annuityLtcPaymentSurplus: number;
}
