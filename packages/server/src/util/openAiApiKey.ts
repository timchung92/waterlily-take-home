import { fetchParamValue, openAIApiKeyProvided, openAIApiKeySSMName } from "@server/util";

export async function openAiApiKey() {
    return openAIApiKeyProvided || await fetchParamValue(openAIApiKeySSMName);
}
