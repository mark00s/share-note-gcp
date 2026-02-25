variable "organization_id" {
  type        = string
  description = "ID of the GCP organization"
  default     = null
}

variable "billing_account" {
  type        = string
  description = "Billing account ID (Format: XXXXXX-XXXXXX-XXXXXX)"
  default     = null
}

variable "region" {
  type        = string
  description = "Region where resources should be created"
  default     = "us-east1"
}

variable "backend_image" {
  type        = string
  description = "Backend image name with tag. Do not set if Registry has not been deployed yet"
  nullable    = true
  default     = null
}
