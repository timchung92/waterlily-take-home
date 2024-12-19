declare interface PolicyExtractRequestDbRecord {
  policyDocumentText: string;
  policyType: FundingPolicyType;
  requestId: string;
  clientId: string;
  prompt: string;
  status: PolicyExtractPollingStatus;
}
