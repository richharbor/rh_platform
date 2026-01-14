variable "project_name" {}
variable "environment" {}
variable "instance_type" {
  default = "t3.small"
}
variable "public_subnet_id" {}
variable "web_sg_id" {}
variable "key_name" {
  description = "Name of the existing SSH key pair"
  type        = string
}
