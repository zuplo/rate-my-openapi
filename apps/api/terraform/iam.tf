resource "google_service_account" "default" {
  display_name = "Rate My Open API (production)"
  account_id   = "rate-my-open-api"
}
