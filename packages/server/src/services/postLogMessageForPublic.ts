import { LogMessage, logMessage } from "@shared";

export async function postLogMessageForPublic({ body }: BodyProps<LogMessage[]>) {
  body.forEach(logMessage);
}
