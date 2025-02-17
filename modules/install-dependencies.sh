#!/bin/bash

for dir in */; do
    if [ -d "$dir" ]; then
        (cd "$dir" && npm install)
    fi
done
