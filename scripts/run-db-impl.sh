#!/bin/bash

set -e

source "$(dirname "$0")/util.sh"

#
# Start Postgres docker container if not already running
#

RUN_DOCKER_CONTAINER=false

CONTAINER_FOUND=`docker container ls -a --filter name="$DATABASE_DOCKER_CONTAINER_NAME" --format "{{.State}}"`
if [[ "$CONTAINER_FOUND" == "" ]]; then
  echo "Creating container $DATABASE_DOCKER_CONTAINER_NAME"
  docker run \
    --name $DATABASE_DOCKER_CONTAINER_NAME \
    -p 5432:5432 \
    -e POSTGRES_USER=walpdbadmin \
    -e POSTGRES_PASSWORD=$WALPAPP_DB_PASSWORD \
    -d postgres:15.3 \
    2>&1
elif [[ "$CONTAINER_FOUND" == "exited" ]]; then
  echo "Starting existing container $DATABASE_DOCKER_CONTAINER_NAME"
  docker container start "$DATABASE_DOCKER_CONTAINER_NAME"
else
  echo "Container already running, $DATABASE_DOCKER_CONTAINER_NAME"
fi;

#
# Calculate hash of schema file so we can check if it's up-to-date
#
EXPECTED_DB_SCHEMA_SHA=`shasum -a 256 $DATABASE_SCHEMA_PATH | cut -d ' ' -f 1`

#
# Check if the SHA tracking table exists and matches the current schema's sha
#
echo "about to check for schema version table"

DB_SCHEMA_SHA_TABLE_EXISTS=`dpsql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WalpSchemaVersion')" || echo f`

if [[ "$DB_SCHEMA_SHA_TABLE_EXISTS" == "f" ]]; then
    echo "Database schema does not exist, creating"
elif [[ "$DB_FORCE_RECREATE" == "true" ]]; then
    echo "Found DB_FORCE_RECREATE=$DB_FORCE_RECREATE, dropping and re-creating database schema"
else
  EXISTING_DB_SCHEMA_SHA=`dpsql 'SELECT "schemaVersion" FROM "WalpSchemaVersion"'`
  if [[ "$EXISTING_DB_SCHEMA_SHA" == "$EXPECTED_DB_SCHEMA_SHA" ]]; then
    echo "Database schema is up-to-date"
    exit 0
  fi
  echo "Database schema is out-of-date, dropping and re-creating, all data will be lost"
fi

#
# Create database schema if not already there or out of date
#
echo "Copying database schema sql file to container"
docker_copy $DATABASE_SCHEMA_PATH $IN_CONTAINER_SCHEMA_PATH

echo "Executing database schema sql file"
dpsql $IN_CONTAINER_SCHEMA_PATH
dpsql "INSERT INTO \"WalpSchemaVersion\" VALUES ('$EXPECTED_DB_SCHEMA_SHA')"
