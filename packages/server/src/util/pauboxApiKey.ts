import { fetchParamValue } from '../util/fetchParamValue';
import { pauboxApiKeyProvided, pauboxApiKeySSMName } from './serverConstants';

export async function pauboxApiKey() {
  return pauboxApiKeyProvided ?? (await fetchParamValue(pauboxApiKeySSMName));
}
