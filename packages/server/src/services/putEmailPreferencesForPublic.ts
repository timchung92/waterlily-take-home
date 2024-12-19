import { selectSimple, upsert } from "src";
import { appModel } from "@shared";

export async function putEmailPreferencesForPublic({
  body,
}: BodyProps<EmailPreferences>) {

  await upsert<EmailPreferences>(appModel.tableNames.emailPreferences, body);

  return selectSimple<EmailPreferences>(appModel.tableNames.emailPreferences, {email: body.email});
}