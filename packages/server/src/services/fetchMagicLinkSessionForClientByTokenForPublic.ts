import { runQuery, selectSimple, selectSimpleSql } from 'src';
import { ApiExError, appModel, httpStatusCodes } from '@shared';
import { isAfter } from 'date-fns';

export async function fetchMagicLinkSessionForClientByTokenForPublic({
  token,
}: TokenProps) {
  const magicLinkSession = await selectSimple<MagicLink | null>(
    appModel.tableNames.magicLinks,
    { token },
  );
  if (!magicLinkSession) {
    throw new ApiExError(httpStatusCodes.forbidden, 'Invalid token', { token });
  }
  const client = await selectSimple<Client>(appModel.tableNames.clients, {
    clientId: magicLinkSession.clientId,
  });
  if (!client) {
    throw new ApiExError(httpStatusCodes.forbidden, 'Invalid client', {
      token,
    });
  }
  const clientUnsuccessfulMagicLinkAttempts =
    client.unsuccessfulMagicLinkAttempts;
  if (clientUnsuccessfulMagicLinkAttempts >= 3) {
    throw new ApiExError(httpStatusCodes.forbidden, 'Account is locked', {
      token,
    });
  }
  const isExpired = isAfter(new Date(), magicLinkSession.expirationDateTime);
  if (isExpired) {
    throw new ApiExError(httpStatusCodes.forbidden, 'Expired token', { token });
  }
  if (magicLinkSession.usedCount >= 2) {
    throw new ApiExError(
      httpStatusCodes.forbidden,
      'Token already used more than twice',
      { token },
    );
  }
  const magicLinkId = magicLinkSession.magicLinkId;
  const magicLinkRows = await runQuery(
    selectSimpleSql(appModel.tableNames.magicLinks, {
      magicLinkId,
    }),
  );

  return magicLinkRows.rows[0] as MagicLink;
}
