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
