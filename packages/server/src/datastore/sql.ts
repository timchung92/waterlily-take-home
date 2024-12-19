import {
  camelCase,
  isDate,
  isEmpty,
  isNumber,
  isString,
  isUndefined,
  pick,
} from 'lodash';
import {
  AppFieldDef,
  AppTableDef,
  ExError,
  SupportProviderDetailSetSource,
  appModel,
  careEnvironmentList,
  carePhaseDefList,
  convertClientTagsToClientTagDefs,
  filterArrayByObjectProperties,
  getOrDefault,
  hasOwnProperty,
  hasTimeComponent,
  inCollection,
  isDefined,
  isNullOrUndefined,
  isNullUndefinedOrEmpty,
  isUuid,
  logOnceFatal,
  newUuid,
  not,
  numericDescSorter,
  pickValues,
  pii,
  regexExtractCaptures,
  replacePlaceholers,
  surveyQuestionTypeByQuestionRef,
  toObjectMap,
} from '@shared';
import { dbFormatByQuestionType } from './dbFormatters';
import { customHiddenFieldQueryParamPrefix } from '@shared';

const keepCallsPrivate = Symbol('SafeSqlPrivateConstructor');
const textPlaceholdersSymbol = Symbol('TextPlaceholders');

type WriteSqlOptions = {
  skipReturning?: boolean;
  expectedRowCountMin?: number;
  expectedRowCountMax?: number;
};

const exactlyOneRowNoReturn = {
  skipReturning: true,
  expectedRowCountMin: 1,
  expectedRowCountMax: 1,
};

export class SafeSql {
  constructor(
    _privateValidator: typeof keepCallsPrivate,
    public readonly text: string,
    public readonly values: unknown[],
    private expectedRowCountMin: number = -1,
    private expectedRowCountMax: number = Number.MAX_SAFE_INTEGER,
  ) {}

  get finalSql(): string {
    const textLimited = ensureHasLimit(this.text);
    const quoted = quoteIdentifiers(textLimited);
    return quoted;
  }

  toString() {
    const { values } = this;

    if (isNullUndefinedOrEmpty(values)) {
      return this.finalSql;
    }

    const valueStrings = values
      .map(
        (value, index) =>
          `--    ${index}: ${String(value).substring(0, 25)} (${typeof value})`,
      )
      .join('\n');

    const qualifiedValues = toObjectMap(
      values,
      (_value, index) => String(index + 1),
      value => (isString(value) ? `'${value}'` : value),
    );

    values.map(value => (isString(value) ? `'${value}'` : value));

    const interpolatedSql = replacePlaceholers(this.finalSql, qualifiedValues);

    return `-- values:\n${valueStrings}\n\n${interpolatedSql}`;
  }

  expectRowCountExactly(count: number) {
    this.expectedRowCountMin = this.expectedRowCountMax = count;
    return this;
  }

  expectRowCountBetween(minCount: number, maxCount: number) {
    this.expectedRowCountMin = minCount;
    this.expectedRowCountMax = maxCount;
    return this;
  }

  expectRowCountAtLeast(minCount: number) {
    this.expectedRowCountMin = minCount;
    this.expectedRowCountMax = Number.MAX_SAFE_INTEGER;
    return this;
  }

  expectRowCountAtMost(maxCount: number) {
    this.expectedRowCountMin = -1;
    this.expectedRowCountMax = maxCount;
    return this;
  }

  checkRowCount(actualCount: number) {
    if (
      actualCount >= this.expectedRowCountMin &&
      actualCount <= this.expectedRowCountMax
    ) {
      return this;
    }

    const { expectedRowCountMin, expectedRowCountMax, text, values } = this;

    throw new ExError('Query results row count not as expected.', {
      actualCount,
      expectedRowCountMin:
        expectedRowCountMin === -1 ? 'no-min' : expectedRowCountMin,
      expectedRowCountMax:
        expectedRowCountMax === Number.MAX_SAFE_INTEGER
          ? 'no-max'
          : expectedRowCountMax,
      text,
      values,
    });
  }

  appendStatement(otherSql: SafeSql) {
    return this.appendFragment(keepCallsPrivate, otherSql, ';\n\n');
  }

  appendFragment(
    _privateUseOnly: typeof keepCallsPrivate,
    fragment: SafeSql,
    separator: string = '\n',
  ) {
    const shiftedNewText = shiftPlaceholders(fragment.text, this.values.length);

    return new SafeSql(
      keepCallsPrivate,
      `${this.text}${separator}${shiftedNewText}`,
      this.values.concat(fragment.values),
    );
  }

  appendWhereClause<T extends Object>(
    _privateUseOnly: typeof keepCallsPrivate,
    whereValues: T,
  ) {
    let buildingSql = '';
    const newValues = [...this.values];
    Object.entries(whereValues).forEach(([fieldName, value], index) => {
      buildingSql +=
        (index === 0 ? '  WHERE     ' : '\n        AND     ') +
        `${fieldName} = ${createSqlPlaceholder(index + 1, value)}`;
      newValues.push(value);
    });

    return this.appendFragment(
      keepCallsPrivate,
      new SafeSql(keepCallsPrivate, buildingSql, newValues),
      '\n',
    );
  }
}

export function sql(fragments: TemplateStringsArray, ...values: unknown[]) {
  const interpolated = [] as string[];
  const flattenedValues = [] as unknown[];
  let foundTextPlaceholders = undefined as ObjectMap<string> | undefined;

  fragments.forEach((fragment, fragmentIndex) => {
    interpolated.push(fragment);

    if (fragmentIndex === fragments.length - 1) {
      // last fragment, no value ever
      return;
    }

    const value = values[fragmentIndex];

    if (fragmentIndex === fragments.length - 2) {
      foundTextPlaceholders = getOrDefault(value, textPlaceholdersSymbol);
      if (foundTextPlaceholders !== undefined) {
        return;
      }
    }

    if (value === undefined) {
      // `null` is important to preserve
      return;
    }

    if (value instanceof SafeSql) {
      interpolated.push(shiftPlaceholders(value.text, flattenedValues.length));
      flattenedValues.splice(flattenedValues.length, 0, ...value.values);
    } else if (Array.isArray(value)) {
      value.forEach((subValue, index) => {
        if (index) {
          interpolated.push(', ');
        }
        appendParam(subValue);
      });
    } else {
      appendParam(value);
    }
  });

  let sqlText = interpolated.join('');
  if (foundTextPlaceholders !== undefined) {
    sqlText = replacePlaceholers(sqlText, foundTextPlaceholders, '$', '');
  }

  return new SafeSql(keepCallsPrivate, sqlText, flattenedValues);

  function appendParam(value: unknown) {
    const identifier = createSqlPlaceholder(flattenedValues.length + 1, value);
    interpolated.push(identifier);
    flattenedValues.push(value);
  }
}

export function createSqlPlaceholder(num: number, value: unknown) {
  const typ = sqlTypeOf(value);
  const identifier = `$${num}${isNullUndefinedOrEmpty(typ) ? '' : '::'}${typ}`;
  return identifier;
}

export function existsSql<T extends Object>(
  tableName: string | keyof typeof appModel.tablesByName,
  whereValues: T,
) {
  const buildingSql = `
      SELECT EXISTS (
      SELECT    1
      FROM      ${tableName}
    `;

  return new SafeSql(keepCallsPrivate, buildingSql, [])
    .appendWhereClause(keepCallsPrivate, whereValues)
    .appendFragment(keepCallsPrivate, sql`) AS itExists`, '\n');
}

function ensureHasLimit(sqlText: string) {
  const selectMatch = sqlText.match(/^\n*( *)SELECT/i);
  if (selectMatch === null) {
    return sqlText;
  }

  const indent = selectMatch[1];

  const hasLimit =
    /LIMIT(?: |\n)+\d+(?:(?: |\n)+OFFSET(?: |\n)+\d+)?(?: |\n)*$/.test(sqlText);
  return hasLimit ? sqlText : `${sqlText.trimEnd()}\n${indent}LIMIT 1000`;
}

export function insertSql<T>(
  tableName: string,
  item: T,
  options: WriteSqlOptions = {},
) {
  if (!hasAllRequiredFields(tableName, item)) {
    throw new ExError(
      'Cannot create automatic INSERT statement when not all required fields were present',
      {
        tableName,
        item,
        requiredFields: listRequiredFieldNames(tableName).join(', '),
      },
    );
  }

  const table = appModel.tablesByName[tableName] as AppTableDef;
  const insertingFields = filterArrayByObjectProperties(
    table.orderedFieldNames,
    item,
  );
  const fieldList = insertingFields.join(', ');
  const values = pickValues(item, insertingFields);
  const paramList = values
    .map((value, index) => createSqlPlaceholder(index + 1, value))
    .join(', ');
  const returning = ifReturning(options);

  const sqlText = `
    INSERT INTO ${tableName} ( ${fieldList})
    VALUES      ( ${paramList} )
    ${returning}`;

  return new SafeSql(
    keepCallsPrivate,
    sqlText,
    values,
    options.expectedRowCountMin,
    options.expectedRowCountMax,
  );
}

