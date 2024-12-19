import {
  runQuery,
  updateClientPartnerLinks,

} from '../datastore';
import {fetchClientByClientId} from './fetchClientByClientId';
import {
  nextTick,
} from '../util';

export async function putClientPartnerLinkForClientByClientId(
  {
    clientId, body: { partnerClientId },
  }: ClientIdProps & BodyProps<PutClientPartnerLinkBodyProps>
) {

  await runQuery(updateClientPartnerLinks({ clientId, partnerClientId}));
  await nextTick();

  return fetchClientByClientId(clientId);
}
