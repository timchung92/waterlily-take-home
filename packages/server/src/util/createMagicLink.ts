import { createMagicLinkSql, runQuery, selectSimple } from 'src';
import { sendMagicLinkEmail } from './email/emailService';
import { appModel, getBaseUrl } from '@shared';

export default async function createMagicLink({
  clientId,
  email,
}: CreateMagicLinkParams) {
  const clientQuery = await selectSimple<Client>(appModel.tableNames.clients, {
    clientId: clientId,
  });
  const magicLink = await getMagicLink({ clientId });

  await sendMagicLinkEmail(
    email ?? clientQuery.clientEmail,
    clientQuery.clientFirstName,
    magicLink,
  );

  return { magicLink, clientEmail: clientQuery.clientEmail };
}

export async function getMagicLink({ clientId }: CreateMagicLinkParams) {
  const insertMagicLinkQuery = createMagicLinkSql({ clientId });
  const result = await runQuery(insertMagicLinkQuery);
  const magicLinkItem = result.rows[0] as MagicLink;
  const magicLink = `${getBaseUrl()}/auth/magic-link/${magicLinkItem.token}`;
  return magicLink;
}
