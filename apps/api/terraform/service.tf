resource "google_cloud_run_v2_service" "default" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  template {
    service_account       = google_service_account.default.email
    timeout               = "60s"
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    scaling {
      max_instance_count = 10
      min_instance_count = 3
    }

    containers {
      image = "us-docker.pkg.dev/zuplo-production/docker-registry/${var.service_name}:${var.image_version}"

      ports {
        container_port = 5000
      }

      resources {
        startup_cpu_boost = true
        cpu_idle          = false
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }

      liveness_probe {
        timeout_seconds   = 5
        period_seconds    = 30
        failure_threshold = 3
        http_get {
          path = "/health"
        }
      }

      startup_probe {
        timeout_seconds   = 5
        period_seconds    = 10
        failure_threshold = 6
        http_get {
          path = "/health"
        }
      }

      # Environment Variables
      dynamic "env" {
        for_each = {
          API_HOST   = "0.0.0.0"
          API_PORT   = "5000"
          LOG_LEVEL  = "debug"
          LOG_FORMAT = "gcp"
        }
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_binding" "default" {
  project  = google_cloud_run_v2_service.default.project
  location = google_cloud_run_v2_service.default.location
  name     = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}
