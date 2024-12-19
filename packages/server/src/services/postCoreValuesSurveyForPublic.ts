import {
  ExError,
  isNullOrUndefined,
  surveyDefinitions,
} from '@shared';

import { processSurvey } from 'src/util/processSurvey';

export async function postCoreValuesSurveyForPublic({ body }: BodyProps<TypeformWebhookPayload> & QueryStringParametersProps): Promise<Survey>  {
  const { hidden } = body?.form_response;

  if (isNullOrUndefined(hidden)) {
    throw new ExError('Invalid survey from webhook; missing hidden fields.', {});
  }

  const clientId = hidden.client_id;
  const surveyId = hidden?.survey_id;

  return await processSurvey({
    typeformPayload: body,
    surveyDefinition: surveyDefinitions.clientCoreValues,
    clientId,
    surveyId,
    supportProviderId: null,
  });

}
