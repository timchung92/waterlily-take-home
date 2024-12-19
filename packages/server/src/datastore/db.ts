import { PoolClient, QueryResult, types } from 'pg';
import {
  SafeSql,
  existsSql,
  insertSql,
  selectSimpleSql,
  updateXrefsSql,
  upsertSql,
} from '..';
import {
  ApiExError,
  ExError,
  doSafely,
  httpStatusCodes,
  logOnceWarn,
  pii,
} from '@shared';
import { connectionPool } from './connectionPool';

// By default node-pg doesn't parse floating points and returns them as
// strings since it's possible for pg to have a floating point beyond
// the range supported by JS. We only use them on smaller values so
// it's always safe for us to parse as floats.
//
// See https://github.com/brianc/node-pg-types
types.setTypeParser(types.builtins.NUMERIC, Number.parseFloat);
types.setTypeParser(types.builtins.FLOAT4, Number.parseFloat);
types.setTypeParser(types.builtins.FLOAT8, Number.parseFloat);

type ItExistsRow = { itExists: boolean };

async function runWithClient<T>(
  executor: (client: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient | undefined;
  let killClient = true;
  try {
    const pool = await connectionPool();
    client = await pool.connect();
    const result = await executor(client);
    killClient = false;
    return result;
  } catch (ex: any) {
    throw ExError.wrapOrAddMetadata(
      'An error occurred running statements on a database client.',
      {},
      ex,
    );
  } finally {
    doSafely(() => {
      client.release(killClient);
    });
  }
}

export async function exists<T extends Object>(tableName: string, item: T) {
  const safeSql = existsSql(tableName, item);
  const { rows } = await runQuery(safeSql);
  return Boolean((rows[0] as ItExistsRow)?.itExists);
}

export async function insert<T>(tableName: string, item: T) {
  const safeSql = insertSql(tableName, item);
  const { rows } = await runQuery(safeSql);
  return rows[0] as T;
}

export async function runQuery(safeSql: SafeSql): Promise<QueryResult<unknown>>;
export async function runQuery(
  safeSqls: SafeSql[],
): Promise<QueryResult<unknown>[]>;
export async function runQuery(arg: SafeSql | SafeSql[]): Promise<any> {
  return runWithClient(async function runQueryImpl(client) {
    if (Array.isArray(arg)) {
      const results = [] as QueryResult<unknown>[];

      try {
        await client.query('BEGIN TRANSACTION');

        // don't use forEach because we specifically want to run them in order and wait for first before
        // running second.
        // but need to do it in a transaction...
        for (const safeSql of arg) {
          results.push(await runOneQueryImpl(safeSql));
        }

        await client.query('COMMIT');
        return results;
      } catch (ex: unknown) {
        await doSafely(async () => {
          await client.query('ROLLBACK');
        });
        throw ex;
      }
    }

    return runOneQueryImpl(arg);

    async function runOneQueryImpl(safeSql: SafeSql) {
      const { finalSql, values } = safeSql;
      try {
        const result = await client.query(finalSql, values);
        safeSql.checkRowCount(result.rowCount);
        return result;
      } catch (ex: unknown) {
        throw new ApiExError(
          httpStatusCodes.internalServerError,
          'Error running database query.',
          {
            finalSql,
            values: pii(values),
          },
          ex,
        );
      }
    }
  });
}

export async function selectMany<T = ObjectMap<unknown>>(
  safeSql: SafeSql,
): Promise<T[]> {
  const { rows } = await runQuery(safeSql);

  if (rows.length === 1000) {
    logOnceWarn(selectMany, 'Select limit reached. We need to add paging.', {
      sql: safeSql.text,
      value: pii(safeSql.values),
      rowCount: rows.length,
    });
  }

  return rows as T[];
}

export async function selectOne<T>(sql: SafeSql): Promise<T | null> {
  const rows = await selectMany<T>(sql);

  switch (rows.length) {
    case 0:
      return null;

    case 1:
      return rows[0];

    default:
      throw new ApiExError(
        httpStatusCodes.internalServerError,
        'Expected to receive one record but more than one returned.',
        {
          rowCount: rows.length,
          firstTwoRows: pii(rows.slice(0, 2)),
          sql: sql.text,
          values: pii(sql.values),
        },
      );
  }
}

export function selectSimple<T>(tableName: string, keys: Partial<T>) {
  return selectOne<T>(selectSimpleSql(tableName, keys));
}

export async function updateXrefs(
  xrefTableName: string,
  primaryKeyName: string,
  primaryKeyValue: unknown,
  secondaryFieldName: string,
  secondaryFieldValues: unknown[],
) {
  try {
    const safeSqls = updateXrefsSql(
      xrefTableName,
      primaryKeyName,
      primaryKeyValue,
      secondaryFieldName,
      secondaryFieldValues,
    );

    return await runQuery(safeSqls);
  } catch (ex: unknown) {
    throw new ApiExError(
      httpStatusCodes.internalServerError,
      'Error running update xrefs database query.',
      {
        xrefTableName,
        primaryKeyName,
        primaryKeyValue,
        secondaryFieldName,
        secondaryFieldValues,
      },
      ex,
    );
  }
}

export async function upsert<T>(tableName: string, item: T): Promise<T> {
  try {
    const safeSql = upsertSql(tableName, item);
    const { rows } = await runQuery(safeSql);
    return rows[0] as T;
  } catch (ex: unknown) {
    throw new ExError(
      'Error running UPSERT query.',
      {
        tableName,
        item,
      },
      ex,
    );
  }
}
