JSON_FILE="path-to-json-file.json"

export PGPASSWORD=`aws ssm get-parameter --profile prod-waterlily --name WalpApp-RDS-prod-MasterPassword --with-decryption --region us-east-2 --output yaml | yq e '.Parameter.Value'`

# Read each object in the JSON array
jq -c '.[]' "$JSON_FILE" | while read -r line; do
    # Extract fields from the JSON object
    advisorId=$(echo "$line" | jq -r '.advisorId')
    organizationName=$(echo "$line" | jq -r '.organizationName')

    # SQL command to echo
    SQL="UPDATE \"Advisors\" SET \"organizationName\" = '$organizationName' WHERE \"advisorId\" = '$advisorId';"

    # Echo the SQL command
    echo "$SQL"


    psql \
      -L ./build/psql.log \
      -h walp-prod-us-east-2-walpappdb-encrypted.cfcaofs96dgg.us-east-2.rds.amazonaws.com \
      -U walpdbadmin walpdbadmin \
      -c "$SQL"
done

echo "Update complete."