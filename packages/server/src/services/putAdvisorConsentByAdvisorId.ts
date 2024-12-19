import { ApiExError, httpStatusCodes, newUuid } from '@shared';
import { insertAdvisorConsentSql, runQuery } from 'src';

export async function putAdvisorConsentByAdvisorId({
  body,
}: BodyProps<PutAdvisorConsentProps>): Promise<AdvisorConsentsDbRecord> {
  const insertRecord = {
    ...body,
    advisorConsentId: newUuid(),
    consentDateTime: new Date(),
  };
  const insertSql = insertAdvisorConsentSql(insertRecord);
  try {
    await runQuery(insertSql);
  } catch (ex: unknown) {
    throw new ApiExError(
      httpStatusCodes.internalServerError,
      'Error inserting advisor consent.',
      { body },
      ex,
    );
  }

  return insertRecord;
}
