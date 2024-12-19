import { ExError, VerificationResult, isNullOrUndefined } from '@shared';
import {
  incrementClientUnsuccessfulMagicLinkAttemptsSql,
  runQuery,
  updateMagicLinkUsedAtSql,
} from 'src';
import { verifySecurityQuestions } from '@server/util/verifySecurityQuestions';

export async function postVerifySecurityQuestionsMagicLinkForClientByClientId({
  body,
}: BodyProps<VerifySecurityQuestionsMagicLinkBody>): Promise<VerifySecurityQuestionsResponse> {
  const { clientId, dateOfBirth, zipCode, height, magicLinkId } = body;

  if (isNullOrUndefined(magicLinkId)) {
    throw new ExError('Must provide magicLinkId', {});
  }

  const verificationResult = await verifySecurityQuestions(clientId, {
    dateOfBirth,
    zipCode,
    height,
  });

  await handleMagicLinkVerificationResults(
    verificationResult,
    magicLinkId,
    clientId,
  );

  return { isValid: verificationResult.isValid };
}

async function handleMagicLinkVerificationResults(
  verificationResult: VerificationResult,
  magicLinkId: string,
  clientId: string,
): Promise<void> {
  if (!verificationResult.isValid) {
    await runQuery(
      incrementClientUnsuccessfulMagicLinkAttemptsSql({ clientId }),
    );
  } else {
    await runQuery(updateMagicLinkUsedAtSql({ magicLinkId }));
  }
}
