import {
  runQuery,
  updateCareEnvironmentSelections,
} from '../datastore';
import {
  fetchClientByClientId,
  } from './fetchClientByClientId';
import {
  nextTick,
} from '../util';

export async function putCareEnvironmentSelectionsForClientByClientId(
  {
    clientId, body: { careEnvironmentSelections }
  }: ClientIdProps & BodyProps<PutCareEnvironmentSelectionsBodyProps>
) {

  await runQuery(updateCareEnvironmentSelections(clientId, careEnvironmentSelections));
  await nextTick();
  return fetchClientByClientId(clientId);
}
