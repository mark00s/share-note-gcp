variable "collection_names" {
  type        = set(string)
  description = "Names of collections to create"
}

variable "databases_name" {
  type        = string
  description = "Firestore database to create"
}

variable "project_id" {
  type        = string
  description = "Project ID where Firestore databases should be created"
}

variable "location_id" {
  type        = string
  description = "Location ID where Firestore databases should be created"
  default     = "us-east1"
}

variable "ttl_field" {
  type        = string
  description = "Name of the field that will be used for TTL"
  default     = "expires_at"
}

variable "database_type" {
  type        = string
  description = "Type of Firestore database to create"
  default     = "FIRESTORE_NATIVE"
  validation {
    condition     = contains(["FIRESTORE_NATIVE", "DATASTORE_MODE"], var.database_type)
    error_message = "database_type must be one of FIRESTORE_NATIVE or DATASTORE_MODE."
  }
}

variable "deletion_policy" {
  type        = string
  description = "Deletion policy for the database"
  default     = "DELETE"
}
