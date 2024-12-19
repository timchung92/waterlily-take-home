import {
  runQuery,
  upsertPolicyFundingSourceByIdSql,
} from '../datastore';
import {
  assertPathParametersMatchesBody,
  nextTick
} from '../util';
import { fetchClientByClientId } from '.';

export async function putPolicyFundingSourceForClientByClientId(
  { clientId, body }: ClientIdProps & BodyProps<PutPolicyFundingSourceByIdBodyProps>
) {
  assertPathParametersMatchesBody({ clientId }, body);
  const queries = upsertPolicyFundingSourceByIdSql(body as PutPolicyFundingSourceByIdBodyProps);
  await runQuery(queries);
  await nextTick();
  return fetchClientByClientId(clientId);
}
