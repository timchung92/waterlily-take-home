import pdfParse from 'pdf-parse';
import { S3 } from 'aws-sdk';

export type BucketKeyProps = {
  bucket: string;
  key: string;
};

const s3 = new S3();

const validateRequest = (
  bucket: string | undefined,
  key: string | undefined,
) => {
  if (!bucket || !key) {
    throw new Error('Bucket and key are required in the request body');
  }
};

export async function fetchPdfDocumentText({
  bucket,
  key,
}: BucketKeyProps): Promise<string> {
  validateRequest(bucket, key);

  const fileObject = await s3.getObject({ Bucket: bucket, Key: key }).promise();

  if (!fileObject.Body) {
    throw new Error('File not found or is empty');
  }

  const fileBuffer = fileObject.Body as Buffer;
  const data = await pdfParse(fileBuffer);
  return data.text;
}
