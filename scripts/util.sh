#!/bin/bash

export ERROR_APP_NOT_INSTALLED_AND_USER_CANCELLED=101
export ERROR_CANCELLED_BY_USER=98
export ERROR_COGNITO_CANT_LIST_USERS=103
export ERROR_GENERATING_APP_MODEL=104
export ERROR_INVALID_USAGE_INSTALL_IF_MISSING=100
export ERROR_PROD_SSH_KEY_NOT_FOUND=106
export ERROR_SCRIPT_MISTMATCH_MISSING_VAR_CLIENT_BUILD_DIR=105
export ERROR_SERVER_ENV_MISSING=108
export ERROR_UNSUPPORTED_APP_VERSION_INSTALLED=102
export ERROR_USAGE=99

export SCRIPT_FILE_REL_PATH="${BASH_SOURCE[0]}"
export ENTRY_POINT_SCRIPT_NAME=`basename $0`

if [[ "$ENTRY_POINT_SCRIPT_NAME" != "util.sh" ]]; then
  set -e
fi

export NL=$'\n'

# when invoked directly on mac terminal, the above won't work because by default it's zsh
if [[ "$SCRIPT_FILE_REL_PATH" == "" ]]; then
  SCRIPT_FILE_REL_PATH="${(%):-%N}"
fi
export SCRIPT_FILE_PATH="`realpath $SCRIPT_FILE_REL_PATH`"
export SCRIPT_DIR="`dirname $SCRIPT_FILE_PATH`"
export WORKSPACE_DIR=`realpath "$SCRIPT_DIR/.."`
export PACKAGE_JSON_PATH="$WORKSPACE_DIR/package.json"
export PACKAGES_DIR="$WORKSPACE_DIR/packages"
export BUILD_DIR="$WORKSPACE_DIR/build"

export NODE_MODULES_DIR="$WORKSPACE_DIR/node_modules"
export NODE_MODULES_BIN_DIR="$NODE_MODULES_DIR/.bin"

export CLIENT_PACKAGE_DIR="$PACKAGES_DIR/client"
export CLIENT_SOURCE_DIR="$CLIENT_PACKAGE_DIR/src"
export CLIENT_TEST_DIR="$CLIENT_PACKAGE_DIR/test"
export CLIENT_BUILD_DIR="$BUILD_DIR/client"

export SERVER_PACKAGE_DIR="$PACKAGES_DIR/server"
export SERVER_SOURCE_DIR="$SERVER_PACKAGE_DIR/src"
export SERVER_TEST_UNIT_DIR="$SERVER_PACKAGE_DIR/test-unit"
export SERVER_TEST_INTEGRATION_DIR="$SERVER_PACKAGE_DIR/test-integration"
export SERVER_BUILD_DIR="$BUILD_DIR/server"
export SERVER_ENV="$SERVER_SOURCE_DIR/.env"

export CERT_DIR="$SERVER_PACKAGE_DIR/dev-certs"
export CERT_PRIVATE_PATH="$CERT_DIR/key.pem"
export CERT_PUBLIC_PATH="$CERT_DIR/cert.pem"

export SHARED_PACKAGE_DIR="$PACKAGES_DIR/shared"
export SHARED_SOURCE_DIR="$SHARED_PACKAGE_DIR/src"
export SHARED_TEST_DIR="$SHARED_PACKAGE_DIR/test"
export WATERLILY_NODE_MODULES_DIR="$NODE_MODULES_DIR/@waterlily"
export SHARED_NODE_MODULES_DIR="$WATERLILY_NODE_MODULES_DIR/shared"

export TYPES_SOURCE_DIR="$SHARED_SOURCE_DIR/types"
export OLD_SHARED_TYPES_NODE_MODULES_DIR="$NODE_MODULES_DIR/@types/waterlily"

# To be removed once all references updated
export OLD_WALP_NODE_MODULES_DIR="$NODE_MODULES_DIR/@walp"
export OLD_SHARED_NODE_MODULES_DIR="$OLD_WALP_NODE_MODULES_DIR/shared"

export DATABASE_PACKAGE_DIR="$PACKAGES_DIR/database"
export DATABASE_SCHEMA_PATH=$DATABASE_PACKAGE_DIR/database-schema.sql
# export DATABASE_MIGRATION_TEMP_DIR="$BUILD_DIR/db-migration-temp"
export DATABASE_DOCKER_CONTAINER_NAME=postgres-walp-app-local

# export DATABASE_MIGRATION_INSERT_SQL_FILE="dynamo-data-inserts.sql"
# export DATABASE_MIGRATION_INSERT_SQL_PATH="$DATABASE_MIGRATION_TEMP_DIR/$DATABASE_MIGRATION_INSERT_SQL_FILE"

