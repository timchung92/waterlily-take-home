import { sendPolicyOptionsRequestEmail } from "src";
import { ApiExError, httpStatusCodes, isNullUndefinedOrEmpty } from "@shared";

export async function postPolicyOptionsRequestEmail({ body }: BodyProps<PolicyOptionsRequestEmailProps>) {
    const { clientEmail, advisorEmail, clientFirstName, clientLastName, clientOnboardingSlidesLink, advisorFirstName } = body;

    if (isNullUndefinedOrEmpty(clientEmail)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'clientEmail is required', {});
    }

    if (isNullUndefinedOrEmpty(advisorEmail)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'advisorEmail is required', {});
    }

    if (isNullUndefinedOrEmpty(clientFirstName)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'clientFirstName is required', {});
    }

    if (isNullUndefinedOrEmpty(advisorFirstName)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'advisorFirstName is required', {});
    }

    if (isNullUndefinedOrEmpty(clientOnboardingSlidesLink)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'clientOnboardingSlidesLink is required', {});
    }

    await sendPolicyOptionsRequestEmail({
        clientEmail,
        clientFirstName,
        clientLastName,
        clientOnboardingSlidesLink,
        advisorEmail,
        advisorFirstName
    });
    return 'Client policy options request email sent successfully.';
}
