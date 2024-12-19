import { insertSurveyAndAnswersSql, runQuery } from '@server/datastore';
import { ApiExError, httpStatusCodes } from '@shared';
import { convertTypeformToSurvey } from './convertTypeformSurvey';

export interface ProcessSurveyProps {
  typeformPayload: TypeformWebhookPayload;
  surveyDefinition: SurveyDefinition;
  clientId: string;
  surveyId: string;
  supportProviderId: string | null;
}
export async function processSurvey(props: ProcessSurveyProps): Promise<Survey> {
  const survey = convertTypeformToSurvey(props);
  await createSurvey(survey, props.typeformPayload);

  return survey;
}

async function createSurvey(survey: Survey, typeformPayload: TypeformWebhookPayload) {
  try {

    const queries = insertSurveyAndAnswersSql(survey, typeformPayload);

    await runQuery(queries);

  } catch (ex: unknown) {
    throw ApiExError.wrapApiOrAddMetadata(
      httpStatusCodes.internalServerError,
      'Error creating new survey.',
      {
        survey
      },
      ex
    );
  }
}
