import {
  gatherSurveys,
  selectMany,
  selectSurveysWithAnswers,
} from '../datastore';
import {
  ApiExError,
  httpStatusCodes,
  surveyDefinitions,
} from '@shared';

export async function fetchSurveyForClientByClientId({ clientId }: ClientIdProps) {
  const rows = await selectMany<Survey & SurveyAnswer & SurveyQuestion>(
    selectSurveysWithAnswers(clientId, [ surveyDefinitions.intakeForm.surveyDefinitionId ])
  );

  if (rows.length === 0) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      'Requested survey by clientId was not found.',
      {
        clientId
      }
    );
  }

  return gatherSurveys(rows)[0];
}
