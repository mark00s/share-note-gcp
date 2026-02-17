variable "project_name" {
  type        = string
  description = "Name of the project to be created"
}

variable "enabled_apis" {
  type        = set(string)
  description = "List of enabled GCP APIs"
}

variable "disable_apis_on_destroy" {
  type        = bool
  default     = true
  description = "Should disable APIs on tofu destroy?"
}
