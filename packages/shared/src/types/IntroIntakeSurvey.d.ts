declare interface IntroIntakeSurvey extends Survey {
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  proxyFirstName?: string;
  proxyLastName?: string;
  proxyEmail?: string;
  proxyPhoneNumber?: string;
  consentToTermsOfService: string;
  respondentRelationToClient: string;
  hasLongTermCareInsuranceProxy?: boolean;
  hasLongTermCareInsurance?: boolean;
}
