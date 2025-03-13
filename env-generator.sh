#!/bin/bash

ENV_FILE=".env"
source .env

TMP_FILE="$ENV_FILE.tmp"
rm -f $TMP_FILE

generate_or_use_existing_key() {
    local key="$1"
    local value="$2"
    local padding_length="${3:-23}"  # Default padding length is 23

    # Check if the key already has a value in the environment
    if [ ! -z "${!key}" ]; then
        echo "$key=\"${!key}\"" >> "$TMP_FILE"
        printf "%-${padding_length}s ✅\n" "- $key"
        export $key="${!key}"
    else
        # If no value is provided, prompt the user for input
        if [ -z "$value" ]; then
            read -p "Enter a value for $key: " value
            printf "\033[1A\033[K"
        fi

        # Write the key-value pair to the environment file
        echo "$key=\"$value\"" >> "$TMP_FILE"
        printf "%-${padding_length}s 🆕\n" "- $key"
        export $key="${value}"
    fi
}

generate() {
    local key="$1"
    local value="$2"
    local padding_length="${3:-23}"  # Default padding length is 23

    # If no value is provided, prompt the user for input
    if [ -z "$value" ]; then
        read -p "Enter a value for $key: " value
        printf "\033[1A\033[K"
    fi

    # Write the key-value pair to the environment file
    echo "$key=\"$value\"" >> "$TMP_FILE"
    if [ ${value} == ${!key} ]; then
        printf "%-${padding_length}s ✅\n" "- $key"
    else
        printf "%-${padding_length}s 🆕\n" "- $key"
    fi
    export $key="${value}"
}

# Array of secret key names
secret_keys=( \
    "JWT_SECRET" \
    "REFRESH_TOKEN_SECRET" \
    "TOKEN_MANAGER_SECRET" \
    "CDN_JWT_SECRET" \
    "PASSWORD_PEPPER" \
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

HOST=$(hostname | cut -d'.' -f1)

printf "\n[URLs]\n"
generate BACKEND_URL "https://${HOST}:7979"
generate FRONTEND_URL "https://${HOST}:8080"
generate CDN_URL "https://${HOST}:8181"

printf "\n[42API OAuth]\n"
generate_or_use_existing_key API42_CLIENT_ID ""
generate_or_use_existing_key API42_SECRET ""
generate API42_REDIRECT_URI "https://${HOST}:7979/auth/fortytwo/callback"
echo  ${API42_REDIRECT_URI} | xclip -selection clipboard

mv $TMP_FILE $ENV_FILE
