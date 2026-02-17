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
