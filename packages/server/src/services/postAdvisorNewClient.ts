import {
  appModel,
  convertClientTagsToClientTagDefs,
  logInfo,
  newUuid,
  randomUnambiguousString,
  ClientStatus,
  ClientTagDef,
} from '@shared';
import { insertSql, runQuery } from 'src';

export async function postAdvisorNewClient({
  body,
}: BodyProps<PostAdvisorNewClientBodyProps>) {
  const {
    advisorId,
    clientEmail,
    clientFirstName,
    clientLastName,
    surveyId,
    intakeFormUrl,
  } = body;
  const clientId = `${randomUnambiguousString(3)}-${randomUnambiguousString(4)}`;
  const client = {
    clientId,
    advisorId,
    clientFirstName,
    clientLastName,
    clientEmail,
    clientAddedDateTime: new Date(),
    clientStatus: ClientStatus.active,
    clientTags: [
      appModel.tablesByName.clientTagDefs.labelsByValue[
        ClientTagDef.intakeFormIncomplete
      ],
    ],
    lastSlideSeen: 0,
    planProgressPercent: 0.15,
    surveyId,
    intakeFormUrl,
  } as Client;

  const queries = [
    insertSql(appModel.tablesByName.clients.tableName, client, {
      skipReturning: true,
      expectedRowCountMin: 1,
      expectedRowCountMax: 1,
    }),
    ...convertClientTagsToClientTagDefs(clientId, client.clientTags).map(
      clientTagDefId =>
        insertSql(
          appModel.tableNames.clientTags,
          {
            clientId,
            clientTagDefId,
          },
          {
            skipReturning: true,
            expectedRowCountMin: 1,
            expectedRowCountMax: 1,
          },
        ),
    ),
    insertSql(appModel.tableNames.clientOnboardingSlideProgress, {
      clientOnboardingSlideProgressId: newUuid(),
      clientId,
    }),
  ];

  await runQuery(queries);
  logInfo(
    postAdvisorNewClient,
    'Created new client and survey from intake form.',
    {
      advisorId,
      clientId,
      clientFirstName,
      clientLastName,
      client,
    },
  );

  return { client };
}
