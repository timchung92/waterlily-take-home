declare interface MultipleFundingSources {
  selfFunding: { [fundingSourceId: string]: SelfFundingSource };
  ltcPolicy: { [fundingSourceId: string]: PolicyFundingSource };
  annuity: { [fundingSourceId: string]: AnnuitySource };

  // calculated
  multiplePolicyProjectedCostCoverage?: number;
  multiplePolicyNonLtcPayout?: number;
  multiplePolicyTotalCost?: number;
  multiplePolicyTotalLtcBenefit?: number;
  multiplePolicyTotalValue?: number;
}
