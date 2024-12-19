#!/bin/bash

# source "$(dirname "$0")/util.sh"

# if [[ ! -d "$SHARED_NODE_MODULES_DIR" ]]; then
#   mkdir -p `dirname "$SHARED_NODE_MODULES_DIR"`
#   ln -s "$SHARED_SOURCE_DIR" "$SHARED_NODE_MODULES_DIR"
# fi

# # remove obolete symlinks if they exist
# [[ -d "$TYPES_NODE_MODULES_DIR" ]] && rm "$TYPES_NODE_MODULES_DIR"
# [[ -d "$OLD_SHARED_NODE_MODULES_DIR" ]] && rm "$OLD_SHARED_NODE_MODULES_DIR"
# [[ -d "$OLD_SHARED_TYPES_NODE_MODULES_DIR" ]] && rm "$OLD_SHARED_TYPES_NODE_MODULES_DIR"

# # remove old @walp directory if empty (should be)
# [[ -d "$OLD_WALP_NODE_MODULES_DIR" && -z "`ls -A "$OLD_WALP_NODE_MODULES_DIR"`" ]] && rm -r "$OLD_WALP_NODE_MODULES_DIR"
