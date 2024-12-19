import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiExError, builtEnvironment, isRunningLocal } from '@shared';

const env = isRunningLocal() ? 'local' : builtEnvironment;
const s3Env = env === 'prod' ? 'prod' : 'dev';
const prodRegion = 'us-east-2';
const devRegion = 'us-west-1';
const region = s3Env === 'prod' ? prodRegion : devRegion;

export async function postPresignedUrlForClientByClientId({
  body,
}: {
  body: PolicyUploadPresignedUrlRequestProps;
}): Promise<PolicyUploadPresignedUrlResponse> {
  const clientId = body.clientId;
  let originalFileName = body.originalFileName;

  if (!originalFileName) {
    throw new ApiExError('400', 'originalFileName is required', body);
  }

  // Check if the file extension is .pdf
  if (!originalFileName.toLowerCase().endsWith('.pdf')) {
    throw new ApiExError('400', 'File must have a .pdf extension', body);
  }

  // Strip the .pdf extension
  originalFileName = originalFileName.replace(/\.pdf$/i, '');

  const s3Client = new S3Client({
    region,
  });

  const fileName = `${clientId}-${originalFileName}-${new Date().toISOString()}.pdf`;
  const bucket = `waterlily-pdf-policy-upload-${s3Env}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    ContentType: 'application/pdf',
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
      url,
      bucket,
      key: fileName,
    };
  } catch (error) {
    throw new ApiExError('500', 'Error generating presigned URL', error);
  }
}
