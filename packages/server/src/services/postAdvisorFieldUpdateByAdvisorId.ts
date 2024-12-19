import { appModel } from '@shared';
import { runQuery, updateSql } from '../datastore';
import { fetchAdvisorByAdvisorId } from './fetchAdvisorByAdvisorId';
import { assertPathParametersMatchesBody } from '../util/assertPathParametersMatchesBody';

export async function postAdvisorFieldUpdateByAdvisorId({
  advisorId,
  body,
}: AdvisorIdProps & BodyProps<AdvisorFieldUpdateProps>) {
  assertPathParametersMatchesBody({ advisorId }, body);

  const { advisorFieldKey, advisorFieldValue } = body;
  const advisor = await fetchAdvisorByAdvisorId({ advisorId });

  if (!advisor) {
    return 'Advisor not found';
  }

  const previousAdvisorFieldValue = advisor[advisorFieldKey];
  const sql = updateSql(appModel.tableNames.advisors, {
    advisorId,
    [advisorFieldKey]: advisorFieldValue,
  });

  await runQuery(sql);

  return `Updated ${advisorFieldKey} from ${previousAdvisorFieldValue} to ${advisorFieldValue}`;
}
