module "project_setup" {
  source = "./modules/project_setup"

  enabled_apis    = local.enabled_services
  organization_id = var.organization_id
  project_name    = local.project_name
}

resource "google_firestore_database" "backend" {
  project     = module.project_setup.project_id
  name        = local.app_name
  location_id = "us-east1"
  type        = "FIRESTORE_NATIVE"

  depends_on = [module.project_setup]
}

resource "google_firebase_project" "frontend" {
  provider = google-beta
  project  = module.project_setup.project_id

  depends_on = [module.project_setup]
}

resource "google_firebase_web_app" "frontend" {
  provider     = google-beta
  project      = module.project_setup.project_id
  display_name = local.app_name

  depends_on = [google_firebase_project.frontend]
}
