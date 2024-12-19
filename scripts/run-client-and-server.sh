#!/bin/bash

source "$(dirname "$0")/util.sh"

$SCRIPT_DIR/run-parallel.sh \
  "PGSQL " "$SCRIPT_DIR/run-db.sh" \
  CLIENT "$SCRIPT_DIR/run-client.sh" \
  SERVER "$SCRIPT_DIR/run-server.sh"
