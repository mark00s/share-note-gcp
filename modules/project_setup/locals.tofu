
locals {
  sa_prefix         = var.app_name != "" ? "${var.app_name}-" : ""
  sa_display_suffix = var.app_name != "" ? " for ${var.app_name}" : ""
}
