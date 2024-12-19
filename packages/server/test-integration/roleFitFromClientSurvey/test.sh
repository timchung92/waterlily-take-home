#!/bin/bash

curl -X POST -H "Content-Type: application/json" -d @"$1" 'https://localhost:8081/dev/api/public/role-fit-from-client-survey?inline=true'