export function insertSupportProviderDetailSetDeletingOneSupportProviderSql(
  clientId: string,
  supportProviderId: string,
) {
  const supportProviderDetailSetId = newUuid();

  return [
    // Make sure we're not deleting the last support provider
    sql`
      SELECT    SPD.supportProviderId

      FROM      SupportProviderDetails SPD

      WHERE     SPD.supportProviderDetailSetId =
                  (
                    SELECT    supportProviderDetailSetId
                    FROM      SupportProviderDetailSets
                    WHERE     clientId = ${clientId}
                    ORDER BY  supportProviderDetailSetDateTime DESC
                    LIMIT     1
                  )

        AND     SPD.supportProviderId != ${supportProviderId}
    `.expectRowCountAtLeast(1),

    sql`
      INSERT INTO   SupportProviderDetailSets (
                      supportProviderDetailSetId,
                      supportProviderDetailSetDateTime,
                      supportProviderDetailSetSource,
                      clientId
                    )
      VALUES        (
                      ${supportProviderDetailSetId},
                      CURRENT_TIMESTAMP,
                      ${SupportProviderDetailSetSource.client},
                      ${clientId}
                    )
    `.expectRowCountExactly(1),
    sql`
      INSERT INTO   SupportProviderDetails (
                      supportProviderDetailId,
                      supportProviderDetailSetId,
                      supportProviderId,
                      supportProviderPhaseOneHours,
                      supportProviderPhaseTwoHours,
                      supportProviderPhaseThreeHours,
                      supportProviderRateHourly,
                      supportProviderRateMonthly
                    )

      SELECT        uuid_generate_v4(),
                    ${supportProviderDetailSetId},
                    supportProviderId,
                    supportProviderPhaseOneHours,
                    supportProviderPhaseTwoHours,
                    supportProviderPhaseThreeHours,
                    supportProviderRateHourly,
                    supportProviderRateMonthly

      FROM          SupportProviderDetails

      WHERE         supportProviderDetailSetId =
                      (
                        SELECT    supportProviderDetailSetId
                        FROM      SupportProviderDetailSets
                        WHERE     clientId = ${clientId}
                          AND     supportProviderDetailSetId != ${supportProviderDetailSetId}
                        ORDER BY  supportProviderDetailSetDateTime DESC
                        LIMIT     1
                      )

        AND         supportProviderId != ${supportProviderId}
    `.expectRowCountAtLeast(1),
  ];
}

export function deleteClient(clientId: string) {
  const queries: SafeSql[] = [];

  queries.push(sql`
    DELETE FROM "SurveyAnswers" WHERE "surveyVersionId" IN (
      SELECT "surveyVersionId" FROM "Surveys" WHERE "clientId" = ${clientId}
    );
  `);

  queries.push(sql`
    DELETE FROM "Surveys" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "InferenceSets" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "FundingSourceDetails" WHERE "fundingSourceId" IN (
      SELECT "fundingSourceId" FROM "FundingSources" WHERE "clientId" = ${clientId}
    );
  `);

  queries.push(sql`
    DELETE FROM "FundingSources" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "SupportProviderDetails" WHERE "supportProviderDetailSetId" IN (
      SELECT "supportProviderDetailSetId" FROM "SupportProviderDetailSets" WHERE "clientId" = ${clientId}
    );
  `);

  queries.push(sql`
    DELETE FROM "SupportProviderDetailSets" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "SupportProviders" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "CareEnvironmentSelections" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientTags" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "MagicLinks" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientOnboardingSlideProgress" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientCarePhaseDurationSelections" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientPolicyDataExtractRequests" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientCareEnvironmentCosts" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
      UPDATE "Clients"
      SET "partnerClientId" = NULL
      WHERE "partnerClientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "PartnerLinkRequests" WHERE "clientId" = ${clientId} OR "partnerClientId" = ${clientId};
  `);

  queries.push(sql`
      DELETE FROM ClientPartnerLinks
      WHERE coupleId = (
        SELECT coupleId
        FROM ClientPartnerLinks
        WHERE clientId = ${clientId})`);

  queries.push(sql`
    DELETE FROM "ClientCustomInferences" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "ClientCalculationSettings" WHERE "clientId" = ${clientId};
  `);

  queries.push(sql`
    DELETE FROM "Clients" WHERE "clientId" = ${clientId};
  `);

  return queries;
}

export function insertSurveyAndAnswersSql<T extends Survey>(
  survey: T,
  typeformPayload: TypeformWebhookPayload,
) {
  return [
    insertSql(appModel.tablesByName.surveys.tableName, survey, {
      skipReturning: true,
      expectedRowCountMin: 1,
      expectedRowCountMax: 1,
    }),
    ...insertSurveyMissingQuestionsSql(survey, typeformPayload),
    ...insertSurveyAnswersSql(survey),
  ];
}

export function insertSurveyAnswersSql<T extends Survey>(survey: T) {
  const { surveyVersionId } = survey;
  const surveyQuestionRefs =
    appModel.tablesByName.surveyQuestions.valuesByLabel;
  const answers = Object.entries(survey)
    .filter(
      ([surveyQuestionRef, _surveyAnswerValue]) =>
        surveyQuestionRefs[surveyQuestionRef] ||
        surveyQuestionRef.startsWith(
          camelCase(customHiddenFieldQueryParamPrefix),
        ),
    )
    .map(([surveyQuestionRef, surveyAnswerValue]) => ({
      surveyAnswerId: newUuid(),
      surveyVersionId,
      surveyQuestionRef,
      surveyAnswerValue: dbFormatByQuestionType(
        surveyQuestionTypeByQuestionRef[surveyQuestionRef] ??
          appModel.tablesByName.surveyQuestionTypes.valuesByLabel.Text,
        surveyAnswerValue,
      ),
    }));

  const answersSql = answers.map(answer =>
    insertSql(appModel.tableNames.surveyAnswers, answer, exactlyOneRowNoReturn),
  );

  return answersSql;
}

function insertSurveyMissingQuestionsSql<T extends Survey>(
  survey: T,
  typeformPayload: TypeformWebhookPayload,
) {
  const knownFields = new Set([
    // fields that exist on Survey in-memory but are not part of the schema,
    'surveyDefinition',
    'surveySubmittedBy',

    // and fields provided by Typeform that are not part of Survey
    'clientFirstName',
    'clientLastName',

    ...appModel.tablesByName.surveys.orderedFieldNames,
    ...Object.keys(appModel.tablesByName.surveyQuestions.valuesByLabel),
  ]);
  const unexpectedQuestionRefs = Object.keys(survey).filter(
    not(inCollection(knownFields)),
  );

  if (isEmpty(unexpectedQuestionRefs)) {
    return [];
  }

  const {
    event_id: eventId,
    form_response: {
      definition: { fields, id: typeformSurveyId, title },
      form_id: formId,
    },
  } = typeformPayload;

  const {
    surveyVersionId,
    surveyId,
    surveyDefinitionId,
    clientId,
    surveySubmittedDateTime,
  } = survey;
  logOnceFatal(
    insertSurveyMissingQuestionsSql,
    'Typeform returned a survey with unexpected question references. Ignoring these questions.',
    {
      unexpectedQuestionRefs,
      survey: {
        surveyVersionId,
        surveyId,
        surveyDefinitionId,
        clientId,
        surveySubmittedDateTime,
      },
      typeform: {
        fieldNames: fields.map(field => field.ref),
        eventId,
        formId,
        typeformSurveyId,
        title,
      },
    },
  );

  const surveyQuestionType =
    appModel.tablesByName.surveyQuestionTypes.valuesByLabel.Text;

  return unexpectedQuestionRefs.map(
    questionRef =>
      sql`
      INSERT INTO   SurveyQuestions (
                      surveyQuestionRef,
                      surveyDefinitionId,
                      surveyQuestionType
                    )
      SELECT        ${questionRef},
                    ${surveyDefinitionId},
                    ${surveyQuestionType}

      ON CONFLICT (surveyQuestionRef) DO NOTHING
    `,
  );
}

function quoteIdentifiers(sqlText: string): string {
  return sqlText.replaceAll(
    // any word consisting only of letters that must have a mix
    // of upper and lower case letters in it somewhere,
    // in either order.
    //
    // and not already quoted (the quote things are a negative
    // lookbehind and lookahead).
    /\b(?<!")[a-zA-Z0-9]*([a-z][A-Z]|[A-Z][a-z])[a-zA-Z0-9]*(?!")\b/g,
    identifier => `"${identifier}"`,
  );
}

