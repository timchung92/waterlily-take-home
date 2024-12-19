import {
  fetchClientByClientId,
  nextTick,
  runQuery,
  updateClientCustomInferences,
} from 'src';
import { assertPathParametersMatchesBody } from '@server/util';

export async function putClientCustomInferencesForClientByClientId({
  clientId,
  body: { clientCustomInferences },
  body,
}: ClientIdProps & BodyProps<PutClientCustomInferencesBodyProps>) {
  assertPathParametersMatchesBody({ clientId }, body);

  await runQuery(
    updateClientCustomInferences(clientId, clientCustomInferences),
  );
  await nextTick();
  return fetchClientByClientId(clientId);
}
