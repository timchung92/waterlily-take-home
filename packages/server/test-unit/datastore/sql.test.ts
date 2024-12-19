import { expect, test } from 'vitest';
import { sql } from '../../src/datastore/sql';
import { last } from 'lodash';

test('comprehensive all types', () => {

  const surveyId = '9a0c7422-ffe1-417d-a346-4b388def6a25';
  const clientId = 'abc-1234';
  const lastPageSeen = 1;
  const fakeFloatValue = 0.33;
  const surveyVersionDateTime = new Date(2000, 0, 1, 8, 9, 10);
  const partnerBirthDate = new Date(1940, 1, 2);
  const surveyRating = [ 1, 2, 3 ];
  const buffer = Buffer.of(1, 2, 3, 4, 5);
  const nil = null;

  const actual = sql`
    SELECT *
    FROM Surveys
    WHERE surveyId = ${ surveyId }
      AND clientId = ${ clientId }
      AND lastPageSeen = ${ lastPageSeen }
      AND fakeFloatValue = ${ fakeFloatValue }
      AND surveyVersionDateTime = ${ surveyVersionDateTime }
      AND partnerBirthDate = ${ partnerBirthDate }
      AND surveyRating IN (${ surveyRating })
      AND bufferTest = ${ buffer }
      AND nilTest = ${ nil }
  `;

  const expectedFinalSql = `
    SELECT *
    FROM "Surveys"
    WHERE "surveyId" = $1::UUID
      AND "clientId" = $2::TEXT
      AND "lastPageSeen" = $3::NUMERIC
      AND "fakeFloatValue" = $4::NUMERIC
      AND "surveyVersionDateTime" = $5::TIMESTAMP
      AND "partnerBirthDate" = $6::DATE
      AND "surveyRating" IN ($7::NUMERIC, $8::NUMERIC, $9::NUMERIC)
      AND "bufferTest" = $10
      AND "nilTest" = $11
    LIMIT 1000`;

  const expectedValues = [
    surveyId,
    clientId,
    lastPageSeen,
    fakeFloatValue,
    surveyVersionDateTime,
    partnerBirthDate,

    // Array surveyRating gets flattened
    1,
    2,
    3,

    buffer,
    nil
  ]
  expect(actual.finalSql).toEqual(expectedFinalSql);
  expect(actual.values).toEqual(expectedValues);
});
