import { selectSimple } from "src";
import { ApiExError, appModel, httpStatusCodes } from "@shared";
import createMagicLink from "@server/util/createMagicLink";

export async function putMagicLinkSessionByTokenForPublic({ body }: BodyProps<TokenProps> & TokenProps): Promise<CreateMagicLinkResponse>{
    const { token } = body;
    const existingMagicLink = await selectSimple<MagicLink | null>(appModel.tableNames.magicLinks, {token});
    if (!existingMagicLink) {
        throw new ApiExError(httpStatusCodes.forbidden, 'Invalid token', { token });
    }
    const { clientEmail } = await createMagicLink({clientId: existingMagicLink.clientId});
    return {result: 'Magic link created successfully.', clientEmail};
}