export function selectCareEnvironmentSelections(clientId: string) {
  return sql`
    SELECT    careEnvironment,
              carePhase

    FROM      CareEnvironmentSelections

    WHERE     clientId = ${clientId}
  `;
}

export function selectClientCareEnvironmentCosts(clientId: string) {
  return sql`
    SELECT    careEnvironment,
              rateAmount

    FROM      ClientCareEnvironmentCosts

    WHERE     clientId = ${clientId}
  `;
}

export function selectCarePhaseDurationSelections(clientId: string) {
  return sql`
    SELECT    carePhase,
              durationMonths

    FROM      ClientCarePhaseDurationSelections

    WHERE     clientId = ${clientId}
  `;
}

export function selectClientsBySql(
  keys:
    | (Pick<Client, 'advisorId'> & { includeSubordinates?: boolean })
    | Pick<Client, 'clientId'>,
) {
  if (!hasOwnProperty(keys, 'clientId') && !hasOwnProperty(keys, 'advisorId')) {
    throw new ExError(
      'Client selection must be restricted at least by clientId or advisorId.',
      {
        keys,
      },
    );
  }

  // Add additional validation for advisorId
  if ('advisorId' in keys && !keys.advisorId) {
    throw new ExError('advisorId must have a value when querying by advisor', {
      keys,
    });
  }

  if ('clientId' in keys) {
    return sql`
      SELECT c.*,
             ct.clientTagDefId,
             ctd.clientTagDefLabel,
             cosp.clientOnboardingSlideProgressId,
             cosp.hasClientStartedOnboarding,
             cosp.hasClientCompletedOnboarding
      FROM Clients c
          LEFT JOIN ClientTags ct ON c.clientId = ct.clientId
          LEFT JOIN ClientTagDefs ctd ON ct.clientTagDefId = ctd.clientTagDefId
          LEFT JOIN ClientOnboardingSlideProgress cosp ON c.clientId = cosp.clientId
      WHERE c.clientId = ${keys.clientId}
      ORDER BY c.clientLastName, c.clientFirstName, c.clientAddedDateTime, ct.clientTagDefId
    `;
  }

  // For advisor queries, include subordinate advisors if requested
  return sql`
    WITH advisor_ids AS (
      SELECT ${keys.advisorId} as advisor_id
      ${
        keys.includeSubordinates
          ? sql`
        UNION
        SELECT "subordinateAdvisorId" as advisor_id
        FROM "AdvisorHierarchy"
        WHERE "supervisorAdvisorId" = ${keys.advisorId}
          AND "isActive" = true
      `
          : sql``
      }
    )
    SELECT c.*,
           ct.clientTagDefId,
           ctd.clientTagDefLabel,
           cosp.clientOnboardingSlideProgressId,
           cosp.hasClientStartedOnboarding,
           cosp.hasClientCompletedOnboarding
    FROM Clients c
        LEFT JOIN ClientTags ct ON c.clientId = ct.clientId
        LEFT JOIN ClientTagDefs ctd ON ct.clientTagDefId = ctd.clientTagDefId
        LEFT JOIN ClientOnboardingSlideProgress cosp ON c.clientId = cosp.clientId
    WHERE c.advisorId IN (SELECT advisor_id FROM advisor_ids)
    ORDER BY c.clientLastName, c.clientFirstName, c.clientAddedDateTime, ct.clientTagDefId
  `;
}

export function selectFundingSourcesSql(clientId: string) {
  return sql`
      SELECT    FS.fundingSourceId,
                FS.fundingSourceLabel,
                FSD.fundingSourceDetailLabel,
                FSD.fundingSourceDetailValue

      FROM      FundingSources FS
                    INNER JOIN
                FundingSourceDetails FSD
                    ON
                  FSD.fundingSourceId = FS.fundingSourceId

      WHERE     FS.clientId = ${clientId}
  `;
}

export function selectInferenceSetSql(clientId: string) {
  return sql`
      SELECT    *
      FROM      InferenceSets
      WHERE     clientId = ${clientId}
      ORDER BY  inferenceSetVersionDateTime DESC
      LIMIT     1
    `;
}

export function selectAdvisorByAdvisorIdSql(advisorId: string) {
  return sql`
      SELECT    *
      FROM      Advisors
      WHERE     advisorId = ${advisorId}
      LIMIT     1
    `;
}

export function selectAdvisorByClientIdSql(clientId: string) {
  return sql`
      SELECT    A.*
      FROM      Advisors A
                INNER JOIN
                Clients C
                  ON
                A.advisorId = C.advisorId
      WHERE     C.clientId = ${clientId}
      LIMIT     1
    `;
}

export function selectIntakeSurveyCreatedAndInferencesRun(surveyId: string) {
  return sql`
    SELECT    DISTINCT
              S.clientId,
              I.inferenceSetId

    FROM      Surveys S
                  LEFT JOIN
              InferenceSets I
                  ON
                I.clientId = S.clientId

    WHERE     S.surveyId = ${surveyId}
  `;
}

export function selectClientCustomInferences(clientId: string) {
  return sql`
      SELECT    C.*
      FROM      ClientCustomInferences C
      WHERE     C.clientId = ${clientId}
    `;
}

export function selectSimpleSql<T>(tableName: string, whereValues: Partial<T>) {
  const buildingSql = `
      SELECT    *
      FROM      ${tableName}
    `;

  return new SafeSql(keepCallsPrivate, buildingSql, []).appendWhereClause(
    keepCallsPrivate,
    whereValues,
  );
}

export function selectSupportProviderSetByClientIdSql(clientId: string) {
  return sql`
      SELECT    SP.supportProviderId,
                SP.clientId,
                SP.supportProviderName,
                SP.supportProviderCareLevel,
                SP.supportProviderType,
                SP.supportProviderContribution,
                SPDS.supportProviderDetailSetId,
                SPDS.supportProviderDetailSetSource,
                SPDS.removeFamilyBurden,
                SPD.supportProviderPhaseOneHours,
                SPD.supportProviderPhaseTwoHours,
                SPD.supportProviderPhaseThreeHours,
                SPD.supportProviderRateHourly,
                SPD.supportProviderRateMonthly

      FROM      SupportProviderDetailSets SPDS
                    INNER JOIN
                SupportProviderDetails SPD
                    ON
                  SPDS.supportProviderDetailSetId = SPD.supportProviderDetailSetId
                    INNER JOIN
                SupportProviders SP
                    ON
                  SPD.supportProviderId = SP.supportProviderId
      WHERE     SPDS.supportProviderDetailSetId =
                  (
                    SELECT    supportProviderDetailSetId
                    FROM      SupportProviderDetailSets
                    WHERE     clientId = ${clientId}
                    ORDER BY  supportProviderDetailSetDateTime DESC
                    LIMIT     1
                  )
      ORDER BY
        /* spouse first, then other family, then professionals */
        CASE
          WHEN SP.supportProviderType = 2202 THEN 1
          WHEN SP.supportProviderType = 2201 THEN 3
          ELSE 2
        END,
        SP.supportProviderCareLevel,
        SP.supportProviderType,
        SP.supportProviderName
    `;
}

export function selectSurveysWithAnswers(
  clientId: string,
  surveyDefinitionIds?: number[],
  supportProviderIds?: string[],
) {
  const surveyDefinitionIdsFragment =
    surveyDefinitionIds === undefined
      ? undefined
      : sql`AND surveyDefinitionId IN (${surveyDefinitionIds})`;

  const supportProviderIdsFragment =
    supportProviderIds === undefined
      ? undefined
      : sql`AND supportProviderId IN (${supportProviderIds})`;

  return sql`
    SELECT      S.surveyVersionId,
                S.surveyVersionDateTime,
                S.surveyId,
                S.surveyDefinitionId,
                S.clientId,
                S.supportProviderId,
                S.surveyStatus,
                S.lastPageSeen,
                S.surveySubmittedDateTime,
                SA.surveyQuestionRef,
                SA.surveyAnswerValue,
                SQ.surveyQuestionType

    FROM        (
                  SELECT  surveyVersionId,
                          RANK() OVER (
                            PARTITION BY  surveyId
                            ORDER BY      surveyVersionDateTime DESC
                          ) = 1 as isLatestVersion

                  FROM    Surveys

                  WHERE   clientId = ${clientId}
                    ${surveyDefinitionIdsFragment}
                    ${supportProviderIdsFragment}

                ) SLatest
                    INNER JOIN
                Surveys S
                    ON
                  SLatest.surveyVersionId = S.surveyVersionId
                    INNER JOIN
                SurveyAnswers SA
                    ON
                  SA.surveyVersionId = S.surveyVersionId
                    INNER JOIN
                SurveyQuestions SQ
                    ON
                  SA.surveyQuestionRef = SQ.surveyQuestionRef

    ORDER BY    S.surveyVersionId,
                SA.surveyQuestionRef
  `;
}

