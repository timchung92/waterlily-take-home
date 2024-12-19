#!/bin/bash

source "$(dirname "$0")/util.sh"

buildIndexForFolder() {
  local FOLDER=$1

  if [[ "$FOLDER" == "" ]]; then
    big_error "buildIndexForFolder called without specifying any folder."
    exit 1
  fi

  if [[ "$FOLDER" == *"packages/client/src/components/ui" ]]; then
    echo "Skipping index generation for $FOLDER"
    return
  fi

  local REFERENCES_SOURCE=""
  local REEXPORTS_SOURCE=""
  local SUBFOLDERS=""

  for FILE_FULL_PATH in "$FOLDER"/*; do

    if ends_with "$FILE_FULL_PATH" ".test.ts" ; then
      continue
    fi

    if ends_with "$FILE_FULL_PATH" "/styles" ; then
      continue
    fi

    if ends_with "$FILE_FULL_PATH" "/images" ; then
      continue
    fi

    if ends_with "$FILE_FULL_PATH" "/ui" ; then
      continue
    fi

    local FILE_NAME_ONLY=`basename "$FILE_FULL_PATH"`
    local EXTENSION="${FILE_NAME_ONLY##*.}"
    local MODULE_NAME="${FILE_NAME_ONLY%.*}"

    local IS_DEFINITION_FILE="false"
    if [[ "${MODULE_NAME##*.}" == "d" ]]; then
      MODULE_NAME="${MODULE_NAME%.*}"
      IS_DEFINITION_FILE="true"
    fi

    MODULE_NAME="${MODULE_NAME//[^a-zA-Z]/}"

    # if a folder has only subfolders, then we end up with a 'file'
    # that is actually the asterisk
    if [[ "$MODULE_NAME" == '*' || "$MODULE_NAME" == 'index' || "$MODULE_NAME" == "viteenv" ]]; then
      continue
    fi

    if [[ -d "$FILE_FULL_PATH" ]]; then
      buildIndexForFolder "$FILE_FULL_PATH"
      # continue

    elif [[ "$EXTENSION" != "ts" && "$EXTENSION" != "tsx" ]]; then
      continue
    fi

    if [[ "$MODULE_NAME" == 'types' ]]; then
      REFERENCES_SOURCE+="/// <reference path='./$FILE_NAME_ONLY/index.ts' />$NL"
    elif [[ "$IS_DEFINITION_FILE" == "true" ]]; then
      REEXPORTS_SOURCE+="/// <reference path='./$FILE_NAME_ONLY' />$NL"
    else
      REEXPORTS_SOURCE+="export * from './$MODULE_NAME';$NL"
    fi
  done

  local INDEX_TS_SOURCE="`generate_header`$NL$NL"

  if [[ "$REFERENCES_SOURCE" != "" ]]; then
    INDEX_TS_SOURCE+="$REFERENCES_SOURCE"
    INDEX_TS_SOURCE+="$NL"
  fi

  INDEX_TS_SOURCE+="$REEXPORTS_SOURCE"

  echo "  $FOLDER/index.ts"
  echo "$INDEX_TS_SOURCE" > "$FOLDER/index.ts"
}

echo "Generating index.ts files"

buildIndexForFolder "$CLIENT_SOURCE_DIR"
buildIndexForFolder "$SERVER_SOURCE_DIR"
buildIndexForFolder "$SHARED_SOURCE_DIR"

buildIndexForFolder "$CLIENT_TEST_DIR"
buildIndexForFolder "$SERVER_TEST_UNIT_DIR"
buildIndexForFolder "$SHARED_TEST_DIR"

echo "Done with code generation"
