locals {
  app_name     = basename(path.cwd)
  project_name = "${terraform.workspace}-${local.app_name}"

  enabled_services = [
    "run.googleapis.com",       # Cloud Run
    "firestore.googleapis.com", # Firestore
    "firebase.googleapis.com",  # Firebase
  ]

  create_firestore_sa   = true
  firestore_collections = ["notes", "dev-notes"]
}
