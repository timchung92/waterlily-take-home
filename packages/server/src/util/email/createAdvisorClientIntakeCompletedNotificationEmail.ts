import { ApiExError, appModel, getBaseUrl, httpStatusCodes } from "@shared";
import { selectSimple, sendAdvisorClientIntakeCompletedNotificationEmail } from "src";

interface CreateAdvisorClientIntakeCompletedNotificationEmailProps {
    advisorId: string;
    clientId: string;
}
export async function createAdvisorClientIntakeCompletedNotificationEmail({advisorId, clientId}: CreateAdvisorClientIntakeCompletedNotificationEmailProps) {
    const advisorPromise = selectSimple<Advisor | null>(appModel.tableNames.advisors, {advisorId});
    const clientPromise = selectSimple<Client | null>(appModel.tableNames.clients, {clientId});
    const [advisor, client] = await Promise.all([advisorPromise, clientPromise]);
    if (!advisor) {
        throw new ApiExError(httpStatusCodes.forbidden, 'Invalid advisorId', { advisorId });
    }
    if (!client) {
        throw new ApiExError(httpStatusCodes.forbidden, 'Invalid clientId', { clientId });
    }
    const clientOnboardingSlidesLink = `${getBaseUrl()}/clients/${client.clientId}/onboarding/results-are-in`;
    
    await sendAdvisorClientIntakeCompletedNotificationEmail({
        advisorEmail: advisor.advisorEmail,
        advisorFirstName: advisor.advisorFirstName,
        clientEmail: client.clientEmail,
        clientFirstName: client.clientFirstName,
        clientLastName: client.clientLastName,
        clientOnboardingSlidesLink
    });

}