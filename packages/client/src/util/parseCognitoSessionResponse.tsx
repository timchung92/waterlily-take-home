export function parseCognitoSessionResponse(data: any) {
  const cognitoSession = JSON.parse(JSON.stringify(data)) as PlainCognitoUserSession;
  cognitoSession.isValid = data.isValid();
  return cognitoSession
}