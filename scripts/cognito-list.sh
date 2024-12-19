#!/bin/bash

source "$(dirname "$0")/util.sh"

cognito_list_users

echo ""
echo "-- Waterlily personnel --"
echo "$COGNITO_WATERLILY_EMAILS"
echo ""
echo "-- Users --"
echo "$COGNITO_USER_EMAILS"
echo ""
