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

# us-east1 is in Free Tier
# You can pick any zone - resources will be region-wide anyway.

provider "google" {
  region = "us-east1"
  zone   = "us-east1-c"
}

provider "google-beta" {
  region = "us-east1"
  zone   = "us-east1-c"
}
