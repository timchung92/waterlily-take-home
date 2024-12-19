import { CognitoJwtVerifier } from 'aws-jwt-verify';

import {
  ApiExError,
  SessionType,
  appModel,
  errorCauseChain,
  httpStatusCodes,
  isRunningLocal,
  isNullUndefinedOrEmpty,
  logDebug,
  logInfo,
  logWarn,
  randomUnambiguousString,
  sessionTypeForUser,
  fakeLocalJwtTokenPrefix,
  fakeLocalPlainSessionHybrid,
  isUuid,
} from '@shared';
import {
  cognitoClientId,
  cognitoUserPoolId,
  scheduledEventApiKey,
} from '../util';
import {
  insert,
  selectAdvisorByClientIdSql,
  selectAdvisorConsentsSql,
  selectMany,
  selectOne,
  selectSimple,
} from '../datastore';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import { SimpleJsonFetcher } from 'aws-jwt-verify/https';

type ParsedJwt = {
  advisorIdentifier: OneOf<
    keyof Pick<Advisor, 'advisorEmail' | 'advisorCognitoRef'>,
    string
  >;
  payload: PlainCognitoIdPayload;
};

const authHeaderValuePrefix = 'Bearer ';
const authHeaderRealValueStart = authHeaderValuePrefix.length;

const jwksCache = new SimpleJwksCache({
  fetcher: new SimpleJsonFetcher({
    defaultRequestOptions: {
      responseTimeout: isRunningLocal() ? 15000 : 3000,
    },
  }),
});

const jwtVerifier = CognitoJwtVerifier.create(
  {
    userPoolId: cognitoUserPoolId,
    tokenUse: 'id',
    clientId: cognitoClientId,
    graceSeconds: 30,
  },
  {
    jwksCache,
  },
);

