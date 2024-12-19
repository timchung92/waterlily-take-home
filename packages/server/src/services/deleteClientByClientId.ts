import { selectClientsBy } from '@server/datastore/clientsDb';
import { nextTick } from '../util';
import { deleteClient, runQuery } from '@server/datastore';

export async function deleteClientByClientId({
  body: { clientId, advisorId },
}: BodyProps<DeleteClientProps>) {
  if (!advisorId) {
    throw new Error('advisorId is required but was not provided');
  }

  await runQuery(deleteClient(clientId));
  await nextTick();
  return selectClientsBy({ advisorId });
}
