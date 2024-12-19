import { builtEnvironment, getBaseUrl } from '.';

export function getIntroIntakeFormApiEndPoint(
  advisorId: string,
  shouldSendClientEmail: boolean | null,
  surveyId?: string,
): string {
  const baseUrl = getBaseUrl();
  const advisorIdWithQueryParams = `${encodeURIComponent(advisorId)}?should_send_client_email=${shouldSendClientEmail ? encodeURIComponent(shouldSendClientEmail) : 'false'}${surveyId ? `&survey_id=${encodeURIComponent(surveyId)}` : ''}`;

  return builtEnvironment === 'prod'
    ? `${baseUrl}/prod/api/public/intro-intake-form/${advisorIdWithQueryParams}`
    : `${baseUrl}/dev/api/public/intro-intake-form/${advisorIdWithQueryParams}`;
}
