#!/bin/bash

OUT_DIR="../../../../build/server/samples"
OUT_FILE="${1/.json/-response.json}"
mkdir -p "$OUT_DIR"

# Check if the keep_survey_id argument is passed
if [ "$2" == "keep_survey_id" ]; then
  sed_command="cat"  # Do nothing with the survey_id
else
  sed_command="sed -E 's.\"survey_id\": \"[a-z0-9-]+\".\"survey_id\": \"'`uuidgen`'\".g'"
fi

eval $sed_command "$1" \
  | curl -X POST -H "Content-Type: application/json" -d @- \
  'https://localhost:8081/dev/api/public/intro-intake-form?inline=true' \
  | tee $OUT_DIR/$OUT_FILE

echo
echo "Saved to $OUT_DIR/$OUT_FILE"
echo