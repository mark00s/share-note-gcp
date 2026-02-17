terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.19.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.19.0"
    }
  }
}

provider "google" {
  region = "us-east1"   # It's in Free Tier
  zone   = "us-east1-c" # Should not affect project as the most resources are region-wide
}

provider "google-beta" {
  region = "us-east1"   # It's in Free Tier
  zone   = "us-east1-c" # Should not affect project as the most resources are region-wide
}
