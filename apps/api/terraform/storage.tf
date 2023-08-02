resource "google_storage_bucket" "default" {
  name     = "rate-my-open-api-prod"
  location = "US"
}

# See https://cloud.google.com/storage/docs/access-control/iam-roles
# Revisit at https://linear.app/zuplo/issue/ZUP-294/revisit-permissions-for-storage-service-account
resource "google_storage_bucket_iam_binding" "default_object_writer" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.objectCreator"
  members = [
    "serviceAccount:${google_service_account.default.email}"
  ]
}

resource "google_storage_bucket_iam_binding" "default_object_viewer" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.objectViewer"
  members = [
    "serviceAccount:${google_service_account.default.email}"
  ]
}
