#!/bin/bash

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WALP_ALGO_AUTH_TOKEN" \
  -d @"$1" \
  'http://18.234.143.82:8000/models/ltcAtAge-ltcLikelihood10Years-ltcLikelihood20Years/predict'