export IN_CONTAINER_SCHEMA_PATH=/tmp/database-schema.sql
# WALPAPP_DB_PASSWORD is set below, after dependencies are validated

export COGNITO_USER_POOL_ID="${COGNITO_USER_POOL_ID:-us-west-2_bSqaa2B0s}"
export COGNITO_USER_POOL_REGION="${COGNITO_USER_POOL_REGION:-us-west-2}"

export APP_MODEL_FILE_PATH=$SHARED_SOURCE_DIR/appModel.ts
export APP_MODEL_TEMPLATE_PATH=$SCRIPT_DIR/generate-app-model-template.ts

if [[ "$PATH" != *"node_modules/.bin"* ]]; then
  PATH="$NODE_MODULES_BIN_DIR:$PATH"
fi

assert_app_installed() {
  local APP_NAME="$1"
  local VERSION_COMMAND="$2"
  local VERSION_REQUIRED="$3"

  if ! test_app_installed "$APP_NAME" ; then
    if [[ -t 0 ]]; then
      ts_echo
      ts_echo "$APP_NAME command not found; it is required for this script."
      ts_echo
    else
      cat # will print out piped content; like if using <<ABC ... ABC
    fi
    exit 5
  fi

  if [[ "$VERSION_COMMAND" != "" && "$VERSION_REQUIRED" != "" ]]; then
    local VERSION_FOUND="$($VERSION_COMMAND)"
    if [[ "$VERSION_FOUND" != "$VERSION_REQUIRED" ]]; then
      ts_echo
      ts_echo "Unsupported version of $APP_NAME found."
      ts_echo
      ts_echo "  Required : $VERSION_REQUIRED"
      ts_echo "  Found    : $VERSION_FOUND"
      ts_ehco
      ts_echo "Please install the required version."
      ts_echo
      exit $ERROR_UNSUPPORTED_APP_VERSION_INSTALLED
    fi
  fi
}

assert_brew_app_installed() {
  local APP_NAME="$1"
  local BREW_NAME="${2:-$APP_NAME}"
  local VERSION_COMMAND="$3"
  local VERSION_REQUIRED="$4"

  assert_app_installed "$1" "$VERSION_COMMAND" "$VERSION_REQUIRED" <<EOM
$APP_NAME command not found; it is required for this script.

You already have Homebrew, so to install $APP_NAME run

    brew install $BREW_NAME

EOM
}

assert_node_version_installed() {

  EXPECTED_VERSION=`jq '.engines.node' $PACKAGE_JSON_PATH | sed -E 's,"[^0-9]*[^0-9]+([0-9]+).*",\1,'`

  if test_app_installed node ; then
    ACTUAL_VERSION=`node --version`
    ACTUAL_VERSION="${ACTUAL_VERSION:1}" # remove the v prefix
    if [[ "$ACTUAL_VERSION" == "$EXPECTED_VERSION."* ]]; then
      return
    fi

    ts_echo
    ts_echo "Node is installed but is not the expected version."
    ts_echo
    ts_echo "Found    : $ACTUAL_VERSION"
    ts_echo "Expected : $EXPECTED_VERSION.*"
    ts_echo
  else
    ts_echo
    ts_echo "node is not installed; version matching $EXPECTED_VERSION.* is required."
    ts_echo
  fi

  if test_app_installed nvm ; then
    ts_echo "You have nvm installed, so use that to switch to the expected version."
    ts_echo
    LATEST_MATCHING_VERSION=`nvm ls-remote | sed -E -n "s,.*v($EXPECTED_VERSION\.[0-9.]+).*,\1,p" | tail -1`
    ts_echo "    nvm install --default $LATEST_MATCHING_VERSION"
    ts_echo
    ts_echo "$LATEST_MATCHING_VERSION is the latest available version matching specification $EXPECTED_VERSION."
  else
    ts_echo "We recommend installing nvm (Node Version Manager) to install node and"
    ts_echo "easily switching between versions."
    brew_install_instructions nvm
  fi
}

big_error() {
  ts_echo
  ts_echo "*"
  ts_echo "* $1"
  ts_echo "*"
  ts_echo
}

brew_install_instructions() {
  local BREW_NAME=${1:-$APP_NAME}

  ts_echo
  ts_echo "You already have Homebrew installed, so to install $BEW_NAME run"
  ts_echo
  ts_echo "    brew install $BREW_NAME"
  ts_echo
}

