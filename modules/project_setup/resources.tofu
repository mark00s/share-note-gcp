resource "google_project" "created" {
  name            = var.project_name
  project_id      = var.project_name
  org_id          = var.organization_id
  deletion_policy = "DELETE"
}

resource "google_project_service" "enabled_apis" {
  for_each           = var.enabled_apis
  project            = google_project.created.project_id
  service            = each.value
  disable_on_destroy = var.disable_apis_on_destroy
}
