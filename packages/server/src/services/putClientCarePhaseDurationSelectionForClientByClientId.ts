import {
  runQuery,
  updateClientCarePhaseDurationSelections,
} from '../datastore';
import {
  fetchClientByClientId,
  } from './fetchClientByClientId';
import {
  assertPathParametersMatchesBody,
  nextTick,
} from '../util';

export async function putClientCarePhaseDurationSelectionForClientByClientId(
  {
    clientId, body: { carePhaseDurationSelections }, body
  }: ClientIdProps & BodyProps<PutCarePhaseDurationSelectionBodyProps>
) {
  assertPathParametersMatchesBody({clientId}, body);

  await runQuery(updateClientCarePhaseDurationSelections(clientId, carePhaseDurationSelections));
  await nextTick();
  return fetchClientByClientId(clientId);
}
