declare interface PolicyExtractResponseDbRecord {
  responseDateTime: Date;
  results?: string;
  status: PolicyExtractPollingStatus;
  requestId: string;
  error?: string;
}