export function sqlTypeOf(value: unknown) {
  // Made to support types we use, to re-check if any additionals were added
  // run this command in terminal in the project root.
  //
  //   sed -nE 's/^  [a-z][a-zA-Z]+ ([A-Z]+)( |,|\n).*/\1/p' packages/database/database-schema.sql | sort | uniq
  //
  //   DATE
  //   INT
  //   NUMERIC
  //   TEXT
  //   TIMESTAMP
  //   UUID
  //
  if (isNullOrUndefined(value) || Number.isNaN(value)) {
    return '';
  }

  if (isDate(value)) {
    return hasTimeComponent(value) ? 'TIMESTAMP' : 'DATE';
  }

  if (isNumber(value)) {
    return 'NUMERIC'; // Postgres will convert to INT fine when needed
  }

  if (isUuid(value)) {
    return 'UUID';
  }

  if (isString(value)) {
    return 'TEXT';
  }

  // unknown type, so let's not specify one,
  return '';
}

export function textPlaceholders(obj: ObjectMap<string>): unknown {
  return { [textPlaceholdersSymbol]: obj };
}

export function updateCareEnvironmentSelections(
  clientId: string,
  careEnvironmentSelections: CareEnvironmentSelections,
) {
  return carePhaseDefList.flatMap(carePhaseDef => {
    const carePhase = carePhaseDef.value;
    const careEnvironment = careEnvironmentSelections[carePhase];
    if (isNullOrUndefined(careEnvironment)) {
      return [
        sql`
            DELETE FROM   CareEnvironmentSelections
            WHERE         clientId = ${clientId}
              AND         carePhase = ${carePhase}
          `,
      ];
    }

    return [
      sql`
          DELETE FROM   CareEnvironmentSelections
          WHERE         clientId = ${clientId}
            AND         carePhase = ${carePhase}
            AND         careEnvironment <> ${careEnvironment}
        `,
      sql`
          INSERT INTO   CareEnvironmentSelections (
                          careEnvironmentSelectionId,
                          clientId,
                          carePhase,
                          careEnvironment
                        )

          SELECT        uuid_generate_v4(),
                        ${clientId},
                        ${carePhase},
                        ${careEnvironment}

          WHERE         NOT EXISTS (
                          SELECT      1

                          FROM        CareEnvironmentSelections

                          WHERE       clientId = ${clientId}
                            AND       carePhase = ${carePhase}
                            AND       careEnvironment = ${careEnvironment}
                        )
        `,
    ];
  });
}

export function updateClientCareEnvironmentCosts(
  clientId: string,
  careEnvironmentCosts: CareEnvironmentCosts,
) {
  return careEnvironmentList.flatMap(careEnvironmentDef => {
    const careEnvironment = careEnvironmentDef.dbId;
    const rateAmount = careEnvironmentCosts[careEnvironment];
    if (isNullOrUndefined(rateAmount)) {
      return [
        sql`
            DELETE FROM   ClientCareEnvironmentCosts
            WHERE         clientId = ${clientId}
              AND         careEnvironment = ${careEnvironment}
          `,
      ];
    }

    return [
      sql`
          DELETE FROM   ClientCareEnvironmentCosts
          WHERE         clientId = ${clientId}
            AND         careEnvironment = ${careEnvironment}
        `,
      sql`
          INSERT INTO   ClientCareEnvironmentCosts (
                          clientCareEnvironmentCostId,
                          clientId,
                          careEnvironment,
                          rateAmount
                        )

          SELECT        uuid_generate_v4(),
                        ${clientId},
                        ${careEnvironment},
                        ${rateAmount}

          WHERE         NOT EXISTS (
                          SELECT      1

                          FROM        ClientCareEnvironmentCosts

                          WHERE       clientId = ${clientId}
                            AND       careEnvironment = ${careEnvironment}
                            AND       rateAmount = ${rateAmount}
                        )
        `,
    ];
  });
}

export function updateClientCarePhaseDurationSelections(
  clientId: string,
  carePhaseDurationSelections: CarePhaseDurationSelections,
) {
  return carePhaseDefList.flatMap(carePhaseDef => {
    const carePhase = carePhaseDef.value;
    const carePhaseDuration = carePhaseDurationSelections[carePhase];
    if (isNullOrUndefined(carePhaseDuration)) {
      return [
        sql`
            DELETE FROM   ClientCarePhaseDurationSelections
            WHERE         clientId = ${clientId}
              AND         carePhase = ${carePhase}
          `,
      ];
    }

    return [
      sql`
          DELETE FROM   ClientCarePhaseDurationSelections
          WHERE         clientId = ${clientId}
            AND         carePhase = ${carePhase}
        `,
      sql`
          INSERT INTO   ClientCarePhaseDurationSelections (
                          clientCarePhaseDurationSelectionId,
                          clientId,
                          carePhase,
                          durationMonths
                        )

          SELECT        uuid_generate_v4(),
                        ${clientId},
                        ${carePhase},
                        ${carePhaseDuration}

          WHERE         NOT EXISTS (
                          SELECT      1

                          FROM        ClientCarePhaseDurationSelections

                          WHERE       clientId = ${clientId}
                            AND       carePhase = ${carePhase}
                            AND       durationMonths = ${carePhaseDuration}
                        )
        `,
    ];
  });
}

export function updateClientCustomInferences(
  clientId: string,
  clientCustomInferences: Partial<ClientCustomInferences>,
) {
  return Object.entries(clientCustomInferences).flatMap(([key, value]) => {
    const inferenceLabel = key;
    const inferenceValue = isNullOrUndefined(value) ? value : String(value);

    if (isNullOrUndefined(inferenceValue)) {
      return [
        sql`
            DELETE FROM   ClientCustomInferences
            WHERE         clientId = ${clientId}
              AND         inferenceLabel = ${inferenceLabel}
          `,
      ];
    }

    return [
      sql`
          DELETE FROM   ClientCustomInferences
          WHERE         clientId = ${clientId}
            AND         inferenceLabel = ${inferenceLabel}
        `,
      sql`
          INSERT INTO   ClientCustomInferences (
                          clientCustomInferenceId,
                          clientId,
                          inferenceLabel,
                          inferenceValue,
                          createdDateTime
                        )

          SELECT        uuid_generate_v4(),
                        ${clientId},
                        ${inferenceLabel},
                        ${inferenceValue},
                        CURRENT_TIMESTAMP

          WHERE         NOT EXISTS (
                          SELECT      1

                          FROM        ClientCustomInferences

                          WHERE       clientId = ${clientId}
                            AND       inferenceLabel = ${inferenceLabel}
                            AND       inferenceValue = ${inferenceValue}
                        )
        `,
    ];
  });
}

export function updateClientTagsSql(
  clientId: string,
  clientTagDefIds: number[],
) {
  const { tableName, fields } = appModel.tablesByName.clientTags;
  return updateXrefsSql(
    tableName,
    fields.clientId.fieldName,
    clientId,
    fields.clientTagDefId.fieldName,
    clientTagDefIds,
  );
}

export function deleteAllClientTagsSql(clientId: string) {
  return sql`
    DELETE FROM ClientTags
    WHERE clientId = ${clientId}
  `;
}

export function updateSql<T>(
  tableName: string,
  item: T,
  options?: WriteSqlOptions,
) {
  const { primaryKey } = appModel.tablesByName[tableName] as AppTableDef;

  if (isNullOrUndefined(primaryKey)) {
    throw new ExError(
      'Cannot automatically create update SQL for a table that does not have a single primary key defined.',
      {
        tableName,
        item,
      },
    );
  }

  const primaryValue = item[primaryKey];
  if (isNullOrUndefined(primaryValue)) {
    throw new ExError(
      'Primary key value is required for automatically created update SQL statements.',
      {
        tableName,
        primaryKey,
        item,
      },
    );
  }

  const fieldAssignments = [] as string[];
  const values = [] as unknown[];

  updateCreateFieldAssignments(tableName, item, fieldAssignments, values);

  const primaryKeyPlaceholder = createSqlPlaceholder(
    values.length + 1,
    primaryValue,
  );
  values.push(primaryValue);

  const returning = ifReturning(options);

  const sqlText = `
    UPDATE  ${tableName}
    SET     ${fieldAssignments.join(',\n           ')}
    WHERE   ${primaryKey} = ${primaryKeyPlaceholder}
    ${returning}`;

  return new SafeSql(keepCallsPrivate, sqlText, values);
}

export function updateSupportProviderSetSql(
  supportProviderSet: SupportProviderSet,
): SafeSql[] {
  const { supportProviderDetailSetId } = supportProviderSet;

  const queries = [
    ...supportProviderSet.supportProviders.map(supportProvider =>
      upsertSql(appModel.tableNames.supportProviders, supportProvider),
    ),

    insertSql(
      appModel.tableNames.supportProviderDetailSets,
      supportProviderSet,
      exactlyOneRowNoReturn,
    ),

    ...supportProviderSet.supportProviders.map(supportProvider =>
      insertSql(
        appModel.tableNames.supportProviderDetails,
        {
          supportProviderDetailId: newUuid(),
          supportProviderDetailSetId,
          ...supportProvider,
        },
        exactlyOneRowNoReturn,
      ),
    ),
  ];

  return queries;
}

