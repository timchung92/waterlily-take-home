import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";

export async function cloudFormationDescribeStack(client: CloudFormationClient, StackName: string) {

  const command = new DescribeStacksCommand({ StackName });
  const response = await client.send(command);

  return response.Stacks?.[ 0 ] ?? null;

  // { // DescribeStacksOutput
  //   Stacks: [ // Stacks
  //     { // Stack
  //       StackId: "STRING_VALUE",
  //       StackName: "STRING_VALUE", // required
  //       ChangeSetId: "STRING_VALUE",
  //       Description: "STRING_VALUE",
  //       Parameters: [ // Parameters
  //         { // Parameter
  //           ParameterKey: "STRING_VALUE",
  //           ParameterValue: "STRING_VALUE",
  //           UsePreviousValue: true || false,
  //           ResolvedValue: "STRING_VALUE",
  //         },
  //       ],
  //       CreationTime: new Date("TIMESTAMP"), // required
  //       DeletionTime: new Date("TIMESTAMP"),
  //       LastUpdatedTime: new Date("TIMESTAMP"),
  //       RollbackConfiguration: { // RollbackConfiguration
  //         RollbackTriggers: [ // RollbackTriggers
  //           { // RollbackTrigger
  //             Arn: "STRING_VALUE", // required
  //             Type: "STRING_VALUE", // required
  //           },
  //         ],
  //         MonitoringTimeInMinutes: Number("int"),
  //       },
  //       StackStatus: "CREATE_IN_PROGRESS" || "CREATE_FAILED" || "CREATE_COMPLETE" || "ROLLBACK_IN_PROGRESS" || "ROLLBACK_FAILED" || "ROLLBACK_COMPLETE" || "DELETE_IN_PROGRESS" || "DELETE_FAILED" || "DELETE_COMPLETE" || "UPDATE_IN_PROGRESS" || "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS" || "UPDATE_COMPLETE" || "UPDATE_FAILED" || "UPDATE_ROLLBACK_IN_PROGRESS" || "UPDATE_ROLLBACK_FAILED" || "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS" || "UPDATE_ROLLBACK_COMPLETE" || "REVIEW_IN_PROGRESS" || "IMPORT_IN_PROGRESS" || "IMPORT_COMPLETE" || "IMPORT_ROLLBACK_IN_PROGRESS" || "IMPORT_ROLLBACK_FAILED" || "IMPORT_ROLLBACK_COMPLETE", // required
  //       StackStatusReason: "STRING_VALUE",
  //       DisableRollback: true || false,
  //       NotificationARNs: [ // NotificationARNs
  //         "STRING_VALUE",
  //       ],
  //       TimeoutInMinutes: Number("int"),
  //       Capabilities: [ // Capabilities
  //         "CAPABILITY_IAM" || "CAPABILITY_NAMED_IAM" || "CAPABILITY_AUTO_EXPAND",
  //       ],
  //       Outputs: [ // Outputs
  //         { // Output
  //           OutputKey: "STRING_VALUE",
  //           OutputValue: "STRING_VALUE",
  //           Description: "STRING_VALUE",
  //           ExportName: "STRING_VALUE",
  //         },
  //       ],
  //       RoleARN: "STRING_VALUE",
  //       Tags: [ // Tags
  //         { // Tag
  //           Key: "STRING_VALUE", // required
  //           Value: "STRING_VALUE", // required
  //         },
  //       ],
  //       EnableTerminationProtection: true || false,
  //       ParentId: "STRING_VALUE",
  //       RootId: "STRING_VALUE",
  //       DriftInformation: { // StackDriftInformation
  //         StackDriftStatus: "DRIFTED" || "IN_SYNC" || "UNKNOWN" || "NOT_CHECKED", // required
  //         LastCheckTimestamp: new Date("TIMESTAMP"),
  //       },
  //       RetainExceptOnCreate: true || false,
  //     },
  //   ],
  //   NextToken: "STRING_VALUE",
  // };
}
