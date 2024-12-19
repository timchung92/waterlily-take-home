#!/bin/bash

set -e

source "$(dirname "$0")/util.sh"

"$SCRIPT_DIR/run-db.sh"
"$DATABASE_PACKAGE_DIR/dynamo-migration/dump-dynamo-data-to-json.sh"

node "$DATABASE_PACKAGE_DIR/dynamo-migration/convert-dynamo-json-to-sql.js"

docker_copy $DATABASE_MIGRATION_INSERT_SQL_PATH /tmp/$DATABASE_MIGRATION_INSERT_SQL_FILE
dpsql /tmp/$DATABASE_MIGRATION_INSERT_SQL_FILE | sed -E -u -f "$SCRIPT_DIR/run-db-console-output.sed"
