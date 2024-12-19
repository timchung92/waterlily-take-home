import { ApiExError } from '@shared';
import { httpStatusCodes } from '@shared';
import { selectMany } from './db';
import { selectClientsBySql } from './sql';
import { gatherClientsWithClientTags } from './gatherers';

export async function selectClientBy(
  keys: Pick<Client, 'advisorId'> | Pick<Client, 'clientId'>,
) {
  const clients = await selectClientsBy(keys);
  if (clients.length === 0) {
    throw new ApiExError(
      httpStatusCodes.methodNotAllowed, // see explanation in routeCall
      'No client found with the specified parameters.',
      {
        keys,
      },
    );
  }

  if (clients.length > 1) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Expected to find only one client matching specified parameters but found multiple.',
      {
        keys,
        clientIds: clients.map(c => c.clientId),
      },
    );
  }

  return clients[0];
}

export async function selectClientsBy(
  keys:
    | (Pick<Client, 'advisorId'> & { includeSubordinates?: boolean })
    | Pick<Client, 'clientId'>,
) {
  const safeSql = selectClientsBySql(keys);
  const rows = await selectMany<Client & { clientTagDefId: number }>(safeSql);
  const clients = gatherClientsWithClientTags(rows);
  return clients;
}
