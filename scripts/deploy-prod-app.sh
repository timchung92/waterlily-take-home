#!/bin/bash
AWS_PROFILE_PROD=$WALPAPP_PROD_PROFILE
AWS_REGION_PROD="us-east-2"

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

export PGPASSWORD=`aws ssm get-parameter --profile $AWS_PROFILE_PROD --name WalpApp-RDS-prod-MasterPassword --with-decryption --region $AWS_REGION_PROD --output yaml | yq e '.Parameter.Value'`

#==============================
echo "creating local db backup"
#==============================
pg_dump \
  --create \
  --no-owner \
  --no-acl \
  --column-inserts \
  --quote-all-identifiers \
  --no-comments \
  --no-tablespaces \
  --file ./build/db-backup/db-prod-`date +"%Y-%m-%dT%H-%M-%S%z"`.sql \
  -h walp-prod-us-east-2-walpappdb-encrypted.cfcaofs96dgg.us-east-2.rds.amazonaws.com \
  -U walpdbadmin \
  walpdbadmin

if [ $? -ne 0 ]; then
    echo "Database backup failed"
    exit 1
fi

#==============================
echo "running db script"
#==============================
psql \
  -L ./build/psql.log \
  -h walp-prod-us-east-2-walpappdb-encrypted.cfcaofs96dgg.us-east-2.rds.amazonaws.com \
  -U walpdbadmin walpdbadmin \
	-f packages/database/database-schema.sql

if [ $? -ne 0 ]; then
    echo "Failed to execute script database-schema.sql"
    exit 1
fi

cd scripts

#==============================
echo "running deploy-client-prod.sh"
#==============================
./deploy-client-prod.sh

if [ $? -ne 0 ]; then
    echo "Failed to execute deploy-client-prod.sh"
    exit 1
fi

#==============================
echo "running deploy-server-prod.sh"
#==============================
./deploy-server-prod.sh

if [ $? -ne 0 ]; then
    echo "Failed to execute deploy-server-prod.sh"
    exit 1
fi