function updateCreateFieldAssignments<T>(
  tableName: string,
  item: T,
  fieldAssignments: string[],
  values: unknown[],
) {
  const { orderedFieldNames, primaryKey } = appModel.tablesByName[
    tableName
  ] as AppTableDef;

  orderedFieldNames.forEach(fieldName => {
    if (fieldName === primaryKey || !hasOwnProperty(item, fieldName)) {
      return;
    }
    const value = item[fieldName];
    const placeholder = createSqlPlaceholder(values.length + 1, value);
    fieldAssignments.push(`${fieldName} = ${placeholder}`);
    values.push(value);
  });

  if (fieldAssignments.length === 0) {
    throw new ExError(
      'No values specified to update; only the primary key was inclued.',
      {
        tableName,
        item,
        primaryKey,
      },
    );
  }
}

export function updateXrefsSql(
  xrefTableName: string,
  primaryKeyName: string,
  primaryKeyValue: unknown,
  secondaryFieldName: string,
  secondaryFieldValues: unknown[],
) {
  if (secondaryFieldValues.some(isNullOrUndefined)) {
    throw new ExError(
      'Xref values cannot be null or undefined; found one in secondary values.',
      {
        xrefTableName,
        primaryKeyName,
        primaryKeyValue,
        secondaryFieldName,
        secondaryFieldValues,
      },
    );
  }
  const safeSqls = [] as SafeSql[];
  safeSqls.push(sql`
    DELETE FROM     $xrefTableName
    WHERE           $primaryKeyName = ${primaryKeyValue}
      AND           $secondaryFieldName NOT IN (${secondaryFieldValues})
    ${textPlaceholders({
      xrefTableName,
      primaryKeyName,
      secondaryFieldName,
    })}`);

  secondaryFieldValues.forEach(value => {
    safeSqls.push(
      sql`
        INSERT INTO       $xrefTableName ($primaryKeyName, $secondaryFieldName)
        SELECT            ${primaryKeyValue}, ${value}
        WHERE             NOT EXISTS (
            SELECT    1
            FROM      $xrefTableName
            WHERE     $primaryKeyName = ${primaryKeyValue}
              AND     $secondaryFieldName = ${value}
        )
      ${textPlaceholders({
        xrefTableName,
        primaryKeyName,
        secondaryFieldName,
      })}`,
    );
  });

  return safeSqls;
}

const crappyHackyRealDatabaseFieldsArray = [
  'selfFunding',
  'ltcPolicy',
  'hasSelfFunding',
  'existingAssetsValue',
  'monthlyContributionAmount',
  'annualRateOfReturn',
  'contributionStartYear',
  'contributionEndYear',
  'contributionYearCount',
  'contributionMonthCount',
  'gainsTaxRate',
  'monthlyIncome',
  'hasPolicyFunding',
  'policyMaximumBenefitAmount',
  'policyPremiumMonthlyCost',
  'policyLumpSumPayment',
  'policyPremiumStartYear',
  'policyInflationProtection',
  'policyType',
  'dailyHomeBenefitAmount',
  'dailyHomeInflationProtectionPercent',
  'dailyIndependentLivingBenefitAmount',
  'dailyIndependentLivingInflationProtectionPercent',
  'dailyAssistedLivingBenefitAmount',
  'dailyAssistedLivingInflationProtectionPercent',
  'dailyNursingHomeBenefitAmount',
  'dailyNursingHomeInflationProtectionPercent',
  'homeCareWaitingPeriodDays',
  'facilityCareWaitingPeriodDays',
  'isSimpleInflationProtection',
  'isIndemnityPolicyPayment',
  'policyLimitedPayYears',
  'policyBenefitPeriodMonths',
  'policyContinuationBenefitAmount',
  'policyMinimumGuaranteedBenefitAmount',
  'customPolicyId',
  'isPrimaryPolicyHolder',
  'policyMonthlyWithdrawalRate',
  'policyPremiumIncreaseRate',
  'illustrationOptionName',
  'isDeactivated',
  'policyPremiumIncreaseRate',
  'policyPremiumIncreaseYears',
  'policyInflationProtectionOnFaceAmount',
  'policyInflationProtectionOnCOBAmount',
  'policyInflationProtectionYears',

  // on-claim fields
  'policyBenefitUtilizedToDate',

  //annuityFields
  'annuity',
  'hasAnnuity',
  'annuityPurchasePrice',
  'annuityExpectedPaymentStartAge',
  'annuityExpectedPaymentEndAge',
  'annuityAnnualPayOut',
  'annuityAnnualPayoutForLtc',
  'annuityAnnualPayoutForLtcPeriodYears',
  'addedByAdvisorId',
];

export function upsertNonPolicyFundingSourcesSql(
  clientId: string,
  fundingSources: FundingSources,
) {
  const fundingSourceLabels = Object.keys(fundingSources).filter(
    fundingSourceLabel =>
      crappyHackyRealDatabaseFieldsArray.includes(fundingSourceLabel),
  );
  const queries: SafeSql[] = [];

  insertNewFundingSourcesSql();
  insertNewFundingSourceDetailsSql();
  deleteOldFundingSourceDetails();
  deleteOldFundingSourcesSql();

  return queries;

  function insertNewFundingSourcesSql() {
    fundingSourceLabels.forEach(fundingSourceLabel => {
      if (fundingSourceLabel === 'ltcPolicy') {
        return;
      }
      queries.push(sql`
          WITH existing_record AS (
              SELECT 1
              FROM FundingSources
              WHERE clientId = ${clientId}
                AND fundingSourceLabel = ${fundingSourceLabel}
          )
          INSERT INTO FundingSources (
              fundingSourceId,
              clientId,
              fundingSourceLabel
          )
          SELECT ${newUuid()}, ${clientId}, ${fundingSourceLabel}
          WHERE NOT EXISTS (SELECT 1 FROM existing_record)
        `);
    });
  }

  function deleteOldFundingSourcesSql() {
    let query = sql`
      DELETE FROM     FundingSources
      WHERE           clientId = ${clientId}
      AND fundingSourceLabel != 'ltcPolicy'
    `;

    if (fundingSourceLabels.length) {
      query = query.appendFragment(
        keepCallsPrivate,
        sql`
          AND           fundingSourceLabel NOT IN (${fundingSourceLabels})
        `,
      );
    }

    queries.push(query);
  }

  function insertNewFundingSourceDetailsSql() {
    fundingSourceLabels.forEach(fundingSourceLabel => {
      // Skip if fundingSourceLabel is 'ltcPolicy'
      if (fundingSourceLabel === 'ltcPolicy') {
        return;
      }
      Object.entries(fundingSources[fundingSourceLabel]).forEach(
        ([fundingSourceDetailLabel, fundingSourceDetailValue]) => {
          if (
            isNullOrUndefined(fundingSourceDetailValue) ||
            !crappyHackyRealDatabaseFieldsArray.includes(
              fundingSourceDetailLabel,
            )
          ) {
            return;
          }
          queries.push(sql`

              INSERT INTO     FundingSourceDetails (
                                fundingSourceDetailId,
                                fundingSourceId,
                                fundingSourceDetailLabel,
                                fundingSourceDetailValue
                              )

              SELECT          ${newUuid()},
                              fundingSourceId,
                              ${fundingSourceDetailLabel},
                              ${fundingSourceDetailValue}

              FROM            FundingSources

              WHERE           clientId = ${clientId}
                AND           fundingSourceLabel = ${fundingSourceLabel}


              ON CONFLICT     (
                                fundingSourceId,
                                fundingSourceDetailLabel
                              )

              DO UPDATE SET   fundingSourceDetailValue = ${fundingSourceDetailValue}

              WHERE           FundingSourceDetails.fundingSourceId = (

                                SELECT    FS.fundingSourceId

                                FROM      FundingSources FS

                                WHERE     FS.clientId = ${clientId}
                                  AND     FS.fundingSourceLabel = ${fundingSourceLabel}
                              )
            `);
        },
      );
    });
  }

  function deleteOldFundingSourceDetails() {
    fundingSourceLabels.forEach(fundingSourceLabel => {
      if (fundingSourceLabel === 'ltcPolicy') {
        return;
      }
      const fundingSource = fundingSources[fundingSourceLabel];
      const fundingSourceDetailLabels = Object.keys(fundingSource).filter(
        fundingSourceLabe => isDefined(fundingSource[fundingSourceLabe]),
      );

      //
      // HACKY HACKY HACK HACK
      //
      // for some reason the `appendFragment` calls to add the where clause were not
      // shifting placeholders properly. The indexes got shifted much further than they were supposed to resulting in
      // the below error. So rewriting to not use `appendFragment`.
      //
      /*
                DELETE
                FROM     "FundingSourceDetails"
                WHERE           "fundingSourceId" = (
                                  SELECT    "fundingSourceId"
                                  FROM      "FundingSources"
                                  WHERE     "clientId" = $1::TEXT
                                    AND     "fundingSourceLabel" = $2::TEXT
                                )
                  AND           "fundingSourceDetailLabel" NOT IN (

                    -- FORMATTING ADDED FOR CLARITY

                    $3::TEXT, $4::TEXT, $5::TEXT, $6::TEXT,
                    $7::TEXT, $8::TEXT, $9::TEXT, $10::TEXT, $11::TEXT,

                    -- NOTICE GAP HERE FROM $11 to $30, not sure what's causing it
                    -- gap is the problem

                    $30::TEXT, $31::TEXT, $32::TEXT, $33::TEXT, $34::TEXT, $35::TEXT
                    )

                \            "
              values:
                - hej-4f49
                - ltcPolicy
                - policyPremiumMonthlyCost
                - policyPremiumStartYear
                - policyInflationProtection
                - hasPolicyFunding
                - policyMaximumBenefitAmount
                - dailyHomeBenefitAmount
                - dailyHomeInflationProtectionPercent
                - dailyIndependentLivingBenefitAmount
                - dailyIndependentLivingInflationProtectionPercent
                - dailyAssistedLivingBenefitAmount
                - dailyAssistedLivingInflationProtectionPercent
                - dailyNursingHomeBenefitAmount
                - dailyNursingHomeInflationProtectionPercent
                - policiyPremiumTotalCost
                - projectedCostCoverage
        */
      let query =
        fundingSourceDetailLabels.length === 0
          ? sql`

              DELETE FROM     FundingSourceDetails

              WHERE           fundingSourceId = (

                                SELECT    fundingSourceId

                                FROM      FundingSources

                                WHERE     clientId = ${clientId}
                                  AND     fundingSourceLabel = ${fundingSourceLabel}
                              )
            `
          : sql`

              DELETE FROM     FundingSourceDetails

              WHERE           fundingSourceId = (

                                SELECT    fundingSourceId

                                FROM      FundingSources

                                WHERE     clientId = ${clientId}
                                  AND     fundingSourceLabel = ${fundingSourceLabel}
                              )
                AND           fundingSourceDetailLabel NOT IN (${fundingSourceDetailLabels})
            `;

      queries.push(query);
    });
  }
}

