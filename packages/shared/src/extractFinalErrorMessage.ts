import { ApiExError } from '.';

// Types for the error response structure
interface ApiExErrorFlattenedMetaData {
  statusCode: string;
  response: {
    body: {
      errorMessage: string;
      error: {
        finalError: {
          staticMessage: string;
          name: string;
          logCode: string;
          metadata: Record<string, any>;
          statusCode: string;
        };
      };
    };
  };
}

export const extractFinalErrorMessage = (error: ApiExError): string | null => {
  const metaData =
    error.flattenMetadata() as unknown as ApiExErrorFlattenedMetaData;
  try {
    return metaData?.response?.body?.error?.finalError?.staticMessage || null;
  } catch (error) {
    return null;
  }
};
