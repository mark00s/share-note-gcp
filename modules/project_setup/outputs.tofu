output "project_id" {
  value = google_project.created.project_id
}

output "enabled_apis" {
  # This makes sure that Tofu will wait for API enablement
  value       = google_project_service.enabled_apis
  description = "Map of enabled API services"
}

output "firestore_sa_email" {
  value = google_service_account.firestore[0].email

  precondition {
    condition     = var.create_firestore_sa
    error_message = "create_firestore_sa must be true to get firestore_sa_email"
  }
}
