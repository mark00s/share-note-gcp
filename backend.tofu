terraform {
  backend "gcs" {
    bucket = "mj-tfstates"
    prefix = "share-note-gcp" # Workspace będzie automatycznie dodany do ścieżki
  }
}
