output "project_id" {
  value = module.project_setup.project_id
}

output "firestore_sa_email" {
  value = module.project_setup.firestore_sa_email

  precondition {
    condition     = local.create_firestore_sa
    error_message = "create_firestore_sa must be true to get firestore_sa_email"
  }
}

output "firestore_gcloud_auth_command" {
  value = "gcloud auth application-default login --impersonate-service-account=${module.project_setup.firestore_sa_email}"

  precondition {
    condition     = local.create_firestore_sa
    error_message = "create_firestore_sa must be true to get firestore_gcloud_auth_command"
  }
}

output "cloud_run_url" {
  description = "Public URL of the backend service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "firebase_app_id" {
  description = "ID of the Firebase app"
  value       = google_firebase_web_app.frontend.app_id
}

output "firebase_app_urls" {
  description = "List of URLs of the Firebase app"
  value       = google_firebase_web_app.frontend.app_urls
}

output "docker_registry" {
  description = "Docker registry URL"
  value       = google_artifact_registry_repository.backend.name
}
