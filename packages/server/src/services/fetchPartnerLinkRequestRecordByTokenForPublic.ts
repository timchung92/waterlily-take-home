import { selectSimple } from 'src';
import { ApiExError, appModel, httpStatusCodes } from '@shared';
import { isAfter } from 'date-fns';

const ALLOWABLE_VERIFICATION_ATTEMPTS = 3;
export async function fetchPartnerLinkRequestRecordByTokenForPublic({
  token,
}: TokenProps): Promise<PartnerLinkRequestsDbRecord> {
  const partnerLinkRequestsRecord =
    await selectSimple<PartnerLinkRequestsDbRecord | null>(
      appModel.tableNames.partnerLinkRequests,
      { token },
    );

  if (partnerLinkRequestsRecord.status === 'accepted') {
    // exact error message is being checked in the verifyPartnerLinkRequestModel, don't change it
    throw new ApiExError(
      httpStatusCodes.forbidden,
      'Request already accepted',
      { token },
    );
  }

  if (!partnerLinkRequestsRecord) {
    // exact error message is being checked in the verifyPartnerLinkRequestModel, don't change it
    throw new ApiExError(httpStatusCodes.forbidden, 'Invalid token', { token });
  }
  const client = await selectSimple<Client>(appModel.tableNames.clients, {
    clientId: partnerLinkRequestsRecord.partnerClientId,
  });
  if (!client) {
    // exact error message is being checked in the verifyPartnerLinkRequestModel, don't change it
    throw new ApiExError(httpStatusCodes.forbidden, 'Invalid client', {
      token,
    });
  }

  if (
    partnerLinkRequestsRecord.unsuccessfulVerificationAttempts >=
    ALLOWABLE_VERIFICATION_ATTEMPTS
  ) {
    // exact error message is being checked in the verifyPartnerLinkRequestModel, don't change it
    throw new ApiExError(
      httpStatusCodes.forbidden,
      'Exceeded allowable verification attempts',
      {
        token,
      },
    );
  }

  const isExpired = isAfter(
    new Date(),
    partnerLinkRequestsRecord.expirationDateTime,
  );
  if (isExpired) {
    // exact error message is being checked in the verifyPartnerLinkRequestModel, don't change it
    throw new ApiExError(httpStatusCodes.forbidden, 'Expired token', { token });
  }

  return partnerLinkRequestsRecord;
}
