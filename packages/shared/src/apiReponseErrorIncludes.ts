import { ApiExError } from '.';

export function apiReponseErrorIncludes(
  apiExError: ApiExError,
  message: string,
) {
  const messageLower = message.toLocaleLowerCase();
  const errorMessageLower = (
    apiExError.metadata.response as ApiResponseError
  )?.body?.errorMessage.toLocaleLowerCase();
  return errorMessageLower.includes(messageLower);
}

export function apiReponseError(apiExError: ApiExError) {
  return (apiExError.metadata.response as ApiResponseError)?.body?.errorMessage;
}
