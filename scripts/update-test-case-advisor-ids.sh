#!/bin/bash


print_break() {
    echo ""
    echo "========================================"
    echo ""
}

WALP_APP_ROOT="waterlily-ltc-planning-app"
# Extract the name of the current working directory
current_folder_name=$(basename "$(pwd)")
# Check if the current folder name matches the required folder name
if [ "$current_folder_name" != "$WALP_APP_ROOT" ]; then
    echo "You are not in the required folder."
    echo "Please navigate to app root folder: $WALP_APP_ROOT to run this script."
    exit 1
else
    echo "Beginning script execution..."
    print_break
fi

# Ensure that an advisor_id argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <advisor_id>"
  exit 1
fi

advisor_id="$1"

# Directory containing the .json files (set this to your specific directory)
json_directory="packages/server/test-integration/intakeSurvey"

# Iterate through each .json file in the specified directory
for json_file in "$json_directory"/*.json; do
  # Check if the file exists
  if [ -f "$json_file" ]; then
    # Use jq to update the JSON file
    jq --arg advisor_id "$advisor_id" '.form_response.hidden.advisor_id = $advisor_id' "$json_file" > tmp.json && mv tmp.json "$json_file"
    echo "Updated $json_file"
  else
    echo "No .json files found in $json_directory"
  fi
done
