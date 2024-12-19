import {
  selectOne,
  selectClientPartnerByClientIdSql
} from '../datastore';
import { isString } from 'lodash';
import { fetchClientByClientId } from './fetchClientByClientId';


export async function fetchClientPartnerByClientId(clientIdOrClientIdProps: ClientIdProps | string): Promise<ClientContainer> {

  const clientId = isString(clientIdOrClientIdProps)
    ? clientIdOrClientIdProps
    : clientIdOrClientIdProps.clientId;

  const clientPartnerDbRecord = await selectOne<ClientPartnerLinkDbRecord>(selectClientPartnerByClientIdSql(clientId));

  if (!clientPartnerDbRecord && !clientPartnerDbRecord.partnerClientId) {
    return null;
  }
  return fetchClientByClientId(clientPartnerDbRecord.partnerClientId);
}
