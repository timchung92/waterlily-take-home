#==============================
echo "running automation infrastructure deployment script"
#==============================


#
# Check for TARGET_ENVIRONMENT
#
if [[ "$TARGET_ENVIRONMENT" == "" ]]; then
    echo "TARGET_ENVIRONMENT not set, failed to execute script deploy-automation-infrastructure.sh"
    exit 1    
fi

#
# Check for TARGET_REGION
#
if [[ "$TARGET_REGION" == "" ]]; then
    echo "if [[ "$TARGET_REGION" == "" ]]; then not set, failed to execute script deploy-automation-infrastructure.sh"
    exit 1    
fi

cd packages/infrastructure/automation

npx cdk deploy "*" --require-approval never --region $TARGET_REGION --context TargetEnv=$TARGET_ENVIRONMENT

if [ $? -ne 0 ]; then
    echo "Failed to execute script deploy-automation-infrastructure.sh"
    exit 1
fi

#==============================
echo "successfully ran automation infrastructure deployment script"
#==============================