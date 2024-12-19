import {
  appModel,
  convertClientTagsToClientTagDefs,
} from '@shared';
import {
  runQuery,
  updateClientTagsSql,
  updateSql,
  updateSupportProviderSetSql,
} from '../datastore';
import {
  assertPathParametersMatchesBody,
  nextTick
} from '../util';
import { fetchClientByClientId } from '../services';

export function putSupportProviderSetForClientByClientId(
  { clientId, body: { client, supportProviderSet } }: ClientIdProps & BodyProps<PutSupportProviderSetBodyProps>
) {
  assertPathParametersMatchesBody({ clientId }, supportProviderSet);
  if (client) {
    assertPathParametersMatchesBody({ clientId }, client);
  }

  // SupportProviderSets are versioned, so we always insert a new one.
  // Client is responsible for resetting thje ids and the insert will fail
  // if they don't.

  return updateSupportProviderSet(client, supportProviderSet);
}

export async function updateSupportProviderSet(client: Partial<Client> | undefined, supportProviderSet: SupportProviderSet) {

  const { clientId } = supportProviderSet;

  const safeSqls = updateSupportProviderSetSql(supportProviderSet);

  if (client) {
    const { clientTags, ...coreClient } = client;
    if (Object.keys(coreClient).length > 1) {
      safeSqls.push(updateSql(appModel.tableNames.clients, coreClient));
    }
    if (clientTags) {
      const clientTagDefIds = convertClientTagsToClientTagDefs(clientId, clientTags);
      updateClientTagsSql(clientId, clientTagDefIds).forEach(
        xrefPartUpdateSql => safeSqls.push(xrefPartUpdateSql)
      );
    }
  }

  await runQuery(safeSqls);
  await nextTick();
  return fetchClientByClientId(clientId);
}
