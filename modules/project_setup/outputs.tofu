output "project_id" {
  value = google_project.created.project_id
}

output "enabled_apis" {
  # This makes sure that Tofu will wait for API enablement
  value       = google_project_service.enabled_apis
  description = "Map of enabled API services"
}
