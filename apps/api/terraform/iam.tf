resource "google_service_account" "default" {
  display_name = "Rate My Open API (production)"
  account_id   = "rate-my-open-api"
}

resource "google_project_iam_member" "storage_admin_sa" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.default.email}"
}
