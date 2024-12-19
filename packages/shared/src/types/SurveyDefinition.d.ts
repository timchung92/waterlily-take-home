declare interface SurveyDefinition {
  surveyDefinitionKey:
    | 'intakeForm'
    | 'clientCoreValues'
    | 'roleFitByClient'
    | 'roleFitByCaregiver'
    | 'introIntakeForm';
  surveyDefinitionId: number;
  surveyDefinitionLabel: string;
  surveySubmittedBy: SurveySubmitter | unknown;
}
