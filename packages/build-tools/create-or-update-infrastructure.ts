//
// To run (for now)
//
// ts-node -r tsconfig-paths/register packages/build-tools/create-or-update-infrastructure.ts packages/infrastructure/params-dev.yaml
//

import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  OnFailure,
} from '@aws-sdk/client-cloudformation';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

import {
  isNullUndefinedOrEmpty,
  yamlParse,
  yamlStringify,
} from '../shared/src';

import { awsAccountId } from './utils/awsAccountId';
import { awsCredentials } from './utils/awsCredentials';
import { bigMessage } from './utils/bigMessage';
import { cloudFormationWaitForStackCompleteOrFailed } from './utils/cloudFormationWaitForStackCompleteOrFailed';
import { fileExists } from './utils/fileExists';
import { infrastructureFilePath } from './utils/infrastructureFilePath';
import { maybeRunMain } from './utils/maybeRunMain';

interface CloudformationTemplateParams {
  // Must match CloudFormation Template Param Pascal Case
  TargetAccountId: string;
  TargetEnvironment: string;
  TargetRegion: string;
  ReleaseVersion: string;
  StackName: string;
  DbRootUserName: string;
  DbRootPasswordSsmName: string;
  LambdaSourceBucketName: string;
  VpcCidr: string;
  PrivateSubnet1CidrBlock: string;
  PrivateSubnet2CidrBlock: string;
  PrivateSubnet3CidrBlock: string;
  PublicSubnet1CidrBlock: string;
  PublicSubnet2CidrBlock: string;
  PublicSubnet3CidrBlock: string;
  VpnServerCertificateArn: string;
  VpnSamlProviderArn: string;
  VpnClientCidr: string;
  VpnAccessGroupId: string;
  ChangeSetName: string;
}

export async function createOrUpdateInfrastructure(paramsFileName: string) {
  const paramsAbsolutePath = await validateAndGetAbsoluteParamsFilePath(
    paramsFileName,
  );
  const paramsText = await readFile(paramsAbsolutePath, 'utf8');
  const {
    StackName,
    TargetAccountId,
    ...params
  } = yamlParse(paramsText) as CloudformationTemplateParams;

  const {
    TargetEnvironment,
    TargetRegion,
  } = params;

  const credentials = await awsCredentials(TargetEnvironment, true);
  const accountIdFromCredentials = await awsAccountId(credentials);

  if (TargetAccountId !== accountIdFromCredentials) {
    throw new Error(
      'Target account mismatch. The provided parameters file is for a different account than the current credentials.\n\n' +
        `Profile                : ${TargetEnvironment} (or default)\n` +
        `Parameters  account id : ${TargetAccountId}\n` +
        `Credentials account id : ${accountIdFromCredentials}\n`,
    );
  }

  const client = new CloudFormationClient({
    credentials,
    region: params.TargetRegion,
  });

  const templatePath = infrastructureFilePath('cloudformation.yaml');
  const TemplateBody = await readFile(templatePath, 'utf8');
  const Parameters = Object.entries(params).map(
    ([ ParameterKey, ParameterValue ]) => ({
      ParameterKey,
      ParameterValue,
    }),
  );

  const createStackInput = {
    // CreateStackInput
    StackName: StackName || `walp-${TargetEnvironment}-${TargetRegion}`,
    TemplateBody,

    Parameters,
    // DisableRollback: true || false,
    // RollbackConfiguration: {
    //   // RollbackConfiguration
    //   RollbackTriggers: [
    //     // RollbackTriggers
    //     {
    //       // RollbackTrigger
    //       Arn: 'STRING_VALUE', // required
    //       Type: 'STRING_VALUE', // required
    //     },
    //   ],
    //   MonitoringTimeInMinutes: Number('int'),
    // },
    // TimeoutInMinutes: Number('int'),
    // NotificationARNs: [
    //   // NotificationARNs
    //   'STRING_VALUE',
    // ],
    Capabilities: [
      Capability.CAPABILITY_IAM,
      Capability.CAPABILITY_NAMED_IAM,
    ],
    // ResourceTypes: [
    //   // ResourceTypes
    //   'STRING_VALUE',
    // ],
    // RoleARN: 'STRING_VALUE',
    OnFailure: OnFailure.ROLLBACK,
    // StackPolicyBody: 'STRING_VALUE',
    // StackPolicyURL: 'STRING_VALUE',
    // Tags: [
    //   // Tags
    //   {
    //     // Tag
    //     Key: 'STRING_VALUE', // required
    //     Value: 'STRING_VALUE', // required
    //   },
    // ],
    // ClientRequestToken: 'STRING_VALUE',
    // EnableTerminationProtection: true || false,
    // RetainExceptOnCreate: true || false,
  };

  console.log(`Triggering create of CloudFormation Stack ${ createStackInput.StackName }`);

  const createStackCommand = new CreateStackCommand(createStackInput);
  const response = await client.send(createStackCommand);
  const { StackId } = response;

  console.log(`    StackID ${ StackId } is being created. Monitoring progress... (it can take 15-30 minutes)`);


  const createResult = await cloudFormationWaitForStackCompleteOrFailed(client, createStackInput.StackName);

  if (createResult.success) {
    bigMessage('Success! Stack created.');
    return 0;
  }

  bigMessage(
    'FAILURE. Stack creation failed.',
    yamlStringify(createResult).split('\n')
  );
  return 1;
}

async function validateAndGetAbsoluteParamsFilePath(paramsFileName: string) {
  if (isNullUndefinedOrEmpty(paramsFileName)) {
    throw new Error(`'paramsFileName' must be provided. It can be a filename inside ./packages/infrastructure/params* or a full path.\n\nparamsFileName: ${paramsFileName }`);
  }

  if (!paramsFileName.endsWith('.yaml') && !paramsFileName.endsWith('.yml')) {
    throw new Error(`'paramsFileName must end in .yaml or .yml.'\n\nparamsFileName: ${paramsFileName}`);
  }

  const paramsAbsolutePath = paramsFileName.includes('/')
    ? resolve(paramsFileName)
    : infrastructureFilePath(paramsFileName);

  if (!fileExists(paramsAbsolutePath)) {
    throw new Error(`paramsFileName not found.\n\nparamsFileName: ${paramsFileName}\n\npparamsAbsolutePath: ${paramsAbsolutePath}`);
  }

  return paramsAbsolutePath;
}

// if (require.main === module) {
//   createOrUpdateInfrastructure(process.argv[process.argv.length - 1])
//     .then(result => process.exitCode = result)
//     .catch(
//       error => {
//         process.exitCode = 1;
//         if ('stack' in error) {
//           bigMessage(error.stack.split('\n'))
//         } else {
//           bigMessage(String(error));
//         }
//       }
//     );
// }

maybeRunMain(module, __filename, createOrUpdateInfrastructure);
