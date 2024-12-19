#!/bin/bash

source "$(dirname "$0")/util.sh"

# causing issues for some reason. Need to guarentee that BuildEnvironment updates to prod
# cleanup_build_environment() {
#   git checkout "$SHARED_SOURCE_DIR/builtEnvironment.ts"
# }

# trap cleanup_build_environment EXIT

cd "$SERVER_PACKAGE_DIR/src"

# export const builtEnvironment: BuildEnvironment = BuildEnvironment.local
sed -E -I "" 's/= BuildEnvironment\..+;/= BuildEnvironment\.prod;/' "$SHARED_SOURCE_DIR/builtEnvironment.ts"

serverless package

aws s3 sync \
  "$SERVER_BUILD_DIR" \
  "s3://walp-app-prod-internal/prod/lambda/rel-0001/" \
  --delete \
  --exact-timestamps \
  --region us-east-2 \
  --profile $WALPAPP_PROD_PROFILE \
  --output text

aws lambda update-function-code \
  --function-name walp-prod-us-east-2-lambda-func \
  --zip-file "fileb://$SERVER_BUILD_DIR/api.zip" \
  --publish \
  --region us-east-2 \
  --profile $WALPAPP_PROD_PROFILE \
  --output text