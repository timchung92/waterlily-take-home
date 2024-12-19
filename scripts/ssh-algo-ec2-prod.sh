#!/bin/bash

source "$(dirname "$0")/util.sh"

SSH_PRIVATE_CERT_PATH="$HOME/.ssh/walp-prod.pem"

if [[ ! -f $SSH_PRIVATE_CERT_PATH ]]; then
  ts_echo "Production private key not found where expected: $SSH_PRIVATE_CERT_PATH"
  ts_echo "Download it from Systems Manager Parameter 'WalpApp-Algo-Private-Key' us-east-2"
  exit $ERROR_PROD_SSH_KEY_NOT_FOUND
fi

ts_echo "Connecting to EC2 instance on private subnet. Must be on AWS Prod VPN for this to succeed..."

ssh -v -i "$SSH_PRIVATE_CERT_PATH" ec2-user@10.201.13.140
