#!/bin/bash

source "$(dirname "$0")/util.sh"

if [[ "$#" == "0" ]]; then
  echo "Usage: run-parallel.sh <prefix1> <command1> <prefix2> <command2> ..."
  exit 1
fi

# Check that we have an even number of arguments
if [ $(( $# % 2 )) -ne 0 ]; then
    echo "Error: Please provide an even number of arguments where each set of two is a prefix and command to run."
    exit 1
fi

# Process each pair of arguments
while [ $# -gt 0 ]; do
    prefix=$1
    command=$2
    shift 2
    $command | prepend $prefix &
done

# Wait for all background processes to finish
wait
