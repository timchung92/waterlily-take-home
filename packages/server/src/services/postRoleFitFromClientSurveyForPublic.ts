import {
  ExError,
  isNullOrUndefined,
  surveyDefinitions,
} from '@shared';
import { processSurvey } from '@server/util/processSurvey';

export async function postRoleFitFromClientSurveyForPublic({ body }: BodyProps<TypeformWebhookPayload> & QueryStringParametersProps): Promise<Survey>  {
  const { hidden } = body?.form_response;

  if (isNullOrUndefined(hidden)) {
    throw new ExError('Invalid survey from webhook; missing hidden fields.', {});
  }

  const clientId = hidden.client_id;
  const surveyId = hidden.survey_id;
  const supportProviderId = hidden.support_provider_id;

  return await processSurvey({
    typeformPayload: body,
    surveyDefinition: surveyDefinitions.roleFitByClient,
    clientId,
    surveyId,
    supportProviderId,
  });

}