export async function maybeLoadSession({
  headers,
}: HeadersProps): Promise<Session> {
  const { authorization } = headers;
  const apiKey = headers['walp-api-key'];
  // handle scheduled events session
  if (!isNullUndefinedOrEmpty(apiKey)) {
    const verificationApiKey = await scheduledEventApiKey();
    if (apiKey === verificationApiKey) {
      return {
        sessionType: SessionType.scheduledEvent,
        advisor: null,
        cognitoSession: null,
      } as Session;
    }
    throw new ApiExError(
      httpStatusCodes.unauthorized,
      'Invalid scheduled event API key.',
      {
        apiKey,
      },
    );
  }
  // handle advisor session
  if (isNullUndefinedOrEmpty(authorization)) {
    logDebug(
      maybeLoadSession,
      'No authorization header present; continuing as unauthenticated call.',
      {
        headers,
      },
    );
    return {
      sessionType: SessionType.unauthenticated,
      advisor: null,
      cognitoSession: null,
      intercomIdentityHash: null,
    } as Session;
  }

  if (!authorization.startsWith(authHeaderValuePrefix)) {
    throw new ApiExError(
      httpStatusCodes.unauthorized,
      'Authorization header prefix not as expected.',
      {
        authorization,
        expectedPrefix: authHeaderValuePrefix,
      },
    );
  }

  try {
    const jwtToken = authorization.substring(authHeaderRealValueStart);
    // handle client session
    if (isUuid(jwtToken)) {
      const magicLinkSession = await selectSimple<MagicLink | null>(
        appModel.tableNames.magicLinks,
        { token: jwtToken },
      );

      if (magicLinkSession) {
        const advisor = await selectOne<Advisor | null>(
          selectAdvisorByClientIdSql(magicLinkSession.clientId),
        );


        return {
          sessionType: SessionType.client,
          advisor: advisor,
          cognitoSession: null,
        } as Session;
      }

      // Check for partner link request if magic link not found
      const partnerLinkRequest =
        await selectSimple<PartnerLinkRequestsDbRecord | null>(
          appModel.tableNames.partnerLinkRequests,
          { token: jwtToken },
        );

      if (partnerLinkRequest) {
        const advisor = await selectOne<Advisor | null>(
          selectAdvisorByClientIdSql(partnerLinkRequest.clientId),
        );


        return {
          sessionType: SessionType.client,
          advisor: advisor,
          cognitoSession: null,
        } as Session;
      }

      throw new ApiExError(
        httpStatusCodes.unauthorized,
        'Invalid token: not found in magic links or partner link requests',
        { token: jwtToken },
      );
    }
    const { advisorIdentifier, payload } = await verifyAndParseJwt(jwtToken);
    let advisor = await selectSimple<Advisor | null>(
      appModel.tableNames.advisors,
      advisorIdentifier,
    );

    if (advisor === null) {
      const {
        given_name: advisorFirstName,
        family_name: advisorLastName,
        email: advisorEmail,
      } = payload;

      let retryCount = 3;
      while (retryCount) {
        try {
          advisor = {
            advisorId: `${randomUnambiguousString(4)}-${randomUnambiguousString(3)}`,
            advisorCreatedDateTime: new Date(),
            advisorFirstName,
            advisorLastName,
            advisorEmail,
            advisorCognitoRef: payload.sub,
          };
          logInfo(
            maybeLoadSession,
            'Valid authentication header found for new advisor. Creating database record.',
            { advisor },
          );

          advisor = await insert(appModel.tableNames.advisors, advisor);
          break;
        } catch (ex: unknown) {
          // although very rare, it's possibe we'll create a duplicate clientId,
          // so check for that and retry in that case.
          const isDuplicateKeyError = errorCauseChain(ex)
            .map(cause =>
              cause instanceof Error ? cause.message : String(cause),
            )
            .some(cause => cause.includes('duplicate key'));

          if (isDuplicateKeyError && retryCount > 0) {
            retryCount--;
            logWarn(
              maybeLoadSession,
              'Duplicate key error creating advisor; retrying.',
              {
                retryCount,
                advisor,
              },
              ex,
            );
            continue;
          }

          throw ApiExError.wrapApiOrAddMetadata(
            httpStatusCodes.internalServerError,
            'Error creating new advisor.',
            {
              advisor,
              payload,
            },
            ex,
          );
        }
      }
    }

    // get consents
    let sessionType = sessionTypeForUser(advisor);
    const consents = await selectMany<AdvisorConsentsDbRecord>(
      selectAdvisorConsentsSql(advisor.advisorId),
    );
    // for now there is only one consent, so we can just check if any records exist
    if (consents.length === 0 && sessionType === SessionType.advisor) {
      sessionType = SessionType.advisorMissingConsents;
    }


    const session = {
      sessionType,
      advisor,
      cognitoSession: {
        idToken: {
          jwtToken,
          payload,
        },
        refreshToken: null,
        accessToken: null,
        isValid: true,
        clockDrift: null,
      },
    } as Session;
    logDebug(maybeLoadSession, 'Authenticated user.', {
      session,
    });
    return session;
  } catch (ex: unknown) {
    throw ApiExError.wrapApiOrAddMetadata(
      httpStatusCodes.unauthorized,
      'Unable to verify JWT token.',
      {
        authorization,
      },
      ex,
    );
  }
}

async function verifyAndParseJwt(jwtToken: string): Promise<ParsedJwt> {
  return isRunningLocal() && jwtToken.startsWith(fakeLocalJwtTokenPrefix)
    ? verifyAndParseJwtLocal(jwtToken)
    : verifyAndParseJwtReal(jwtToken);
}

async function verifyAndParseJwtReal(jwtToken: string): Promise<ParsedJwt> {
  const payload = (await jwtVerifier.verify(
    jwtToken,
  )) as unknown as PlainCognitoIdPayload;


  return {
    advisorIdentifier: {
      advisorCognitoRef: payload.sub,
    },
    payload,
  };
}

async function verifyAndParseJwtLocal(jwtToken: string): Promise<ParsedJwt> {
  const advisorEmail = jwtToken.substring(fakeLocalJwtTokenPrefix.length + 1);
  const { payload } = fakeLocalPlainSessionHybrid(advisorEmail).idToken;

  return {
    advisorIdentifier: {
      advisorEmail,
    },
    payload,
  };
}
