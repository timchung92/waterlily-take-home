import { SurveyQuestionType, appModel, isNullOrUndefined, jsonStringifyBetter } from '@shared';
import { gatherObjects } from './gatherObjects';
import { dbParseByQuestionType } from './dbFormatters';

export type SupportProviderSetRow = (SupportProviderSet & SupportProvider);
export type ClientWithClientTagRow = (Client & { clientTagDefId: number; });

export function gatherClientsWithClientTags(rows: ClientWithClientTagRow[]) {
  return gatherObjects(
    rows,
    {
      key: row => row.clientId,
      fields: appModel.tablesByName.clients.orderedFieldNames
    },
    {
      key: row => row.clientId + row.clientTagDefId,
      fields: appModel.tablesByName.clientTagDefs.orderedFieldNames,
      associate: (client, { clientTagDefLabel }) =>
        (client.clientTags ?? (client.clientTags = [])).push(clientTagDefLabel)
    }, {
      key: row => row.clientId,
      fields: appModel.tablesByName.clientOnboardingSlideProgress.orderedFieldNames,
      associate: (client, clientOnboardingSlideProgress) =>
        client.onboardingSlideProgress = clientOnboardingSlideProgress
    }
  );
}

export function gatherSupportProviderSetsWithSupportProviders(rows: SupportProviderSetRow[] | null | undefined) {
  if (isNullOrUndefined(rows)) {
    return rows;
  }

  return gatherObjects(
    rows,
    {
      key: row => row.supportProviderDetailSetId,
      fields: appModel.tablesByName.supportProviderDetailSets.orderedFieldNames
    },
    {
      key: row => row.supportProviderId,
      associate: (parent, child: SupportProvider) =>
        (parent.supportProviders ?? (parent.supportProviders = [])).push(child),
      fields:
        [
          ...appModel.tablesByName.supportProviders.orderedFieldNames,
          ...appModel.tablesByName.supportProviderDetails.orderedFieldNames
        ]
    }
  );
}

export function gatherSurveys(rows: (Survey & SurveyAnswer)[]) {
  const surveyAnswerFields = appModel.tablesByName.surveyAnswers.fields;
  const surveyQuestionFields = appModel.tablesByName.surveyQuestions.fields;

  const surveys = gatherObjects(
    rows,
    {
      key: row => row.surveyVersionId,
      fields: appModel.tablesByName.surveys.orderedFieldNames,
    },
    {
      key: row => row.surveyQuestionRef,
      associate: (parent, child: SurveyAnswer & SurveyQuestion) => {
        if (child.surveyQuestionRef === 'supportProviderFactorPrioritization') {
          console.log(`**********\n\nsupportProviderFactorPrioritization: ${ jsonStringifyBetter(
            {
              child
            }
          ) }`);
        }
        parent[ child.surveyQuestionRef ] = dbParseByQuestionType(
          child.surveyQuestionType as SurveyQuestionType,
          child.surveyAnswerValue,
        )
      },
      fields: [
        surveyAnswerFields.surveyQuestionRef.fieldName,
        surveyAnswerFields.surveyAnswerValue.fieldName,
        surveyQuestionFields.surveyQuestionType.fieldName,
      ]
    }
  );

  return surveys;
}
