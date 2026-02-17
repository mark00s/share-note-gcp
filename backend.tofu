terraform {
  backend "gcs" {
    bucket = "mj-tfstates"
    prefix = local.project_name
  }
}
