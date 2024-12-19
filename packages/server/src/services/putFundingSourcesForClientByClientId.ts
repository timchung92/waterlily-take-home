import { runQuery, upsertNonPolicyFundingSourcesSql } from '../datastore';
import { assertPathParametersMatchesBody, nextTick } from '../util';
import { fetchClientByClientId } from '../services';

export async function putFundingSourcesForClientByClientId({
  clientId,
  body,
}: ClientIdProps & BodyProps<PutFundingSourcesBodyProps>) {
  assertPathParametersMatchesBody({ clientId }, body);

  const queries = upsertNonPolicyFundingSourcesSql(
    clientId,
    body.fundingSources,
  );

  await runQuery(queries);
  await nextTick();
  return fetchClientByClientId(clientId);
}
