resource "google_storage_bucket" "default" {
  name     = "rate-my-open-api"
  location = "US"
}

resource "google_storage_bucket_iam_member" "object_admin" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.default.email}"
}
