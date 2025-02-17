#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new_directory_name>"
    exit 1
fi

template_dir=".template"
new_dir="$1"
export SERVICE=$new_dir

if [ ! -d "$template_dir" ]; then
    echo "Error: $template_dir directory does not exist."
    exit 1
fi

# Create the new directory
mkdir -p "$new_dir"

# Recursively process files
find "$template_dir" -type f | while read -r file; do
    # Create the corresponding directory structure in the new directory
    target_dir="$new_dir/$(dirname "${file#$template_dir/}")"
    mkdir -p "$target_dir"
    
    # Apply envsubst and save the result in the new directory
    envsubst < "$file" > "$new_dir/${file#$template_dir/}"
done

echo "Created $new_dir service directory"
