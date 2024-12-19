import { appModel, filterNullProperties } from '@shared';
import { upsert } from '../datastore';
import { fetchAdvisorByAdvisorId } from '../services/fetchAdvisorByAdvisorId';
import { assertPathParametersMatchesBody } from '../util/assertPathParametersMatchesBody';

export async function putAdvisorByAdvisorId({
  advisorId,
  body,
}: AdvisorIdProps & BodyProps<Advisor>) {
  assertPathParametersMatchesBody({ advisorId }, body);

  // special case, never null out any Advisor fields
  const safeAdvisor = filterNullProperties(body);

  await upsert(appModel.tableNames.advisors, safeAdvisor);
  return fetchAdvisorByAdvisorId({ advisorId });
}
