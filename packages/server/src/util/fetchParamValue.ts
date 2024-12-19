import {
  GetParameterCommand,
  GetParameterRequest,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { ExError, doSafely, isNullOrUndefined, toStars } from '@shared';

const cachedParameters: ObjectMap<string | null> = {};

export async function fetchParamValue(paramName: string, client?: SSMClient) {
  let actualClient = client;

  try {
    let parameterValue = cachedParameters[ paramName ];
    if (parameterValue !== undefined) {
      return parameterValue;
    }

    if (isNullOrUndefined(actualClient)) {
      actualClient = new SSMClient();
    }

    const input: GetParameterRequest = {
      Name: paramName,
      WithDecryption: true,
    };

    const command = new GetParameterCommand(input);
    const response = await actualClient.send(command);

    parameterValue = response.Parameter?.Value ?? null;
    cachedParameters[ paramName ] = parameterValue;
    return parameterValue;

    // { // GetParameterResult
    //   Parameter: { // Parameter
    //     Name: "STRING_VALUE",
    //     Type: "String" || "StringList" || "SecureString",
    //     Value: "STRING_VALUE",
    //     Version: Number("long"),
    //     Selector: "STRING_VALUE",
    //     SourceResult: "STRING_VALUE",
    //     LastModifiedDate: new Date("TIMESTAMP"),
    //     ARN: "STRING_VALUE",
    //     DataType: "STRING_VALUE",
    //   },
    // };
  } catch (ex: unknown) {
    const config = actualClient?.config;
    const credentials = await doSafely(async () => await config?.credentials());
    const awsRegion = await (doSafely(async () => await config?.region()));

    throw new ExError(
      'Error retrieving Systems Manager Parameter.',
      {
        paramName,
        awsRegion,
        awsCredentialsAccessKeyId: toStars(credentials.accessKeyId),
        awsCredentialsSecretAccessKey: toStars(credentials.secretAccessKey),
        env: process.env,
      },
      ex
    );
  }
}
