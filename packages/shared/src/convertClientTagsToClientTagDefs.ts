import { ApiExError } from './ApiExError';
import { appModel } from './appModel';
import { httpStatusCodes } from './httpStatusCodes';

export function convertClientTagsToClientTagDefs(clientId: string, clientTags: string[]): number[] {
  const { valuesByLabel } = appModel.tablesByName.clientTagDefs;
  return clientTags.map((label) => {
    const clientTagDefId = valuesByLabel[ label as keyof typeof valuesByLabel ];
    if (clientTagDefId === undefined) {
      throw new ApiExError(
        httpStatusCodes.badRequest,
        "The client could not be updated; the tags provided do not exist as options in the database.",
        {
          clientTags,
          clientId,
          clientTagLabels: Object.keys(valuesByLabel),
        }
      );
    }
    return clientTagDefId;
  });
}