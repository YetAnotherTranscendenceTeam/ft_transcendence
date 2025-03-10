#!/bin/bash

SECRET=$(openssl rand -base64  64 | tr -d '\n')
echo "$SECRET"
echo -n "$SECRET" | xclip -selection clipboard
