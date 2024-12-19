import { postIntakeFormEmail } from 'src';

export async function postBatchIntakeFormEmail({
  body,
}: BodyProps<BatchIntakeFormEmailProps>): Promise<BatchEmailResult> {
  const { intakeFormEmailProps } = body;
  const result: BatchEmailResult = {
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  for (const emailProps of intakeFormEmailProps) {
    try {
      await postIntakeFormEmail({ body: { ...emailProps } });
      result.successCount++;
    } catch (error) {
      result.errorCount++;
      result.errors.push({
        email: emailProps.email,
        error: error.message || 'Unknown error',
      });
    }
  }

  if (result.errorCount > 0) {
    console.warn('Some batch emails failed:', result);
  }

  return result;
}
