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

variable "organization_id" {
  type        = string
  nullable    = true
  description = "Organization ID under which Project should be created (Default: null)"
  default     = null
}

variable "billing_account" {
  type        = string
  nullable    = true
  description = "Billing account ID to attach to the project (Format: XXXXXX-XXXXXX-XXXXXX)"
  default     = null
}
