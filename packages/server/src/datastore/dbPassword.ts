import { dbPasswordProvided, dbPasswordSsmName } from '../util';
import { fetchParamValue } from '../util/fetchParamValue';

export async function dbPassword() {
    return dbPasswordProvided ?? await fetchParamValue(dbPasswordSsmName);
}
