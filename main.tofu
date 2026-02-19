module "project_setup" {
  source = "./modules/project_setup"

  billing_account = var.billing_account
  enabled_apis    = local.enabled_services
  organization_id = var.organization_id
  project_name    = local.project_name
}

module "firestore" {
  source = "./modules/firestore"

  project_id       = module.project_setup.project_id
  databases_name   = local.app_name
  collection_names = local.firestore_collections

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
