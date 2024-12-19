import { selectAdvisorConsentsSql, selectMany } from 'src';

export async function fetchAdvisorConsents(
  keys: AdvisorIdProps,
): Promise<AdvisorConsentsDbRecord[]> {
  const consentRecords = await selectMany<AdvisorConsentsDbRecord>(
    selectAdvisorConsentsSql(keys.advisorId),
  );
  return consentRecords;
}
