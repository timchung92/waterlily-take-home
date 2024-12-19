import { SurveySubmitter } from './appModel';
import { toRecord } from './toRecord';

export const surveyDefinitionList: SurveyDefinition[] = [
  {
    surveyDefinitionKey: 'intakeForm',
    surveyDefinitionId: 991001,
    surveyDefinitionLabel: 'Intake Form',
    surveySubmittedBy: SurveySubmitter.advisor,
  },
  {
    surveyDefinitionKey: 'clientCoreValues',
    surveyDefinitionId: 991002,
    surveyDefinitionLabel: 'Client Core Values',
    surveySubmittedBy: SurveySubmitter.client,
  },
  {
    surveyDefinitionKey: 'roleFitByClient',
    surveyDefinitionId: 991003,
    surveyDefinitionLabel: 'Role Fit by Client',
    surveySubmittedBy: SurveySubmitter.client,
  },
  {
    surveyDefinitionKey: 'roleFitByCaregiver',
    surveyDefinitionId: 991004,
    surveyDefinitionLabel: 'Role Fit by Caregiver',
    surveySubmittedBy: SurveySubmitter.supportProvider,
  },
  {
    surveyDefinitionKey: 'introIntakeForm',
    surveyDefinitionId: 991005,
    surveyDefinitionLabel: 'Intro Intake Form',
    surveySubmittedBy: SurveySubmitter.client, // could be updated later
  },
];

export const surveyDefinitions = Object.assign(
  toRecord(surveyDefinitionList, surveyDef => surveyDef.surveyDefinitionKey),
  toRecord(surveyDefinitionList, surveyDef => surveyDef.surveyDefinitionId),
);
