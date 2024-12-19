
#!/bin/bash

source "$(dirname "$0")/util.sh"


APP_MODEL_CONTENT="`node $SCRIPT_DIR/generate-app-model-content.js`"
GENERATE_RESULT=$?

if [[ "$GENERATE_RESULT" != "0" ]]; then
  big_error "Error generating app model. See prior logs."
  exit $ERROR_GENERATING_APP_MODEL
fi

APP_MODEL_CODE="`generate_header`$NL$NL$APP_MODEL_CONTENT"

if [[ -f "$APP_MODEL_FILE_PATH" ]]; then
  EXISTING_APP_MODEL_CODE="`cat $APP_MODEL_FILE_PATH`"

  if [[ "$APP_MODEL_CODE" == "$EXISTING_APP_MODEL_CODE" ]]; then
    echo "Model is up-to-date: $APP_MODEL_FILE_PATH"
    exit 0
  fi
fi

echo "$APP_MODEL_CODE" > "$APP_MODEL_FILE_PATH"
echo "Model updated: $APP_MODEL_FILE_PATH"
