import { appModel, filterNullProperties } from '@shared';
import { runQuery, updateSql } from '../datastore';
import { fetchAdvisorByAdvisorId } from './fetchAdvisorByAdvisorId';
import { assertPathParametersMatchesBody } from '../util/assertPathParametersMatchesBody';

export async function postAdvisorUpdatesByAdvisorId({
  advisorId,
  body,
}: AdvisorIdProps & BodyProps<AdvisorProfile>) {
  assertPathParametersMatchesBody({ advisorId }, body);

  // special case, never null out any Advisor fields
  const safeAdvisor = filterNullProperties(body);

  const sql = updateSql(appModel.tableNames.advisors, safeAdvisor);
  await runQuery(sql);

  return fetchAdvisorByAdvisorId({ advisorId });
}