cognito_list_users() {

  export COGNITO_EMAILS_JSON=`
    aws cognito-idp list-users \
      --user-pool-id "$COGNITO_USER_POOL_ID" \
      --region "$COGNITO_USER_POOL_REGION" \
      --output json
  `

  export COGNITO_EMAILS=`echo "$COGNITO_EMAILS_JSON" | jq -r '.Users[] | [ (.Attributes[] | select(.Name=="sub").Value), (.Attributes[] | select(.Name=="email").Value) ] | @tsv'`

  LIST_USERS_RESULT=$?

  if [[ "$LIST_USERS_RESULT" != "0" ]]; then
    echo "" >&2
    echo "Unable to obtain list of users from Cognito. Check your AWS configuration and access rights." >&2
    echo "" >&2
    exit $ERROR_COGNITO_CANT_LIST_USERS
  fi

  export COGNITO_WATERLILY_EMAILS=`echo "$COGNITO_EMAILS" | grep "@joinwaterlily.com"`
  export COGNITO_USER_EMAILS=`echo "$COGNITO_EMAILS" | grep --invert-match "@joinwaterlily.com"`
}

docker_copy() {
  local SOURCE_PATH=$1
  local DEST_PATH=$2
  docker cp \
    $SOURCE_PATH \
    $DATABASE_DOCKER_CONTAINER_NAME:$DEST_PATH \
    2>&1
}

dpsql() {

  local RUN_FLAG;
  local SQL_COMMAND="$1";

  if [[ "$SQL_COMMAND" == *" "* ]]; then
    RUN_FLAG=-c
  else
    RUN_FLAG=-f

    if [[ -f "$SQL_COMMAND" ]]; then
      local SOURCE_FILE="$SQL_COMMAND"
      local TARGET_FILE="/tmp/`basename "$SQL_COMMAND"`"
      docker_copy "$SOURCE_FILE" "$TARGET_FILE"
      SQL_COMMAND="$TARGET_FILE"
    fi
  fi


  docker exec \
    $DATABASE_DOCKER_CONTAINER_NAME \
    psql \
    -U walpdbadmin \
    --tuples-only \
    --no-align \
    --field-separator='\|' \
    --pset=footer=off \
    walpdbadmin \
    $RUN_FLAG "$SQL_COMMAND" \
    2>&1
}

dpsqli() {
  docker exec \
    -it \
    $DATABASE_DOCKER_CONTAINER_NAME \
    psql \
    -U walpdbadmin \
    --field-separator=' \| ' \
    walpdbadmin \
    2>&1
}

ends_with() {
    if [[ "$1" == *"$2" ]]; then
        return 0
    else
        return 1
    fi
}

generate_header() {
  echo "// ////////////////////////////////////////////////////////"
  echo "//"
  echo "//"
  echo "//    GENERATED FILE  -  DO NOT EDIT"
  echo "//"
  echo "//    This file is generated by $ENTRY_POINT_SCRIPT_NAME"
  echo "//    the folder's recursive contents."
  echo "//"
  echo "// ////////////////////////////////////////////////////////"
}

#
# Does not work due to bash/zsh difference in `read` command. Needs a little more work and testing
# see https://superuser.com/questions/555874/zsh-read-command-fails-within-bash-function-read1-p-no-coprocess
#
# install_if_missing() {
#   local APP_NAME=$1
#   local INSTALL_COMMAND="$2"

#   if test_app_installed "$APP_NAME" ; then
#     return
#   fi

#   if [[ "$INSTALL_COMMAND" == "" ]]; then
#     ts_echo
#     ts_ecno "'install_if_missing' called incorrectly. The install command must be provided as the second parameter."
#     ts_echo
#     ts_echo "Found while checking for '$APP_NAME', which needs to be installed."
#     ts_echo
#     print_stack_trace
#     exit $ERROR_INVALID_USAGE_INSTALL_IF_MISSING
#   fi

#   ts_echo
#   ts_echo "$APP_NAME is required to run Waterlily development scripts."
#   ts_echo
#   read -p "Install it now? (Y/n) " INSTALL_NOW
#   if [[ "$INSTALL_NOW" =~ ^[Yy]?$ ]]; then
#     ts_echo
#     ts_echo "Installing..."
#     ts_echo
#     bash -c "$INSTALL_COMMAND"
#     ts_echo
#     ts_echo "Done installing $APP_NAME, continuing with script '$ENTRY_POINT_SCRIPT_NAME'."
#     return
#   fi

#   ts_echo
#   ts_echo "OK, you'll have to install it manually to continue, or re-run the same script."
#   ts_echo
#   ts_echo "To install ityou can run this commamnd:"
#   ts_echo
#   ts_echo "    $INSTALL_COMMAND"
#   ts_echo

