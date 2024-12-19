declare interface Survey { // extends ObjectMap<unknown> {
  surveyId: string;
  surveyVersionId: string;
  surveyVersionDateTime: Date;
  surveyDefinition: SurveyDefinition;
  surveyDefinitionId: number;
  clientId: string;
  supportProviderId?: string;
  surveyStatus: SurveyStatus;
  lastPageSeen: number;
  surveySubmittedDateTime?: Date;
}

declare interface SurveyAnswer {
  surveyAnswerId: string;
  surveyVersionId: string;
  surveyQuestionRef: string;
  surveyAnswerValue: string;
}

declare interface SurveyQuestion {
  surveyQuestionRef: string;
  surveyDefinitionId: number;
  surveyQuestionType: SurveyQuestionType;
}
