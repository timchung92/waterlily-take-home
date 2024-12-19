type ContentType = 'application/pdf';

export const uploadFileToS3 = async (
  url: string,
  file: File,
  fileType: ContentType,
) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': fileType },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
};
