import {
  insert,
  selectMany,
  selectSimpleSql,
  sendPartnerLinkRequestEmail,
} from 'src';
import { appModel } from '@shared/appModel';
import { ApiExError, getBaseUrl, httpStatusCodes, newUuid } from '@shared';

export async function putPartnerLinkRequestEmail({
  body,
}: BodyProps<PutPartnerLinkRequestEmailProps>) {
  const {
    partnerEmail,
    clientEmail,
    clientFirstName,
    clientLastName,
    clientId,
    advisorId,
  } = body;

  // check if the partner email exists for advisor
  const rows = await selectMany<Client>(
    selectSimpleSql(appModel.tableNames.clients, {
      clientEmail: partnerEmail,
      advisorId,
    }),
  );

  if (rows.length === 0) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      'Not found - partner with provided email not found for advisor.',
      {
        partnerEmail,
        advisorId,
      },
    );
  }

  if (rows.length > 1) {
    throw new ApiExError(
      httpStatusCodes.conflict,
      'Multiple records - more than one record returned.',
      {
        rowCount: rows.length,
        partnerEmail,
        advisorId,
      },
    );
  }

  const partner = rows[0];
  if (partner.partnerClientId) {
    throw new ApiExError(
      httpStatusCodes.conflict,
      'Already linked - partner already linked to another client.',
      {
        partnerEmail,
        advisorId,
        partnerClientId: partner.partnerClientId,
      },
    );
  }

  // check if the partner has submitted an intake form
  const inferenceSet = await selectMany<InferenceSet>(
    selectSimpleSql(appModel.tableNames.inferenceSets, {
      clientId: partner.clientId,
    }),
  );

  if (inferenceSet.length === 0) {
    throw new ApiExError(
      httpStatusCodes.conflict,
      'No inference set - partner has not submitted an intake form.',
      {
        partnerEmail,
        advisorId,
      },
    );
  }

  // put record into partner link requests table
  const partnerLinkRequestId = newUuid();
  const token = newUuid();
  const status = 'requested';

  await insert(appModel.tableNames.partnerLinkRequests, {
    partnerLinkRequestId,
    clientId,
    partnerClientId: partner.clientId,
    advisorId,
    token,
    status,
  });

  await sendPartnerLinkRequestEmail({
    partnerEmail,
    clientEmail,
    clientFirstName,
    clientLastName,
    partnerLinkRequestUrl: createPartnerLinkRequestLink(token),
  });
}

function createPartnerLinkRequestLink(token: string) {
  return `${getBaseUrl()}/auth/partner-link/${token}`;
}
