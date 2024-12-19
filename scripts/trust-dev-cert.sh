#!/bin/bash

source "$(dirname "$0")/util.sh"

if [[ ! -f "$CERT_PRIVATE_PATH" ]]; then
  echo "Creating cert"
  mkdir -p "$CERT_DIR"
  openssl req \
    -newkey rsa:2048 \
    -nodes \
    -x509 \
    -days 1825 \
    -subj "/CN=localhost" \
    -addext "subjectAltName = DNS:localhost" \
    -keyout $CERT_PRIVATE_PATH \
    -out $CERT_PUBLIC_PATH
fi

echo ''
echo 'Updating operating system to trust our certificates.'
echo ''
echo '!!!!!!'
echo 'It will prompt you for your password (maybe twice).'
echo ''
sudo security add-trusted-cert \
  -d \
  -r trustRoot \
  -p ssl \
  -k /Library/Keychains/System.keychain \
  "$CERT_PUBLIC_PATH"
echo "Development SSL certificates created and registered."