#!/bin/bash

print_break() {
    echo ""
    echo "========================================"
    echo ""
}

# Check if the new advisor_id is provided as a command-line argument
if [ -z "$1" ]; then
    echo "Usage: $0 <new_advisor_id>"
    exit 1
fi

# Get the new advisor_id from the first command-line argument
new_advisor_id="$1"

# Directory containing the .json files (set this to your specific directory)
json_directory="packages/server/test-integration/intakeSurvey"
cd "$json_directory" || { echo "Directory not found: $json_directory"; exit 1; }

# Iterate through each .json file in the directory
for json_file in *.json; do
  # Check if the file exists
  if [ -f "$json_file" ]; then
    # Update the advisor_id in the json_file using jq
    jq --arg new_advisor_id "$new_advisor_id" '.form_response.hidden.advisor_id = $new_advisor_id' "$json_file" > temp.json && mv temp.json "$json_file"
    echo "Updated advisor_id in $json_file"

    # Run the test.sh script with the json_file as an argument
    ./test.sh "$json_file"
    echo "Executed test.sh for $json_file"
  else
    echo "No .json files found in $json_directory"
  fi
done