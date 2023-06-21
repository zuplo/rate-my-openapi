
variable "project_id" {
  description = "The Google Cloud project ID containing the services"
  type        = string
}

variable "region" {
  description = "The Google Cloud region containing the services"
  default     = "us-east1"
  type        = string
}

variable "service_name" {
  description = "The name of the service"
  default     = "rate-my-open-api"
}

variable "image_version" {
  description = "The image version to deploy"
  default     = "latest"
}