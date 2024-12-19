
# Define the endpoints for dev and prod
DEV_ENDPOINT="https://dev-app.joinwaterlily.com/dev/api/public/intake-form"
PROD_ENDPOINT="https://app.joinwaterlily.com/prod/api/public/intake-form"

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <dev|prod> <json_file>"
    exit 1
fi

# Assign command line arguments to variables
ENVIRONMENT=$1
JSON_FILE=$2

# Set the endpoint based on the environment
if [ "$ENVIRONMENT" = "dev" ]; then
    ENDPOINT_URL=$DEV_ENDPOINT
elif [ "$ENVIRONMENT" = "prod" ]; then
    ENDPOINT_URL=$PROD_ENDPOINT
else
    echo "Error: Environment must be either 'dev' or 'prod'."
    exit 1
fi

# Check if the JSON file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file '$JSON_FILE' does not exist."
    exit 1
fi

# Send the POST request using curl
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$ENDPOINT_URL" \
    -H "Content-Type: application/json" \
    -d @"$JSON_FILE")

# Extract the body and the HTTP status code from the response
http_body=$(echo "$response" | sed -e 's/HTTP_CODE\:.*//g')
http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_CODE://')

# Output the HTTP status code and body
echo "HTTP Status Code: $http_code"
echo "Response Body:"
echo "$http_body"

# Exit with the HTTP status code
exit "$http_code"