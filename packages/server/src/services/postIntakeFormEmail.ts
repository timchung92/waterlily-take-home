import { sendClientIntakeFormEmail } from 'src';
import { ApiExError, httpStatusCodes, isNullUndefinedOrEmpty } from '@shared';

export async function postIntakeFormEmail({
  body,
}: BodyProps<IntakeFormEmailProps>) {
  const {
    email,
    intakeFormLink,
    clientFirstName,
    advisorFirstName,
    advisorOrganization,
    advisorProvidedBody,
  } = body;

  if (isNullUndefinedOrEmpty(email)) {
    throw new ApiExError(httpStatusCodes.badRequest, 'Email is required', {});
  }

  if (isNullUndefinedOrEmpty(intakeFormLink)) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Intake Form Link is required',
      {},
    );
  }

  try {
    const result = await sendClientIntakeFormEmail({
      email,
      clientFirstName,
      advisorFirstName,
      intakeFormLink,
      advisorOrganization,
      advisorProvidedBody,
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
