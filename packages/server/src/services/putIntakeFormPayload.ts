import { ApiExError, httpStatusCodes, isNullUndefinedOrEmpty } from "@shared";
import { upsertIntakeFormPayloadSql, runQuery } from "src";

export async function putIntakeFormPayload({ body }: BodyProps<IntakeFormPayloadBodyProps>) {
    if (isNullUndefinedOrEmpty(body.typeformPayloadSubmissionId)) {
        throw new ApiExError(httpStatusCodes.badRequest, 'Missing typeformPayloadSubmissionId.', { body });
    }
    await runQuery(upsertIntakeFormPayloadSql(body));

    return 'Intake form payload successfully stored.';
}
