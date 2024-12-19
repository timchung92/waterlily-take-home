import createMagicLink from '@server/util/createMagicLink';
import { checkIsEmailUnsubscribed } from 'src/util';

export async function putMagicLinkEmailToClient({
  body,
}: BodyProps<CreateMagicLinkParams>) {
  const { clientId, email } = body;
  const isUnsubscribed = await checkIsEmailUnsubscribed(email, 'transactions');
  if (isUnsubscribed) {
    return { clientId, email, status: 'unsubscribed' };
  }
  await createMagicLink(body);
  return { clientId, email, status: 'success' };
}