export function upsertPolicyFundingSourceByIdSql(
  body: PutPolicyFundingSourceByIdBodyProps,
) {
  const { clientId, fundingSourceId, policyFundingSource } = body;
  const queries: SafeSql[] = [];
  const newExistingFundingSourceId = fundingSourceId || newUuid();

  if (
    fundingSourceId &&
    (!policyFundingSource || isEmpty(policyFundingSource))
  ) {
    deleteExistingFundingSourceSql();
    return queries;
  }

  if (
    !fundingSourceId &&
    policyFundingSource &&
    !isEmpty(policyFundingSource)
  ) {
    insertNewFundingSourceSql();
  }

  upsertFundingSourceDetailsSql();

  function deleteExistingFundingSourceSql() {
    const deleteFundingSourceDetails = sql`
      DELETE FROM   FundingSourceDetails
      WHERE         fundingSourceId = ${fundingSourceId}
    `;
    const deleteFundingSource = sql`
      DELETE FROM   FundingSources
      WHERE         fundingSourceId = ${fundingSourceId}
    `;
    queries.push(deleteFundingSourceDetails, deleteFundingSource);
  }

  function insertNewFundingSourceSql() {
    const fundingSourceLabel = 'ltcPolicy';
    queries.push(sql`
          INSERT INTO     FundingSources (
                            fundingSourceId,
                            clientId,
                            fundingSourceLabel
                          )
          VALUES          (
                            ${newExistingFundingSourceId},
                            ${clientId},
                            ${fundingSourceLabel}
                          )

          ON CONFLICT     (
                            fundingSourceId
                          )
          DO NOTHING
        `);
  }

  function upsertFundingSourceDetailsSql() {
    Object.entries(policyFundingSource).forEach(
      ([fundingSourceDetailLabel, fundingSourceDetailValue]) => {
        if (
          isNullOrUndefined(fundingSourceDetailValue) &&
          crappyHackyRealDatabaseFieldsArray.includes(fundingSourceDetailLabel)
        ) {
          queries.push(sql`
            DELETE FROM   FundingSourceDetails
            WHERE         fundingSourceId = ${newExistingFundingSourceId}
              AND         fundingSourceDetailLabel = ${fundingSourceDetailLabel}
          `);
          return;
        }
        if (
          isNullOrUndefined(fundingSourceDetailValue) ||
          !crappyHackyRealDatabaseFieldsArray.includes(fundingSourceDetailLabel)
        ) {
          return;
        }
        queries.push(sql`
          INSERT INTO     FundingSourceDetails (
                            fundingSourceDetailId,
                            fundingSourceId,
                            fundingSourceDetailLabel,
                            fundingSourceDetailValue
                          )

          SELECT          ${newUuid()},
                          fundingSourceId,
                          ${fundingSourceDetailLabel},
                          ${fundingSourceDetailValue}

          FROM            FundingSources

          WHERE           clientId = ${clientId}
            AND           fundingSourceId = ${newExistingFundingSourceId}


          ON CONFLICT     (
                            fundingSourceId,
                            fundingSourceDetailLabel
                          )

          DO UPDATE SET   fundingSourceDetailValue = ${fundingSourceDetailValue}

          WHERE           FundingSourceDetails.fundingSourceDetailId = (

                            SELECT    FSD.fundingSourceDetailId

                            FROM      FundingSourceDetails FSD

                            WHERE     FSD.fundingSourceId = ${newExistingFundingSourceId}
                              AND     FSD.fundingSourceDetailLabel = ${fundingSourceDetailLabel}
                          )
        `);
      },
    );
  }
  return queries;
}

/**
 * Creates a query that tries to insert a record but updates it if it already exists.
 *
 * @example
 *
 * ```sql
 * INSERT INTO   Clients (
 *                 clientId,
 *                 advisorId,
 *                 clientFirstName,
 *                 clientLastName,
 *                 clientEmail,
 *                 clientStatus,
 *                 lastSlideSeen,
 *                 planProgressPercent,
 *                 clientAddedDateTime
 *               )
 * VALUES        (
 *                 ${ clientId },
 *                 ${ advisorId },
 *                 ${ clientFirstName },
 *                 ${ clientLastName },
 *                 ${ clientEmail ?? null },
 *                 ${ clientStatus },
 *                 ${ lastSlideSeen },
 *                 ${ planProgressPercent },
 *                 ${ clientAddedDateTime }
 *               )
 *
 * ON CONFLICT   ( clientId )
 *
 * DO UPDATE SET clientFirstName = ${ clientFirstName },
 *               clientLastName = ${ clientLastName },
 *               clientEmail = ${ clientEmail },
 *               clientStatus = ${ clientStatus },
 *               lastSlideSeen = ${ lastSlideSeen },
 *               planProgressPercent = ${ planProgressPercent }
 *
 * WHERE         clientId = ${ clientId }
 *
 * RETURNS *
 * ```
 */
export function upsertSql<T>(
  tableName: string,
  item: T,
  options?: WriteSqlOptions,
) {
  const { primaryKey } = appModel.tablesByName[tableName] as AppTableDef;

  if (isNullOrUndefined(primaryKey)) {
    throw new ExError(
      'Unable to generate UPSERT, INSERT, or UPDATE statement for table without a single primary key field defined.',
      {
        tableName,
        item: pii(item),
      },
    );
  }

  if (!hasAllRequiredFields(tableName, item)) {
    // if we don't have all required fields then we can't be doing an insert, so
    // skip the upsert and do an update instead.
    return updateSql(tableName, item, pick(options, 'skipReturning'));
  }

  const insertFragment = insertSql(tableName, item, { skipReturning: true });
  const updateSets = [] as string[];
  const values = [] as unknown[];

  updateCreateFieldAssignments(tableName, item, updateSets, values);

  return insertFragment
    .appendFragment(
      keepCallsPrivate,
      new SafeSql(
        keepCallsPrivate,
        `ON CONFLICT ( ${primaryKey} ) DO UPDATE SET`,
        [],
      ),
      '\n',
    )
    .appendFragment(
      keepCallsPrivate,
      new SafeSql(keepCallsPrivate, updateSets.join(', '), values),
      '\n',
    );
}

const maybePrefixFieldNameRegex = /^(?:[a-zA-Z]+\.)?([a-zA-Z]+)$/;

