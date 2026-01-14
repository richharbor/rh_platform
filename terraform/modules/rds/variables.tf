variable "project_name" {}
variable "environment" {}
variable "db_name" {}
variable "db_username" {}
variable "db_password" {}
variable "subnet_ids" {
  type = list(string)
}
variable "db_sg_id" {}
variable "instance_class" {
  default = "db.t3.micro"
}
variable "platform_db_name" {
  description = "Name of the secondary platform database"
  type        = string
  default     = ""
}

