declare type UpdateStatus = 'loading' | 'complete' | 'error' | null;
declare type MagicLinkStatus =
  | 'fetchingSession'
  | 'sessionFetched'
  | 'expired'
  | 'used'
  | 'locked'
  | 'sendingNew'
  | 'newLinkSent'
  | 'error'
  | 'unsubscribed'
  | null;

declare type AdvisorUpdateKeys = 'sendMagicLink';
declare type ClientUpdateKeys =
  | 'ltcAtAge'
  | 'phaseDurations'
  | 'advisorMeetingRequest'
  | 'partnerLinkRequest';

declare type PolicyExtractorState = {
  status: null | PolicyExtractorStatus;
  errors: string[];
  requestId: string;
  requestedRuns: number;
  currentRunPollCount: number;
  fileUrl: string;
  fileBucket: string;
  fileKey: string;
  runsCompletedOrFailed: number;
  policyType: null | FundingPolicyType;
  responses: PolicyExtractResponseDbRecord[];
  parsedResponses: ParsedPolicyDataExtractResponse[];
  processedResponse: ParsedPolicyDataExtractResponse | null;
};
