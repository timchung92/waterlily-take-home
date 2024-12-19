import { fetchParamValue } from '../util/fetchParamValue';
import { pdfPasswordProvided, pdfPasswordSSMName } from './serverConstants';

export async function pdfUserPassword() {
    return pdfPasswordProvided ?? await fetchParamValue(pdfPasswordSSMName);
}
