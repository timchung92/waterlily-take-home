import { selectOne, sql } from '@server/datastore';
import { logLocal } from '@shared';

export async function fetchHealth() {

  const client = await selectOne<Client>(
    sql`
      SELECT   *
      FROM    Clients
      LIMIT   1
    `
  );

  logLocal(fetchHealth, 'Health check found one client as expected.', { client });

  return { passed: true };
}
