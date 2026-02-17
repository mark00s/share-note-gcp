locals {
  app_name     = basename(path.cwd)
  project_name = "${terraform.workspace}-${local.app_name}"
}
