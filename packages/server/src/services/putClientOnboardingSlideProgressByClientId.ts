import { appModel, convertClientTagsToClientTagDefs } from '@shared';
import {
  assertPathParametersMatchesBody,
  fetchClientByClientId,
  updateClientTags,
  upsert,
} from 'src';

export async function putClientOnboardingSlideProgressByClientId({
  clientId,
  body,
}: ClientIdProps & BodyProps<ClientOnboardingSlideProgress>) {
  assertPathParametersMatchesBody({ clientId }, body);
  await upsert<ClientOnboardingSlideProgress>(
    appModel.tableNames.clientOnboardingSlideProgress,
    body,
  );
  const { clientTags } = body;

  if (clientTags) {
    const clientTagDefIds = convertClientTagsToClientTagDefs(
      clientId,
      clientTags,
    );
    await updateClientTags(clientId, clientTagDefIds);
  }
  return fetchClientByClientId(clientId);
}
