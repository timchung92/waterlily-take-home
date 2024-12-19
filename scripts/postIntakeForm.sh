#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <file_name> <dev|prod>"
  exit 1
fi

# Check if the current directory is waterlily-ltc-planning-app
current_dir=$(basename "$PWD")
if [ "$current_dir" != "waterlily-ltc-planning-app" ]; then
  echo "This script must be run from the waterlily-ltc-planning-app directory."
  exit 1
fi

# Assign arguments to variables
file_name=$1
environment=$2
relative_path="packages/server/test-integration/intakeSurvey/${file_name}"

# Determine the API URL based on the environment
if [ "$environment" == "dev" ]; then
  api_url="https://dev-app.joinwaterlily.com/dev/api/public/intake-form"
elif [ "$environment" == "prod" ]; then
  api_url="https://app.joinwaterlily.com/dev/api/public/intake-form"
else
  echo "Invalid environment specified. Use 'dev' or 'prod'."
  exit 1
fi

# Check if the payload file exists
if [ ! -f "$relative_path" ]; then
  echo "Payload file not found: $relative_path"
  exit 1
fi

# Send the POST request with the payload
response=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}\n" -X POST "$api_url" -H "Content-Type: application/json" -d @"$relative_path")

# Extract the body and the HTTP status code
body=$(echo "$response" | sed -e 's/HTTP_STATUS_CODE:.*//g')
status_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS_CODE://')

# Print the response body and status code
echo "Response body: $body"
echo "Status code: $status_code"