module "project_setup" {
  source = "./modules/project_setup"

  project_name = local.project_name
  enabled_apis = local.enabled_services
}

resource "google_firestore_database" "backend" {
  project     = module.project_setup.project_id
  name        = local.app_name
  location_id = "us-east1"
  type        = "FIRESTORE_NATIVE"
}

resource "google_firebase_project" "frontend" {
  provider = google-beta
  project  = module.project_setup.project_id
}
