import { convertClientTagsToClientTagDefs } from '@shared';
import { assertPathParametersMatchesBody, updateClientTags } from 'src';

export async function putClientTagsByClientId({
  clientId,
  body,
}: ClientIdProps & BodyProps<PutClientTagsBodyProps>) {
  assertPathParametersMatchesBody({ clientId }, body);
  const { clientTags } = body;
  const clientTagDefIds = convertClientTagsToClientTagDefs(
    clientId,
    clientTags,
  );
  await updateClientTags(clientId, clientTagDefIds);
}
