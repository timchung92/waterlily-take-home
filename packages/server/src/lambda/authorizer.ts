import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cognitoClientId, cognitoUserPoolId } from 'src/util';

export async function authenticate(token: string): Promise<any> {

  const verifier = CognitoJwtVerifier.create({
    userPoolId: cognitoUserPoolId,
    tokenUse: "access",
    clientId: cognitoClientId,
  });

  try {
    return await verifier.verify(token);
  } catch (ex: unknown) {
    return ex;
  }
}