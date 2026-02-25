# gcloud organizations list
export TF_VAR_organization_id="your-org-id"
# gcloud billing accounts list
export TF_VAR_billing_account="XXXXXX-XXXXXX-XXXXXX"
#Uncomment after building Backend Image
#export TF_VAR_backend_image=""

# Backend build envs
export APP_API_KEY="D3VM0DE"
export FRONTEND_ADDRESS="http://localhost:4200"
export FIRESTORE_DB="share-note-gcp"
export FIRESTORE_DB_COLLECTION="dev-notes"
export GCP_PROJECT_ID="dev-share-note-gcp"
export LOG_LEVEL="WARNING"

