variable "PROJECT_ID" {
    default = "dev-share-note-gcp"
}

variable "REPOSITORY_NAME" {
    default = "share-note-gcp-backend"
}

variable "REGION" {
    default = "us-east1"
}

variable "APP_API_KEY" {
    default = "D3VM0DE"
}

variable "FRONTEND_ADDRESS" {
    default = "http://localhost:4200"
}

variable "FIRESTORE_DB" {
    default = "share-note-gcp"
}

variable "FIRESTORE_DB_COLLECTION" {
    default = "dev-notes"
}

variable "GCP_PROJECT_ID" {
    default = "dev-share-note-gcp"
}

variable "LOG_LEVEL" {
    default = "WARNING"
}

target "share-note-gcp-backend" {
    context = "./02_backend"
    dockerfile = "Dockerfile"
    platforms = ["linux/amd64"]
    tags = [
        "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/notes-backend:latest"
    ]
    args = {
        APP_API_KEY = "${APP_API_KEY}"
        FRONTEND_ADDRESS = "${FRONTEND_ADDRESS}"
        FIRESTORE_DB = "${FIRESTORE_DB}"
        FIRESTORE_DB_COLLECTION = "${FIRESTORE_DB_COLLECTION}"
        GCP_PROJECT_ID = "${GCP_PROJECT_ID}"
        LOG_LEVEL = "${LOG_LEVEL}"
    }
}
