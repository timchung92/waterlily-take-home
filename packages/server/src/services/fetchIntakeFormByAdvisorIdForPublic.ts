import {
  ApiExError,
  INTAKE_BASE_URL,
  addCustomQueryParams,
  appModel,
  httpStatusCodes,
  isNullUndefinedOrEmpty,
  newUuid,
  customHiddenFieldQueryParamPrefix,
} from '@shared';
import {
  selectMany,
  selectSimple,
  selectSupervisorAdvisorsByAdvisorIdSql,
} from 'src';

export async function fetchIntakeFormByAdvisorIdForPublic({
  advisorId,
  queryStringParameters,
}: AdvisorIdProps & QueryStringParametersProps) {
  if (isNullUndefinedOrEmpty(advisorId)) {
    throw new ApiExError(
      httpStatusCodes.forbidden,
      'advisorId is required',
      {},
    );
  }

  const {
    should_send_client_email: shouldSendClientEmail,
    survey_id: clientSurveyId,
    first_name: clientFirstName,
    last_name: clientLastName,
    consent,
  } = queryStringParameters || {};

  const newClientSurveyId = newUuid();
  const advisor = await selectSimple<Advisor | null>(
    appModel.tableNames.advisors,
    { advisorId },
  );
  // Get supervisor advisor
  const supervisorAdvisors = await selectMany<Advisor>(
    selectSupervisorAdvisorsByAdvisorIdSql(advisorId),
  );

  // Combine organization names if supervisor exists
  const organizationName = [
    ...new Set([
      advisor?.organizationName,
      ...supervisorAdvisors.map(sa => sa.organizationName),
    ]),
  ]
    .filter(Boolean)
    .join(' and ');

  let intakeFormUrl = `${INTAKE_BASE_URL}advisor_id=${encodeURIComponent(advisorId)}&survey_id=${clientSurveyId ? encodeURIComponent(clientSurveyId) : encodeURIComponent(newClientSurveyId)}&should_send_client_email=${encodeURIComponent(shouldSendClientEmail === 'true')}&organization_name=${organizationName ? encodeURIComponent(organizationName) : undefined}&first_name=${clientFirstName ? encodeURIComponent(clientFirstName) : undefined}&last_name=${clientLastName ? encodeURIComponent(clientLastName) : undefined}&consent=${encodeURIComponent(consent === 'true')}`;
  intakeFormUrl = addCustomQueryParams(
    intakeFormUrl,
    queryStringParameters,
    customHiddenFieldQueryParamPrefix,
  );

  return { redirectUrl: intakeFormUrl, shouldRedirect: true };
}
