#!/bin/bash

ENV_FILE=".env"
source .env 2> /dev/null

mv $ENV_FILE $ENV_FILE.old

TMP_FILE="$ENV_FILE.tmp"
rm -f $TMP_FILE

generate_or_use_existing_key() {
    local key="$1"
    local value="$2"

    # Check if the key already has a value in the environment
    if [ ! -z "${!key}" ]; then
        echo "$key=\"${!key}\"" >> "$TMP_FILE"
        echo "- ✅ $key"
        export $key="${!key}"
    else
        # If no value is provided, prompt the user for input
        if [ -z "$value" ]; then
            read -p "Enter a value for $key: " value
            printf "\033[1A\033[K"
        fi

        # Write the key-value pair to the environment file
        echo "$key=\"$value\"" >> "$TMP_FILE"
        echo "- 🆕 $key"
        export $key="${value}"
    fi
}

generate() {
    local key="$1"
    local value="$2"

    # If no value is provided, prompt the user for input
    if [ -z "$value" ]; then
        read -p "Enter a value for $key: " value
        printf "\033[1A\033[K"
    fi

    # Write the key-value pair to the environment file
    echo "$key=\"$value\"" >> "$TMP_FILE"
    if [[ -z "${!key}" || "${value}" != "${!key}" ]]; then
        echo "- 🆕 $key"
    else
        echo "- ✅ $key"
    fi
    export $key="${value}"
}

# Array of secret key names
secret_keys=( \
    "PASSWORD_PEPPER" \
    "AUTHENTICATION_SECRET" \
    "REFRESH_TOKEN_SECRET" \
    "TOKEN_MANAGER_SECRET" \
    "CDN_SECRET" \
    "MATCHMAKING_SECRET" \
    "PONG_SECRET"
    "MATCH_MANAGEMENT_SECRET" \
)  

echo "[SECRETS]"
# Loop through the secret keys
for key in "${secret_keys[@]}"
do
    generate_or_use_existing_key "$key" "$(openssl rand -base64  64 | tr -d '\n')"
done

if [ ! -z $GITHUB_ACTION ]; then
    mv $TMP_FILE $ENV_FILE
    exit
fi


printf "\n[URLs]\n"
if [[ -z $1 || "$1" = "evaluation" ]]; then
    HOST=$(hostname)
    generate DOMAIN_NAME "${HOST}"
    generate BACKEND_URL "https://${HOST}:7979"
    generate WS_URL "wss://${HOST}:7979"
    generate FRONTEND_URL "https://${HOST}:8080"
    generate CDN_URL "https://${HOST}:8181"
else
    HOST=$1
    generate DOMAIN_NAME "$1"
    generate BACKEND_URL "https://api-${HOST}"
    generate WS_URL "wss://api-${HOST}"
    generate FRONTEND_URL "https://${HOST}"
    generate CDN_URL "https://cdn-${HOST}"
fi

printf "\n[Google OAuth]\n"
generate_or_use_existing_key GOOGLE_CLIENT_ID ""

printf "\n[42API OAuth]\n"
generate_or_use_existing_key API42_CLIENT_ID ""
generate_or_use_existing_key API42_SECRET ""
if [[ -z $1 || "$1" = "evaluation" ]]; then
    generate API42_REDIRECT_URI "https://${HOST}:7979/auth/fortytwo/callback"
else
    generate API42_REDIRECT_URI "https://api-${HOST}/auth/fortytwo/callback"
fi
echo  ${API42_REDIRECT_URI} | xclip -selection clipboard

printf "\n[MISC PARAMETERS] \n"
if [ -z $1 ]; then
    generate SOCIAL_OFFLINE_DELAY "10000"
    generate SOCIAL_INACTIVITY_DELAY "15000"
else
    true
fi

generate MATCHMAKING_SCHEDULER_DELAY "100"

mv $TMP_FILE $ENV_FILE
