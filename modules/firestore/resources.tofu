resource "google_firestore_database" "this" {
  project         = var.project_id
  name            = var.databases_name
  location_id     = var.location_id
  type            = var.database_type
  deletion_policy = var.deletion_policy
}

resource "google_firestore_field" "my_ttl_policy" {
  for_each = var.collection_names

  project    = var.project_id
  database   = google_firestore_database.this.name
  collection = each.value
  field      = var.ttl_field

  ttl_config {}

  depends_on = [google_firestore_database.this]
}
