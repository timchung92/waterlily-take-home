import { selectAdvisorByAdvisorIdSql, selectOne } from '@server/datastore';

export function fetchAdvisorByAdvisorId(keys: AdvisorIdProps) {
  return selectOne<Advisor>(
      selectAdvisorByAdvisorIdSql(keys.advisorId)
    );
  
}
