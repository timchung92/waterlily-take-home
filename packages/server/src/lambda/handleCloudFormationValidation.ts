export function handleCloudFormationValidation(event, context) {
  return new Promise((resolve, reject) => {
    if (!('ResponseURL' in event)) {
      resolve(null);
      return;
    }

    const responseUrl = event.ResponseURL;

    if (typeof responseUrl !== 'string' || !responseUrl.startsWith('https://cloudformation-custom-resource-response')) {
      resolve(null);
      return;
    }

    var responseBody = JSON.stringify({
      Status: 'SUCCESS', // 'FAILED'
      Reason: "handler running successfully, logging to " + context.logStreamName,
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: false,
      Data: { 'hello': 'hello' }
    });

    console.log("CloudFormation setup check body sending to CloudFormation:\n", responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(responseUrl);
    var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: "PUT",
      headers: {
        "content-type": "",
        "content-length": responseBody.length
      }
    };

    var request = https.request(options, response => {
      console.log(`CloudFormation setup check response: [${ response.statusCode }] ${ response.statusMessage }`);
      resolve(response);
    });

    request.on("error", function (error) {
      console.log(`CloudFormation setup check confirmation failed: ${ error }`);
      reject(error);
    });

    request.write(responseBody);
    request.end();
  });
}
