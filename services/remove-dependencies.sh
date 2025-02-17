#!/bin/bash

for dir in */; do
    if [ -d "$dir" ]; then
        (cd "$dir" && rm -rf node_modules)
    fi
done
