#!/bin/bash

source "$(dirname "$0")/util.sh"

# Check if the email and temporary password are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <email> <temporary-password>"
  exit 1
fi

# Get the email and temporary password from the command-line arguments
EMAIL="$1"
TEMP_PASSWORD="$2"

# Generate a UUID for the username (requires uuidgen to be installed)
USERNAME=$(uuidgen)

# Create the user using AWS CLI
aws cognito-idp admin-create-user \
  --region "$COGNITO_USER_POOL_REGION" \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --username "$EMAIL" \
  --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
  --temporary-password "$TEMP_PASSWORD" \
  --message-action "SUPPRESS"

# Check if the user creation was successful
if [ $? -eq 0 ]; then
  echo "User created successfully!"
  echo "Email: $EMAIL"
  echo "Temporary password: $TEMP_PASSWORD"
else
  echo "Failed to create user."
fi