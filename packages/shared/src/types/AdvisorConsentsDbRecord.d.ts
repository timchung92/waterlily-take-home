declare type PutAdvisorConsentProps = {
  advisorId: string;
  consentVersionDescription: string;
  consentText: string;
};

declare type AdvisorConsentsDbRecord = PutAdvisorConsentProps & {
  advisorConsentId: string;
  consentDateTime: Date;
};
