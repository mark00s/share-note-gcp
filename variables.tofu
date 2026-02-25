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
