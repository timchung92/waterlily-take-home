import { ApiExError, httpStatusCodes, isNullUndefinedOrEmpty } from '@shared';
import { sendAdvisorMeetingRequestEmail } from 'src/util/email/emailService';

export async function postAdvisorMeetingRequestEmail({
  body,
}: BodyProps<AdvisorMeetingRequestEmailProps>) {
  const {
    advisorEmail,
    clientEmail,
    advisorFirstName,
    clientFullName,
    clientProvidedBody,
  } = body;

  if (isNullUndefinedOrEmpty(advisorEmail)) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Advisor email is required',
      {},
    );
  }
  if (isNullUndefinedOrEmpty(clientEmail)) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Client email is required',
      {},
    );
  }
  if (isNullUndefinedOrEmpty(clientFullName)) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Client full name is required',
      {},
    );
  }

  try {
    const result = await sendAdvisorMeetingRequestEmail({
      advisorEmail,
      clientEmail,
      advisorFirstName,
      clientFullName,
      clientProvidedBody,
    });
    return result;
  } catch (error) {
    throw new ApiExError(
      httpStatusCodes.internalServerError,
      error.message,
      {},
    );
  }
}
