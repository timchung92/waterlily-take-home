declare type PolicyExtractorNumberFields<T> = {
  [K in keyof T]: T[K] extends number | null ? K : never;
}[keyof T];

declare type PolicyExtractorFieldTypeMap = Partial<
  Pick<PolicyFundingSource, PolicyExtractorNumberFields<PolicyFundingSource>>
> & {
  policyInflationProtectionType?: 'Compound' | 'Simple';
  policyPaymentType?: 'Reimbursement' | 'Indemnity';
  isPrimaryPolicyHolder?: 'Yes' | 'No';
  policyHasCobRider?: 'Yes' | 'No';
};
