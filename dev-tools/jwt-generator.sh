#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <account_id>"
    exit 1
fi

node --env-file=../.env node/generate-jwt.js $1
