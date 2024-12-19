import { selectMany, selectSupportProviderSetByClientIdSql } from '@server/datastore';
import { ApiExError, httpStatusCodes, pii } from '@shared';
import { SupportProviderSetRow, gatherSupportProviderSetsWithSupportProviders } from '@server/datastore/gatherers';

export async function fetchSupportProviderSetForClientByClientId({ clientId }: ClientIdProps) {
  const safeSql = selectSupportProviderSetByClientIdSql(clientId);
  const rows = await selectMany<SupportProviderSetRow>(safeSql);

  if (rows.length === 0) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      'No support providers found for the specified client.',
      {
        clientId,
        sql: safeSql.finalSql,
        values: pii(safeSql.values),
      }
    );
  }

  const supportProviderSets = gatherSupportProviderSetsWithSupportProviders(rows);
  return supportProviderSets[0];
}
