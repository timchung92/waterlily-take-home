import { selectClientsBy } from '@server/datastore/clientsDb';

export async function fetchClientsForAdvisorByAdvisorId({
  advisorId,
}: AdvisorIdProps) {
  return selectClientsBy({ advisorId, includeSubordinates: true });
}
