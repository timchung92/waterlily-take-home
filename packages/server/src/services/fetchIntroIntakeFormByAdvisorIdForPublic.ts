import {
  ApiExError,
  INTRO_INTAKE_BASE_URL,
  appModel,
  httpStatusCodes,
  isNullUndefinedOrEmpty,
  newUuid,
  addCustomQueryParams,
  customHiddenFieldQueryParamPrefix,
} from '@shared';
import { selectMany, selectSimple } from 'src';
import { selectSupervisorAdvisorsByAdvisorIdSql } from '../datastore/sql';

export async function fetchIntroIntakeFormByAdvisorIdForPublic({
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
  const advisor = await selectSimple<Advisor | null>(
    appModel.tableNames.advisors,
    { advisorId },
  );
  if (!advisor) {
    throw new ApiExError(httpStatusCodes.notFound, 'Advisor not found', {});
  }

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

  const shouldSendClientEmail =
    queryStringParameters?.should_send_client_email === 'true';
  const surveyId = queryStringParameters?.survey_id ?? newUuid();

  // Base intake form URL
  let intakeFormUrl = `${INTRO_INTAKE_BASE_URL}advisor_id=${encodeURIComponent(advisorId)}&survey_id=${encodeURIComponent(surveyId)}&should_send_client_email=${encodeURIComponent(shouldSendClientEmail)}&organization_name=${organizationName ? encodeURIComponent(organizationName) : undefined}`;
  intakeFormUrl = addCustomQueryParams(
    intakeFormUrl,
    queryStringParameters,
    customHiddenFieldQueryParamPrefix,
  );

  return { redirectUrl: intakeFormUrl, shouldRedirect: true };
}
