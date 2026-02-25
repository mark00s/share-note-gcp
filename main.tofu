module "project_setup" {
  source = "./modules/project_setup"

  billing_account = var.billing_account
  enabled_apis    = local.enabled_services
  organization_id = var.organization_id
  project_name    = local.project_name

  create_firestore_sa = local.create_firestore_sa
  app_name            = local.app_name
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

resource "google_artifact_registry_repository" "backend" {
  location      = var.region
  project       = module.project_setup.project_id
  repository_id = "${local.app_name}-backend"
  description   = "Repository for ${local.app_name} backend Docker images"
  format        = "DOCKER"

  depends_on = [module.project_setup]
}

resource "google_cloud_run_v2_service" "backend" {
  name     = "${local.app_name}-backend"
  location = var.region
  project  = module.project_setup.project_id

  template {
    # TODO: Parametrize
    # Might be too strict
    max_instance_request_concurrency = 5
    timeout                          = "10s"

    containers {
      # We are using "Hello" image to create CloudRun if Image is not yet pushed.
      image = var.backend_image == null ? local.hello_image : var.backend_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true
      }

      ports {
        container_port = 80
      }
    }
    # Scaling down to 0 instances to save money when not used
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }
  }
  depends_on = [module.project_setup]
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = google_cloud_run_v2_service.backend.project
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
