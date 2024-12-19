import { ApiExError, appModel, httpStatusCodes, isNullUndefinedOrEmpty } from "@shared";
import { selectSimple } from "src";

export async function fetchEmailPreferencesForPublicByEmail({
    email,
    }: {
    email: string;
    }) {
        if (isNullUndefinedOrEmpty(email)) {
            throw new ApiExError(httpStatusCodes.forbidden, 'Email is required', {});
        }
        const emailPreferences = await selectSimple<EmailPreferences>(appModel.tableNames.emailPreferences, { email });
        if (!emailPreferences) {
            return {
                email,
                optOutReminders: false,
                optOutTransactions: false,
            }
        } else {
            return emailPreferences;
        }
    }