import { Pool, PoolConfig } from 'pg';
import {
  ApiExError,
  delayPromise,
  httpStatusCodes,
  isRunningLocal,
  toStars,
} from '@shared';
import {
  dbReadWriteHost,
  dbReadWritePort,
  dbUser,
} from '../util/serverConstants';
import { dbPassword } from './dbPassword';

let pool: Pool | undefined = undefined;
let initializingPool = undefined as Promise<Pool> | undefined;

export function connectionPool(): Promise<Pool> {

  if (pool !== undefined) {
    return Promise.resolve(pool);
  }

  const delayedPromise = delayPromise(uniqueifyGetPool);
  const ourPromise = delayedPromise.promise;
  delayedPromise.runNextTick();
  return ourPromise;

  function uniqueifyGetPool(
    resolve: (pool: Pool) => void,
    reject: (ex: ApiExError) => void
  ) {
    if (initializingPool) {
      initializingPool.then(resolve).catch(reject);
      return;
    }
    initializingPool = ourPromise;
    dbPassword()
      .then(password => getPoolImpl(password, resolve, reject))
      .catch(reject);
  }

  function getPoolImpl(
    password: string,
    resolve: (pool: Pool) => void,
    reject: (ex: ApiExError) => void
  ) {

    if (pool !== undefined) {
      resolve(pool);
      return;
    }

    const poolConfig: PoolConfig = {
      host: dbReadWriteHost,
      port: -1,
      user: dbUser,
      password,
      database: dbUser,
      min: 1,
      ssl: !isRunningLocal(),
    };

    try {
      poolConfig.port = Number.parseInt(dbReadWritePort);

      pool = new Pool(poolConfig);
      resolve(pool);
    } catch (ex: unknown) {
      const apiEx = ex instanceof ApiExError
        ? ex
        : new ApiExError(
          httpStatusCodes.internalServerError,
          'Unknown error creating database connection pool.',
          {
            ...poolConfig,
            password: toStars(password),
          }
        );
      reject(apiEx);
    } finally {
      initializingPool = undefined;
    }
  }
}
