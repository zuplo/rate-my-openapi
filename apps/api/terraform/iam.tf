resource "google_service_account" "default" {
  account_id = "rate-my-open-api"
}

resource "google_project_iam_member" "artifactregistry_read_dev_api_sa" {
  project = "zuplo-production"
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.default.email}"
}
