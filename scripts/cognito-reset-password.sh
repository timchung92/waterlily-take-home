#!/bin/bash

source "$(dirname "$0")/util.sh"

TARGET_USER_EMAIL="$1"

if [[ "$TARGET_USER_EMAIL" == "-s" ]] || [[ "$TARGET_USER_EMAIL" == "--silent" ]]; then
  DO_NOT_PROMPT_FOR_CONFIRMATION=true
  TARGET_USER_EMAIL="$2"
  TARGET_USER_PASSWORD="$3"
else
  TARGET_USER_PASSWORD="$2"
fi

if [[ "$TARGET_USER_EMAIL" == "" ]]; then
  echo ""
  echo "Usage:"
  echo ""
  echo "    $ENTRY_POINT_SCRIPT_NAME [-s|--silent] [email] [password]"
  echo ""
  echo "           -s or --silent to change without prompting for confirmation."
  echo "or"
  echo ""
  echo "    $ENTRY_POINT_SCRIPT_NAME list"
  echo ""
  echo ""
  exit $ERROR_USAGE
fi

# # We'll want the list of emails both to show to user if they want and to validate what they type"
# cognito_list_users

# if [[ "$TARGET_USER_EMAIL" == "list" ]]; then
#   echo ""
#   echo "-- Waterlily personnel --"
#   echo "$COGNITO_WATERLILY_EMAILS"
#   echo ""
#   echo "-- Users --"
#   echo "$COGNITO_USER_EMAILS"
#   echo ""
#   exit 0
# fi

if grep --invert-match --quiet "$COGNITO_EMAILS" <<< "$TARGET_USER_EMAIL"; then
  echo ""
  echo "User $TARGET_USER_EMAIL not found. Enter 'list' to view the list of users."
  echo ""
  exit $ERROR_USAGE
fi

if [[ "$DO_NOT_PROMPT_FOR_CONFIRMATION" != "true" ]]; then

  while true ; do
    if [[ "$TARGET_USER_PASSWORD" == "" ]]; then
      echo "Press ENTER to force $TARGET_USER_EMAIL to change their password on next login ('x' or 'exit' to cancel)."
    else
      echo "Press ENTER to change $TARGET_USER_EMAIL's password ('x' or 'exit' to cancel)."
    fi

    read CONFIRM_RESPONSE

    if [[ "$CONFIRM_RESPONSE" == "x" ]] || [[ "$CONFIRM_RESPONSE" == "exit" ]]; then
      exit $ERROR_CANCELLED_BY_USER
    fi

    if [[ "$CONFIRM_RESPONSE" != "" ]]; then
      echo "Unrecognized confirmation response. Hit ENTER to confirm; 'x' or 'exit' to cancel."
      cancel
    fi

    break
  done

fi

if [[ "$TARGET_USER_PASSWORD" == "" ]]; then
  echo "Requiring $TARGET_USER_EMAIL to change password on next login."
  aws cognito-idp admin-reset-user-password \
    --username "$TARGET_USER_EMAIL" \
    --user-pool-id "$COGNITO_USER_POOL_ID" \
    --region "$COGNITO_USER_POOL_REGION" \
    --output text
else
  echo "Changing $TARGET_USER_EMAIL's password"
  aws cognito-idp admin-set-user-password \
  --username "$TARGET_USER_EMAIL" \
  --password "$TARGET_USER_PASSWORD" \
  --permanent \
  --user-pool-id "$COGNITO_USER_POOL_ID" \
  --region "$COGNITO_USER_POOL_REGION" \
  --output text
fi

echo "Done"