#   exit $ERROR_APP_NOT_INSTALLED_AND_USER_CANCELLED
# }

pipe_to_list() {
  PIPED_INPUT=""
  while IFS= read -r PIPED_LINE
  do
      PIPED_INPUT+=" $PIPED_LINE"
  done

  if [[ "$PIPED_INPUT" != "" ]]; then
    echo "${PIPED_INPUT:1}"
  fi
}

prepend() {
    prefix=$1
    while IFS= read -r line
    do
        echo "$prefix> $line"
        sleep 0.001
    done
}

print_stack_trace() {
  local FRAME=0
  while caller $FRAME; do
    ((frame++))
  done
}

tee_grep() {
  local REGEX_FILE=$1
  local OUTPUT_FILE=$2

  if [[ ! -f "$REGEX_FILE" ]]; then
    if [[ "$REGEX_FILE" =~ ^/ ]]; then
      ABS_REGEX_FILE="$REGEX_FILE"
    else
      # Note; cannot use realpath since the file doesn't exist
      ABS_REGEX_FILE="$PWD/$REGEX_FILE"
    fi

    echo "Regular expression file not found: $ABS_REGEX_FILE"
    exit 1
  fi

  if [[ ! "$REGEX_FILE" =~ \.regex$ ]]; then
    echo "Regular expression file must end with extension .regex; found: $REGEX_FILE"
    exit 2
  fi

  tee "$OUTPUT_FILE" | grep -E -f "$REGEX_FILE"
}

test_app_installed() {
  local APP_NAME=$1

  if [[ "$APP_NAME" == "" ]]; then
    echo ""
    echo "'test_app_installed' called without any parameters; specify app to check for."
    echo ""
    exit 5
  fi

  which $APP_NAME >/dev/null 2>&1
  return $?
}

trim() {

  local s=$1

  if [[ -p /dev/fd/0 && "$s" == "" ]]; then
    while IFS= read -r PIPE_LINE
    do
        # echo "trim "$PIPE_LINE""
        echo "`trim $PIPE_LINE`"
    done
  else
    s="${s#"${s%%[![:space:]]*}"}"
    s="${s%"${s##*[![:space:]]}"}"
    echo -n "$s"
  fi
}

ts_echo() {

  if [[ -t 0 ]]; then
    ts_echo_impl "$@" # resolves parsing error when more than one arg
  else
     while IFS= read -r line
    do
      ts_echo_impl "$line"
    done
  fi
}

ts_echo_impl() {
  MINUTES_ELAPSED=$((SECONDS / 60))
  SECONDS_ONLY_ELAPSED=$((SECONDS % 60))
  TEXT="$@" # resolves parsing error when more than one arg
  printf "%02d:%02d Waterlily> $TEXT\n" $MINUTES_ELAPSED $SECONDS_ONLY_ELAPSED
}


ts_echo "Running Waterlily utility script '$ENTRY_POINT_SCRIPT_NAME'."

# install_if_missing brew "curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash"
assert_app_installed brew <<EOM
Homebrew not found; it is required Waterlily developer scripts.

To install it run:

    /bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

EOM

assert_brew_app_installed jq
assert_brew_app_installed yq
assert_brew_app_installed docker
assert_brew_app_installed act

# version check not working right; needs some debuggin
# assert_brew_app_installed aws awscli 'aws --version | sed -E "s,aws-cli/([0-9]+).+,\1,"' 2
assert_brew_app_installed aws awscli
assert_node_version_installed

mkdir -p "$BUILD_DIR"
# mkdir -p "$DATABASE_MIGRATION_TEMP_DIR"
mkdir -p "$CERT_DIR"

if [[ ! -f "$SERVER_ENV" ]]; then
  big_error "Missing server .env"
  ts_echo
  ts_echo "Copy the sample file to .env in the same folder and set the appropriate values."
  ts_echo "Ask a team member for the secret values or retrieve them from AWS."
  ts_echo
  ts_echo "  cp $SERVER_ENV.sample $SERVER_ENV"
  exit $ERROR_SERVER_ENV_MISSING
fi

# load variables from $SERVER_ENV into the current shell
set -a
source "$SERVER_ENV"
set +a

#
# Retrieve password if not already available
#
if [[ "$WALPAPP_DB_PASSWORD" == "" ]]; then
  WALPAPP_DB_PASSWORD=`aws ssm get-parameter \
    --name WalpApp-RDS-local-MasterPassword \
    --profile $WALPAPP_DEV_PROFILE \
    --with-decryption \
    --output yaml \
    | yq e '.Parameter.Value'`
fi
