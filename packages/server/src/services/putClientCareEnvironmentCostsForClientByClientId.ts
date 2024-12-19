import {
  runQuery,
  updateClientCareEnvironmentCosts,
} from '../datastore';
import {
  fetchClientByClientId,
  } from './fetchClientByClientId';
import {
  assertPathParametersMatchesBody,
  nextTick,
} from '../util';

export async function putClientCareEnvironmentCostsForClientByClientId(
  {
    clientId, body: { careEnvironmentCosts }, body
  }: ClientIdProps & BodyProps<PutClientCareEnvironmentCostsBodyProps>
) {
  assertPathParametersMatchesBody({clientId}, body);

  await runQuery(updateClientCareEnvironmentCosts(clientId, careEnvironmentCosts));
  await nextTick();
  return fetchClientByClientId(clientId);
}
