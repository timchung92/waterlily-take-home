#!/bin/bash

source "$(dirname "$0")/util.sh"

cleanup_build_environment() {
  git checkout "$SHARED_SOURCE_DIR/builtEnvironment.ts"
}

trap cleanup_build_environment EXIT

cd "$SERVER_PACKAGE_DIR/src"

# export const builtEnvironment: BuildEnvironment = BuildEnvironment.local
sed -E -I "" 's/= BuildEnvironment\..+;/= BuildEnvironment\.dev;/' "$SHARED_SOURCE_DIR/builtEnvironment.ts"

serverless package

aws s3 sync \
  "$SERVER_BUILD_DIR" \
  "s3://walp-dev-us-west-1/dev/lambda/rel-0001/" \
  --delete \
  --exact-timestamps \
  --region us-west-1 \
  --profile $WALPAPP_DEV_PROFILE \
  --output text
# walp-${TargetEnvironment}-${AWS::Region}-app-lambda
aws lambda update-function-code \
  --function-name walp-dev-us-west-1-app-lambda-dev-1 \
  --zip-file "fileb://$SERVER_BUILD_DIR/api.zip" \
  --publish \
  --profile $WALPAPP_DEV_PROFILE \
  --region us-west-1 \
  --output text