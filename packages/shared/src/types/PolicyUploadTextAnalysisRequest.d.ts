declare interface PolicyUploadTextAnalysisRequest {
  uploadMethod: 'file' | 'text';
  fileBucket?: string;
  fileKey?: string;
  policyDocumentText?: string;
  policyType: FundingPolicyType;
  clientId: string;
  ltcAtAge?: number;
  clientBirthYear?: number;
  clientGenderAtBirth?: string;
  policyActivationAgeClientIsPolicyHolder?: number;
  policyActivationAgePartnerIsPolicyHolder?: number;
  clientFullName?: string;
  isPrimaryPolicyHolder?: boolean;
  illustrationOptionName?: string;
}

declare type PolicyExtractRequestedRuns = {
  requestedRuns: number;
};

declare type PolicyUploadPresignedUrlRequestProps = {
  clientId: string;
  originalFileName: string;
};

declare type PolicyUploadPresignedUrlResponse = {
  url: string;
  bucket: string;
  key: string;
};

declare type PolicyUploadFileRequestProps = {
  fileUrl: string;
  file: File;
  fileType: ContentType;
};
