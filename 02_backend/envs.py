import os

# Defaults are for dev development
APP_API_KEY = os.getenv("APP_API_KEY", "D3VM0DE")
FRONTEND_ADDRESS = os.getenv("FRONTEND_ADDRESS", "http://localhost:4200")
FIRESTORE_DB_COLLECTION = os.getenv("FIRESTORE_DB_COLLECTION", "dev_notes")
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "dev-share-note-gcp")