export function where(keys: ObjectMap<unknown>) {
  if (isNullUndefinedOrEmpty(keys)) {
    throw new ExError(
      'Invalid WHERE clause filters provided. At least one field/value combination is required but none were provided.',
      {
        keys,
      },
    );
  }

  const clauses = [] as string[];
  const values = [] as unknown[];

  Object.entries(keys).forEach(processWhereKey);

  return new SafeSql(
    keepCallsPrivate,
    `WHERE ${clauses.join('\n  AND ')}\n`,
    values,
  );

  function processWhereKey([key, value]: [string, unknown]) {
    const prefixedMatch = key.match(maybePrefixFieldNameRegex);
    if (prefixedMatch === null) {
      throw new ExError(
        'Invalid field provided for WHERE clause; field must contain letters ony and may contain an optional prefix, also letters only separated by a period.',
        {
          key,
          regex: maybePrefixFieldNameRegex.toString(),
          keys,
        },
      );
    }

    const fieldName = prefixedMatch[1];
    if (!hasOwnProperty(appModel.fieldsByName, fieldName)) {
      throw new ExError(
        'Invalid field provided for WHERE clause; field does not exist in database on any table.',
        {
          fieldName,
          keys,
        },
      );
    }

    clauses.push(`${key} = ${createSqlPlaceholder(values.length + 1, value)}`);
    values.push(value);
  }
}

export function listRequiredFieldNames(tableName: string) {
  return listRequiredFields(tableName).map(field => field.fieldName);
}

export function listRequiredFields(tableName: string) {
  const table = appModel.tablesByName[tableName];

  if (isUndefined(table)) {
    throw new ExError(
      'Invalid table name specified. Cannot list required fields.',
      {
        tableName,
      },
    );
  }

  return (Object.values(table.fields) as AppFieldDef[]).filter(
    field => field.isRequired && !field.hasDefault,
  );
}

export function hasAllRequiredFields<T>(
  tableName: string,
  item: Partial<T>,
): item is T {
  return (
    Object.values(appModel.tablesByName[tableName].fields) as AppFieldDef[]
  ).every(
    field =>
      !field.isRequired ||
      field.hasDefault ||
      !isNullOrUndefined(item[field.fieldName]),
  );
}

function ifReturning(options: WriteSqlOptions | undefined) {
  return options?.skipReturning ? '' : 'RETURNING   *';
}

function shiftPlaceholders(sqlFragment: string, shiftBy: number) {
  const maxExistingPlaceholder = regexExtractCaptures(sqlFragment, /\$(\d+)/)
    ?.map(i => Number.parseInt(i))
    ?.sort(numericDescSorter)[0];

  if (isNullOrUndefined(maxExistingPlaceholder)) {
    // nothing tho shift  :-)
    return sqlFragment;
  }

  const shiftMap = {} as ObjectMap<string>;
  for (let i = 1; i <= maxExistingPlaceholder; i++) {
    shiftMap[i] = `$${i + shiftBy}`;
  }

  return replacePlaceholers(sqlFragment, shiftMap);
}
export function createMagicLinkSql({ clientId }: CreateMagicLinkParams) {
  const token = newUuid();
  const magicLinkId = newUuid();
  const magicLink: Omit<MagicLink, 'status'> = {
    magicLinkId,
    clientId,
    token,
  };

  return insertSql(appModel.tableNames.magicLinks, magicLink);
}

export function unsubscribedEmailsSql(
  type: 'reminders' | 'transactions' | 'all',
) {
  let whereClause: string;
  switch (type) {
    case 'reminders':
      whereClause = 'WHERE "optOutReminders" = true';
      break;
    case 'transactions':
      whereClause = 'WHERE "optOutTransactions" = true';
      break;
    case 'all':
      whereClause =
        'WHERE "optOutReminders" = true OR "optOutTransactions" = true';
      break;
    default:
      throw new ExError('Invalid type provided', { type });
  }

  return `
    SELECT    "email"
    FROM      "EmailPreferences"
    ${whereClause}
  `;
}

export function selectUnsubscribedEmailsSql(
  type: 'reminders' | 'transactions' | 'all',
) {
  const selectStatement = unsubscribedEmailsSql(type);
  return new SafeSql(keepCallsPrivate, selectStatement, []);
}

export function updateMagicLinkUsedAtSql({
  magicLinkId,
}: {
  magicLinkId: string;
}) {
  return sql`UPDATE "MagicLinks" SET "usedDateTime" = CURRENT_TIMESTAMP, "usedCount" = "usedCount" + 1 WHERE "magicLinkId" = ${magicLinkId} RETURNING *`;
}

export function selectMagicLinkRowByIdSql({
  magicLinkId,
}: {
  magicLinkId: string;
}) {
  return sql`SELECT * FROM "MagicLinks" WHERE "magicLinkId" = ${magicLinkId}`;
}

export function incrementClientUnsuccessfulMagicLinkAttemptsSql({
  clientId,
}: {
  clientId: string;
}) {
  return sql`UPDATE "Clients" SET "unsuccessfulMagicLinkAttempts" = "unsuccessfulMagicLinkAttempts" + 1 WHERE "clientId" = ${clientId} RETURNING *`;
}

export function incrementPartnerLinkRequestUnsuccessfulVerificationAttemptsSql({
  partnerLinkRequestId,
  allowableVerificationAttempts,
}: {
  partnerLinkRequestId: string;
  allowableVerificationAttempts: number;
}): SafeSql {
  return sql`
    UPDATE PartnerLinkRequests
    SET
      unsuccessfulVerificationAttempts = unsuccessfulVerificationAttempts + 1,
      statusDateTime = CURRENT_TIMESTAMP,
      status = CASE
        WHEN unsuccessfulVerificationAttempts + 1 >= ${allowableVerificationAttempts} THEN 'locked'
        ELSE 'verification_failed'
      END
    WHERE partnerLinkRequestId = ${partnerLinkRequestId}
    RETURNING *
  `;
}

export function updatePartnerLinkRequestToAcceptedSql({
  partnerLinkRequestId,
}: {
  partnerLinkRequestId: string;
}): SafeSql {
  return sql`
    UPDATE PartnerLinkRequests
    SET
      status = 'accepted',
      statusDateTime = CURRENT_TIMESTAMP
    WHERE partnerLinkRequestId = ${partnerLinkRequestId}
    RETURNING *
  `;
}

export function selectClientsHasNotStartedOnboardingSlidesWithMagicLinkAccess() {
  const unsubscribedSql = selectUnsubscribedEmailsSql('reminders');
  return sql`
  SELECT "clientEmail", "clientFirstName", "clientId"
  FROM "Clients"
  WHERE "clientId" IN (
      SELECT progress."clientId"
      FROM "ClientOnboardingSlideProgress" AS progress
      INNER JOIN (SELECT DISTINCT "clientId" FROM "MagicLinks") AS magicLinks ON progress."clientId" = magicLinks."clientId"
      WHERE progress."hasClientStartedOnboarding" = false
      AND progress."hasClientCompletedOnboarding" = false
  )
  AND "clientEmail" NOT IN (${unsubscribedSql})
  `;
}

export function selectClientsHasNotStartedOnboardingSlidesNoMagicLinkAccess() {
  const unsubscribedSql = selectUnsubscribedEmailsSql('reminders');
  return sql`
  SELECT DISTINCT "clientEmail", "clientFirstName", "clientId", "advisorId"
  FROM "Clients"
  WHERE "clientId" IN (
      SELECT progress."clientId"
      FROM "ClientOnboardingSlideProgress" AS progress
      WHERE progress."hasClientStartedOnboarding" = false
      AND progress."hasClientCompletedOnboarding" = false
 	AND progress."clientId" NOT IN (SELECT DISTINCT "clientId" FROM "MagicLinks")
  )
  AND "clientEmail" NOT IN (${unsubscribedSql})
  `;
}

export function selectClientsHasStartedOnboardingSlidesWithMagicLinkAccess() {
  const unsubscribedSql = selectUnsubscribedEmailsSql('reminders');
  return sql`
  SELECT DISTINCT "clientEmail", "clientFirstName", "clientId", "advisorId"
  FROM "Clients"
  WHERE "clientId" IN (
      SELECT progress."clientId"
      FROM "ClientOnboardingSlideProgress" AS progress
      INNER JOIN (SELECT DISTINCT "clientId" FROM "MagicLinks") AS magicLinks ON progress."clientId" = magicLinks."clientId"
      WHERE progress."hasClientStartedOnboarding" = true
      AND progress."hasClientCompletedOnboarding" = false
  )
  AND "clientEmail" NOT IN (${unsubscribedSql})
  `;
}

export function selectClientsMissingIntakeForm() {
  const unsubscribedSql = selectUnsubscribedEmailsSql('reminders');
  return sql`
  SELECT "clientEmail", "clientFirstName", "clientId", "advisorId", "intakeFormUrl"
  FROM "Clients"
  WHERE "clientId" NOT IN (
      SELECT c."clientId"
      FROM "Clients" c
      JOIN "Surveys" s ON c."surveyId" = s."surveyId"
  )
  AND "clientEmail" NOT IN (${unsubscribedSql})
  AND "surveyId" IS NOT NULL
  AND "intakeFormUrl" IS NOT NULL
  `;
}

