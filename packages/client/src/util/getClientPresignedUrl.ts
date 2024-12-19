import { AuthHeader } from './useAuthHeader';
import { builtEnvironment, isRunningLocal } from '@shared';

export const getClientPresignedS3Url = async (
  fileName: string,
  clientId: string,
  authHeader: AuthHeader,
) => {
  const origin = new URL(document.URL).origin;
  const env = isRunningLocal() ? 'dev' : builtEnvironment;

  const presignedUrlApi = `${origin}/${env}/api/client/${clientId}/file-with-presigned-url`;

  const response = await fetch(presignedUrlApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify({ originalFileName: fileName }),
  });

  if (!response.ok) {
    throw new Error('Failed to get presigned URL');
  }

  return await response.json();
};
