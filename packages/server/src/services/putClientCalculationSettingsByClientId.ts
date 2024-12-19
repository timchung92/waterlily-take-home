import { runQuery, upsertClientCalculationSettingsSql } from '../datastore';
import { assertPathParametersMatchesBody, nextTick } from '../util';
import { fetchClientByClientId } from '../services';

export async function putClientCalculationSettingsByClientId({
  clientId,
  body,
}: ClientIdProps & BodyProps<PutClientCalculationSettingsBodyProps>) {
  assertPathParametersMatchesBody({ clientId }, body);

  const queries = upsertClientCalculationSettingsSql(
    clientId,
    body.clientCalculationSettings,
  );

  await runQuery(queries);
  await nextTick();
  return fetchClientByClientId(clientId);
}
