#!/bin/bash

source "$(dirname "$0")/util.sh"

LOG_FILE_PATH="$SCRIPT_DIR/run-db-log-`date +%Y-%m-%d`.log"

$SCRIPT_DIR/run-db-impl.sh 2>&1 | \
  tee "$LOG_FILE_PATH" | \
  sed -E -u -f "$SCRIPT_DIR/run-db-console-output.sed"

echo ""
echo "Postgres running locally. Full logs at $LOG_FILE_PATH"
echo ""
