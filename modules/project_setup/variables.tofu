variable "enabled_apis" {
  type        = set(string)
  description = "List of enabled GCP APIs"
}

variable "project_name" {
  type        = string
  description = "Name of the project to be created"
}

variable "disable_apis_on_destroy" {
  type        = bool
  default     = true
  description = "Should disable APIs on tofu destroy? (Default: true)"
}

variable "app_name" {
  type        = string
  default     = ""
  description = "Name of the app - used during SA Creation"

  validation {
    condition     = var.app_name == "" || can(regex("^[a-z][a-z0-9-]{0,20}$", var.app_name))
    error_message = "app_name must be lowercase alphanumeric with hyphens, max 20 chars (to allow suffix)."
  }
}

variable "billing_account" {
  type        = string
  nullable    = true
  description = "Billing account ID to attach to the project (Format: XXXXXX-XXXXXX-XXXXXX)"
  default     = null
}

variable "create_firestore_sa" {
  type        = bool
  description = "Should create Firestore service account? (Default: false)"
  default     = false
}

variable "organization_id" {
  type        = string
  nullable    = true
  description = "Organization ID under which Project should be created (Default: null)"
  default     = null
}