export function updateClientPartnerLinks({
  clientId,
  partnerClientId,
}: PutClientPartnerLinkBodyProps) {
  const queries: SafeSql[] = [];

  // clear partnerClientId for the partner
  queries.push(sql`
    UPDATE Clients
    SET partnerClientId = null
    WHERE clientId = (SELECT partnerClientId FROM Clients WHERE clientId = ${clientId})
  `);
  // clear partnerClientId for the client
  queries.push(sql`
    UPDATE Clients
    SET partnerClientId = null
    WHERE clientId = ${clientId}
  `);

  // clear existing links for the client and partner
  queries.push(sql`
      DELETE FROM ClientPartnerLinks
      WHERE coupleId = (
        SELECT coupleId
        FROM ClientPartnerLinks
        WHERE clientId = ${clientId}
    );`);

  // Insert new link for the client if partnerClientId is provided
  if (partnerClientId) {
    const newCoupleId = newUuid();
    const insertClientRowQuery = insertSql(
      appModel.tableNames.clientPartnerLinks,
      {
        coupleId: newCoupleId,
        clientId,
        partnerClientId,
      },
    );
    const insertPartnerRowQuery = insertSql(
      appModel.tableNames.clientPartnerLinks,
      {
        coupleId: newCoupleId,
        clientId: partnerClientId,
        partnerClientId: clientId,
      },
    );

    queries.push(insertClientRowQuery);
    queries.push(insertPartnerRowQuery);
    queries.push(sql`
      UPDATE Clients
      SET partnerClientId = ${partnerClientId}
      WHERE clientId = ${clientId}
    `);
    queries.push(sql`
      UPDATE Clients
      SET partnerClientId = ${clientId}
      WHERE clientId = ${partnerClientId}
    `);
  }

  return queries;
}

export function selectClientPartnerByClientIdSql(clientId: string) {
  return selectSimpleSql(appModel.tableNames.clientPartnerLinks, { clientId });
}

export function upsertIntakeFormPayloadSql(body: IntakeFormPayloadBodyProps) {
  return upsertSql(
    appModel.tableNames.intakeFormPayloads,
    body,
    exactlyOneRowNoReturn,
  );
}

export function selectClientBySurveyIdSql(surveyId: string) {
  return sql`
    SELECT    "clientId",
              "surveyId"
    FROM      "Clients"
    WHERE     "surveyId" = ${surveyId}
    LIMIT     1
  `;
}

export function selectAdvisorConsentsSql(advisorId: string) {
  return sql`
    SELECT    "advisorConsentId",
              "advisorId",
              "consentText",
              "consentVersionDescription",
              "consentDateTime"
    FROM      "AdvisorConsents"
    WHERE     "advisorId" = ${advisorId}
  `;
}

export function insertAdvisorConsentSql(body: AdvisorConsentsDbRecord) {
  return insertSql(
    appModel.tableNames.advisorConsents,
    body,
    exactlyOneRowNoReturn,
  );
}

export function createNewClientSql(client: Client) {
  const { clientId } = client;
  return [
    insertSql(appModel.tablesByName.clients.tableName, client, {
      skipReturning: true,
      expectedRowCountMin: 1,
      expectedRowCountMax: 1,
    }),
    ...convertClientTagsToClientTagDefs(clientId, client.clientTags).map(
      clientTagDefId =>
        insertSql(
          appModel.tableNames.clientTags,
          {
            clientId,
            clientTagDefId,
          },
          {
            skipReturning: true,
            expectedRowCountMin: 1,
            expectedRowCountMax: 1,
          },
        ),
    ),
    // create a new clientOnboardingSlideProgress record for the new client
    insertSql(appModel.tableNames.clientOnboardingSlideProgress, {
      clientOnboardingSlideProgressId: newUuid(),
      clientId,
    }),
  ];
}

export function insertAdvisorHierarchySql(
  supervisorAdvisorId: string,
  subordinateAdvisorId: string,
) {
  return sql`
    INSERT INTO "AdvisorHierarchy" (
      "advisorHierarchyId",
      "supervisorAdvisorId",
      "subordinateAdvisorId",
      "isActive",
      "createdDateTime",
      "updatedDateTime"
    )
    VALUES (
      ${newUuid()},
      ${supervisorAdvisorId},
      ${subordinateAdvisorId},
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("supervisorAdvisorId", "subordinateAdvisorId")
    DO UPDATE SET
      "isActive" = true,
      "updatedDateTime" = CURRENT_TIMESTAMP
    WHERE "AdvisorHierarchy"."supervisorAdvisorId" = ${supervisorAdvisorId}
      AND "AdvisorHierarchy"."subordinateAdvisorId" = ${subordinateAdvisorId}
  `;
}

export function selectAdvisorHierarchySql(
  supervisorAdvisorId: string,
  subordinateAdvisorId: string,
) {
  return sql`
    SELECT *
    FROM "AdvisorHierarchy"
    WHERE (
      ("supervisorAdvisorId" = ${supervisorAdvisorId} AND "subordinateAdvisorId" = ${subordinateAdvisorId})
      OR
      ("supervisorAdvisorId" = ${subordinateAdvisorId} AND "subordinateAdvisorId" = ${supervisorAdvisorId})
    )
    AND "isActive" = true
  `;
}

export function selectSubordinateAdvisorsByAdvisorIdSql(advisorId: string) {
  return sql`
    SELECT DISTINCT
      a."advisorId",
      a."organizationName",
      a."organizationDisplayName",
      a."advisorFirstName",
      a."advisorLastName",
      a."advisorEmail",
      a."schedulingLinkUrl",
      a."advisorCognitoRef",
      a."advisorCreatedDateTime"
    FROM "AdvisorHierarchy" ah
    JOIN "Advisors" a ON a."advisorId" = ah."subordinateAdvisorId"
    WHERE ah."supervisorAdvisorId" = ${advisorId}
    AND ah."isActive" = true
  `;
}

export function deactivateAdvisorHierarchySql(
  supervisorAdvisorId: string,
  subordinateAdvisorId: string,
) {
  return sql`
    UPDATE "AdvisorHierarchy"
    SET
      "isActive" = false,
      "updatedDateTime" = CURRENT_TIMESTAMP
    WHERE (
      ("supervisorAdvisorId" = ${supervisorAdvisorId} AND "subordinateAdvisorId" = ${subordinateAdvisorId})
      OR
      ("supervisorAdvisorId" = ${subordinateAdvisorId} AND "subordinateAdvisorId" = ${supervisorAdvisorId})
    )
    AND "isActive" = true
  `;
}

export function selectSupervisorAdvisorsByAdvisorIdSql(advisorId: string) {
  return sql`
    SELECT DISTINCT
      a."advisorId",
      a."organizationName",
      a."organizationDisplayName",
      a."advisorFirstName",
      a."advisorLastName",
      a."advisorEmail",
      a."schedulingLinkUrl",
      a."advisorCognitoRef",
      a."advisorCreatedDateTime"
    FROM "AdvisorHierarchy" ah
    JOIN "Advisors" a ON a."advisorId" = ah."supervisorAdvisorId"
    WHERE ah."subordinateAdvisorId" = ${advisorId}
    AND ah."isActive" = true
  `;
}

export function upsertClientCalculationSettingsSql(
  clientId: string,
  clientCalculationSettings: Partial<ClientCalculationSettings>,
) {
  const queries: SafeSql[] = [];
  console.log('upsertClientCalculationSettingsSql', clientCalculationSettings);
  Object.entries(clientCalculationSettings).forEach(
    ([settingLabel, settingValue]) => {
      if (settingValue === undefined || settingValue === null) {
        // Delete setting if value is null/undefined
        queries.push(sql`
        DELETE FROM   "ClientCalculationSettings"
        WHERE         "clientId" = ${clientId}
          AND         "settingLabel" = ${settingLabel}
      `);
        return;
      }

      // Determine setting type from ClientCalculationSettings type definition
      const settingType =
        settingLabel === 'returnOnInvestmentCalculationType'
          ? 'string'
          : 'number';

      queries.push(sql`
      INSERT INTO     "ClientCalculationSettings" (
                        "clientCalculationSettingsId",
                        "clientId",
                        "settingLabel",
                        "settingValue",
                        "settingType"
                      )
      VALUES          (
                        ${newUuid()},
                        ${clientId},
                        ${settingLabel},
                        ${String(settingValue)},
                        ${settingType}
                      )
      ON CONFLICT     (
                        "clientId",
                        "settingLabel"
                      )
      DO UPDATE SET   "settingValue" = ${String(settingValue)},
                      "settingType" = ${settingType}
    `);
    },
  );

  return queries;
}
