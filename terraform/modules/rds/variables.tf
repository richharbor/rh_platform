variable "project_name" {}
variable "environment" {}
variable "db_name" {}
variable "db_username" {}
variable "db_password" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "db_sg_id" {}
