#!/bin/bash

# Ollama API endpoint (replace with your server URL if different)
API_URL="http://localhost:11434/api/generate"

# Replace with your desired Ollama model name
MODEL_NAME="tinyllama"

# Get user prompt for Ollama
read -p "Enter the prompt for Ollama: " prompt

# Escape special characters in the prompt for safe transmission
escaped_prompt=$(echo "$prompt" | sed 's/"/\\"/g' | sed 's/&/\\&/g')

# Prepare JSON data for the request
payload="{\"model\": \"$MODEL_NAME\", \"prompt\": \"$escaped_prompt\"}"

# Send POST request with cURL, capture response
response=$(curl -X POST -H "Content-Type: application/json" -d "$payload" "$API_URL") 

# Check if the request was successful
if [[ $? -eq 0 && $response =~ .*"generated_text".* ]]; then
  # Extract generated text with jq and format output 
  generated_text=$(echo "$response" | jq -r '.generated_text' | tr '\n' ' ')
  echo "Ollama Response:"
  echo "------------------"
  echo "$generated_text"
  echo "------------------"
else
  echo "Error: Ollama API request failed."
  exit 1
fi

