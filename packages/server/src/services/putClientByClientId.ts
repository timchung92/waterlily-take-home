import { assertPathParametersMatchesBody } from '@server/util/assertPathParametersMatchesBody';
import { runQuery, updateClientTagsSql, upsert } from '@server/datastore';
import { appModel, convertClientTagsToClientTagDefs, isDefined } from '@shared';
import { fetchClientByClientId } from '@server/services/fetchClientByClientId';
import { deleteAllClientTagsSql, nextTick } from 'src';

export async function putClientByClientId({
  clientId,
  body,
}: ClientIdProps & BodyProps<Client>) {
  assertPathParametersMatchesBody({ clientId }, body);

  const { clientTags, ...requestClient } = body;

  if (Object.keys(requestClient).length >= 1) {
    // only clientId; happens when only updating tags
    await upsert<Client>(appModel.tableNames.clients, body);
  }

  if (isDefined(clientTags)) {
    const clientTagDefIds = convertClientTagsToClientTagDefs(
      clientId,
      clientTags,
    );
    updateClientTags(clientId, clientTagDefIds);
  }

  await nextTick();
  return await fetchClientByClientId(clientId);
}

export function updateClientTags(clientId: string, clientTagDefIds: number[]) {
  if (clientTagDefIds.length === 0) {
    return runQuery(deleteAllClientTagsSql(clientId));
  }
  return runQuery(updateClientTagsSql(clientId, clientTagDefIds));
}
