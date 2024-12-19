#!/bin/bash

source "$(dirname "$0")/util.sh"

# causing issues for some reason. Need to guarentee that BuildEnvironment updates to prod
# cleanup_build_environment() {
#   git checkout "$SHARED_SOURCE_DIR/builtEnvironment.ts"
# }

# trap cleanup_build_environment EXIT

if [[ "$CLIENT_BUILD_DIR" == "" ]]; then
  ts_echo "Something big messed up and CLIENT_BUILD_DIR is empty."
  exit "${ERROR_SCRIPT_MISTMATCH_MISSING_VAR_CLIENT_BUILD_DIR:-105}"
fi

cd "$CLIENT_PACKAGE_DIR"

# code as in git that we're replacing...
# export const builtEnvironment: BuildEnvironment = BuildEnvironment.local
sed -E -I "" 's/= BuildEnvironment\..+;/= BuildEnvironment\.prod;/' "$SHARED_SOURCE_DIR/builtEnvironment.ts"

npm run build

aws s3 sync \
  "$CLIENT_BUILD_DIR" \
  "s3://walp-app-prod-public/prod/rel-0001/" \
  --delete \
  --exact-timestamps \
  --region us-east-2 \
  --profile $WALPAPP_PROD_PROFILE \
  --output text

aws cloudfront create-invalidation \
  --distribution-id EI5L6FTYTXU4U \
  --paths '/*' \
  --profile $WALPAPP_PROD_PROFILE \
  --output text

