import { selectSubordinateAdvisorsByAdvisorIdSql } from '../datastore/sql';
import { selectMany } from '../datastore';

export async function fetchSubordinateAdvisorsByAdvisorId({
  advisorId,
}: {
  advisorId: string;
}): Promise<Advisor[]> {
  const subordinateAdvisors = await selectMany<Advisor>(
    selectSubordinateAdvisorsByAdvisorIdSql(advisorId),
  );
  return subordinateAdvisors;
}
