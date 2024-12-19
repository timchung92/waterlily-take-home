import {
  ExError,
  VerificationResult,
  appModel,
  isNullOrUndefined,
} from '@shared';
import {
  getMagicLink,
  incrementPartnerLinkRequestUnsuccessfulVerificationAttemptsSql,
  putClientPartnerLinkForClientByClientId,
  runQuery,
  selectSimple,
  sendPartnerLinkConfirmationEmail,
  updatePartnerLinkRequestToAcceptedSql,
} from 'src';
import { verifySecurityQuestions } from '@server/util/verifySecurityQuestions';

const ALLOWABLE_VERIFICATION_ATTEMPTS = 3;

export async function postVerifySecurityQuestionsPartnerLinkForClientByClientId({
  body,
}: BodyProps<VerifySecurityQuestionsPartnerLinkBody> &
  QueryStringParametersProps): Promise<PartnerLinkRequestsDbRecord> {
  const { clientId, dateOfBirth, zipCode, height, partnerLinkRequestId } = body;

  if (isNullOrUndefined(partnerLinkRequestId)) {
    throw new ExError('Must provide partnerLinkRequestId', {});
  }

  const verificationResult = await verifySecurityQuestions(clientId, {
    dateOfBirth,
    zipCode,
    height,
  });

  return handlePartnerLinkRequestVerificationResults(
    verificationResult,
    partnerLinkRequestId,
  );
}

async function handlePartnerLinkRequestVerificationResults(
  verificationResult: VerificationResult,
  partnerLinkRequestId: string,
): Promise<PartnerLinkRequestsDbRecord> {
  if (!verificationResult.isValid) {
    const updatedRecordResults = await runQuery(
      incrementPartnerLinkRequestUnsuccessfulVerificationAttemptsSql({
        partnerLinkRequestId,
        allowableVerificationAttempts: ALLOWABLE_VERIFICATION_ATTEMPTS,
      }),
    );
    const updatedRecord = updatedRecordResults
      .rows[0] as PartnerLinkRequestsDbRecord;
    return updatedRecord;
  }

  // Handle successful verification
  const acceptedRecordResults = await runQuery(
    updatePartnerLinkRequestToAcceptedSql({
      partnerLinkRequestId,
    }),
  );

  const acceptedRecord = acceptedRecordResults
    .rows[0] as PartnerLinkRequestsDbRecord;

  // Update/create client partner link
  await putClientPartnerLinkForClientByClientId({
    clientId: acceptedRecord.clientId,
    body: {
      clientId: acceptedRecord.clientId,
      partnerClientId: acceptedRecord.partnerClientId,
    },
  });

  // send email to requester that the link has been accepted
  const client = await selectSimple<Client>(appModel.tableNames.clients, {
    clientId: acceptedRecord.clientId,
  });
  const partner = await selectSimple<Client>(appModel.tableNames.clients, {
    clientId: acceptedRecord.partnerClientId,
  });
  const clientMagicLink = await getMagicLink({ clientId: client.clientId });
  await sendPartnerLinkConfirmationEmail({
    clientEmail: client.clientEmail,
    clientFirstName: client.clientFirstName,
    partnerFirstName: partner.clientFirstName,
    partnerLastName: partner.clientLastName,
    magicLink: clientMagicLink,
  });

  return acceptedRecord;
}
