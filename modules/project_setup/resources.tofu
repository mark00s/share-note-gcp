resource "google_project" "created" {
  name            = var.project_name
  project_id      = var.project_name
  org_id          = var.organization_id
  billing_account = var.billing_account
  deletion_policy = "DELETE"
}

resource "google_project_service" "enabled_apis" {
  for_each           = var.enabled_apis
  project            = google_project.created.project_id
  service            = each.value
  disable_on_destroy = var.disable_apis_on_destroy
}

resource "google_service_account" "firestore" {
  count = var.create_firestore_sa ? 1 : 0

  account_id   = "${local.sa_prefix}firestore-sa"
  project      = google_project.created.project_id
  display_name = "Firestore Service Account${local.sa_display_suffix}"
  description  = "Firestore Service account${local.sa_display_suffix}"

  depends_on = [google_project.created]
}

resource "google_project_iam_member" "firestore_sa_datastore_user" {
  count = var.create_firestore_sa ? 1 : 0

  project = google_project.created.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.firestore[0].email}"
}
