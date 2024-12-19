import { fetchParamValue } from './fetchParamValue';
import { scheduledEventApiKeyProvided, scheduledEventsApiKeySSMName } from './serverConstants';

export async function scheduledEventApiKey() {
    return scheduledEventApiKeyProvided ?? await fetchParamValue(scheduledEventsApiKeySSMName);
}
