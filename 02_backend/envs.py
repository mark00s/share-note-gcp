import os

# Defaults are for dev development
# TODO: https://docs.pydantic.dev/latest/concepts/pydantic_settings/#usage
APP_API_KEY = os.getenv("APP_API_KEY", "D3VM0DE")
FRONTEND_ADDRESS = os.getenv("FRONTEND_ADDRESS", "http://localhost:4200")
FIRESTORE_DB = os.getenv("FIRESTORE_DB", "share-note-gcp")
FIRESTORE_DB_COLLECTION = os.getenv("FIRESTORE_DB_COLLECTION", "dev-notes")
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "dev-share-note-gcp")
