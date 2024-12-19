import { selectOne, sql } from '@server/datastore';
import { ApiExError, httpStatusCodes } from '@shared';

export async function fetchInferenceSetForClientByClientId({ clientId }: ClientIdProps) {
  const inferenceeSet = await selectOne<InferenceSet>(
    sql`
      SELECT    *
      FROM      InferenceSets
      WHERE     clientId = ${ clientId }
      ORDER BY  inferenceSetVersionDateTime DESC
      LIMIT     1
    `
  );

  if (inferenceeSet === null) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      'Requested inference set not found by specified clientId.',
      {
        clientId
      }
    );
  }

  return inferenceeSet;
}
