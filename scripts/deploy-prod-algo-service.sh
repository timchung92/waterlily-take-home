#!/bin/bash
source "$(dirname "$0")/util.sh"
# dev related variables
ECR_REGISTRY_DEV="064935776731.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY_NAME_DEV="test-waterlily-ltc-planning-api"
AWS_REGION_DEV="us-east-1"
AWS_PROFILE_DEV=$WALPAPP_DEV_PROFILE

# prod related variables
ECR_REGISTRY_PROD="181677543737.dkr.ecr.us-east-2.amazonaws.com"
ECR_REPOSITORY_NAME_PROD="walp-prod-us-east-2-ecr-repo"
AWS_REGION_PROD="us-east-2"
AWS_PROFILE_PROD=$WALPAPP_PROD_PROFILE

print_break() {
    echo ""
    echo "========================================"
    echo ""
}

print_script_section_message() {
    echo "========================================"
    echo "  $1"
    echo "========================================"
}

# ====================================================
print_script_section_message "Verify working directory = waterlily-ltc-planning-app"
# ====================================================

WALP_APP_ROOT="waterlily-ltc-planning-app"
# Extract the name of the current working directory
current_folder_name=$(basename "$(pwd)")
# Check if the current folder name matches the required folder name
if [ "$current_folder_name" != "$WALP_APP_ROOT" ]; then
    echo "You are not in the required folder."
    echo "Please navigate to app root folder: $WALP_APP_ROOT to run this script."
    exit 1
else
    echo "Beginning script execution..."
    print_break
fi

# ====================================================
print_script_section_message "Query for the latest image tag in the ECR repository"
# ====================================================

LATEST_IMAGE_TAG=$(aws ecr describe-images --repository-name "$ECR_REPOSITORY_NAME_DEV" \
                --region "$AWS_REGION_DEV" --profile "$AWS_PROFILE_DEV" \
                --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' \
                --output text)

# Check if we successfully got a tag
if [ "$LATEST_IMAGE_TAG" = "None" ] || [ -z "$LATEST_IMAGE_TAG" ]; then
    echo "No images found in the ECR repository: $REPOSITORY_NAME_DEV"
    exit 1
else
    echo "Latest image tag in ECR repository $REPOSITORY_NAME_DEV: $LATEST_IMAGE_TAG"
    print_break
fi

# ====================================================
print_script_section_message "Login to Dev AWS ECR"
# ====================================================

aws ecr get-login-password --region "$AWS_REGION_DEV" --profile "$AWS_PROFILE_DEV" | docker login --username AWS --password-stdin $ECR_REGISTRY_DEV
print_break
# Check if login succeeded
if [ $? -ne 0 ]; then
    echo "Failed to login to ECR with profile $AWS_PROFILE_DEV. Please check your AWS credentials and try again."
    exit 1
fi

# ====================================================
print_script_section_message "Pull the latest image from the ECR repository"
# ====================================================

IMAGE_URI_DEV="$ECR_REGISTRY_DEV/$ECR_REPOSITORY_NAME_DEV:$LATEST_IMAGE_TAG"
if docker pull $IMAGE_URI_DEV; then
  echo "Successfully pulled latest image: $IMAGE_URI_DEV"
  print_break
else
  echo "Failed to pull the image: $IMAGE_URI_DEV"
  exit 1
fi

# ====================================================
print_script_section_message "Tag the image with the new registry and repository name"
# ====================================================

IMAGE_URI_PROD="$ECR_REGISTRY_PROD/$ECR_REPOSITORY_NAME_PROD:$LATEST_IMAGE_TAG"
if docker tag "$IMAGE_URI_DEV" "$IMAGE_URI_PROD"; then
    echo "Tagged image as: $IMAGE_URI_PROD"
    print_break
else
    echo "Failed to tag the image as: $IMAGE_URI_PROD"
    exit 1
fi

# ====================================================
print_script_section_message "Login to Prod AWS ECR"
# ====================================================

aws ecr get-login-password --region $AWS_REGION_PROD --profile $AWS_PROFILE_PROD | docker login --username AWS --password-stdin $ECR_REGISTRY_PROD
print_break
# Check if login succeeded
if [ $? -ne 0 ]; then
    echo "Failed to login to ECR with profile $AWS_PROFILE_PROD. Please check your AWS credentials and try again."
    exit 1
fi

# ====================================================
print_script_section_message "Push the image to prod ECR"
# ====================================================

if docker push $IMAGE_URI_PROD; then
  echo "Successfully pushed image to prod ecr: $IMAGE_URI_PROD"
  print_break
else
  echo "Failed to push image to prod ECR $IMAGE_URI_PROD"
  exit 1
fi

echo "Complete the following steps in order to continue"
echo ""
echo "1. Create file ~/.ssh/walp-prod.pem for prod EC2 private key"
echo "2. Connect to PROD VPN"
echo ""
echo "Once complete, type 'yes' to continue"
while true; do
    read -p "HAVE YOU COMPLETED THE AFOREMENTIONED STEPS?: " userInput
    if [ "$userInput" = "yes" ]; then
        echo "Continuing script execution..."
        print_break
        break
    else
        echo "Invalid command. Type 'yes' to proceed."
    fi
done

# ====================================================
print_script_section_message "Get access_key_id and secret_access_key_id for the IAM user needed for the ALGO EC2"
# ====================================================

IAM_USER_NAME="walp-prod-us-east-2-algo-iam-user"
TAG_VALUE="Docker on EC2 algo"
# Fetch the tags for the specified IAM user
tags_json=$(aws iam --profile $AWS_PROFILE_PROD --region $AWS_REGION_PROD list-user-tags --user-name "$IAM_USER_NAME")
# Check if the command was successful
if [ $? -ne 0 ]; then
    echo "Failed to retrieve tags for IAM user: $IAM_USER_NAME"
    exit 1
fi

# Extract the key for the specified tag value
ACCESS_KEY_ID=$(echo "$tags_json" | jq -r ".Tags[] | select(.Value == \"$TAG_VALUE\") | .Key")

# Check if the key was found
if [ -z "$ACCESS_KEY_ID" ]; then
    echo "No tag found with value '$TAG_VALUE' for IAM user: $IAM_USER_NAME"
    exit 1
else
    echo "Key for the tag value '$TAG_VALUE' for IAM user '$IAM_USER_NAME': $ACCESS_KEY_ID"
    print_break
fi

# get the access key and the secret access key for the EC2 IAM user
SECRET_ACCESS_KEY_PARM_NAME="walp-prod-us-east-2-algo-iam-user-secret-key"
SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "$SECRET_ACCESS_KEY_PARM_NAME" --profile "$AWS_PROFILE_PROD" --region "$AWS_REGION_PROD" --query 'Parameter.Value' --with-decryption --output text)

