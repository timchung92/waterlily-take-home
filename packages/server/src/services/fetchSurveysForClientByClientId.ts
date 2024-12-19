import {
  gatherSurveys,
  selectMany,
  selectSurveysWithAnswers,
} from '../datastore';
import {
  surveyDefinitions,
} from '@shared';

export async function fetchSurveysForClientByClientId({ clientId }: ClientIdProps) {
  const rows = await selectMany<Survey & SurveyAnswer & SurveyQuestion>(
    selectSurveysWithAnswers(
      clientId,
      Object.values(surveyDefinitions).map(def => def.surveyDefinitionId)
    )
  );

  return gatherSurveys(rows);
}
