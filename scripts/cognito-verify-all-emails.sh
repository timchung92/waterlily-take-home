#!/bin/bash

source "$(dirname "$0")/util.sh"

cognito_list_users

COGNITO_EMAILS_ONLY=`echo "$COGNITO_EMAILS_JSON" | jq -r '.Users[] | (.Attributes[] | select(.Name=="email").Value)'`

while IFS= read -r EMAIL
do
  echo "Verifying email $EMAIL"

  aws cognito-idp \
    admin-update-user-attributes \
    --user-pool-id "$COGNITO_USER_POOL_ID" \
    --region "$COGNITO_USER_POOL_REGION" \
    --username "$EMAIL" \
    --user-attributes Name=email_verified,Value=true
done <<< "$COGNITO_EMAILS_ONLY"
