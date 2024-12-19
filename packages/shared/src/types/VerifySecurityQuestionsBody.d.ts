declare interface VerifySecurityQuestionsBody {
  dateOfBirth: string;
  zipCode: string;
  height: string;
  clientId: string;
}

declare interface VerifySecurityQuestionsMagicLinkBody
  extends VerifySecurityQuestionsBody {
  magicLinkId: string;
}

declare interface VerifySecurityQuestionsPartnerLinkBody
  extends VerifySecurityQuestionsBody {
  partnerLinkRequestId: string;
}
