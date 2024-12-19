#!/bin/bash

source "$(dirname "$0")/util.sh"

cleanup_build_environment() {
  git checkout "$SHARED_SOURCE_DIR/builtEnvironment.ts"
}

trap cleanup_build_environment EXIT

if [[ "$CLIENT_BUILD_DIR" == "" ]]; then
  ts_echo "Something big messed up and CLIENT_BUILD_DIR is empty."
  exit "${ERROR_SCRIPT_MISTMATCH_MISSING_VAR_CLIENT_BUILD_DIR:-105}"
fi

cd "$CLIENT_PACKAGE_DIR"

# export const builtEnvironment: BuildEnvironment = BuildEnvironment.local
sed -E -I "" 's/= BuildEnvironment\..+;/= BuildEnvironment\.dev;/' "$SHARED_SOURCE_DIR/builtEnvironment.ts"

npm run build

aws s3 sync \
  "$CLIENT_BUILD_DIR" \
  "s3://walp-app-public/dev-us-west-1/webroot/rel-0001/" \
  --delete \
  --profile $WALPAPP_DEV_PROFILE \
  --exact-timestamps \
  --region us-west-1 \
  --output text \
  --profile $WALPAPP_DEV_PROFILE

aws cloudfront create-invalidation \
  --distribution-id E7NLPLJ6ZTH8Y \
  --profile $WALPAPP_DEV_PROFILE \
  --paths '/*' \
  --output text