# Check if the retrieval was successful
if [ $? -eq 0 ]; then
    echo "Successfully retrieved '$SECRET_ACCESS_KEY_PARM_NAME'='$SECRET_ACCESS_KEY'"
    print_break
else
    echo "Failed to retrieve '$SECRET_ACCESS_KEY_PARM_NAME' the parameter value."
    exit 1
fi
print_break

# ====================================================
print_script_section_message "SSH into the prod EC2, pull the docker image and run it"
# ====================================================
source "$(dirname "$0")/util.sh"

SSH_PRIVATE_CERT_PATH="$HOME/.ssh/walp-prod.pem"

if [[ ! -f $SSH_PRIVATE_CERT_PATH ]]; then
  ts_echo "Production private key not found where expected: $SSH_PRIVATE_CERT_PATH"
  ts_echo "Download it from Systems Manager Parameter 'WalpApp-Algo-Private-Key' us-east-2"
  exit $ERROR_PROD_SSH_KEY_NOT_FOUND
fi

ts_echo "Connecting to EC2 instance on private subnet. Must be on AWS Prod VPN for this to succeed..."

ECR_LOGIN_SCRIPT="aws ecr get-login-password --region $AWS_REGION_PROD | docker login --username AWS --password-stdin $ECR_REGISTRY_PROD"
DOCKER_SCRIPT="
    docker image prune -a -f &&
    docker pull $IMAGE_URI_PROD &&
    docker stop algorithm-api-host || true &&
    docker rm algorithm-api-host || true &&
    docker run -d \
      -e AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID \
      -e AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY \
      -e AWS_DEFAULT_REGION=$AWS_REGION_PROD \
      --restart=always \
      --name algorithm-api-host \
      -p 8000:8000 \
      $IMAGE_URI_PROD
"
ssh -v -i "$SSH_PRIVATE_CERT_PATH" ec2-user@10.201.13.140 bash -c "'$ECR_LOGIN_SCRIPT && $DOCKER_SCRIPT'"







