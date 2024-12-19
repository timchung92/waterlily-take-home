import { algorithmApiAuthTokenProvided, algorithmApiAuthTokenSsmName } from '../util';
import { fetchParamValue } from '../util/fetchParamValue';

export async function algorithmApiAuthToken() {
    return algorithmApiAuthTokenProvided || await fetchParamValue(algorithmApiAuthTokenSsmName);
}
